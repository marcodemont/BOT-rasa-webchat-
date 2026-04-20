(function(global){
  const enc = new TextEncoder();
  const dec = new TextDecoder();

  function toBytes(data) {
    if (!data) return new Uint8Array();
    if (data instanceof Uint8Array) return data;
    if (data.buffer instanceof ArrayBuffer) return new Uint8Array(data.buffer);
    if (data instanceof ArrayBuffer) return new Uint8Array(data);
    if (typeof data === 'string') return enc.encode(data);
    return new Uint8Array();
  }

  function bytesToBase64(bytes) {
    let bin = '';
    bytes.forEach(b => { bin += String.fromCharCode(b); });
    return btoa(bin);
  }

  function base64ToBytes(base64) {
    const raw = atob(base64 || '');
    const arr = new Uint8Array(raw.length);
    for (let i = 0; i < raw.length; i++) arr[i] = raw.charCodeAt(i);
    return arr;
  }

  function parsePayload(data) {
    const bytes = toBytes(data);
    if (!bytes.length) return { type:'unknown', raw:'' };

    const codeMap = {
      0x01: 'anchor',
      0x02: 'audio_start',
      0x03: 'audio_stop',
      0x04: 'compression',
      0x05: 'compression_cancel'
    };
    if (codeMap[bytes[0]]) {
      return { type:codeMap[bytes[0]], raw:`0x${bytes[0].toString(16)}` };
    }

    const text = dec.decode(bytes).trim();
    if (!text) return { type:'unknown', raw:'' };

    try {
      const json = JSON.parse(text);
      const t = String(json.type || json.event || '').toLowerCase();
      if (t) return { type:t, raw:text, payload:json };
    } catch(e) {}

    const token = text.toUpperCase();
    const norm = token.replace(/\s+/g, '_');
    const map = {
      'ANCHOR': 'anchor',
      'MARKER': 'anchor',
      'AUDIO_START': 'audio_start',
      'START_AUDIO': 'audio_start',
      'AUDIO_STOP': 'audio_stop',
      'STOP_AUDIO': 'audio_stop',
      'COMPRESSION': 'compression',
      'COMPRESS_START': 'compression',
      'COMP_START': 'compression',
      'COMP_ABORT': 'compression_cancel',
      'COMP_CANCEL': 'compression_cancel',
      'ABORT': 'compression_cancel'
    };

    return { type: map[norm] || norm.toLowerCase(), raw:text };
  }

  class WebBleAdapter {
    constructor(hooks) {
      this.hooks = hooks;
      this.device = null;
      this.server = null;
      this.notifyChar = null;
      this.writeChar = null;
      this.onNotification = this.onNotification.bind(this);
      this.onDisconnected = this.onDisconnected.bind(this);
    }

    available() {
      return !!(global.navigator && global.navigator.bluetooth);
    }

    async connect(config) {
      if (!this.available()) throw new Error('Web Bluetooth nicht verfügbar');
      const options = {
        acceptAllDevices: true,
        optionalServices: [config.serviceUuid]
      };
      if (config.deviceNamePrefix) {
        options.filters = [{ namePrefix: config.deviceNamePrefix }];
        delete options.acceptAllDevices;
      }

      this.device = await navigator.bluetooth.requestDevice(options);
      this.device.addEventListener('gattserverdisconnected', this.onDisconnected);
      this.server = await this.device.gatt.connect();

      const service = await this.server.getPrimaryService(config.serviceUuid);
      this.notifyChar = await service.getCharacteristic(config.notifyCharUuid);
      this.writeChar = await service.getCharacteristic(config.writeCharUuid);

      await this.notifyChar.startNotifications();
      this.notifyChar.addEventListener('characteristicvaluechanged', this.onNotification);

      return { deviceName: this.device.name || 'Unbekannt', transport:'web-bluetooth' };
    }

    async disconnect() {
      try {
        if (this.notifyChar) {
          this.notifyChar.removeEventListener('characteristicvaluechanged', this.onNotification);
          await this.notifyChar.stopNotifications().catch(()=>{});
        }
      } catch(e) {}

      if (this.device && this.device.gatt && this.device.gatt.connected) {
        this.device.gatt.disconnect();
      }

      this.notifyChar = null;
      this.writeChar = null;
      this.server = null;
      this.device = null;
    }

    async write(command) {
      if (!this.writeChar) throw new Error('Ring ist nicht verbunden');
      const payload = enc.encode(`${command}\n`);
      await this.writeChar.writeValue(payload);
    }

    onNotification(ev) {
      const value = ev && ev.target && ev.target.value ? ev.target.value : null;
      if (!value) return;
      this.hooks.onData(new Uint8Array(value.buffer));
    }

    onDisconnected() {
      this.hooks.onDisconnected();
    }
  }

  class CapacitorBleAdapter {
    constructor(hooks) {
      this.hooks = hooks;
      this.plugin = null;
      this.deviceId = null;
    }

    available() {
      return !!(global.Capacitor && global.Capacitor.Plugins && global.Capacitor.Plugins.BluetoothLe);
    }

    async connect(config) {
      if (!this.available()) throw new Error('Capacitor BLE Plugin nicht verfügbar');
      this.plugin = global.Capacitor.Plugins.BluetoothLe;

      if (this.plugin.initialize) await this.plugin.initialize();

      const req = {
        services: [config.serviceUuid]
      };
      if (config.deviceNamePrefix) req.namePrefix = config.deviceNamePrefix;

      const selected = await this.plugin.requestDevice(req);
      const deviceId = selected && (selected.deviceId || selected.id || selected.identifier);
      if (!deviceId) throw new Error('Kein Device aus BLE-Auswahl zurückgegeben');
      this.deviceId = deviceId;

      await this.plugin.connect({ deviceId });

      if (this.plugin.startNotifications) {
        const args = {
          deviceId,
          service: config.serviceUuid,
          characteristic: config.notifyCharUuid
        };
        await this.plugin.startNotifications(args, value => {
          const b64 = value && value.value ? value.value : '';
          this.hooks.onData(base64ToBytes(b64));
        });
      }

      return { deviceName: selected.name || selected.device?.name || 'Ring', transport:'capacitor-ble' };
    }

    async disconnect(config) {
      if (!this.plugin || !this.deviceId) return;
      if (this.plugin.stopNotifications) {
        await this.plugin.stopNotifications({
          deviceId: this.deviceId,
          service: config.serviceUuid,
          characteristic: config.notifyCharUuid
        }).catch(()=>{});
      }
      if (this.plugin.disconnect) {
        await this.plugin.disconnect({ deviceId: this.deviceId }).catch(()=>{});
      }
      this.deviceId = null;
    }

    async write(command, config) {
      if (!this.plugin || !this.deviceId) throw new Error('Ring ist nicht verbunden');
      const value = bytesToBase64(enc.encode(`${command}\n`));
      await this.plugin.write({
        deviceId: this.deviceId,
        service: config.serviceUuid,
        characteristic: config.writeCharUuid,
        value
      });
    }
  }

  class AurumRingClient {
    constructor(opts) {
      this.onStatus = opts.onStatus || function(){};
      this.onEvent = opts.onEvent || function(){};
      this.adapter = null;
      this.config = null;
      this.connected = false;
    }

    async connect(config) {
      this.config = config;
      if (this.connected) return;

      const hooks = {
        onData: data => this.handleIncoming(data),
        onDisconnected: () => this.handleDisconnect()
      };

      const cap = new CapacitorBleAdapter(hooks);
      const web = new WebBleAdapter(hooks);
      if (cap.available()) this.adapter = cap;
      else if (web.available()) this.adapter = web;
      else throw new Error('Weder Capacitor-BLE noch Web Bluetooth verfügbar');

      this.onStatus({ phase:'connecting' });
      const info = await this.adapter.connect(config);
      this.connected = true;
      this.onStatus({ phase:'connected', ...info });
    }

    async disconnect() {
      if (!this.adapter) return;
      const adapter = this.adapter;
      this.adapter = null;
      this.connected = false;
      try {
        if (adapter instanceof CapacitorBleAdapter) await adapter.disconnect(this.config || {});
        else await adapter.disconnect();
      } finally {
        this.onStatus({ phase:'disconnected' });
      }
    }

    async sendCommand(command) {
      if (!this.adapter || !this.connected) throw new Error('Ring ist nicht verbunden');
      if (this.adapter instanceof CapacitorBleAdapter) {
        await this.adapter.write(command, this.config || {});
      } else {
        await this.adapter.write(command);
      }
    }

    handleIncoming(data) {
      const parsed = parsePayload(data);
      this.onEvent(parsed);
    }

    handleDisconnect() {
      this.connected = false;
      this.onStatus({ phase:'disconnected' });
    }
  }

  global.createAurumRingClient = function createAurumRingClient(opts) {
    return new AurumRingClient(opts || {});
  };
})(window);

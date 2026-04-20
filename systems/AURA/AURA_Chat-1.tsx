import { useState, useRef, useEffect } from "react";
import {
  X,
  Send,
  Brain,
  Search,
  BookOpen,
  Trash2,
} from "lucide-react";
import { toast } from "sonner@2.0.3";

interface Message {
  role: "user" | "assistant" | "system";
  content: string;
  timestamp: Date;
}

interface AuraChatBotProps {
  onClose: () => void;
  onAdminAccess?: () => void; // Callback für Admin-Zugang
  onClick?: () => void;
  zIndex?: number;
}

export function AuraChatBot({
  onClose,
  onAdminAccess,
  onClick,
  zIndex = 9999,
}: AuraChatBotProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [position, setPosition] = useState<{
    x: number;
    y: number;
  }>({
    x: window.innerWidth - 420,
    y: 100,
  });
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [dragTranslate, setDragTranslate] = useState({
    x: 0,
    y: 0,
  });
  const [currentUser, setCurrentUser] = useState<{
    id: string;
    name: string;
    email: string;
    role: string;
  } | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const chatRef = useRef<HTMLDivElement>(null);
  const animationFrameRef = useRef<number | null>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({
      behavior: "smooth",
    });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Load messages from localStorage on mount
  useEffect(() => {
    if (!currentUser) return; // Wait for user to be loaded

    const messagesKey = `aura_chat_messages_${currentUser.id}`;
    const savedMessages = localStorage.getItem(messagesKey);

    if (savedMessages) {
      try {
        const parsed = JSON.parse(savedMessages);
        const messagesWithDates = parsed.map((msg: any) => ({
          ...msg,
          timestamp: new Date(msg.timestamp),
        }));
        setMessages(messagesWithDates);
      } catch (error) {
        console.error(
          "Error loading AURA chat messages:",
          error,
        );
        // Start with personalized welcome message if loading fails
        const roleSpecificWelcome =
          currentUser.role === "admin"
            ? `Hallo ${currentUser.name}! Ich bin AURA – Ihre READ-ONLY Wissensassistentin mit erweiterten Admin-Rechten.\n\n**Admin-Funktionen:**\n- System-Logs und Analysen\n- Vollständiger Wissensgraph-Zugriff\n- Technische Dokumentationen\n- AURIX-Architektur Details\n\n**Beispiel-Abfragen:**\n- "Zeige System-Logs der letzten 24h"\n- "Erkläre AURIX-Architektur"\n- "Suche nach Konflikten"\n\n**Hinweis:** AURA hat nur Lesezugriff. Für Bearbeitungen nutzen Sie bitte LYNA.\n\nWie kann ich Sie unterstützen?`
            : `Hallo ${currentUser.name}! Ich bin AURA – Ihre READ-ONLY Wissensassistentin.\n\n**Verfügbare Funktionen:**\n- Dokumentationen durchsuchen\n- AURIX-Module erkunden\n- Strukturanalysen\n\n**Beispiel-Abfragen:**\n- "Suche nach Dialogue-Dokumentation"\n- "Erkläre Structure-Modul"\n- "Zeige mir meine Wissensgraph-Analysen"\n\n**Hinweis:** AURA hat nur Lesezugriff. Für persönliche Analysen nutzen Sie bitte LYNA.\n\nWie kann ich Sie unterstützen?`;

        setMessages([
          {
            role: "assistant",
            content: roleSpecificWelcome,
            timestamp: new Date(),
          },
        ]);
      }
    } else {
      // Start with personalized welcome message
      const roleSpecificWelcome =
        currentUser.role === "admin"
          ? `Hallo ${currentUser.name}! Ich bin AURA – Ihre READ-ONLY Wissensassistentin mit erweiterten Admin-Rechten.\n\n**Admin-Funktionen:**\n- System-Logs und Analysen\n- Vollständiger Wissensgraph-Zugriff\n- Technische Dokumentationen\n- AURIX-Architektur Details\n\n**Beispiel-Abfragen:**\n- "Zeige System-Logs der letzten 24h"\n- "Erkläre AURIX-Architektur"\n- "Suche nach Konflikten"\n\n**Hinweis:** AURA hat nur Lesezugriff. Für Bearbeitungen nutzen Sie bitte LYNA.\n\nWie kann ich Sie unterstützen?`
          : `Hallo ${currentUser.name}! Ich bin AURA – Ihre READ-ONLY Wissensassistentin.\n\n**Verfügbare Funktionen:**\n- Dokumentationen durchsuchen\n- AURIX-Module erkunden\n- Strukturanalysen\n\n**Beispiel-Abfragen:**\n- "Suche nach Dialogue-Dokumentation"\n- "Erkläre Structure-Modul"\n- "Zeige mir meine Wissensgraph-Analysen"\n\n**Hinweis:** AURA hat nur Lesezugriff. Für persönliche Analysen nutzen Sie bitte LYNA.\n\nWie kann ich Sie unterstützen?`;

      setMessages([
        {
          role: "assistant",
          content: roleSpecificWelcome,
          timestamp: new Date(),
        },
      ]);
    }
  }, [currentUser]);

  // Save messages to localStorage whenever they change (per user)
  useEffect(() => {
    if (messages.length > 0 && currentUser) {
      const messagesKey = `aura_chat_messages_${currentUser.id}`;
      localStorage.setItem(
        messagesKey,
        JSON.stringify(messages),
      );
    }
  }, [messages, currentUser]);

  // Load current user from localStorage
  useEffect(() => {
    const patientData = localStorage.getItem("patient_data");
    const doctorData = localStorage.getItem("doctor_data");
    const adminUser = localStorage.getItem("admin_user");

    if (patientData) {
      try {
        const patient = JSON.parse(patientData);
        setCurrentUser({
          id: patient.id,
          name: patient.name || patient.email,
          email: patient.email,
          role: "patient",
        });
      } catch (e) {
        console.error("Error parsing patient data:", e);
      }
    } else if (doctorData) {
      try {
        const doctor = JSON.parse(doctorData);
        setCurrentUser({
          id: doctor.id,
          name: doctor.name || doctor.email,
          email: doctor.email,
          role: "doctor",
        });
      } catch (e) {
        console.error("Error parsing doctor data:", e);
      }
    } else if (adminUser) {
      try {
        const admin = JSON.parse(adminUser);
        setCurrentUser({
          id: admin.id || "admin",
          name: admin.name || admin.email,
          email: admin.email,
          role: "admin",
        });
      } catch (e) {
        console.error("Error parsing admin data:", e);
      }
    }
  }, []);

  // Drag handlers
  const handleMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    const rect = chatRef.current?.getBoundingClientRect();
    if (rect) {
      setIsDragging(true);
      setDragOffset({
        x: e.clientX - rect.left,
        y: e.clientY - rect.top,
      });
      setDragTranslate({ x: 0, y: 0 });
    }
  };

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isDragging) return;

      const translateX = e.clientX - position.x - dragOffset.x;
      const translateY = e.clientY - position.y - dragOffset.y;

      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }

      animationFrameRef.current = requestAnimationFrame(() => {
        setDragTranslate({ x: translateX, y: translateY });
      });
    };

    const handleMouseUp = () => {
      if (!isDragging) return;

      const finalX = position.x + dragTranslate.x;
      const finalY = position.y + dragTranslate.y;

      setPosition({ x: finalX, y: finalY });
      setDragTranslate({ x: 0, y: 0 });
      setIsDragging(false);

      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
        animationFrameRef.current = null;
      }
    };

    if (isDragging) {
      document.addEventListener("mousemove", handleMouseMove);
      document.addEventListener("mouseup", handleMouseUp);
      return () => {
        document.removeEventListener(
          "mousemove",
          handleMouseMove,
        );
        document.removeEventListener("mouseup", handleMouseUp);
        if (animationFrameRef.current) {
          cancelAnimationFrame(animationFrameRef.current);
        }
      };
    }
  }, [isDragging, dragOffset, position, dragTranslate]);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage: Message = {
      role: "user",
      content: input,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    const currentInput = input;
    setInput("");
    setIsLoading(true);

    try {
      // 🔐 ADMIN-ZUGANG: Nur für eingeloggte Admins mit word boundary check
      const adminPatterns = [
        /\badmin\b/i, // Word boundary - "admin" als eigenständiges Wort
        /^admin$/i, // Exact match
      ];

      if (
        adminPatterns.some((pattern) =>
          pattern.test(currentInput),
        )
      ) {
        // Nur Admins dürfen Admin-Bereich öffnen
        if (currentUser && currentUser.role === "admin") {
          const assistantMessage: Message = {
            role: "assistant",
            content: `Willkommen im Admin-Bereich, ${currentUser.name}!\n\nWeiterleitung zum Administratorbereich...`,
            timestamp: new Date(),
          };
          setMessages((prev) => [...prev, assistantMessage]);

          // Warte kurz für Feedback, dann öffne Admin-Bereich
          await new Promise((resolve) =>
            setTimeout(resolve, 800),
          );

          if (onAdminAccess) {
            onAdminAccess();
            onClose();
          }
        } else {
          // Nicht-Admins bekommen eine Ablehnung
          const deniedMessage: Message = {
            role: "assistant",
            content: `Zugriff verweigert.\n\nDer Admin-Bereich ist nur für autorisierte Administratoren zugänglich. Sie sind als ${currentUser?.role || "Gast"} eingeloggt.\n\nBitte wenden Sie sich an einen Administrator, wenn Sie Zugriff benötigen.`,
            timestamp: new Date(),
          };
          setMessages((prev) => [...prev, deniedMessage]);
        }
        setIsLoading(false);
        return;
      }

      // Simulate AURA reasoning (read-only)
      await new Promise((resolve) => setTimeout(resolve, 1500));

      const response = generateAuraResponse(currentInput);

      const assistantMessage: Message = {
        role: "assistant",
        content: response,
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, assistantMessage]);
    } catch (error) {
      console.error("AURA error:", error);
      toast.error("Fehler bei der AURA-Kommunikation");

      const errorMessage: Message = {
        role: "assistant",
        content:
          "Ein Fehler ist aufgetreten. Bitte versuchen Sie es erneut.",
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const generateAuraResponse = (query: string): string => {
    const q = query.toLowerCase();

    if (
      q.includes("suche") ||
      q.includes("find") ||
      q.includes("search")
    ) {
      return "**Suchergebnisse in Wissensbasis**\n\n**Gefundene Dokumente:**\n\n**AURIX_Architecture.md**\n   → Beschreibung der 4-Module-Architektur\n   → Zuletzt geändert: vor 2 Tagen\n\n**Dialogue_Module.md**\n   → Konversationslogik und Intentionen\n   → Zuletzt geändert: vor 5 Tagen\n\n**Structure_Wissensgraph.md**\n   → Kognitive Landkarte und Graphen\n   → Zuletzt geändert: vor 1 Tag\n\n**Meta_Analysis.md**\n   → Reflexionsebene und Widersprüche\n   → Zuletzt geändert: heute\n\n**Frage:** Welches Dokument möchten Sie näher betrachten?";
    }

    if (
      q.includes("hilfe") ||
      q.includes("help") ||
      q.includes("was kannst")
    ) {
      return "**AURA Capabilities**\n\n**Suche & Analyse:**\n- Dokumentationen durchsuchen\n- Notizbücher analysieren\n- System-Logs einsehen\n- Wissensgraphen navigieren\n\n**Wissen abrufen:**\n- AURIX-Modul-Referenzen\n- Architektur-Erklärungen\n- Strukturdaten\n- Konfigurations-Details\n\n**Reasoning:**\n- Zusammenhänge erkennen\n- Konflikte identifizieren\n- Trends analysieren\n- Systemintrospektion\n\n**KEINE Berechtigung für:**\n- Daten ändern\n- Nutzer anlegen\n- Konfiguration bearbeiten\n- Admin-Aktionen\n\nStellen Sie mir eine spezifische Frage!";
    }

    if (q.includes("konflikt") || q.includes("log")) {
      return "**System-Logs - Letzte 24h**\n\n**Konflikte:** Keine\n**Warnungen:** 0\n**Info-Events:** 12\n\n**Letzte Events:**\n\n1. **[14:23]** LYNA-Konversation gestartet\n   - User: Demo-User\n   - Modul: Dialogue\n   - Status: Aktiv\n\n2. **[12:10]** Wissensgraph aktualisiert\n   - Modul: Structure\n   - Knoten: 5 neue Einträge\n   - Status: Gespeichert\n\n**Hinweis:** Für detaillierte Logs nutzen Sie das Admin-Panel.";
    }

    return `**AURA Analyse zu:** "${query}"\n\nIch habe Ihre Anfrage analysiert. Für diese spezifische Frage kann ich:\n\n- Relevante Dokumentation suchen\n- Systemzustände abfragen\n- Zusammenhänge erklären\n\n**Vorschläge:**\n- Spezifizieren Sie Ihre Frage genauer\n- Nutzen Sie Schlüsselwörter wie "Dialogue", "Structure", "Meta"\n- Fragen Sie nach konkreten Dokumenten\n\n**Tipp:** AURA ist optimiert für Wissensabfragen, nicht für Datenbearbeitung.\n\nWie kann ich Ihnen weiterhelfen?`;
  };

  const handleClearChat = () => {
    const welcomeMessage = currentUser
      ? currentUser.role === "admin"
        ? `Hallo ${currentUser.name}! Ich bin AURA – Ihre READ-ONLY Wissensassistentin mit erweiterten Admin-Rechten.\n\n**Admin-Funktionen:**\n- System-Logs und Analysen\n- Vollständiger Wissensgraph-Zugriff\n- Technische Dokumentationen\n- AURIX-Architektur Details\n\n**Beispiel-Abfragen:**\n- "Zeige System-Logs der letzten 24h"\n- "Erkläre AURIX-Architektur"\n- "Suche nach Konflikten"\n\n**Hinweis:** AURA hat nur Lesezugriff. Für Bearbeitungen nutzen Sie bitte LYNA.\n\nWie kann ich Sie unterstützen?`
        : `Hallo ${currentUser.name}! Ich bin AURA – Ihre READ-ONLY Wissensassistentin.\n\n**Verfügbare Funktionen:**\n- Dokumentationen durchsuchen\n- AURIX-Module erkunden\n- Strukturanalysen\n\n**Beispiel-Abfragen:**\n- "Suche nach Dialogue-Dokumentation"\n- "Erkläre Structure-Modul"\n- "Zeige mir meine Wissensgraph-Analysen"\n\n**Hinweis:** AURA hat nur Lesezugriff. Für persönliche Analysen nutzen Sie bitte LYNA.\n\nWie kann ich Sie unterstützen?`
      : '**AURA - Adaptive Understanding & Research Assistant**\n\nIch bin Ihr READ-ONLY Wissensassistent mit Zugriff auf:\n\n- Alle Referenzen und Dokumentationen\n- Notizbücher und Wissensgraphen\n- Analysezustände und Logs\n\n**Beispiel-Abfragen:**\n- "Suche nach AURIX-Dokumentation"\n- "Zeige Konflikte der letzten 24h"\n- "Erkläre das Dialogue-Modul"\n\n**Hinweis:** AURA hat nur Lesezugriff. Für Bearbeitungen nutzen Sie bitte LYNA.\n\nWie kann ich Sie unterstützen?';

    setMessages([
      {
        role: "assistant",
        content: welcomeMessage,
        timestamp: new Date(),
      },
    ]);

    if (currentUser) {
      const messagesKey = `aura_chat_messages_${currentUser.id}`;
      localStorage.removeItem(messagesKey);
    } else {
      localStorage.removeItem("aura_chat_messages");
    }

    toast.success("AURA Chat-Verlauf gelöscht");
  };

  // Quick Action Handlers
  const handleQuickAction = (action: string) => {
    setInput(action);
    // Direkt senden nach kurzer Verzögerung
    setTimeout(() => {
      handleSend();
    }, 100);
  };

  return (
    <div
      ref={chatRef}
      onClick={onClick}
      className="fixed bg-white rounded-2xl shadow-2xl border border-cyan-200 flex flex-col w-96 h-[600px]"
      style={{
        left: `${position.x}px`,
        top: `${position.y}px`,
        cursor: isDragging ? "grabbing" : "default",
        transform: isDragging
          ? `translate3d(${dragTranslate.x}px, ${dragTranslate.y}px, 0)`
          : "scale(1)",
        willChange: isDragging ? "transform" : "auto",
        transition: isDragging ? "none" : undefined,
        zIndex: zIndex,
      }}
    >
      {/* Header */}
      <div
        className="bg-gradient-to-r from-cyan-500 via-blue-500 to-blue-600 p-4 rounded-t-2xl flex items-center justify-between cursor-move"
        onMouseDown={handleMouseDown}
      >
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center shadow-lg">
            <Brain className="w-5 h-5 text-cyan-600" />
          </div>
          <div>
            <h3 className="text-white">AURA</h3>
            <p className="text-xs text-cyan-100">
              Wissensassistentin
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={handleClearChat}
            className="w-8 h-8 flex items-center justify-center hover:bg-white/20 rounded-lg transition-colors"
            title="Chat-Verlauf löschen"
          >
            <Trash2 className="w-4 h-4 text-white" />
          </button>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center hover:bg-white/20 rounded-lg transition-colors"
          >
            <X className="w-4 h-4 text-white" />
          </button>
        </div>
      </div>

      {/* Schnellauswahl / Quick Actions */}
      <div className="bg-gradient-to-r from-cyan-100 to-blue-100 px-4 py-3 border-b border-cyan-200">
        <div className="flex gap-2 flex-wrap">
          <button
            onClick={() =>
              handleQuickAction("Zeige System-Logs")
            }
            disabled={isLoading}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-white hover:bg-cyan-50 text-cyan-700 rounded-lg text-xs transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
          >
            <Search className="w-3.5 h-3.5" />
            System-Logs
          </button>
          <button
            onClick={() =>
              handleQuickAction("Erkläre AURIX-Architektur")
            }
            disabled={isLoading}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-white hover:bg-cyan-50 text-cyan-700 rounded-lg text-xs transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
          >
            <BookOpen className="w-3.5 h-3.5" />
            AURIX-Architektur
          </button>
          <button
            onClick={() =>
              handleQuickAction("Suche Dialogue-Dokumentation")
            }
            disabled={isLoading}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-white hover:bg-cyan-50 text-cyan-700 rounded-lg text-xs transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
          >
            <Brain className="w-3.5 h-3.5" />
            Dialogue-Doku
          </button>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-gradient-to-br from-cyan-50 via-blue-50 to-blue-100">
        {messages.map((message, index) => (
          <div
            key={index}
            className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}
          >
            <div
              className={`max-w-[85%] rounded-2xl px-4 py-3 text-sm ${
                message.role === "user"
                  ? "bg-gradient-to-r from-cyan-500 to-blue-500 text-white"
                  : "bg-white border border-cyan-200 text-gray-900 shadow-sm"
              }`}
            >
              {message.role === "assistant" && (
                <div className="flex items-center gap-1.5 mb-1.5 pb-1.5 border-b border-cyan-100">
                  <Brain className="w-3.5 h-3.5 text-cyan-600" />
                  <span className="text-xs text-cyan-600">
                    AURA
                  </span>
                </div>
              )}
              <p className="whitespace-pre-wrap text-sm leading-relaxed">
                {message.content}
              </p>
              <p
                className={`text-xs mt-1.5 ${message.role === "user" ? "text-cyan-100" : "text-gray-500"}`}
              >
                {message.timestamp.toLocaleTimeString("de-DE", {
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </p>
            </div>
          </div>
        ))}

        {isLoading && (
          <div className="flex justify-start">
            <div className="bg-white border border-cyan-200 rounded-2xl px-4 py-3 shadow-sm">
              <div className="flex items-center gap-2">
                <Brain className="w-4 h-4 text-cyan-600 animate-pulse" />
                <span className="text-gray-600 text-sm">
                  AURA analysiert...
                </span>
              </div>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="p-4 bg-white border-t border-cyan-200 rounded-b-2xl">
        <div className="flex gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={(e) =>
              e.key === "Enter" && handleSend()
            }
            placeholder="Fragen Sie AURA..."
            className="flex-1 px-4 py-2.5 bg-cyan-50 border border-cyan-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-cyan-400 focus:border-transparent text-sm"
            disabled={isLoading}
          />
          <button
            onClick={handleSend}
            disabled={!input.trim() || isLoading}
            className="px-4 py-2.5 bg-gradient-to-r from-cyan-500 to-blue-500 text-white rounded-xl hover:from-cyan-600 hover:to-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 flex items-center gap-2"
          >
            <Send className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
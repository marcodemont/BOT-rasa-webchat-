import React, { useState, useEffect } from 'react';
import { useAuth } from '../auth/AuthContext';
import { SystemToggle } from '../systems/SystemToggle';
import { FloatingLYNA } from '../systems/LYNA/FloatingLYNA';
import { BoardCanvas } from '../canvas/BoardCanvas';
import { BoardElement } from '../canvas/types';
import { Button } from '../../components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../components/ui/tabs';
import { FileText, Zap, Clock, Trash2, Plus, Sparkles, Wind } from 'lucide-react';
import { toast } from 'sonner';

interface EphemeralNote {
  id: string;
  content: string;
  createdAt: Date;
}

interface EphemeralSurface {
  id: string;
  title: string;
  content: string;
  createdAt: Date;
}

export function ArgentumWorkspace() {
  const { user, signOut } = useAuth();
  const [activeTab, setActiveTab] = useState<'overview' | 'surface' | 'notes' | 'sketch' | 'present'>('overview');
  const [quickNotes, setQuickNotes] = useState<EphemeralNote[]>([]);
  const [surfaces, setSurfaces] = useState<EphemeralSurface[]>([]);
  const [selectedSurface, setSelectedSurface] = useState<EphemeralSurface | null>(null);
  const [surfaceContent, setSurfaceContent] = useState('');
  const [boardElements, setBoardElements] = useState<BoardElement[]>([]);
  const [sessionStart] = useState(new Date());

  // Session storage only - everything is temporary
  useEffect(() => {
    const savedNotes = sessionStorage.getItem('argentum-quick-notes');
    const savedSurfaces = sessionStorage.getItem('argentum-surfaces');
    
    if (savedNotes) {
      try {
        const parsed = JSON.parse(savedNotes);
        setQuickNotes(parsed.map((note: any) => ({
          ...note,
          createdAt: new Date(note.createdAt)
        })));
      } catch (error) {
        console.error('Error loading ARGENTUM notes:', error);
      }
    }
    
    if (savedSurfaces) {
      try {
        const parsed = JSON.parse(savedSurfaces);
        setSurfaces(parsed.map((surface: any) => ({
          ...surface,
          createdAt: new Date(surface.createdAt)
        })));
      } catch (error) {
        console.error('Error loading ARGENTUM surfaces:', error);
      }
    }
  }, []);

  useEffect(() => {
    if (quickNotes.length > 0) {
      sessionStorage.setItem('argentum-quick-notes', JSON.stringify(quickNotes));
    }
  }, [quickNotes]);

  useEffect(() => {
    if (surfaces.length > 0) {
      sessionStorage.setItem('argentum-surfaces', JSON.stringify(surfaces));
    }
  }, [surfaces]);

  const addQuickNote = () => {
    const newNote: EphemeralNote = {
      id: `note-${Date.now()}`,
      content: '',
      createdAt: new Date()
    };
    setQuickNotes([newNote, ...quickNotes]);
    toast.success('Quick note created (session only)');
  };

  const updateQuickNote = (id: string, content: string) => {
    setQuickNotes(quickNotes.map(note =>
      note.id === id ? { ...note, content } : note
    ));
  };

  const deleteQuickNote = (id: string) => {
    setQuickNotes(quickNotes.filter(note => note.id !== id));
    toast.success('Note dissolved');
  };

  const createNewSurface = () => {
    const newSurface: EphemeralSurface = {
      id: `surface-${Date.now()}`,
      title: `Surface ${surfaces.length + 1}`,
      content: '',
      createdAt: new Date()
    };
    setSurfaces([newSurface, ...surfaces]);
    setSelectedSurface(newSurface);
    setSurfaceContent('');
    toast.success('Ephemeral surface created');
  };

  const saveSurface = () => {
    if (!selectedSurface) return;
    
    setSurfaces(surfaces.map(s =>
      s.id === selectedSurface.id ? { ...s, content: surfaceContent } : s
    ));
    toast.success('Surface updated (no history)');
  };

  const clearAllSession = () => {
    if (confirm('Clear entire session? This cannot be undone.')) {
      setQuickNotes([]);
      setSurfaces([]);
      setSelectedSurface(null);
      setBoardElements([]);
      sessionStorage.clear();
      toast.success('Session cleared - fresh start');
    }
  };

  const getSessionDuration = () => {
    const now = new Date();
    const diff = now.getTime() - sessionStart.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(minutes / 60);
    
    if (hours > 0) {
      return `${hours}h ${minutes % 60}m`;
    }
    return `${minutes}m`;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      {/* LYNA AI Assistant */}
      <FloatingLYNA />

      {/* Header */}
      <header className="bg-gradient-to-r from-slate-500 to-blue-500 shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <h1 className="text-3xl font-bold text-white">ARGENTUM</h1>
              <span className="text-white/70 text-sm">Ephemeral Surface</span>
            </div>
            <div className="flex items-center space-x-4">
              <div className="text-white/80 text-sm flex items-center gap-2">
                <Clock className="w-4 h-4" />
                Session: {getSessionDuration()}
              </div>
              <SystemToggle />
              <span className="text-white/90">Welcome, {user?.name || user?.email}</span>
              <button
                onClick={signOut}
                className="bg-white/20 hover:bg-white/30 text-white px-4 py-2 rounded-lg transition-colors"
              >
                Sign Out
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Tabs value={activeTab} onValueChange={(value: any) => setActiveTab(value)} className="w-full">
          <TabsList className="grid w-full grid-cols-5 mb-6 bg-white shadow-md rounded-lg">
            <TabsTrigger value="overview" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-slate-500 data-[state=active]:to-blue-500 data-[state=active]:text-white">
              Overview
            </TabsTrigger>
            <TabsTrigger value="surface" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-slate-500 data-[state=active]:to-blue-500 data-[state=active]:text-white">
              <Wind className="w-4 h-4 mr-2 inline" />
              Surface
            </TabsTrigger>
            <TabsTrigger value="notes" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-slate-500 data-[state=active]:to-blue-500 data-[state=active]:text-white">
              <Zap className="w-4 h-4 mr-2 inline" />
              Quick Notes
            </TabsTrigger>
            <TabsTrigger value="sketch" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-slate-500 data-[state=active]:to-blue-500 data-[state=active]:text-white">
              <Sparkles className="w-4 h-4 mr-2 inline" />
              Sketch
            </TabsTrigger>
            <TabsTrigger value="present" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-slate-500 data-[state=active]:to-blue-500 data-[state=active]:text-white">
              <Clock className="w-4 h-4 mr-2 inline" />
              Present
            </TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview">
            <div className="bg-white rounded-2xl shadow-xl p-8">
              <div className="text-center py-16">
                <div className="relative inline-block mb-6">
                  <div className="absolute inset-0 text-6xl font-bold bg-gradient-to-r from-amber-300/40 to-orange-300/40 bg-clip-text text-transparent blur-[1px]"
                       style={{ transform: 'translateX(4px) translateY(-4px)' }}>
                    AURUM
                  </div>
                  <h2 className="relative text-6xl font-bold bg-gradient-to-r from-slate-500 to-blue-500 bg-clip-text text-transparent">
                    ARGENTUM
                  </h2>
                </div>
                <p className="text-2xl text-gray-600 mb-4">
                  Ephemeral • Flat • Present • Momentary
                </p>
                <p className="text-gray-500 max-w-2xl mx-auto">
                  Welcome to ARGENTUM, where simplicity meets the present moment. 
                  No layers, no history—just pure, immediate interaction with your ideas.
                </p>

                {/* Feature Cards - Now Clickable */}
                <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mt-12">
                  <button
                    onClick={() => setActiveTab('surface')}
                    className="bg-gradient-to-br from-slate-50 to-blue-50 p-6 rounded-xl border border-slate-200 hover:border-blue-400 hover:shadow-lg transition-all"
                  >
                    <div className="text-4xl mb-4">⬜</div>
                    <h3 className="font-bold text-lg text-gray-800 mb-2">Single Surface</h3>
                    <p className="text-sm text-gray-600">One simple, flat workspace</p>
                  </button>

                  <button
                    onClick={() => setActiveTab('notes')}
                    className="bg-gradient-to-br from-slate-50 to-blue-50 p-6 rounded-xl border border-slate-200 hover:border-blue-400 hover:shadow-lg transition-all"
                  >
                    <div className="text-4xl mb-4">⚡</div>
                    <h3 className="font-bold text-lg text-gray-800 mb-2">Quick Notes</h3>
                    <p className="text-sm text-gray-600">Fast, ephemeral thoughts</p>
                  </button>

                  <button
                    onClick={() => setActiveTab('sketch')}
                    className="bg-gradient-to-br from-slate-50 to-blue-50 p-6 rounded-xl border border-slate-200 hover:border-blue-400 hover:shadow-lg transition-all"
                  >
                    <div className="text-4xl mb-4">✨</div>
                    <h3 className="font-bold text-lg text-gray-800 mb-2">Sketch</h3>
                    <p className="text-sm text-gray-600">Simple visual expressions</p>
                  </button>

                  <button
                    onClick={() => setActiveTab('present')}
                    className="bg-gradient-to-br from-slate-50 to-blue-50 p-6 rounded-xl border border-slate-200 hover:border-blue-400 hover:shadow-lg transition-all"
                  >
                    <div className="text-4xl mb-4">🎯</div>
                    <h3 className="font-bold text-lg text-gray-800 mb-2">Present Moment</h3>
                    <p className="text-sm text-gray-600">Current session only</p>
                  </button>
                </div>

                {/* Stats Section */}
                <div className="mt-12 grid grid-cols-3 gap-6">
                  <div className="bg-slate-50 p-6 rounded-xl border border-slate-200">
                    <div className="text-3xl font-bold text-slate-600">{quickNotes.length}</div>
                    <div className="text-sm text-gray-600 mt-1">Active Notes</div>
                  </div>
                  <div className="bg-slate-50 p-6 rounded-xl border border-slate-200">
                    <div className="text-3xl font-bold text-slate-600">{surfaces.length}</div>
                    <div className="text-sm text-gray-600 mt-1">Surfaces</div>
                  </div>
                  <div className="bg-slate-50 p-6 rounded-xl border border-slate-200">
                    <div className="text-3xl font-bold text-slate-600">~</div>
                    <div className="text-sm text-gray-600 mt-1">Impermanence</div>
                  </div>
                </div>

                {/* Session Warning */}
                <div className="mt-12 bg-blue-50 border border-blue-200 rounded-xl p-6">
                  <p className="text-blue-800 font-medium flex items-center justify-center gap-2">
                    <Wind className="w-5 h-5" />
                    All content is session-based and will vanish when you close this tab
                  </p>
                </div>

                {/* Anti-Philosophy Footer */}
                <div className="mt-16 pt-8 border-t border-slate-200">
                  <h3 className="text-2xl font-bold text-gray-800 mb-8">The ARGENTUM Anti-Principles</h3>
                  <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
                    <div className="text-left">
                      <div className="text-3xl mb-3">🌊</div>
                      <h4 className="font-bold text-gray-800 mb-2">Impermanence</h4>
                      <p className="text-sm text-gray-600">
                        A sheet is temporary. Let go, don't accumulate.
                      </p>
                    </div>
                    <div className="text-left">
                      <div className="text-3xl mb-3">▬</div>
                      <h4 className="font-bold text-gray-800 mb-2">Flatness</h4>
                      <p className="text-sm text-gray-600">
                        No layers, no depth. Simplicity reigns.
                      </p>
                    </div>
                    <div className="text-left">
                      <div className="text-3xl mb-3">⚡</div>
                      <h4 className="font-bold text-gray-800 mb-2">Presence</h4>
                      <p className="text-sm text-gray-600">
                        No history. Only the current moment matters.
                      </p>
                    </div>
                    <div className="text-left">
                      <div className="text-3xl mb-3">🎯</div>
                      <h4 className="font-bold text-gray-800 mb-2">Immediacy</h4>
                      <p className="text-sm text-gray-600">
                        Value in the moment. Meaning through focus.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </TabsContent>

          {/* Surface Tab */}
          <TabsContent value="surface">
            <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
              <div className="flex h-[calc(100vh-250px)]">
                {/* Surface Sidebar */}
                <div className="w-80 border-r border-gray-200 flex flex-col">
                  <div className="p-4 border-b border-gray-200">
                    <Button
                      onClick={createNewSurface}
                      className="w-full bg-gradient-to-r from-slate-500 to-blue-500 hover:from-slate-600 hover:to-blue-600"
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      New Surface
                    </Button>
                  </div>
                  <div className="flex-1 overflow-y-auto p-4 space-y-2">
                    {surfaces.map(surface => (
                      <button
                        key={surface.id}
                        onClick={() => {
                          setSelectedSurface(surface);
                          setSurfaceContent(surface.content);
                        }}
                        className={`w-full text-left p-4 rounded-lg border transition-all ${
                          selectedSurface?.id === surface.id
                            ? 'border-blue-500 bg-blue-50 shadow-md'
                            : 'border-gray-200 hover:border-blue-300 hover:bg-blue-50/50'
                        }`}
                      >
                        <div className="flex items-start justify-between mb-2">
                          <Wind className="w-5 h-5 text-slate-600" />
                          <span className="text-xs text-gray-500">ephemeral</span>
                        </div>
                        <h3 className="font-semibold text-gray-900 mb-1 truncate">{surface.title}</h3>
                        <p className="text-xs text-gray-500">
                          {surface.createdAt.toLocaleTimeString('de-DE')}
                        </p>
                      </button>
                    ))}
                    {surfaces.length === 0 && (
                      <div className="text-center py-12 text-gray-500">
                        <Wind className="w-12 h-12 mx-auto mb-3 opacity-30" />
                        <p className="text-sm">No surfaces yet</p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Surface Editor */}
                <div className="flex-1 flex flex-col">
                  {selectedSurface ? (
                    <>
                      <div className="p-4 border-b border-gray-200 flex items-center justify-between bg-slate-50">
                        <input
                          type="text"
                          value={selectedSurface.title}
                          onChange={(e) => {
                            const newTitle = e.target.value;
                            setSurfaces(surfaces.map(s =>
                              s.id === selectedSurface.id ? { ...s, title: newTitle } : s
                            ));
                            setSelectedSurface({ ...selectedSurface, title: newTitle });
                          }}
                          className="text-xl font-semibold bg-transparent border-none outline-none text-gray-900"
                        />
                        <Button
                          onClick={saveSurface}
                          className="bg-gradient-to-r from-slate-500 to-blue-500"
                        >
                          Update
                        </Button>
                      </div>
                      <div className="flex-1 p-6">
                        <textarea
                          value={surfaceContent}
                          onChange={(e) => setSurfaceContent(e.target.value)}
                          placeholder="Write on this ephemeral surface..."
                          className="w-full h-full p-4 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none font-mono text-sm"
                        />
                      </div>
                    </>
                  ) : (
                    <div className="h-full flex items-center justify-center bg-gradient-to-br from-slate-50/50 to-blue-50/50">
                      <div className="text-center">
                        <Wind className="w-24 h-24 mx-auto mb-6 text-slate-300" />
                        <h3 className="text-2xl font-bold text-gray-800 mb-2">Create a Surface</h3>
                        <p className="text-gray-600 mb-6">Flat, ephemeral, momentary</p>
                        <Button
                          onClick={createNewSurface}
                          className="bg-gradient-to-r from-slate-500 to-blue-500"
                        >
                          <Plus className="w-4 h-4 mr-2" />
                          New Surface
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </TabsContent>

          {/* Quick Notes Tab */}
          <TabsContent value="notes">
            <div className="bg-white rounded-2xl shadow-xl p-8 h-[calc(100vh-250px)] overflow-y-auto">
              <div className="max-w-4xl mx-auto">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-bold text-gray-900">Quick Notes</h2>
                  <Button
                    onClick={addQuickNote}
                    className="bg-gradient-to-r from-slate-500 to-blue-500"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Add Note
                  </Button>
                </div>

                <div className="space-y-4">
                  {quickNotes.map(note => (
                    <div key={note.id} className="border border-slate-200 rounded-lg p-4 bg-slate-50/50">
                      <div className="flex items-start justify-between mb-2">
                        <span className="text-xs text-gray-500">
                          {note.createdAt.toLocaleTimeString('de-DE')}
                        </span>
                        <button
                          onClick={() => deleteQuickNote(note.id)}
                          className="text-red-500 hover:text-red-700"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                      <textarea
                        value={note.content}
                        onChange={(e) => updateQuickNote(note.id, e.target.value)}
                        placeholder="Quick thought..."
                        className="w-full p-2 border border-gray-200 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none min-h-[100px]"
                      />
                    </div>
                  ))}
                  {quickNotes.length === 0 && (
                    <div className="text-center py-16 text-gray-500">
                      <Zap className="w-16 h-16 mx-auto mb-4 opacity-30" />
                      <p>No quick notes yet. Start capturing thoughts!</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </TabsContent>

          {/* Sketch Tab */}
          <TabsContent value="sketch">
            <div className="bg-white rounded-2xl shadow-xl overflow-hidden h-[calc(100vh-250px)]">
              <BoardCanvas
                boardId="argentum-sketch"
                elements={boardElements}
                onElementsChange={setBoardElements}
                onSave={() => toast.success('Sketch updated (no history)')}
              />
            </div>
          </TabsContent>

          {/* Present Tab */}
          <TabsContent value="present">
            <div className="bg-white rounded-2xl shadow-xl p-8">
              <div className="text-center mb-8">
                <Clock className="w-24 h-24 mx-auto mb-6 text-slate-400" />
                <h3 className="text-2xl font-bold text-gray-800 mb-2">Present Moment</h3>
                <p className="text-gray-600">This session only - no past, no future</p>
              </div>
              
              <div className="max-w-4xl mx-auto space-y-6">
                <div className="bg-slate-50 border border-slate-200 rounded-lg p-6">
                  <h4 className="font-bold text-gray-800 mb-4">Current Session</h4>
                  <div className="space-y-2 text-sm text-gray-600">
                    <p>⏱️ Session Duration: {getSessionDuration()}</p>
                    <p>📝 Quick Notes: {quickNotes.length}</p>
                    <p>⬜ Surfaces: {surfaces.length}</p>
                    <p>🎨 Sketch Elements: {boardElements.length}</p>
                  </div>
                </div>

                <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
                  <h4 className="font-bold text-gray-800 mb-2">💨 Ephemeral by Design</h4>
                  <p className="text-sm text-gray-600 mb-4">
                    Everything in ARGENTUM exists only for this session. When you close this tab, 
                    all content will dissolve—no traces, no history, no clutter.
                  </p>
                  <p className="text-xs text-gray-500 italic">
                    "The beauty of impermanence is the freedom it brings."
                  </p>
                </div>

                <div className="bg-red-50 border border-red-200 rounded-lg p-6">
                  <h4 className="font-bold text-red-800 mb-2">⚠️ Clear Session</h4>
                  <p className="text-sm text-gray-600 mb-4">
                    Start fresh by clearing all current content. This action is immediate and irreversible.
                  </p>
                  <Button
                    onClick={clearAllSession}
                    variant="destructive"
                    className="w-full"
                  >
                    <Trash2 className="w-4 h-4 mr-2" />
                    Clear Entire Session
                  </Button>
                </div>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}
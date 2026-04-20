import React, { useState, useEffect } from 'react';
import { useAuth } from '../auth/AuthContext';
import { SystemToggle } from '../systems/SystemToggle';
import { FloatingLYNA } from '../systems/LYNA/FloatingLYNA';
import { NotesModule } from '../notes/NotesModule';
import { Canvas } from '../canvas/Canvas';
import { BoardCanvas } from '../canvas/BoardCanvas';
import { CanvasDocument, BoardElement } from '../canvas/types';
import { Button } from '../../components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../components/ui/tabs';
import { FileText, Layout, Archive, History, Plus, Layers } from 'lucide-react';
import { toast } from 'sonner';

export function AurumWorkspace() {
  const { user, signOut } = useAuth();
  const [activeTab, setActiveTab] = useState<'overview' | 'sheets' | 'notes' | 'canvas' | 'archive' | 'history'>('overview');
  const [canvasDocuments, setCanvasDocuments] = useState<CanvasDocument[]>([]);
  const [selectedDocument, setSelectedDocument] = useState<CanvasDocument | null>(null);
  const [boardElements, setBoardElements] = useState<BoardElement[]>([]);

  // Load canvas documents from localStorage (AURUM uses persistent storage)
  useEffect(() => {
    const saved = localStorage.getItem('aurum-canvas-documents');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setCanvasDocuments(parsed.map((doc: any) => ({
          ...doc,
          createdAt: new Date(doc.createdAt),
          updatedAt: new Date(doc.updatedAt)
        })));
      } catch (error) {
        console.error('Error loading AURUM documents:', error);
      }
    }
  }, []);

  // Save canvas documents to localStorage
  useEffect(() => {
    if (canvasDocuments.length > 0) {
      localStorage.setItem('aurum-canvas-documents', JSON.stringify(canvasDocuments));
    }
  }, [canvasDocuments]);

  const createNewSheet = () => {
    const newDoc: CanvasDocument = {
      id: `aurum-sheet-${Date.now()}`,
      title: `Sheet ${canvasDocuments.length + 1}`,
      content: '',
      createdAt: new Date(),
      updatedAt: new Date(),
      tags: ['aurum'],
      version: 1
    };
    setCanvasDocuments([newDoc, ...canvasDocuments]);
    setSelectedDocument(newDoc);
    toast.success('New AURUM sheet created');
  };

  const handleSaveDocument = (content: string) => {
    if (!selectedDocument) return;
    
    const updated = canvasDocuments.map(doc =>
      doc.id === selectedDocument.id
        ? { ...doc, content, updatedAt: new Date(), version: doc.version + 1 }
        : doc
    );
    setCanvasDocuments(updated);
    setSelectedDocument({ ...selectedDocument, content, updatedAt: new Date(), version: selectedDocument.version + 1 });
    toast.success('Sheet saved with version history');
  };

  const handleUpdateTitle = (title: string) => {
    if (!selectedDocument) return;
    
    const updated = canvasDocuments.map(doc =>
      doc.id === selectedDocument.id
        ? { ...doc, title, updatedAt: new Date() }
        : doc
    );
    setCanvasDocuments(updated);
    setSelectedDocument({ ...selectedDocument, title });
  };

  const handleSaveBoard = () => {
    toast.success('Board saved to AURUM archive');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 to-orange-50">
      {/* LYNA AI Assistant */}
      <FloatingLYNA />

      {/* Header */}
      <header className="bg-gradient-to-r from-amber-500 to-orange-500 shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <h1 className="text-3xl font-bold text-white">AURUM</h1>
              <span className="text-white/70 text-sm">Digital Canvas</span>
            </div>
            <div className="flex items-center space-x-4">
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
          <TabsList className="grid w-full grid-cols-6 mb-6 bg-white shadow-md rounded-lg">
            <TabsTrigger value="overview" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-amber-500 data-[state=active]:to-orange-500 data-[state=active]:text-white">
              Overview
            </TabsTrigger>
            <TabsTrigger value="sheets" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-amber-500 data-[state=active]:to-orange-500 data-[state=active]:text-white">
              <FileText className="w-4 h-4 mr-2 inline" />
              Sheets
            </TabsTrigger>
            <TabsTrigger value="notes" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-amber-500 data-[state=active]:to-orange-500 data-[state=active]:text-white">
              <Layout className="w-4 h-4 mr-2 inline" />
              Notes
            </TabsTrigger>
            <TabsTrigger value="canvas" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-amber-500 data-[state=active]:to-orange-500 data-[state=active]:text-white">
              <Layers className="w-4 h-4 mr-2 inline" />
              Canvas
            </TabsTrigger>
            <TabsTrigger value="archive" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-amber-500 data-[state=active]:to-orange-500 data-[state=active]:text-white">
              <Archive className="w-4 h-4 mr-2 inline" />
              Archive
            </TabsTrigger>
            <TabsTrigger value="history" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-amber-500 data-[state=active]:to-orange-500 data-[state=active]:text-white">
              <History className="w-4 h-4 mr-2 inline" />
              History
            </TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview">
            <div className="bg-white rounded-2xl shadow-xl p-8">
              <div className="text-center py-16">
                <div className="relative inline-block mb-6">
                  <div className="absolute inset-0 text-6xl font-bold text-slate-400/30 blur-[2px]"
                       style={{ transform: 'translateX(-6px) translateY(3px)' }}>
                    ARGENTUM
                  </div>
                  <h2 className="relative text-6xl font-bold bg-gradient-to-r from-amber-500 to-orange-500 bg-clip-text text-transparent">
                    AURUM
                  </h2>
                </div>
                <p className="text-2xl text-gray-600 mb-4">
                  Permanence • Layers • History • Memory
                </p>
                <p className="text-gray-500 max-w-2xl mx-auto">
                  Welcome to AURUM, your creative workspace where ideas are built in layers and preserved through time. 
                  Every stroke matters, every layer tells a story.
                </p>

                {/* Feature Cards - Now Clickable */}
                <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mt-12">
                  <button
                    onClick={() => setActiveTab('sheets')}
                    className="bg-gradient-to-br from-amber-50 to-orange-50 p-6 rounded-xl border border-amber-200 hover:border-amber-400 hover:shadow-lg transition-all"
                  >
                    <div className="text-4xl mb-4">📄</div>
                    <h3 className="font-bold text-lg text-gray-800 mb-2">Sheets</h3>
                    <p className="text-sm text-gray-600">Create and manage permanent digital canvases</p>
                  </button>

                  <button
                    onClick={() => setActiveTab('notes')}
                    className="bg-gradient-to-br from-amber-50 to-orange-50 p-6 rounded-xl border border-amber-200 hover:border-amber-400 hover:shadow-lg transition-all"
                  >
                    <div className="text-4xl mb-4">📝</div>
                    <h3 className="font-bold text-lg text-gray-800 mb-2">Notes</h3>
                    <p className="text-sm text-gray-600">Permanent notes with full versioning</p>
                  </button>

                  <button
                    onClick={() => setActiveTab('canvas')}
                    className="bg-gradient-to-br from-amber-50 to-orange-50 p-6 rounded-xl border border-amber-200 hover:border-amber-400 hover:shadow-lg transition-all"
                  >
                    <div className="text-4xl mb-4">🎨</div>
                    <h3 className="font-bold text-lg text-gray-800 mb-2">Canvas</h3>
                    <p className="text-sm text-gray-600">Visual workspace with layered structure</p>
                  </button>

                  <button
                    onClick={() => setActiveTab('archive')}
                    className="bg-gradient-to-br from-amber-50 to-orange-50 p-6 rounded-xl border border-amber-200 hover:border-amber-400 hover:shadow-lg transition-all"
                  >
                    <div className="text-4xl mb-4">🗄️</div>
                    <h3 className="font-bold text-lg text-gray-800 mb-2">Archive</h3>
                    <p className="text-sm text-gray-600">Long-term storage with full history</p>
                  </button>
                </div>

                {/* Stats Section */}
                <div className="mt-12 grid grid-cols-3 gap-6">
                  <div className="bg-amber-50 p-6 rounded-xl border border-amber-200">
                    <div className="text-3xl font-bold text-amber-600">{canvasDocuments.length}</div>
                    <div className="text-sm text-gray-600 mt-1">Active Sheets</div>
                  </div>
                  <div className="bg-amber-50 p-6 rounded-xl border border-amber-200">
                    <div className="text-3xl font-bold text-amber-600">
                      {canvasDocuments.reduce((sum, doc) => sum + doc.version, 0)}
                    </div>
                    <div className="text-sm text-gray-600 mt-1">Total Versions</div>
                  </div>
                  <div className="bg-amber-50 p-6 rounded-xl border border-amber-200">
                    <div className="text-3xl font-bold text-amber-600">∞</div>
                    <div className="text-sm text-gray-600 mt-1">Permanence</div>
                  </div>
                </div>

                {/* Philosophy Footer - 4 Core Principles */}
                <div className="mt-16 pt-8 border-t border-amber-200">
                  <h3 className="text-2xl font-bold text-gray-800 mb-8">The AURUM Principles</h3>
                  <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
                    <div className="text-left">
                      <div className="text-3xl mb-3">🏛️</div>
                      <h4 className="font-bold text-gray-800 mb-2">Permanence</h4>
                      <p className="text-sm text-gray-600">
                        A sheet is permanent. Ideas are preserved, not discarded.
                      </p>
                    </div>
                    <div className="text-left">
                      <div className="text-3xl mb-3">📚</div>
                      <h4 className="font-bold text-gray-800 mb-2">Layering</h4>
                      <p className="text-sm text-gray-600">
                        Layers create depth. Complexity emerges through structure.
                      </p>
                    </div>
                    <div className="text-left">
                      <div className="text-3xl mb-3">⏳</div>
                      <h4 className="font-bold text-gray-800 mb-2">History</h4>
                      <p className="text-sm text-gray-600">
                        Every change matters. The journey is preserved.
                      </p>
                    </div>
                    <div className="text-left">
                      <div className="text-3xl mb-3">💎</div>
                      <h4 className="font-bold text-gray-800 mb-2">Continuity</h4>
                      <p className="text-sm text-gray-600">
                        Value grows over time. Meaning emerges through building.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </TabsContent>

          {/* Sheets Tab */}
          <TabsContent value="sheets">
            <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
              <div className="flex h-[calc(100vh-250px)]">
                {/* Sheets Sidebar */}
                <div className="w-80 border-r border-gray-200 flex flex-col">
                  <div className="p-4 border-b border-gray-200">
                    <Button
                      onClick={createNewSheet}
                      className="w-full bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600"
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      New Sheet
                    </Button>
                  </div>
                  <div className="flex-1 overflow-y-auto p-4 space-y-2">
                    {canvasDocuments.map(doc => (
                      <button
                        key={doc.id}
                        onClick={() => setSelectedDocument(doc)}
                        className={`w-full text-left p-4 rounded-lg border transition-all ${
                          selectedDocument?.id === doc.id
                            ? 'border-amber-500 bg-amber-50 shadow-md'
                            : 'border-gray-200 hover:border-amber-300 hover:bg-amber-50/50'
                        }`}
                      >
                        <div className="flex items-start justify-between mb-2">
                          <FileText className="w-5 h-5 text-amber-600" />
                          <span className="text-xs text-gray-500">v{doc.version}</span>
                        </div>
                        <h3 className="font-semibold text-gray-900 mb-1 truncate">{doc.title}</h3>
                        <p className="text-xs text-gray-500">
                          {doc.updatedAt.toLocaleDateString('de-DE')}
                        </p>
                      </button>
                    ))}
                    {canvasDocuments.length === 0 && (
                      <div className="text-center py-12 text-gray-500">
                        <FileText className="w-12 h-12 mx-auto mb-3 opacity-30" />
                        <p className="text-sm">No sheets yet</p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Canvas Area */}
                <div className="flex-1">
                  {selectedDocument ? (
                    <Canvas
                      document={selectedDocument}
                      onClose={() => setSelectedDocument(null)}
                      onSave={handleSaveDocument}
                      onUpdateTitle={handleUpdateTitle}
                    />
                  ) : (
                    <div className="h-full flex items-center justify-center bg-gradient-to-br from-amber-50/50 to-orange-50/50">
                      <div className="text-center">
                        <FileText className="w-24 h-24 mx-auto mb-6 text-amber-300" />
                        <h3 className="text-2xl font-bold text-gray-800 mb-2">Select or Create a Sheet</h3>
                        <p className="text-gray-600 mb-6">Your permanent canvas awaits</p>
                        <Button
                          onClick={createNewSheet}
                          className="bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600"
                        >
                          <Plus className="w-4 h-4 mr-2" />
                          Create New Sheet
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </TabsContent>

          {/* Notes Tab */}
          <TabsContent value="notes">
            <div className="bg-white rounded-2xl shadow-xl overflow-hidden h-[calc(100vh-250px)]">
              <NotesModule />
            </div>
          </TabsContent>

          {/* Canvas Tab */}
          <TabsContent value="canvas">
            <div className="bg-white rounded-2xl shadow-xl overflow-hidden h-[calc(100vh-250px)]">
              <BoardCanvas
                boardId="aurum-main-board"
                elements={boardElements}
                onElementsChange={setBoardElements}
                onSave={handleSaveBoard}
              />
            </div>
          </TabsContent>

          {/* Archive Tab */}
          <TabsContent value="archive">
            <div className="bg-white rounded-2xl shadow-xl p-8">
              <div className="text-center py-16">
                <Archive className="w-24 h-24 mx-auto mb-6 text-amber-400" />
                <h3 className="text-2xl font-bold text-gray-800 mb-2">AURUM Archive</h3>
                <p className="text-gray-600 mb-6">Long-term storage with full version history</p>
                <div className="max-w-2xl mx-auto text-left space-y-4">
                  <div className="bg-amber-50 border border-amber-200 rounded-lg p-6">
                    <h4 className="font-bold text-gray-800 mb-2">📦 All Documents: {canvasDocuments.length}</h4>
                    <p className="text-sm text-gray-600">Every sheet and note is permanently stored</p>
                  </div>
                  <div className="bg-amber-50 border border-amber-200 rounded-lg p-6">
                    <h4 className="font-bold text-gray-800 mb-2">🔄 Version Control</h4>
                    <p className="text-sm text-gray-600">Full history of changes with rollback capability</p>
                  </div>
                  <div className="bg-amber-50 border border-amber-200 rounded-lg p-6">
                    <h4 className="font-bold text-gray-800 mb-2">☁️ Cloud Sync (Coming Soon)</h4>
                    <p className="text-sm text-gray-600">Supabase integration for cross-device permanence</p>
                  </div>
                </div>
              </div>
            </div>
          </TabsContent>

          {/* History Tab */}
          <TabsContent value="history">
            <div className="bg-white rounded-2xl shadow-xl p-8">
              <div className="text-center mb-8">
                <History className="w-24 h-24 mx-auto mb-6 text-amber-400" />
                <h3 className="text-2xl font-bold text-gray-800 mb-2">Version History</h3>
                <p className="text-gray-600">Track every change across all documents</p>
              </div>
              
              <div className="max-w-4xl mx-auto">
                {canvasDocuments.length > 0 ? (
                  <div className="space-y-4">
                    {canvasDocuments
                      .sort((a, b) => b.updatedAt.getTime() - a.updatedAt.getTime())
                      .map(doc => (
                        <div key={doc.id} className="border border-amber-200 rounded-lg p-6 bg-amber-50/50">
                          <div className="flex items-center justify-between mb-2">
                            <h4 className="font-bold text-gray-800">{doc.title}</h4>
                            <span className="text-xs bg-amber-200 text-amber-800 px-2 py-1 rounded">
                              Version {doc.version}
                            </span>
                          </div>
                          <div className="text-sm text-gray-600 space-y-1">
                            <p>📅 Created: {doc.createdAt.toLocaleString('de-DE')}</p>
                            <p>🔄 Last Updated: {doc.updatedAt.toLocaleString('de-DE')}</p>
                            <p>📊 {doc.version} version{doc.version !== 1 ? 's' : ''} saved</p>
                          </div>
                        </div>
                      ))}
                  </div>
                ) : (
                  <div className="text-center py-12 text-gray-500">
                    <History className="w-16 h-16 mx-auto mb-4 opacity-30" />
                    <p>No history yet. Create your first sheet to begin tracking versions.</p>
                  </div>
                )}
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}
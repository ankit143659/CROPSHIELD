
import React, { useState, useCallback, useEffect } from 'react';
import Sidebar from './components/Sidebar';
import ChatWindow from './components/ChatWindow';
import ChatInput from './components/ChatInput';
import AuthPortal from './components/Auth/AuthPortal';
import AutomationPortal from './components/AutomationPortal';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ChatSession, Message } from './types';
import { generateAIResponse } from './services/geminiService';
import { db } from './services/db';
import { Menu, ShieldCheck } from 'lucide-react';

const MainApp: React.FC = () => {
  const { currentUser } = useAuth();
  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [activeSessionId, setActiveSessionId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [currentView, setCurrentView] = useState<'diagnostic' | 'automation'>('diagnostic');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const loadSessions = useCallback(async (autoSelectFirst = false) => {
    if (!currentUser) return;
    const sessionList = await db.sessions
      .where('userId')
      .equals(currentUser.uid)
      .reverse()
      .sortBy('createdAt');
    
    const sessionsWithMessages = await Promise.all(sessionList.map(async (s) => {
      const messages = await db.messages.where('sessionId').equals(s.id).sortBy('timestamp');
      return {
        ...s,
        messages: messages.map(m => ({
          ...m,
          timestamp: new Date(m.timestamp)
        }))
      };
    }));

    setSessions(sessionsWithMessages);
    
    if (autoSelectFirst && !activeSessionId && sessionsWithMessages.length > 0) {
      setActiveSessionId(sessionsWithMessages[0].id);
    }
  }, [currentUser, activeSessionId]);

  useEffect(() => {
    if (currentUser) {
      loadSessions(true);
    }
  }, [currentUser]);

  const handleNewChat = useCallback(async () => {
    if (!currentUser) return;
    const newId = crypto.randomUUID();
    
    await db.sessions.add({
      id: newId,
      userId: currentUser.uid,
      title: "New Chat",
      createdAt: new Date()
    });

    setActiveSessionId(newId);
    setCurrentView('diagnostic');
    setIsSidebarOpen(false); 
    await loadSessions();
  }, [currentUser, loadSessions]);

  const handleSendMessage = async (content: string, image?: { mimeType: string, data: string, url: string }) => {
    if (!currentUser) return;

    let targetSessionId = activeSessionId;

    // Create a session if none exists
    if (!targetSessionId) {
      targetSessionId = crypto.randomUUID();
      const newTitle = image ? "Photo Analysis" : (content.length > 25 ? content.slice(0, 25) + "..." : content);
      await db.sessions.add({
        id: targetSessionId,
        userId: currentUser.uid,
        title: newTitle,
        createdAt: new Date()
      });
      setActiveSessionId(targetSessionId);
    } else {
      // Robust Renaming Logic: If the session is named "New Chat", it means this is the first message.
      const currentSession = await db.sessions.get(targetSessionId);
      if (currentSession && (currentSession.title === "New Chat" || currentSession.title === "")) {
        const newTitle = image ? "Photo Analysis" : (content.length > 25 ? content.slice(0, 25) + "..." : content);
        await db.sessions.update(targetSessionId, { title: newTitle });
      }
    }

    const userMsgId = crypto.randomUUID();
    
    await db.messages.add({
      id: userMsgId,
      sessionId: targetSessionId,
      role: 'user',
      content,
      imageUrl: image?.url,
      timestamp: new Date()
    });

    // Reload immediately to update Sidebar titles and show the user message
    await loadSessions();
    setIsLoading(true);

    try {
      const messagesToUse = (await db.messages.where('sessionId').equals(targetSessionId).sortBy('timestamp')) || [];
      const apiHistory = messagesToUse
        .filter(m => m.id !== userMsgId)
        .map(m => ({
          role: m.role === 'assistant' ? 'model' : 'user',
          parts: [{ text: m.content }]
        }));

      const aiResponseText = await generateAIResponse(
        content, 
        apiHistory, 
        image ? { mimeType: image.mimeType, data: image.data } : undefined
      );

      const assistantMsgId = crypto.randomUUID();
      
      await db.messages.add({
        id: assistantMsgId,
        sessionId: targetSessionId,
        role: 'assistant',
        content: aiResponseText,
        timestamp: new Date()
      });

      await loadSessions();
    } catch (err) {
      console.error("AI Generation Error:", err);
    } finally {
      setIsLoading(false);
    }
  };

  if (!currentUser) return <AuthPortal />;

  const activeSession = sessions.find(s => s.id === activeSessionId);

  return (
    <div className="flex h-[100dvh] w-full bg-[#fcfdfd] overflow-hidden relative text-emerald-950">
      
      {isSidebarOpen && (
        <div 
          className="lg:hidden fixed inset-0 bg-black/60 backdrop-blur-md z-[900] animate-in fade-in duration-300" 
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      <div className={`
        fixed lg:relative inset-y-0 left-0 z-[1000] lg:z-30 transform 
        ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'} 
        transition-transform duration-500 ease-[cubic-bezier(0.4,0,0.2,1)] w-[280px] sm:w-80 shrink-0 shadow-2xl lg:shadow-none
      `}>
        <Sidebar 
          sessions={sessions} 
          activeSessionId={activeSessionId} 
          onNewChat={handleNewChat}
          onSelectSession={(id) => {
            setActiveSessionId(id);
            setCurrentView('diagnostic');
            setIsSidebarOpen(false);
            loadSessions();
          }}
          currentView={currentView}
          onSetView={(view) => {
            setCurrentView(view);
            setIsSidebarOpen(false);
          }}
          automationEnabled={true}
        />
      </div>
      
      <main className="flex-1 flex flex-col relative h-full min-w-0 bg-[#fcfdfd]">
        <header className="h-16 md:h-20 shrink-0 flex items-center justify-between px-4 md:px-10 bg-white/80 backdrop-blur-xl border-b border-emerald-50 z-40 sticky top-0">
          <div className="flex items-center gap-3">
            <button 
              onClick={() => setIsSidebarOpen(true)}
              className="lg:hidden p-3 bg-emerald-50 text-emerald-950 rounded-xl active:scale-95 transition-all shadow-sm border border-emerald-100 focus:outline-none"
              aria-label="Open Menu"
            >
              <Menu size={24} />
            </button>
            <div className="flex flex-col">
              <div className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                <span className="text-[8px] md:text-[10px] font-black uppercase text-emerald-600 tracking-[0.2em]">System Active</span>
              </div>
              <span className="text-base md:text-xl font-black text-emerald-950 tracking-tighter uppercase truncate max-w-[180px] md:max-w-none">
                {currentView === 'automation' ? 'Email Alerts' : (activeSession?.title || 'Plant Care Chat')}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3">
             <div className="hidden md:flex items-center gap-2 px-4 py-2 bg-emerald-50 rounded-full border border-emerald-100 shadow-sm">
                <ShieldCheck size={14} className="text-emerald-500" />
                <span className="text-[10px] font-black text-emerald-700 uppercase tracking-widest text-nowrap">Secure Connection</span>
             </div>
          </div>
        </header>

        <div className="flex-1 relative overflow-hidden flex flex-col">
          {currentView === 'diagnostic' ? (
            <>
              <ChatWindow messages={activeSession?.messages || []} isLoading={isLoading} />
              <ChatInput onSend={handleSendMessage} disabled={isLoading} />
            </>
          ) : (
            <AutomationPortal />
          )}
        </div>
      </main>
    </div>
  );
};

const App: React.FC = () => {
  return (
    <AuthProvider>
      <MainApp />
    </AuthProvider>
  );
};

export default App;

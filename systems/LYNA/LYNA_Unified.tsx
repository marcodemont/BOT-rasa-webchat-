import { useState, useRef, useEffect } from "react";
import {
  X,
  Send,
  MessageCircle,
  Brain,
  Lightbulb,
  Key,
  Trash2,
} from "lucide-react";
import { motion, AnimatePresence, useDragControls } from "motion/react";
import { toast } from "sonner@2.0.3";
import {
  projectId,
  publicAnonKey,
} from "../../../utils/supabase/info";
import { supabase } from "../../../utils/supabase/client";
import { AdminLoginDialog } from "../../admin/AdminLoginDialog";

interface Message {
  role: "user" | "assistant" | "system";
  content: string;
  timestamp: Date;
}

interface ChatBotProps {
  onOpenAura?: () => void;
  onOpenJoi?: () => void;
  onEditorLogin?: (token: string, user: any) => void;
  onClick?: () => void;
  zIndex?: number;
  onClose?: () => void;
}

const WELCOME_MESSAGES = [
  {
    id: 1,
    content: "Hallo, wenn ich helfen kann, einfach auf die Bubble klicken!",
  },
];

const QUICK_REPLIES = [
  "System erkunden",
  "Ich habe eine Frage",
  "Nur stöbern",
];

export function LYNA_Unified({
  onOpenAura,
  onOpenJoi,
  onEditorLogin,
  onClick,
  zIndex = 9999,
  onClose,
}: ChatBotProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showAdminDialog, setShowAdminDialog] = useState(false);
  const [showWelcome, setShowWelcome] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [currentUser, setCurrentUser] = useState<{
    id: string;
    name: string;
    email: string;
    role: string;
  } | null>(null);
  const [isAdminActive, setIsAdminActive] = useState(false);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const dragControls = useDragControls();
  const bubbleDragControls = useDragControls();
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [bubblePosition, setBubblePosition] = useState({ x: 0, y: 0 });

  // Check admin status
  useEffect(() => {
    const checkAdminStatus = () => {
      const status = isAdminLoggedIn();
      setIsAdminActive(status);
    };

    checkAdminStatus();
    const interval = setInterval(checkAdminStatus, 5000);

    const handleStorageChange = (e: StorageEvent) => {
      if (
        e.key === "aurix_admin_session" ||
        e.key === "admin_token"
      ) {
        checkAdminStatus();
      }
    };

    window.addEventListener("storage", handleStorageChange);

    return () => {
      clearInterval(interval);
      window.removeEventListener("storage", handleStorageChange);
    };
  }, []);

  // Load current user
  useEffect(() => {
    const adminUser = localStorage.getItem("admin_user");
    const userData = localStorage.getItem("user_data");

    if (adminUser) {
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
    } else if (userData) {
      try {
        const user = JSON.parse(userData);
        setCurrentUser({
          id: user.id,
          name: user.name || user.email,
          email: user.email,
          role: "user",
        });
      } catch (e) {
        console.error("Error parsing user data:", e);
      }
    }
  }, []);

  // Check if admin is logged in
  const isAdminLoggedIn = () => {
    const adminSessionStr = localStorage.getItem("aurix_admin_session");
    if (!adminSessionStr) return false;

    try {
      const session = JSON.parse(adminSessionStr);
      if (session.expiresAt && Date.now() > session.expiresAt) {
        localStorage.removeItem("aurix_admin_session");
        localStorage.removeItem("admin_token");
        localStorage.removeItem("admin_user");
        return false;
      }
      return true;
    } catch (e) {
      return false;
    }
  };

  // Show welcome messages on homepage reload only
  useEffect(() => {
    // Only show on homepage
    const isHomepage = window.location.pathname === '/';
    
    if (isHomepage && !isOpen) {
      const delay = 3000 + Math.random() * 2000;
      const timer = setTimeout(() => {
        setShowWelcome(true);
        setUnreadCount(WELCOME_MESSAGES.length);
      }, delay);

      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  // Load messages from localStorage
  useEffect(() => {
    const getWelcomeMessage = () => {
      if (currentUser) {
        return `Hallo ${currentUser.name}! Ich bin LYNA – deine persönliche kognitive Assistentin für AURIX.design. Ich helfe dir bei der Strukturierung deiner Gedanken, beim Erkunden der Module und bei allen Fragen. Wie kann ich dir heute helfen?`;
      } else {
        return "Hallo! Ich bin LYNA – deine kognitive KI-Assistentin für AURIX.design. Ich kann dir das System erklären, bei der Navigation helfen und deine Fragen beantworten. Wie kann ich dir helfen?";
      }
    };

    if (currentUser === undefined) return;

    const messagesKey = currentUser
      ? `aurix_lyna_messages_${currentUser.id}`
      : "aurix_lyna_messages_public";
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
        console.error("Error loading chat messages:", error);
        setMessages([
          {
            role: "assistant",
            content: getWelcomeMessage(),
            timestamp: new Date(),
          },
        ]);
      }
    } else {
      setMessages([
        {
          role: "assistant",
          content: getWelcomeMessage(),
          timestamp: new Date(),
        },
      ]);
    }
  }, [currentUser]);

  // Save messages to localStorage
  useEffect(() => {
    if (messages.length > 0 && currentUser !== undefined) {
      const messagesKey = currentUser
        ? `aurix_lyna_messages_${currentUser.id}`
        : "aurix_lyna_messages_public";
      localStorage.setItem(messagesKey, JSON.stringify(messages));
    }
  }, [messages, currentUser]);

  // Close LYNA when admin dialog opens
  useEffect(() => {
    if (showAdminDialog) {
      setIsOpen(false);
    }
  }, [showAdminDialog]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleQuickReply = (reply: string) => {
    setShowWelcome(false);
    localStorage.setItem("hasSeenLynaIntro", "true");
    setUnreadCount(0);
    handleSend(reply);
  };

  const handleSend = async (messageText?: string) => {
    const textToSend = messageText || input.trim();
    if (!textToSend || isLoading) return;

    const userMessage: Message = {
      role: "user",
      content: textToSend,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);

    try {
      // Check for AURA trigger
      const auraPatterns = [
        /\baura\b/i,
        /^aura$/i,
        /öffne\s+aura/i,
        /zeig\s+mir\s+aura/i,
        /starte\s+aura/i,
      ];

      if (auraPatterns.some((pattern) => pattern.test(textToSend))) {
        const auraMessage: Message = {
          role: "assistant",
          content:
            "Ich öffne AURA für dich! AURA ist deine analytische Assistentin mit READ-ONLY Zugriff auf alle Referenzen und Notizbücher.",
          timestamp: new Date(),
        };
        setMessages((prev) => [...prev, auraMessage]);

        if (onOpenAura) {
          setTimeout(() => onOpenAura(), 500);
        }
        setIsLoading(false);
        return;
      }

      // Check for JOI trigger
      const joiPatterns = [
        /\bjoi\b/i,
        /^joi$/i,
        /öffne\s+joi/i,
        /zeig\s+mir\s+joi/i,
        /starte\s+joi/i,
      ];

      if (joiPatterns.some((pattern) => pattern.test(textToSend))) {
        const joiMessage: Message = {
          role: "assistant",
          content:
            "Ich öffne JOI für dich! JOI ist deine explorative Assistentin, die alternative Perspektiven vorschlägt.",
          timestamp: new Date(),
        };
        setMessages((prev) => [...prev, joiMessage]);

        if (onOpenJoi) {
          setTimeout(() => onOpenJoi(), 500);
        }
        setIsLoading(false);
        return;
      }

      // Check for Admin trigger
      const adminPatterns = [
        /\badmin\b/i,
        /administration/i,
        /verwaltung/i,
        /\blogin\b/i,
        /anmelden/i,
        /admin\s+bereich/i,
      ];

      if (adminPatterns.some((pattern) => pattern.test(textToSend))) {
        if (isAdminActive && onEditorLogin) {
          const adminToken = localStorage.getItem("admin_token");
          const adminUserStr = localStorage.getItem("admin_user");

          if (adminToken && adminUserStr) {
            try {
              const adminUser = JSON.parse(adminUserStr);
              const successMessage: Message = {
                role: "assistant",
                content: `Willkommen zurück, ${adminUser.name}! Ich öffne den Admin-Bereich für dich...`,
                timestamp: new Date(),
              };
              setMessages((prev) => [...prev, successMessage]);

              setTimeout(() => {
                onEditorLogin(adminToken, adminUser);
              }, 500);

              setIsLoading(false);
              return;
            } catch (error) {
              console.error("Error parsing admin user:", error);
            }
          }
        }

        const editorResponse: Message = {
          role: "assistant",
          content:
            "Du möchtest auf den Admin-Bereich zugreifen. Dies ist ein geschützter Bereich. Bitte authentifiziere dich.",
          timestamp: new Date(),
        };
        setMessages((prev) => [...prev, editorResponse]);
        setShowAdminDialog(true);
        setIsLoading(false);
        return;
      }

      // General query - call AURIX backend
      await handleGeneralQuery(textToSend);
    } catch (error) {
      console.error("LYNA error:", error);
      toast.error("Fehler bei der Kommunikation mit LYNA");

      const fallbackMessage: Message = {
        role: "assistant",
        content: generateFallbackResponse(textToSend),
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, fallbackMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  // General query handler - Calls AURIX backend
  const handleGeneralQuery = async (query: string) => {
    try {
      console.log("🤖 LYNA: Calling AURIX backend...");
      console.log("📝 Query:", query);

      // Build messages array for LYNA
      const messagesForAI = [
        {
          role: "system" as const,
          content: `Du bist LYNA, eine kognitive Assistentin für AURIX.design - ein kognitives Assistenzsystem mit 4 Hauptmodulen:

1. **Dialogue** - Sprachinteraktion und Konversationslogik
2. **Structure** - Kognitive Landkarte und Wissensgraph
3. **Meta** - Reflexion und Widerspruchsanalyse
4. **Projects** - Langfristige Projektkontinuität

Du hilfst Nutzern bei:
- Navigation durch die Module
- Strukturierung ihrer Gedanken
- Verständnis des Systems
- Nutzung der verschiedenen Features

Antworte freundlich, hilfreich und präzise. Verwende deutsche Sprache.`,
        },
        ...messages.slice(-5).map((msg) => ({
          role: msg.role === "system" ? "assistant" : msg.role,
          content: msg.content,
        })),
        {
          role: "user" as const,
          content: query,
        },
      ];

      // Call AURIX AI backend
      const { data, error } = await supabase.functions.invoke(
        "server/make-server-c302f717/ai/lyna",
        {
          body: {
            messages: messagesForAI,
          },
        }
      );

      if (error) {
        console.error("❌ Supabase Functions error:", error);
        throw new Error(
          error.message || "Supabase Functions call failed"
        );
      }

      console.log("✅ Backend response:", data);

      if (data && data.content) {
        const assistantMessage: Message = {
          role: "assistant",
          content: data.content,
          timestamp: new Date(),
        };
        setMessages((prev) => [...prev, assistantMessage]);
      } else {
        throw new Error(data?.error || "Invalid response from backend");
      }
    } catch (error) {
      console.error("❌ LYNA Error:", error);
      
      // Fallback response
      const errorMessage: Message = {
        role: "assistant",
        content: `Es tut mir leid, ich konnte keine Verbindung zum Backend herstellen.\n\n**Fehler:** ${error instanceof Error ? error.message : String(error)}\n\nIch kann dir aber trotzdem helfen! Was möchtest du über AURIX wissen?`,
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, errorMessage]);
    }
  };

  // Fallback response generator
  const generateFallbackResponse = (query: string): string => {
    const lowerQuery = query.toLowerCase();

    if (
      lowerQuery.includes("dialogue") ||
      lowerQuery.includes("dialog") ||
      lowerQuery.includes("gespräch")
    ) {
      return "Das **Dialogue-Modul** ist dein Hauptinterface für Sprachinteraktion. Hier kannst du mit den KI-Assistenten sprechen und Konversationen führen. Es klassifiziert deine Intentionen und passt sich deinem Kommunikationsstil an.";
    }

    if (
      lowerQuery.includes("structure") ||
      lowerQuery.includes("struktur") ||
      lowerQuery.includes("graph")
    ) {
      return "Das **Structure-Modul** visualisiert deine kognitive Landkarte. Du kannst Wissensknoten erstellen, Verbindungen ziehen und deine Gedankenstruktur im Wissensgraph explorieren. Perfekt für visuelles Denken!";
    }

    if (
      lowerQuery.includes("meta") ||
      lowerQuery.includes("reflexion") ||
      lowerQuery.includes("widerspruch")
    ) {
      return "Das **Meta-Modul** analysiert deine Denkprozesse auf Widersprüche und Annahmen. Es hilft dir, alternative Perspektiven zu finden und deine Argumentation zu verfeinern. Eine Ebene über dem normalen Denken!";
    }

    if (
      lowerQuery.includes("project") ||
      lowerQuery.includes("projekt")
    ) {
      return "Das **Projects-Modul** sichert langfristige Kontinuität. Deine Gedanken, Strukturen und Erkenntnisse werden über Zeit gespeichert und evolutionär weiterentwickelt. So verlierst du nie den Faden!";
    }

    if (
      lowerQuery.includes("aura")
    ) {
      return "**AURA** ist deine analytische Assistentin mit READ-ONLY Zugriff. Sie analysiert Netzwerkstrukturen, erkennt Muster und identifiziert Konflikte – aber greift niemals ein. Sage einfach 'AURA' um sie zu starten!";
    }

    if (
      lowerQuery.includes("joi")
    ) {
      return "**JOI** ist deine explorative Assistentin. Sie schlägt alternative Perspektiven vor und simuliert mögliche Reaktionen. Perfekt für Brainstorming und kreatives Denken! Sage einfach 'JOI' um sie zu starten!";
    }

    return "Ich bin LYNA, deine kognitive Assistentin für AURIX.design. Ich kann dir helfen mit:\n\n• **Dialogue** - Sprachinteraktion\n• **Structure** - Visuelle Denkstruktur\n• **Meta** - Reflexion & Analyse\n• **Projects** - Langfristige Kontinuität\n\nWorüber möchtest du mehr erfahren?";
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const clearChat = () => {
    const messagesKey = currentUser
      ? `aurix_lyna_messages_${currentUser.id}`
      : "aurix_lyna_messages_public";
    localStorage.removeItem(messagesKey);
    
    const welcomeMsg = currentUser
      ? `Hallo ${currentUser.name}! Ich bin LYNA – deine persönliche kognitive Assistentin für AURIX.design.`
      : "Hallo! Ich bin LYNA – deine kognitive KI-Assistentin für AURIX.design.";
    
    setMessages([
      {
        role: "assistant",
        content: welcomeMsg,
        timestamp: new Date(),
      },
    ]);
    
    toast.success("Chat-Verlauf gelöscht");
  };

  return (
    <>
      {/* Welcome Messages - Floating above button */}
      <AnimatePresence>
        {showWelcome && !isOpen && (
          <div className="fixed bottom-32 right-6 z-[9999] flex flex-col items-end gap-3">
            {WELCOME_MESSAGES.map((msg, index) => (
              <motion.div
                key={msg.id}
                initial={{ opacity: 0, x: 20, y: 20 }}
                animate={{ opacity: 1, x: 0, y: 0 }}
                exit={{ opacity: 0, x: 20, y: -20 }}
                transition={{ delay: index * 0.3 }}
                className="flex items-start gap-3"
              >
                <div className="w-12 h-12 bg-black rounded-full flex items-center justify-center flex-shrink-0 shadow-lg">
                  <MessageCircle className="h-6 w-6 text-white" />
                </div>
                <div className="bg-white rounded-2xl shadow-xl px-6 py-4 max-w-xs">
                  <p className="text-gray-800 text-base leading-relaxed">
                    {msg.content}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </AnimatePresence>

      {/* Chat Window - Floating & Draggable */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="fixed bottom-28 right-6 z-[9999] w-96 max-h-[600px] flex flex-col"
          >
            {/* Messages - Transparent Background */}
            <div className="flex-1 overflow-y-auto px-4 space-y-3 max-h-[440px] scrollbar-hide">
              {messages.map((message, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`flex ${
                    message.role === "user"
                      ? "justify-end"
                      : "items-start gap-2"
                  }`}
                >
                  {message.role !== "user" && (
                    <div className="w-8 h-8 bg-black rounded-full flex items-center justify-center flex-shrink-0 shadow-lg">
                      <MessageCircle className="h-4 w-4 text-white" />
                    </div>
                  )}
                  <div
                    className={`rounded-2xl px-4 py-2.5 max-w-[280px] text-sm shadow-xl ${
                      message.role === "user"
                        ? "bg-gradient-to-r from-blue-500 to-indigo-600 text-white"
                        : message.role === "system"
                        ? "bg-yellow-100 text-gray-800 border border-yellow-300"
                        : "bg-white text-gray-800 border border-gray-200"
                    }`}
                  >
                    <p className="leading-relaxed whitespace-pre-wrap">
                      {message.content}
                    </p>
                    <p
                      className={`text-xs mt-1 ${
                        message.role === "user"
                          ? "text-white/70"
                          : "text-gray-500"
                      }`}
                    >
                      {message.timestamp.toLocaleTimeString("de-DE", {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </p>
                  </div>
                </motion.div>
              ))}

              {isLoading && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="flex items-start gap-2"
                >
                  <div className="w-8 h-8 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full flex items-center justify-center flex-shrink-0 shadow-lg">
                    <MessageCircle className="h-4 w-4 text-white" />
                  </div>
                  <div className="bg-white rounded-2xl shadow-xl px-4 py-2.5 border border-gray-200">
                    <div className="flex gap-1">
                      <div
                        className="w-2 h-2 bg-yellow-500 rounded-full animate-bounce"
                        style={{ animationDelay: "0ms" }}
                      />
                      <div
                        className="w-2 h-2 bg-yellow-500 rounded-full animate-bounce"
                        style={{ animationDelay: "150ms" }}
                      />
                      <div
                        className="w-2 h-2 bg-yellow-500 rounded-full animate-bounce"
                        style={{ animationDelay: "300ms" }}
                      />
                    </div>
                  </div>
                </motion.div>
              )}

              <div ref={messagesEndRef} />
            </div>

            {/* Input Field - As Floating Bubble */}
            <div className="px-4 pt-3">
              <div className="bg-white rounded-full shadow-xl px-4 py-3 flex items-center gap-2 border border-gray-200">
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Nachricht an LYNA..."
                  className="flex-1 bg-transparent text-sm focus:outline-none text-gray-900 placeholder-gray-500"
                />
                <button
                  onClick={() => handleSend()}
                  disabled={!input.trim() || isLoading}
                  className="bg-gradient-to-r from-yellow-400 to-orange-500 text-white p-2 rounded-full hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed flex-shrink-0"
                >
                  <Send className="h-4 w-4" />
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Floating Button with Quick Replies - Draggable */}
      <AnimatePresence>
        {!isOpen && (
          <motion.div
            drag
            dragControls={bubbleDragControls}
            dragMomentum={false}
            dragElastic={0.05}
            initial={{ opacity: 0, scale: 0 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0 }}
            className="fixed bottom-6 right-6 touch-none"
            style={{ zIndex, x: bubblePosition.x, y: bubblePosition.y }}
          >
            {/* Quick Reply Buttons - Only visible when welcome is shown */}
            {showWelcome && (
              <>
                {/* Button 1 - Top Left */}
                <motion.button
                  initial={{ opacity: 0, scale: 0 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0 }}
                  transition={{ delay: 0.9 }}
                  onClick={() => {
                    setIsOpen(true);
                    handleQuickReply(QUICK_REPLIES[0]);
                  }}
                  className="absolute bottom-[70px] right-[80px] bg-white hover:bg-gray-50 text-gray-700 px-4 py-2 rounded-full shadow-lg transition-all hover:shadow-xl border border-gray-200 text-sm font-medium whitespace-nowrap"
                >
                  {QUICK_REPLIES[0]}
                </motion.button>

                {/* Button 2 - Top */}
                <motion.button
                  initial={{ opacity: 0, scale: 0 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0 }}
                  transition={{ delay: 1.0 }}
                  onClick={() => {
                    setIsOpen(true);
                    handleQuickReply(QUICK_REPLIES[1]);
                  }}
                  className="absolute bottom-[90px] right-[-20px] bg-white hover:bg-gray-50 text-gray-700 px-4 py-2 rounded-full shadow-lg transition-all hover:shadow-xl border border-gray-200 text-sm font-medium whitespace-nowrap"
                >
                  {QUICK_REPLIES[1]}
                </motion.button>

                {/* Button 3 - Left */}
                <motion.button
                  initial={{ opacity: 0, scale: 0 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0 }}
                  transition={{ delay: 1.1 }}
                  onClick={() => {
                    setIsOpen(true);
                    handleQuickReply(QUICK_REPLIES[2]);
                  }}
                  className="absolute bottom-[10px] right-[100px] bg-white hover:bg-gray-50 text-gray-700 px-4 py-2 rounded-full shadow-lg transition-all hover:shadow-xl border border-gray-200 text-sm font-medium whitespace-nowrap"
                >
                  {QUICK_REPLIES[2]}
                </motion.button>
              </>
            )}

            {/* Main Chat Button - Draggable */}
            <motion.button
              onClick={() => {
                setIsOpen(true);
                setShowWelcome(false);
                localStorage.setItem("hasSeenLynaIntro", "true");
                setUnreadCount(0);
              }}
              onPointerDown={(e) => bubbleDragControls.start(e)}
              className="w-16 h-16 bg-gradient-to-r from-yellow-400 via-amber-500 to-orange-500 rounded-full flex items-center justify-center text-white shadow-2xl hover:shadow-3xl transition-all relative cursor-move"
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
            >
              {/* Unread Badge */}
              {unreadCount > 0 && (
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="absolute -top-1 -right-1 w-6 h-6 bg-red-500 rounded-full flex items-center justify-center text-white text-xs font-bold shadow-lg"
                >
                  {unreadCount}
                </motion.div>
              )}

              <MessageCircle className="h-8 w-8" />
            </motion.button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Admin Login Dialog */}
      {showAdminDialog && (
        <AdminLoginDialog
          onClose={() => setShowAdminDialog(false)}
          onSuccess={(token, user) => {
            setShowAdminDialog(false);
            if (onEditorLogin) {
              onEditorLogin(token, user);
            }
          }}
        />
      )}
    </>
  );
}
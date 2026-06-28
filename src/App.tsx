import React, { useState, useEffect, useRef } from "react";
import { ChatSession, ChatMode, Message, UserMemoryProfile } from "./types";
import { MODES, SUGGESTIONS, DEFAULT_PROFILE } from "./data";
import Sidebar from "./components/Sidebar";
import MemoryModal from "./components/MemoryModal";
import MarkdownRenderer from "./components/MarkdownRenderer";
import SyllabusTracker from "./components/SyllabusTracker";
import StudyPlanner from "./components/StudyPlanner";
import DocumentCreator from "./components/DocumentCreator";
import LoginModal from "./components/LoginModal";
import AuthScreen from "./components/AuthScreen";
import { UserLogin, StudyTask, INBUILT_SYLLABUS } from "./syllabus";
import { 
  Send, Image as ImageIcon, BookOpen, FileCheck, Zap, 
  BrainCircuit, X, Sparkles, Brain, Plus, AlertCircle, Eye, 
  Menu, Trash2, CheckCircle2, ChevronRight, CornerDownLeft, Calendar, LayoutGrid,
  FileText, FileSpreadsheet, Paperclip, Camera, Compass, FolderOpen
} from "lucide-react";

export function getNameFromEmail(email: string): string {
  if (!email || !email.includes("@")) return "Praveen";
  const part = email.split("@")[0];
  if (part.toLowerCase().includes("harini")) {
    return "Praveen";
  }
  const clean = part.replace(/[0-9]+/g, "").replace(/[._-]+/g, " ").trim();
  if (!clean) return "Praveen";
  return clean
    .split(" ")
    .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(" ");
}

export function ZyloLogo({ className = "w-8 h-8", style }: { className?: string; style?: React.CSSProperties }) {
  return (
    <svg 
      viewBox="0 0 120 120" 
      fill="none" 
      xmlns="http://www.w3.org/2000/svg" 
      className={`${className} select-none drop-shadow-[0_0_15px_rgba(168,85,247,0.55)]`}
      style={style}
    >
      <defs>
        <linearGradient id="zyloMetallic" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#bf5af2" /> {/* Light Purple */}
          <stop offset="50%" stopColor="#8b5cf6" /> {/* Deep Purple */}
          <stop offset="100%" stopColor="#00b4d8" /> {/* Electric Blue */}
        </linearGradient>
        <filter id="neonGlow" x="-20%" y="-20%" width="140%" height="140%">
          <feGaussianBlur stdDeviation="3.5" result="blur" />
          <feComposite in="SourceGraphic" in2="blur" operator="over" />
        </filter>
      </defs>
      
      <g filter="url(#neonGlow)">
        {/* Main Z body: with sharp horn curving to the left, diagonal body and bottom wing */}
        <path 
          d="M 24,36 C 30,36 34,32 37,27 L 85,27 L 40,78 H 26 C 32,78 36,75 39,70 L 51,56 L 24,36 Z" 
          fill="url(#zyloMetallic)" 
        />
        {/* Sleek bottom foot of Z */}
        <path 
          d="M 38,78 L 84,78 C 78,78 74,81 71,86 L 88,86 L 88,78 L 54,40 L 38,78 Z" 
          fill="url(#zyloMetallic)" 
        />
        {/* The prominent futuristic parallel slash/blade extending far up-right */}
        <path 
          d="M 96,22 L 28,94 C 32,94 35,92 37,87 L 96,29 V 22 Z" 
          fill="url(#zyloMetallic)" 
        />
      </g>
    </svg>
  );
}

export default function App() {
  // Application State
  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [activeSessionId, setActiveSessionId] = useState<string | null>(null);
  const [profile, setProfile] = useState<UserMemoryProfile>(DEFAULT_PROFILE);
  const [sidebarOpen, setSidebarOpen] = useState(() => {
    if (typeof window !== "undefined") {
      return window.innerWidth > 768;
    }
    return false;
  });
  const [memoryModalOpen, setMemoryModalOpen] = useState(false);
  
  // Tab Navigation Desk State
  const [activeTab, setActiveTab] = useState<"chat" | "syllabus" | "planner" | "documents">("chat");
  const [tabsExpanded, setTabsExpanded] = useState(true);
  const [loginModalOpen, setLoginModalOpen] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(() => {
    if (typeof window !== "undefined") {
      return !!localStorage.getItem("zylo_user_login");
    }
    return false;
  });

  // Inbuilt Data States
  const [userLogin, setUserLogin] = useState<UserLogin>({
    name: "Praveen",
    identifier: "maniharini091@gmail.com",
    targetAttempt: "September 2026"
  });
  const [completedTopics, setCompletedTopics] = useState<string[]>([]);
  const [plannerTasks, setPlannerTasks] = useState<StudyTask[]>([]);

  // Current input states
  const [inputMessage, setInputMessage] = useState("");
  const [selectedMode, setSelectedMode] = useState<ChatMode>("study");
  const [attachedFile, setAttachedFile] = useState<{ name: string; type: string; dataUrl: string } | null>(null);
  const [isSending, setIsSending] = useState(false);
  const [showUploadMenu, setShowUploadMenu] = useState(false);
  const [activeModel, setActiveModel] = useState("zylo 3.5 flash");
  const [errorStatus, setErrorStatus] = useState<string | null>(null);
  
  // Loading indicator text - always "Zylo is thinking..."
  const [loadingText, setLoadingText] = useState("Zylo is thinking...");
  useEffect(() => {
    setLoadingText("Zylo is thinking...");
  }, [isSending]);

  // Full-screen image preview
  const [expandedImage, setExpandedImage] = useState<string | null>(null);

  // References
  const chatEndRef = useRef<HTMLDivElement>(null);
  const imageInputRef = useRef<HTMLInputElement>(null);
  const photosInputRef = useRef<HTMLInputElement>(null);
  const filesInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);

  // Load configuration and session list on mount
  useEffect(() => {
    const savedSessions = localStorage.getItem("zylo_sessions");
    const savedProfile = localStorage.getItem("zylo_profile");
    const savedUser = localStorage.getItem("zylo_user_login");
    const savedCompleted = localStorage.getItem("zylo_completed_topics");
    const savedTasks = localStorage.getItem("zylo_planner_tasks");
    
    if (savedSessions) {
      try {
        const parsed = JSON.parse(savedSessions);
        setSessions(parsed);
        if (parsed.length > 0) {
          setActiveSessionId(parsed[0].id);
        }
      } catch (err) {
        console.error("Error loading cached study sessions:", err);
      }
    }
    
    if (savedProfile) {
      try {
        setProfile(JSON.parse(savedProfile));
      } catch (err) {
        console.error("Error loading cached cognitive profile:", err);
      }
    }

    if (savedUser) {
      try {
        const parsed = JSON.parse(savedUser) as UserLogin;
        if (parsed.name.toLowerCase().includes("harini")) {
          parsed.name = getNameFromEmail(parsed.identifier);
        }
        setUserLogin(parsed);
        setIsLoggedIn(true);
      } catch (err) {
        console.error("Error loading cached user login:", err);
        setIsLoggedIn(false);
      }
    } else {
      setIsLoggedIn(false);
      setUserLogin({
        name: "Praveen",
        identifier: "maniharini091@gmail.com",
        targetAttempt: "September 2026"
      });
    }

    if (savedCompleted) {
      try {
        setCompletedTopics(JSON.parse(savedCompleted));
      } catch (err) {
        console.error("Error loading cached completed syllabus topics:", err);
      }
    }

    if (savedTasks) {
      try {
        setPlannerTasks(JSON.parse(savedTasks));
      } catch (err) {
        console.error("Error loading cached study planner tasks:", err);
      }
    }
  }, []);

  // Sync state changes back to local storage
  const saveSessions = (updated: ChatSession[]) => {
    setSessions(updated);
    try {
      localStorage.setItem("zylo_sessions", JSON.stringify(updated));
    } catch (err) {
      console.warn("Storage quota exceeded, cleaning up older session images...", err);
      try {
        // Let's create a deep copy of the sessions and start clearing older messages' images
        // to reduce local storage footprint.
        let cleanedSessions = JSON.parse(JSON.stringify(updated)) as ChatSession[];
        let imageClearedCount = 0;
        
        // Loop backwards (oldest sessions to newest) and clear their image attachments
        for (let i = cleanedSessions.length - 1; i >= 0; i--) {
          const sess = cleanedSessions[i];
          if (sess.messages) {
            for (let m = 0; m < sess.messages.length; m++) {
              if (sess.messages[m].image) {
                sess.messages[m].image = ""; // clear base64 data to save space
                imageClearedCount++;
                
                // Try saving again after each clear to minimize data loss
                try {
                  localStorage.setItem("zylo_sessions", JSON.stringify(cleanedSessions));
                  console.log(`Successfully saved sessions after clearing ${imageClearedCount} old image(s).`);
                  setSessions(cleanedSessions);
                  return;
                } catch (retryErr) {
                  // Continue clearing more images
                }
              }
            }
          }
        }
        
        // If we cleared all images and it still fails, keep only the last 3 sessions
        if (cleanedSessions.length > 3) {
          cleanedSessions = cleanedSessions.slice(0, 3);
          try {
            localStorage.setItem("zylo_sessions", JSON.stringify(cleanedSessions));
            setSessions(cleanedSessions);
            return;
          } catch (finalErr) {
            console.error("Critical failure: unable to save sessions even after trimming sessions:", finalErr);
          }
        }
      } catch (innerErr) {
        console.error("Error during quota cleanup recovery:", innerErr);
      }
    }
  };

  const saveProfile = (updated: UserMemoryProfile) => {
    setProfile(updated);
    localStorage.setItem("zylo_profile", JSON.stringify(updated));
  };

  const saveUserLogin = (updated: UserLogin) => {
    let finalLogin = { ...updated };
    if (finalLogin.name.toLowerCase().includes("harini")) {
      finalLogin.name = getNameFromEmail(finalLogin.identifier);
    }
    setUserLogin(finalLogin);
    localStorage.setItem("zylo_user_login", JSON.stringify(finalLogin));
    setIsLoggedIn(true);
    // Adapt profile notes to match new user
    const updatedProfile = {
      ...profile,
      notes: `${finalLogin.name} is studying for their CA Intermediate course. They want detailed answers, helpful section citations, and love interactive evaluation of their handwritten answers.`
    };
    saveProfile(updatedProfile);
  };

  const handleLogout = () => {
    localStorage.removeItem("zylo_user_login");
    setIsLoggedIn(false);
    setUserLogin({
      name: "Praveen",
      identifier: "maniharini091@gmail.com",
      targetAttempt: "September 2026"
    });
  };

  const saveCompletedTopics = (updated: string[]) => {
    setCompletedTopics(updated);
    localStorage.setItem("zylo_completed_topics", JSON.stringify(updated));
  };

  const savePlannerTasks = (updated: StudyTask[]) => {
    setPlannerTasks(updated);
    localStorage.setItem("zylo_planner_tasks", JSON.stringify(updated));
  };

  // Syllabus tracker & study planner action triggers
  const handleToggleSyllabusTopic = (topicId: string) => {
    const isCompleted = completedTopics.includes(topicId);
    const updated = isCompleted 
      ? completedTopics.filter(id => id !== topicId) 
      : [...completedTopics, topicId];
    saveCompletedTopics(updated);
  };

  const handleAddPlannerTask = (newTask: Omit<StudyTask, "id">) => {
    const task: StudyTask = {
      ...newTask,
      id: "task_" + Date.now()
    };
    const updated = [task, ...plannerTasks];
    savePlannerTasks(updated);
  };

  const handleDeletePlannerTask = (taskId: string) => {
    const updated = plannerTasks.filter(t => t.id !== taskId);
    savePlannerTasks(updated);
  };

  const handleUpdatePlannerTaskStatus = (taskId: string, status: StudyTask["status"]) => {
    const updated = plannerTasks.map(t => t.id === taskId ? { ...t, status } : t);
    savePlannerTasks(updated);
  };

  const handleStartStudyWithAI = (topicName: string, subjectName: string) => {
    // 1. Switch to chat tab
    setActiveTab("chat");
    // 2. Select mode 'study'
    setSelectedMode("study");
    // 3. Craft query
    const studyPrompt = `Hi Zylo! I am currently studying "${topicName}" from "${subjectName}" under the CA Intermediate September 2026 attempt syllabus. Please act as my personal CA tutor and give me a clear, comprehensive breakdown of the key provisions, important section citations, and a practical scenario to test my active recall on this topic! Keep it highly advanced and aligned with ICAI standards.`;
    
    // 4. Fill in input message
    setInputMessage(studyPrompt);
  };

  // Scroll to bottom of active conversation
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [activeSessionId, sessions, isSending]);

  // Session Management
  const handleCreateSession = (initialMode: ChatMode = "study") => {
    const newSession: ChatSession = {
      id: "session_" + Date.now(),
      title: `CA Prep (${MODES.find(m => m.id === initialMode)?.shortName || "Study"}) - ${new Date().toLocaleDateString()}`,
      messages: [],
      mode: initialMode,
      createdAt: new Date().toISOString(),
      lastActiveAt: new Date().toISOString(),
    };
    const updated = [newSession, ...sessions];
    saveSessions(updated);
    setActiveSessionId(newSession.id);
    setSelectedMode(initialMode);
    setErrorStatus(null);
    if (window.innerWidth < 768) {
      setSidebarOpen(false);
    }
  };

  const handleDeleteSession = (id: string) => {
    const updated = sessions.filter(s => s.id !== id);
    saveSessions(updated);
    if (activeSessionId === id) {
      setActiveSessionId(updated.length > 0 ? updated[0].id : null);
    }
  };

  const handleSelectSession = (id: string) => {
    setActiveSessionId(id);
    const session = sessions.find(s => s.id === id);
    if (session) {
      setSelectedMode(session.mode);
    }
    setErrorStatus(null);
    if (window.innerWidth < 768) {
      setSidebarOpen(false);
    }
  };

  const activeSession = sessions.find(s => s.id === activeSessionId) || null;

  // File & Image Management (OCR supporting answers evaluation)
  const handleImageSelectClick = () => {
    imageInputRef.current?.click();
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === "string") {
        setAttachedFile({
          name: file.name,
          type: file.type || "application/octet-stream",
          dataUrl: reader.result
        });
        // Automatically switch mode to evaluator when a document/image is attached
        setSelectedMode("evaluator");
      }
    };
    reader.readAsDataURL(file);
    e.target.value = ""; // Reset input so same file can trigger change
  };

  const handleRemoveImage = () => {
    setAttachedFile(null);
  };

  // Submit chat message to the Express server proxy
  const handleSendMessage = async (textToSend?: string) => {
    const prompt = (textToSend || inputMessage).trim();
    if (!prompt && !attachedFile) return;

    setErrorStatus(null);

    // If there is no active session, create one first
    let currentSessionId = activeSessionId;
    let currentSession = activeSession;
    
    if (!currentSessionId) {
      const newSessionId = "session_" + Date.now();
      const newSession: ChatSession = {
        id: newSessionId,
        title: prompt ? (prompt.length > 25 ? prompt.substring(0, 25) + "..." : prompt) : "Document Analysis",
        messages: [],
        mode: selectedMode,
        createdAt: new Date().toISOString(),
        lastActiveAt: new Date().toISOString(),
      };
      
      currentSessionId = newSessionId;
      currentSession = newSession;
      // We directly update list state locally first to avoid race conditions
      sessions.unshift(newSession);
      setSessions([...sessions]);
      setActiveSessionId(newSessionId);
    }

    // Add User Message
    const userMsg: Message = {
      id: "msg_" + Date.now(),
      role: "user",
      content: prompt,
      image: attachedFile?.dataUrl || undefined,
      attachmentName: attachedFile?.name || undefined,
      attachmentType: attachedFile?.type || undefined,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    const updatedMessages = [...(currentSession?.messages || []), userMsg];
    
    // Auto-rename untitled/new sessions to match prompt
    let title = currentSession?.title || "Study Session";
    if (currentSession?.messages.length === 0 && prompt) {
      title = prompt.length > 28 ? prompt.substring(0, 28) + "..." : prompt;
    }

    const updatedSession: ChatSession = {
      ...currentSession!,
      messages: updatedMessages,
      mode: selectedMode,
      title: title,
      lastActiveAt: new Date().toISOString(),
    };

    // Update session list
    const updatedSessionsList = sessions.map(s => s.id === currentSessionId ? updatedSession : s);
    saveSessions(updatedSessionsList);
    
    // Clear input
    setInputMessage("");
    setAttachedFile(null);
    setIsSending(true);

    try {
      // Structure profile block as text context
      const userMemoryText = `
User: ${userLogin.name}
Preferred Language: ${profile.preferredLanguage}
Struggle/Weak Zones: ${profile.weakAreas.join(", ") || "None logged yet"}
Mastered/Strengths: ${profile.strengths.join(", ") || "None logged yet"}
Custom Tutor Notes: ${profile.notes}
`;

      const response = await fetch("/api/zylo/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          messages: updatedMessages.map(m => ({
            role: m.role,
            content: m.content,
          })),
          mode: selectedMode,
          userMemoryProfile: userMemoryText,
          userName: userLogin.name,
          image: userMsg.image ? {
            mimeType: userMsg.attachmentType || userMsg.image.split(";")[0].split(":")[1] || "image/jpeg",
            data: userMsg.image,
          } : undefined,
        }),
      });

      if (!response.ok) {
        throw new Error(`Server returned error code: ${response.status}`);
      }

      const data = await response.json();

      if (data.modelUsed) {
        let displayName = "zylo 3.5 flash";
        if (data.modelUsed === "gemini-3.1-flash-lite") {
          displayName = "zylo 3.1 lite";
        } else if (data.modelUsed === "gemini-flash-latest") {
          displayName = "zylo flash";
        }
        setActiveModel(displayName);
      }

      // Add Zylo's response
      const assistantMsg: Message = {
        id: "msg_" + Date.now() + "_ai",
        role: "assistant",
        content: data.reply || `I am processing that context, ${userLogin.name}. Let's look closely at the provisions.`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };

      const finalMessages = [...updatedMessages, assistantMsg];
      const finalSession = {
        ...updatedSession,
        messages: finalMessages,
      };

      const finalSessionsList = updatedSessionsList.map(s => s.id === currentSessionId ? finalSession : s);
      saveSessions(finalSessionsList);

      // Handle cognitive profile updates returned by Zylo
      if (data.memoryUpdates) {
        const up = data.memoryUpdates;
        const mergedProfile = { ...profile };

        if (Array.isArray(up.weakAreas)) {
          up.weakAreas.forEach((area: string) => {
            if (area && !mergedProfile.weakAreas.includes(area)) {
              mergedProfile.weakAreas.push(area);
            }
          });
        }

        if (Array.isArray(up.strengths)) {
          up.strengths.forEach((str: string) => {
            if (str && !mergedProfile.strengths.includes(str)) {
              mergedProfile.strengths.push(str);
            }
            // Remove from weak area if it's now a strength
            mergedProfile.weakAreas = mergedProfile.weakAreas.filter(wa => wa.toLowerCase() !== str.toLowerCase());
          });
        }

        if (up.preferredLanguage) {
          mergedProfile.preferredLanguage = up.preferredLanguage;
        }

        if (up.lastTopic) {
          mergedProfile.lastTopic = up.lastTopic;
        }

        saveProfile(mergedProfile);
      }

    } catch (err: any) {
      console.error("Error communicating with Zylo:", err);
      setErrorStatus(`Tutor Connection Interrupted: ${err.message || "Please make sure your API key is correctly configured."}`);
    } finally {
      setIsSending(false);
    }
  };

  // Suggestion chip trigger
  const handleSuggestionClick = (chip: typeof SUGGESTIONS[0]) => {
    setSelectedMode(chip.mode);
    handleSendMessage(chip.prompt);
  };

  // Generate similar practice question from any uploaded image
  const handleCreateSimilarQuestionFromImage = async (imageSrc: string) => {
    setErrorStatus(null);

    // If there is no active session, create one first
    let currentSessionId = activeSessionId;
    let currentSession = activeSession;
    
    if (!currentSessionId) {
      const newSessionId = "session_" + Date.now();
      const newSession: ChatSession = {
        id: newSessionId,
        title: "Practice: Similar Question",
        messages: [],
        mode: "evaluator",
        createdAt: new Date().toISOString(),
        lastActiveAt: new Date().toISOString(),
      };
      
      currentSessionId = newSessionId;
      currentSession = newSession;
      sessions.unshift(newSession);
      setSessions([...sessions]);
      setActiveSessionId(newSessionId);
    }

    // Add User Message asking to generate a similar question
    const userMsg: Message = {
      id: "msg_" + Date.now(),
      role: "user",
      content: "I want to practice. Based on the question paper / worksheet image uploaded above, please generate a brand new, highly realistic practice question with similar structure, difficulty, and formatting (aligned with ICAI CA Intermediate standard). Do not give me the solution yet—just present the problem clearly and ask me to solve it!",
      image: imageSrc,
      attachmentName: "question_paper_reference.png",
      attachmentType: "image/png",
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    const updatedMessages = [...(currentSession?.messages || []), userMsg];
    
    const updatedSession: ChatSession = {
      ...currentSession!,
      messages: updatedMessages,
      mode: "evaluator",
      title: "Practice: Similar Question",
      lastActiveAt: new Date().toISOString(),
    };

    const updatedSessionsList = sessions.map(s => s.id === currentSessionId ? updatedSession : s);
    saveSessions(updatedSessionsList);
    
    setIsSending(true);

    try {
      const userMemoryText = `
User: ${userLogin.name}
Preferred Language: ${profile.preferredLanguage}
Struggle/Weak Zones: ${profile.weakAreas.join(", ") || "None logged yet"}
Mastered/Strengths: ${profile.strengths.join(", ") || "None logged yet"}
Additional Notes: ${profile.notes}
`;

      const response = await fetch("/api/zylo/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          messages: updatedMessages.map(msg => ({
            role: msg.role,
            content: msg.content,
          })),
          mode: "evaluator",
          userMemoryProfile: userMemoryText,
          userName: userLogin.name,
          image: {
            mimeType: "image/png",
            data: imageSrc,
          }
        }),
      });

      if (!response.ok) {
        throw new Error(`Server returned error code: ${response.status}`);
      }

      const data = await response.json();

      if (data.modelUsed) {
        let displayName = "zylo 3.5 flash";
        if (data.modelUsed === "gemini-3.1-flash-lite") {
          displayName = "zylo 3.1 lite";
        } else if (data.modelUsed === "gemini-flash-latest") {
          displayName = "zylo flash";
        }
        setActiveModel(displayName);
      }

      const assistantMsg: Message = {
        id: "msg_" + Date.now() + "_ai",
        role: "assistant",
        content: data.reply || `I am processing that context, ${userLogin.name}. Let's look closely at the provisions.`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };

      const finalMessages = [...updatedMessages, assistantMsg];
      const finalSession = {
        ...updatedSession,
        messages: finalMessages,
      };

      const finalSessionsList = updatedSessionsList.map(s => s.id === currentSessionId ? finalSession : s);
      saveSessions(finalSessionsList);

      if (data.memoryUpdates) {
        const up = data.memoryUpdates;
        const mergedProfile = { ...profile };

        if (Array.isArray(up.weakAreas)) {
          up.weakAreas.forEach((area: string) => {
            if (area && !mergedProfile.weakAreas.includes(area)) {
              mergedProfile.weakAreas.push(area);
            }
          });
        }

        if (Array.isArray(up.strengths)) {
          up.strengths.forEach((str: string) => {
            if (str && !mergedProfile.strengths.includes(str)) {
              mergedProfile.strengths.push(str);
            }
            mergedProfile.weakAreas = mergedProfile.weakAreas.filter(wa => wa.toLowerCase() !== str.toLowerCase());
          });
        }

        if (up.preferredLanguage) mergedProfile.preferredLanguage = up.preferredLanguage;
        if (up.lastTopic) mergedProfile.lastTopic = up.lastTopic;

        setProfile(mergedProfile);
        localStorage.setItem("zylo_profile", JSON.stringify(mergedProfile));
      }

    } catch (err: any) {
      console.error(err);
      setErrorStatus("Connection timeout. Please retry generating the similar question.");
    } finally {
      setIsSending(false);
    }
  };

  // Data backups and restorations
  const handleExportData = () => {
    const backup = {
      sessions,
      profile,
      exportedAt: new Date().toISOString()
    };
    
    const blob = new Blob([JSON.stringify(backup, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `zylo_ca_intermediate_backup_${new Date().toISOString().slice(0,10)}.json`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const handleImportData = (dataStr: string) => {
    try {
      const parsed = JSON.parse(dataStr);
      if (parsed && (parsed.sessions || parsed.profile)) {
        if (Array.isArray(parsed.sessions)) {
          saveSessions([...parsed.sessions, ...sessions].filter((v, i, a) => a.findIndex(t => t.id === v.id) === i));
          if (parsed.sessions.length > 0) {
            setActiveSessionId(parsed.sessions[0].id);
          }
        }
        if (parsed.profile) {
          saveProfile(parsed.profile);
        }
        alert("Study sessions and cognitive memory profile successfully restored! 🎯");
      } else {
        alert("Invalid file format. Please import a valid Zylo backup JSON file.");
      }
    } catch (err) {
      alert("Error parsing file. Please make sure it's a valid JSON backup.");
    }
  };

  const clearAllHistory = () => {
    if (confirm("Are you sure you want to clear all your study sessions and chat history? Your cognitive memory profile will be preserved.")) {
      saveSessions([]);
      setActiveSessionId(null);
    }
  };

  const getModeIcon = (mode: ChatMode) => {
    switch (mode) {
      case "evaluator": return <FileCheck className="w-4 h-4 text-cyan-400" />;
      case "qa": return <Zap className="w-4 h-4 text-yellow-400" />;
      case "recall": return <BrainCircuit className="w-4 h-4 text-rose-400" />;
      case "study":
      default:
        return <BookOpen className="w-4 h-4 text-emerald-400" />;
    }
  };

  if (!isLoggedIn) {
    return <AuthScreen onLogin={saveUserLogin} />;
  }

  return (
    <div className="flex h-screen w-screen bg-black text-zinc-100 overflow-hidden font-sans">
      
      {/* Sidebar Backdrop Overlay on Mobile */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/60 z-30 md:hidden animate-in fade-in duration-200"
          onClick={() => setSidebarOpen(false)}
        />
      )}
      
      {/* Sidebar - Manage sessions and backup state */}
      <Sidebar
        sessions={sessions}
        activeSessionId={activeSessionId}
        isOpen={sidebarOpen}
        onToggle={() => setSidebarOpen(!sidebarOpen)}
        onSelectSession={handleSelectSession}
        onCreateSession={() => handleCreateSession("study")}
        onDeleteSession={handleDeleteSession}
        onOpenMemory={() => {
          setMemoryModalOpen(true);
          if (window.innerWidth < 768) {
            setSidebarOpen(false);
          }
        }}
        memoryProfile={profile}
        onExportData={handleExportData}
        onImportData={handleImportData}
        currentUser={userLogin}
        onOpenLogin={() => {
          setLoginModalOpen(true);
          if (window.innerWidth < 768) {
            setSidebarOpen(false);
          }
        }}
        onLogout={handleLogout}
      />

      {/* Main Study Desk Area */}
      <div className="flex-1 flex flex-col h-full overflow-hidden bg-black relative">
        
        {/* Top Navigation Bar */}
        <header className="h-16 border-b border-[#111111] bg-black px-4 md:px-6 flex items-center justify-between shrink-0 z-10 gap-3">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="p-2 -ml-2 rounded-xl hover:bg-[#0a0a0a] text-zinc-400 hover:text-zinc-200 transition-colors"
            >
              <Menu className="w-5 h-5" />
            </button>
            <div className="flex items-center gap-2.5">
              <div className="flex items-center gap-2">
                <ZyloLogo className="w-5 h-5 shrink-0" />
                <span className="font-display text-sm md:text-base font-semibold tracking-wider bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 text-transparent bg-clip-text uppercase italic select-none">
                  {activeModel}
                </span>
              </div>

              {/* Collapsible Dot trigger to open Navigation Tabs */}
              <button
                onClick={() => setTabsExpanded(!tabsExpanded)}
                className="w-5 h-5 rounded-full flex items-center justify-center hover:bg-zinc-900 transition-all group shrink-0 relative"
                title={tabsExpanded ? "Hide Workspace Tabs" : "Show Workspace Tabs"}
              >
                <span className="relative flex h-2.5 w-2.5">
                  {!tabsExpanded && (
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                  )}
                  <span className={`relative inline-flex rounded-full h-2.5 w-2.5 transition-all duration-300 ${tabsExpanded ? 'bg-zinc-600 group-hover:bg-rose-400' : 'bg-blue-500 group-hover:bg-blue-400'}`}></span>
                </span>
              </button>

              <div className="hidden lg:flex items-center gap-2 text-[9px] text-[#555555] font-mono tracking-wider">
                <span>•</span>
                <span>AY 2026-27 | Sept 2026 attempt Active</span>
              </div>
            </div>
          </div>

          {/* Desk Workspace Navigation Tabs - Collapsible/Toggleable via Dot */}
          {tabsExpanded && (
            <div className="flex items-center gap-1 p-0.5 bg-[#111111]/90 border border-zinc-800/60 rounded-xl shrink-0 transition-all duration-300 animate-in fade-in slide-in-from-left-2 z-20">
              <button
                onClick={() => setActiveTab("chat")}
                className={`px-3 py-1 text-xs rounded-lg font-medium transition-all ${
                  activeTab === "chat" 
                    ? "bg-[#222222] text-zinc-100 shadow border border-zinc-800" 
                    : "text-zinc-500 hover:text-zinc-300"
                }`}
              >
                Chat
              </button>
              <button
                onClick={() => setActiveTab("syllabus")}
                className={`px-3 py-1 text-xs rounded-lg font-medium transition-all ${
                  activeTab === "syllabus" 
                    ? "bg-[#222222] text-zinc-100 shadow border border-zinc-800" 
                    : "text-zinc-500 hover:text-zinc-300"
                }`}
              >
                Tracker
              </button>
              <button
                onClick={() => setActiveTab("planner")}
                className={`px-3 py-1 text-xs rounded-lg font-medium transition-all ${
                  activeTab === "planner" 
                    ? "bg-[#222222] text-zinc-100 shadow border border-zinc-800" 
                    : "text-zinc-500 hover:text-zinc-300"
                }`}
              >
                Planner
              </button>
              <button
                onClick={() => setActiveTab("documents")}
                className={`px-3 py-1 text-xs rounded-lg font-medium transition-all ${
                  activeTab === "documents" 
                    ? "bg-[#222222] text-zinc-100 shadow border border-zinc-800" 
                    : "text-zinc-500 hover:text-zinc-300"
                }`}
              >
                Generator
              </button>
            </div>
          )}

          {/* Clear history button */}
          <div className="flex items-center gap-2">
            {sessions.length > 0 && (
              <button
                onClick={clearAllHistory}
                className="p-2 rounded-xl hover:bg-zinc-900 hover:text-rose-400 text-zinc-500 transition-colors"
                title="Clear Study History"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            )}
          </div>
        </header>

        {/* Chat Feed Workspace */}
        <div className="flex-1 overflow-y-auto px-4 py-6 md:px-8 space-y-6 flex flex-col">
          
          {activeTab === "syllabus" ? (
            <SyllabusTracker
              completedTopics={completedTopics}
              onToggleTopic={handleToggleSyllabusTopic}
              onStudyTopic={handleStartStudyWithAI}
            />
          ) : activeTab === "planner" ? (
            <StudyPlanner
              tasks={plannerTasks}
              onAddTask={handleAddPlannerTask}
              onDeleteTask={handleDeletePlannerTask}
              onUpdateTaskStatus={handleUpdatePlannerTaskStatus}
              onStudyTask={handleStartStudyWithAI}
            />
          ) : activeTab === "documents" ? (
            <DocumentCreator userName={userLogin.name} />
          ) : (!activeSession || activeSession.messages.length === 0) ? (
            /* Welcome / Empty Desk State - Elegant Gemini-Style Animated Aura & Google Sans Typo */
            <div className="flex-1 flex flex-col justify-center items-center max-w-2xl mx-auto w-full py-16 relative overflow-hidden select-none">
              
              {/* Soft, pulsing colorful background aura */}
              <div className="absolute inset-0 pointer-events-none flex items-center justify-center opacity-[0.15] z-0">
                <div className="absolute w-[450px] h-[450px] rounded-full bg-gradient-to-tr from-blue-600 via-indigo-600 to-purple-500 blur-[100px] animate-pulse" style={{ animationDuration: "10s" }} />
                <div className="absolute w-[300px] h-[300px] rounded-full bg-cyan-500/80 blur-[80px] animate-pulse" style={{ animationDuration: "14s", animationDelay: "2s" }} />
              </div>

              <div className="text-center space-y-6 animate-in fade-in slide-in-from-bottom-5 duration-700 relative z-10 flex flex-col items-center">
                {/* Custom glowing Zylo metallic Z icon with deep purple-blue glow */}
                <div className="relative group mb-2">
                  <div className="absolute -inset-1 bg-gradient-to-r from-blue-500 via-purple-600 to-pink-500 rounded-full blur-xl opacity-40 group-hover:opacity-70 animate-pulse duration-1000" />
                  <div className="relative bg-[#0d0d0d] p-4 rounded-3xl border border-zinc-800/80 shadow-2xl">
                    <ZyloLogo className="w-16 h-16 md:w-20 md:h-20" />
                  </div>
                </div>

                <div className="space-y-2">
                  <h1 className="text-2xl md:text-3xl font-sans font-medium text-zinc-100 tracking-tight leading-tight">
                    Hello, Praveen.
                  </h1>
                  <p className="text-sm md:text-base font-sans text-zinc-500 font-normal">
                    Let's get to it.
                  </p>
                </div>
              </div>
            </div>
          ) : (
            /* Active Conversation logs */
            <div className="flex-1 max-w-2xl mx-auto w-full space-y-6 pb-24">
              
              {/* Dynamic memory focus notice if weak areas exist */}
              {profile.weakAreas.length > 0 && (
                <div className="p-3 bg-[#080808] border border-[#1a1a1a] rounded-xl flex items-center justify-between gap-3 text-xs">
                  <div className="flex items-center gap-2 text-zinc-400">
                    <Brain className="w-4 h-4 text-blue-400 animate-pulse shrink-0" />
                    <span>
                      Zylo is currently adapting your tutor speed. Weak areas targeted:{" "}
                      <strong className="text-zinc-200">{profile.weakAreas.slice(0, 2).join(", ")}</strong>
                    </span>
                  </div>
                  <button 
                    onClick={() => setMemoryModalOpen(true)}
                    className="text-blue-400 hover:text-blue-300 font-medium whitespace-nowrap"
                  >
                    Manage Memory
                  </button>
                </div>
              )}

              {activeSession.messages.map((msg) => {
                const isAI = msg.role === "assistant";
                return (
                  <div 
                    key={msg.id} 
                    className={`flex gap-3.5 items-start py-4 border-b border-zinc-900/30 first:pt-0 last:border-0 ${
                      isAI ? "justify-start text-left" : "flex-row-reverse justify-start"
                    }`}
                  >
                    {/* Avatar / Logo - Hidden for AI/App messages as requested, shown only for user */}
                    {!isAI && (
                      <div className="w-8 h-8 rounded-xl bg-blue-950/40 border border-blue-900/20 flex items-center justify-center shrink-0">
                        <span className="text-xs font-bold text-blue-400 font-mono">
                          {userLogin.name.slice(0, 2).toUpperCase()}
                        </span>
                      </div>
                    )}

                    {/* Content Column - User gets a sleek bubble aligned to the right, AI gets full-width left-aligned layout */}
                    <div className={`min-w-0 space-y-1.5 ${
                      isAI 
                        ? "flex-1 text-left" 
                        : "max-w-[85%] text-left bg-zinc-900/45 border border-zinc-850 rounded-2xl rounded-tr-none px-4 py-3 shadow-inner shadow-zinc-950/40"
                    }`}>
                      {/* Name & Timestamp Header */}
                      <div className="flex items-baseline gap-2">
                        <span className={`text-sm font-semibold tracking-tight ${
                          isAI ? "text-cyan-400" : "text-zinc-100"
                        }`}>
                          {isAI ? "Zylo" : userLogin.name}
                        </span>
                        <span className="text-[10px] text-zinc-500 font-mono">
                          {msg.timestamp}
                        </span>
                      </div>

                      {/* Text contents parsed dynamically */}
                      <div className="text-sm text-zinc-200 leading-relaxed break-words">
                        {/* Uploaded attachment render */}
                        {msg.image && (
                          <div className="max-w-xs overflow-hidden rounded-xl border border-zinc-800/80 bg-[#080808] text-left my-2">
                            {(!msg.attachmentType || msg.attachmentType.startsWith("image/")) ? (
                              <div className="relative group">
                                <img 
                                  src={msg.image} 
                                  alt="Attachment" 
                                  className="w-full h-auto max-h-48 object-cover cursor-pointer hover:scale-102 transition-all duration-300"
                                  onClick={() => setExpandedImage(msg.image || null)}
                                />
                                <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center pointer-events-none">
                                  <Eye className="w-5 h-5 text-zinc-200" />
                                  <span className="text-[10px] text-zinc-300 ml-1.5 font-medium">Click to expand</span>
                                </div>
                                <div className="px-2.5 py-1.5 bg-[#111111] border-t border-zinc-800/60 flex items-center justify-between text-[10px] text-zinc-400">
                                  <span className="truncate max-w-[150px]">{msg.attachmentName || "Attached Image"}</span>
                                  <span className="text-[9px] font-mono uppercase text-blue-400 font-bold bg-blue-950/40 px-1.5 py-0.5 rounded border border-blue-900/30 shrink-0">Image</span>
                                </div>
                              </div>
                            ) : (msg.attachmentName?.endsWith(".xlsx") || msg.attachmentName?.endsWith(".xls") || msg.attachmentType.includes("spreadsheet") || msg.attachmentType.includes("excel")) ? (
                              <div className="p-3 bg-emerald-950/20 hover:bg-emerald-950/30 transition-all flex items-center gap-3">
                                <div className="w-10 h-10 rounded-lg bg-emerald-900/20 border border-emerald-800/40 flex items-center justify-center text-emerald-400 shrink-0">
                                  <FileSpreadsheet className="w-5 h-5" />
                                </div>
                                <div className="flex-1 min-w-0">
                                  <p className="text-xs font-semibold text-zinc-200 truncate">{msg.attachmentName}</p>
                                  <p className="text-[9px] text-emerald-400 font-mono">ICAI Excel Workbook</p>
                                </div>
                                <a 
                                  href={msg.image} 
                                  download={msg.attachmentName || "workbook.xlsx"}
                                  className="p-1.5 rounded-lg hover:bg-[#1a1a1a] text-zinc-400 hover:text-emerald-400 transition-colors shrink-0"
                                  title="Download spreadsheet"
                                >
                                  <X className="w-4 h-4 -rotate-45" />
                                </a>
                              </div>
                            ) : (
                              <div className="p-3 bg-indigo-950/20 hover:bg-indigo-950/30 transition-all flex items-center gap-3">
                                <div className="w-10 h-10 rounded-lg bg-indigo-900/20 border border-indigo-800/40 flex items-center justify-center text-indigo-400 shrink-0">
                                  <FileText className="w-5 h-5" />
                                </div>
                                <div className="flex-1 min-w-0">
                                  <p className="text-xs font-semibold text-zinc-200 truncate">{msg.attachmentName}</p>
                                  <p className="text-[9px] text-indigo-400 font-mono">Study Document / PDF</p>
                                </div>
                                <a 
                                  href={msg.image} 
                                  download={msg.attachmentName || "document.pdf"}
                                  className="p-1.5 rounded-lg hover:bg-[#1a1a1a] text-zinc-400 hover:text-indigo-400 transition-colors shrink-0"
                                  title="Download document"
                                >
                                  <X className="w-4 h-4 -rotate-45" />
                                </a>
                              </div>
                            )}
                          </div>
                        )}
                        
                        {isAI ? (
                          <MarkdownRenderer content={msg.content} />
                        ) : (
                          <p className="text-sm leading-relaxed whitespace-pre-wrap text-zinc-100">{msg.content}</p>
                        )}
                        
                        {/* Generate similar question helper button for user-uploaded question paper images */}
                        {!isAI && msg.image && (
                          <div className="mt-3 flex items-center gap-2">
                            <button
                              onClick={() => handleCreateSimilarQuestionFromImage(msg.image!)}
                              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-cyan-950/20 border border-cyan-800/30 text-cyan-400 hover:bg-cyan-950/45 text-xs font-medium transition-all"
                            >
                              <Sparkles className="w-3.5 h-3.5" />
                              Generate Similar Question to Practice
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}

              {/* Loader indicator while communicating with backend - Minimalist Gemini Shimmer */}
              {isSending && (
                <div className="flex items-center gap-3 py-4 animate-in fade-in duration-300 select-none">
                  {/* Glowing 4-Point Gemini Sparkle */}
                  <svg 
                    viewBox="0 0 24 24" 
                    className="w-6 h-6 md:w-7 h-7 animate-pulse shrink-0 filter drop-shadow-[0_0_8px_rgba(191,90,242,0.65)]"
                    fill="none" 
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <defs>
                      <linearGradient id="sparkleGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" stopColor="#bf5af2" />
                        <stop offset="100%" stopColor="#00b4d8" />
                      </linearGradient>
                    </defs>
                    <path 
                      d="M12,2 C12,7.5 7.5,12 2,12 C7.5,12 12,16.5 12,22 C12,16.5 16.5,12 22,12 C16.5,12 12,7.5 12,2 Z" 
                      fill="url(#sparkleGrad)"
                    />
                  </svg>
                  <span className="text-lg md:text-xl font-sans font-semibold tracking-tight bg-gradient-to-r from-blue-300 via-purple-300 to-pink-300 text-transparent bg-clip-text animate-gemini-blink pb-0.5">
                    {loadingText}
                  </span>
                </div>
              )}

              {/* Connection or Quota Errors */}
              {errorStatus && (
                <div className="p-4 bg-rose-950/20 border border-rose-900/50 rounded-xl flex gap-3 text-xs text-rose-300">
                  <AlertCircle className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
                  <div className="space-y-1">
                    <h4 className="font-semibold text-rose-200">System Alert</h4>
                    <p className="leading-relaxed">{errorStatus}</p>
                    <p className="text-[10px] text-rose-400">Please make sure the Gemini API key is configured in your AI Studio secrets.</p>
                  </div>
                </div>
              )}

              <div ref={chatEndRef} />
            </div>
          )}

        </div>

        {/* Floating Input Desk Desk Container */}
        {activeTab === "chat" && (
          <div className="absolute bottom-0 left-0 right-0 p-4 md:p-6 bg-gradient-to-t from-black via-black/95 to-transparent shrink-0">
            <div className="max-w-2xl mx-auto w-full space-y-2">
              
              {/* Input Form Wrapper (Made thin, py-1.5 px-3 instead of p-3.5) */}
              <div className="border border-[#222222] bg-[#111111] rounded-[24px] py-1.5 px-3 flex flex-col gap-1.5 shadow-2xl focus-within:border-blue-500/50 transition-all">
                
                {/* Attached document or image preview */}
                {attachedFile && (
                  <div className="inline-flex items-center gap-2.5 p-1.5 bg-[#080808] rounded-xl border border-[#222222] w-fit max-w-full">
                    {attachedFile.type.startsWith("image/") ? (
                      <img src={attachedFile.dataUrl} alt="Attachment" className="w-10 h-10 object-cover rounded-lg" />
                    ) : attachedFile.name.endsWith(".xlsx") || attachedFile.name.endsWith(".xls") || attachedFile.type.includes("spreadsheet") || attachedFile.type.includes("excel") ? (
                      <div className="w-10 h-10 rounded-lg bg-emerald-950/40 border border-emerald-900/30 flex items-center justify-center text-emerald-400 shrink-0">
                        <FileSpreadsheet className="w-5 h-5" />
                      </div>
                    ) : (
                      <div className="w-10 h-10 rounded-lg bg-indigo-950/40 border border-indigo-900/30 flex items-center justify-center text-indigo-400 shrink-0">
                        <FileText className="w-5 h-5" />
                      </div>
                    )}
                    <div className="text-left max-w-[180px] md:max-w-[240px]">
                      <div className="text-[10px] font-semibold text-zinc-200 truncate">{attachedFile.name}</div>
                      <div className="text-[9px] text-purple-400 font-mono">Ready to Analyze</div>
                    </div>
                    <button 
                      onClick={handleRemoveImage}
                      className="p-1 rounded-lg hover:bg-zinc-850 text-zinc-500 hover:text-rose-400 transition-colors ml-1"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                )}

                {/* TextInput row - centered aligned correctly for sleek look */}
                <div className="flex gap-2 items-center">
                  
                  {/* General file attachment button with elegant popover menu */}
                  <div className="relative">
                    <button
                      type="button"
                      onClick={() => setShowUploadMenu(!showUploadMenu)}
                      className={`p-2 rounded-full hover:bg-zinc-900 transition-all shrink-0 border border-transparent ${showUploadMenu ? 'text-blue-400 bg-zinc-900' : 'text-[#888888] hover:text-zinc-200'}`}
                      title="Attach documents, photos or plugins"
                    >
                      <Paperclip className="w-4.5 h-4.5" />
                    </button>

                    {showUploadMenu && (
                      <>
                        {/* Invisible backdrop to dismiss click outside */}
                        <div 
                          className="fixed inset-0 z-20"
                          onClick={() => setShowUploadMenu(false)}
                        />
                        
                        {/* Elegant floating popover menu exactly matching screenshot */}
                        <div className="absolute bottom-full left-0 mb-3.5 z-30 w-52 bg-[#1c1c1e] border border-zinc-800/90 rounded-[24px] p-2 shadow-2xl animate-in fade-in slide-in-from-bottom-2 duration-150 select-none">
                          
                          {/* Camera option */}
                          <button
                            type="button"
                            onClick={() => {
                              setShowUploadMenu(false);
                              cameraInputRef.current?.click();
                            }}
                            className="w-full flex items-center gap-3 px-2.5 py-2 rounded-xl hover:bg-zinc-800/60 text-zinc-300 hover:text-zinc-100 transition-colors text-left font-sans text-xs font-medium"
                          >
                            <div className="w-8 h-8 rounded-full bg-zinc-800 flex items-center justify-center text-zinc-200 shrink-0">
                              <Camera className="w-4 h-4" />
                            </div>
                            <span>Camera</span>
                          </button>

                          {/* Photos option */}
                          <button
                            type="button"
                            onClick={() => {
                              setShowUploadMenu(false);
                              photosInputRef.current?.click();
                            }}
                            className="w-full flex items-center gap-3 px-2.5 py-2 rounded-xl hover:bg-zinc-800/60 text-zinc-300 hover:text-zinc-100 transition-colors text-left font-sans text-xs font-medium"
                          >
                            <div className="w-8 h-8 rounded-full bg-zinc-800 flex items-center justify-center text-zinc-200 shrink-0">
                              <ImageIcon className="w-4 h-4" />
                            </div>
                            <span>Photos</span>
                          </button>

                          {/* Files option */}
                          <button
                            type="button"
                            onClick={() => {
                              setShowUploadMenu(false);
                              filesInputRef.current?.click();
                            }}
                            className="w-full flex items-center gap-3 px-2.5 py-2 rounded-xl hover:bg-zinc-800/60 text-zinc-300 hover:text-zinc-100 transition-colors text-left font-sans text-xs font-medium"
                          >
                            <div className="w-8 h-8 rounded-full bg-zinc-800 flex items-center justify-center text-zinc-200 shrink-0">
                              <FolderOpen className="w-4 h-4" />
                            </div>
                            <span>Files</span>
                          </button>

                          {/* Plugins option */}
                          <button
                            type="button"
                            onClick={() => {
                              setShowUploadMenu(false);
                              alert("Study companion plugins are loaded and active!");
                            }}
                            className="w-full flex items-center gap-3 px-2.5 py-2 rounded-xl hover:bg-zinc-800/60 text-zinc-300 hover:text-zinc-100 transition-colors text-left font-sans text-xs font-medium"
                          >
                            <div className="w-8 h-8 rounded-full bg-zinc-800 flex items-center justify-center text-zinc-200 shrink-0">
                              <Compass className="w-4 h-4" />
                            </div>
                            <span>Plugins</span>
                          </button>

                        </div>
                      </>
                    )}
                  </div>
                  
                  {/* Hidden standard Inputs for Photos, Files and Camera */}
                  <input
                    type="file"
                    ref={photosInputRef}
                    onChange={handleImageChange}
                    accept="image/*"
                    className="hidden"
                  />
                  <input
                    type="file"
                    ref={filesInputRef}
                    onChange={handleImageChange}
                    accept=".pdf,.xlsx,.xls,.csv,.doc,.docx"
                    className="hidden"
                  />
                  <input
                    type="file"
                    ref={cameraInputRef}
                    onChange={handleImageChange}
                    accept="image/*"
                    capture="environment"
                    className="hidden"
                  />

                  {/* Redundant hidden input for compatibility */}
                  <input
                    type="file"
                    ref={imageInputRef}
                    onChange={handleImageChange}
                    accept=".pdf,.xlsx,.xls,.csv,.doc,.docx,.png,.jpg,.jpeg,.heic,image/*"
                    className="hidden"
                  />

                  {/* Clean, sleek, vertically aligned input area with minimal height and no weird extra paddings */}
                  <textarea
                    rows={1}
                    value={inputMessage}
                    onChange={(e) => setInputMessage(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && !e.shiftKey) {
                        e.preventDefault();
                        handleSendMessage();
                      }
                    }}
                    placeholder="Ask Zylo..."
                    className="flex-1 bg-transparent border-0 focus:ring-0 py-1.5 px-2 text-sm text-zinc-100 placeholder-[#444444] focus:outline-none resize-none max-h-32 min-h-0 leading-normal self-center"
                  />

                  {/* Send Button */}
                  <button
                    onClick={() => handleSendMessage()}
                    disabled={isSending || (!inputMessage.trim() && !attachedFile)}
                    className={`p-2 rounded-full shrink-0 transition-all flex items-center justify-center ${
                      (inputMessage.trim() || attachedFile) && !isSending
                        ? "bg-blue-600 hover:bg-blue-500 text-white hover:scale-105 shadow-md shadow-blue-950/20"
                        : "bg-[#1a1a1a] text-[#444444] cursor-not-allowed"
                    }`}
                  >
                    <Send className="w-4 h-4" />
                  </button>
                </div>

              </div>

              {/* Simplified footer layout with ONLY 'Zylo can make mistakes.' */}
              <p className="text-[10px] text-[#444444] text-center leading-relaxed font-sans select-none">
                Zylo can make mistakes.
              </p>
            </div>
          </div>
        )}

      </div>

      {/* Full screen photo inspection overlay (helpful for studying details of answer key) */}
      {expandedImage && (
        <div 
          className="fixed inset-0 z-50 bg-black/95 flex flex-col justify-center items-center p-4"
          onClick={() => setExpandedImage(null)}
        >
          <button 
            className="absolute top-6 right-6 p-2 rounded-xl bg-zinc-900 border border-zinc-850 hover:bg-zinc-800 text-zinc-300 transition-colors"
            onClick={() => setExpandedImage(null)}
          >
            <X className="w-5 h-5" />
          </button>
          <img 
            src={expandedImage} 
            alt="Handwriting answer sheet zoomed" 
            className="max-w-full max-h-[85vh] object-contain rounded-xl border border-zinc-800 shadow-2xl" 
          />
          <span className="text-xs text-zinc-500 mt-4 font-mono">Handwritten Answer Sheet Zoomed View</span>
        </div>
      )}

      {/* Cognitive adaptation profile manager modal */}
      <MemoryModal
        isOpen={memoryModalOpen}
        onClose={() => setMemoryModalOpen(false)}
        profile={profile}
        onSave={(updated) => saveProfile(updated)}
      />

      {/* Student credentials personal login modal */}
      <LoginModal
        isOpen={loginModalOpen}
        onClose={() => setLoginModalOpen(false)}
        onLogin={saveUserLogin}
        currentUser={userLogin}
      />

    </div>
  );
}

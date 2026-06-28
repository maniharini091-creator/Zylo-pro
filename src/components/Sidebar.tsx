import React, { useRef } from "react";
import { ChatSession, UserMemoryProfile } from "../types";
import { UserLogin } from "../syllabus";
import { ZyloLogo } from "../App";
import { 
  MessageSquare, Plus, Trash2, Brain, Database, 
  Download, Upload, ChevronLeft, ChevronRight, BookOpen, FileText, LogOut, UserCheck, X
} from "lucide-react";

interface SidebarProps {
  sessions: ChatSession[];
  activeSessionId: string | null;
  isOpen: boolean;
  onToggle: () => void;
  onSelectSession: (id: string) => void;
  onCreateSession: () => void;
  onDeleteSession: (id: string) => void;
  onOpenMemory: () => void;
  memoryProfile: UserMemoryProfile;
  onImportData: (dataStr: string) => void;
  onExportData: () => void;
  currentUser: UserLogin;
  onOpenLogin: () => void;
  onLogout?: () => void;
}

export default function Sidebar({
  sessions,
  activeSessionId,
  isOpen,
  onToggle,
  onSelectSession,
  onCreateSession,
  onDeleteSession,
  onOpenMemory,
  memoryProfile,
  onImportData,
  onExportData,
  currentUser,
  onOpenLogin,
  onLogout,
}: SidebarProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImportClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const contents = event.target?.result;
      if (typeof contents === "string") {
        onImportData(contents);
      }
    };
    reader.readAsText(file);
    e.target.value = ""; // Reset input
  };

  return (
    <div 
      className={`fixed md:relative top-0 left-0 bottom-0 z-40 bg-black border-r border-[#222222] flex flex-col transition-all duration-300 ${
        isOpen ? "w-64" : "w-0 md:w-16 overflow-hidden border-none"
      }`}
    >
      {/* Brand Title / Header */}
      <div className="h-16 border-b border-[#111111] px-4 flex items-center justify-between shrink-0">
        <div className={`flex items-center gap-2.5 transition-opacity ${isOpen ? "opacity-100" : "opacity-0 md:opacity-100"}`}>
          <ZyloLogo className="w-8 h-8 shrink-0" />
          {isOpen && (
            <div>
              <span className="font-display font-semibold tracking-tight text-zinc-100">Zylo</span>
              <span className="text-[10px] ml-1.5 px-1 py-0.5 rounded bg-[#111111] border border-[#222222] text-zinc-400 font-mono">v1.2</span>
            </div>
          )}
        </div>
        {isOpen && (
          <>
            <button 
              onClick={onToggle}
              className="p-1 rounded-lg hover:bg-zinc-900 text-zinc-500 hover:text-zinc-300 transition-colors hidden md:block"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button 
              onClick={onToggle}
              className="p-1.5 rounded-lg hover:bg-zinc-900 text-zinc-500 hover:text-zinc-300 transition-colors md:hidden"
            >
              <X className="w-4 h-4" />
            </button>
          </>
        )}
      </div>

      {/* New Chat Button */}
      <div className="p-3 shrink-0">
        <button
          onClick={onCreateSession}
          className={`w-full flex items-center justify-center gap-2 py-2 px-3 bg-[#111111] hover:bg-zinc-900 border border-[#222222] rounded-xl text-sm font-medium text-zinc-200 transition-all ${
            !isOpen && "p-2 hover:bg-blue-600 hover:text-white"
          }`}
          title="Start New CA Study Session"
        >
          <Plus className="w-4 h-4" />
          {isOpen && <span>New Session</span>}
        </button>
      </div>

      {/* Chat History List */}
      <div className="flex-1 overflow-y-auto px-2 py-2 space-y-1">
        {isOpen && sessions.length === 0 && (
          <div className="px-4 py-8 text-center text-zinc-600 text-xs">
            No study sessions yet.<br />Ask Zylo anything below!
          </div>
        )}
        {sessions.map((session) => {
          const isActive = session.id === activeSessionId;
          return (
            <div
              key={session.id}
              className={`group flex items-center justify-between rounded-xl p-2.5 transition-colors cursor-pointer ${
                isActive 
                  ? "bg-[#111111] text-zinc-100 border border-[#222222]" 
                  : "text-zinc-400 hover:bg-[#0a0a0a] hover:text-zinc-200"
              }`}
              onClick={() => onSelectSession(session.id)}
            >
              <div className="flex items-center gap-2.5 min-w-0 flex-1">
                <MessageSquare className={`w-4 h-4 shrink-0 ${isActive ? "text-blue-400" : "text-zinc-500"}`} />
                {isOpen && (
                  <span className="text-xs font-medium truncate leading-none">
                    {session.title || "Untitled Session"}
                  </span>
                )}
              </div>
              {isOpen && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onDeleteSession(session.id);
                  }}
                  className="p-1 rounded opacity-0 group-hover:opacity-100 hover:bg-zinc-800 text-zinc-500 hover:text-zinc-300 transition-all"
                  title="Delete Session"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          );
        })}
      </div>

      {/* Bottom Adaptability & Control Zone */}
      <div className="p-3 border-t border-[#111111] space-y-2 shrink-0 bg-[#000000]">
        {/* Memory Adaptation Controller */}
        <button
          onClick={onOpenMemory}
          className={`w-full flex items-center gap-2.5 p-2.5 rounded-xl text-left border transition-all ${
            isOpen 
              ? "bg-[#080808] hover:bg-[#111111] border-[#1a1a1a] hover:border-[#222222] text-zinc-300" 
              : "bg-transparent border-transparent justify-center text-blue-400 hover:bg-zinc-900"
          }`}
          title="View Adaptability Profile"
        >
          <div className="relative">
            <Brain className="w-4 h-4 text-blue-400 shrink-0" />
            <span className="absolute top-0 right-0 w-1.5 h-1.5 bg-purple-500 rounded-full animate-pulse" />
          </div>
          {isOpen && (
            <div className="min-w-0 flex-1 leading-tight">
              <div className="text-[11px] font-medium text-zinc-100">Cognitive Adaptor</div>
              <div className="text-[9px] text-zinc-500 truncate mt-0.5">
                {memoryProfile.weakAreas.length > 0 
                  ? `${memoryProfile.weakAreas.length} weak areas adapted` 
                  : "Learning your style..."}
              </div>
            </div>
          )}
        </button>

        {/* Database backup / develop controls */}
        {isOpen && (
          <div className="grid grid-cols-2 gap-1.5 pt-1">
            <button
              onClick={onExportData}
              className="flex items-center justify-center gap-1.5 py-1.5 px-2 bg-[#080808] hover:bg-[#111111] border border-[#1a1a1a] hover:border-[#222222] rounded-lg text-[10px] text-zinc-400 hover:text-zinc-200 transition-all font-medium"
              title="Backup your data"
            >
              <Download className="w-3 h-3" />
              Backup
            </button>
            <button
              onClick={handleImportClick}
              className="flex items-center justify-center gap-1.5 py-1.5 px-2 bg-[#080808] hover:bg-[#111111] border border-[#1a1a1a] hover:border-[#222222] rounded-lg text-[10px] text-zinc-400 hover:text-zinc-200 transition-all font-medium"
              title="Import past study sessions"
            >
              <Upload className="w-3 h-3" />
              Restore
            </button>
          </div>
        )}

        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileChange}
          accept=".json"
          className="hidden"
        />
        
        {/* User signature */}
        {isOpen && (
          <div className="flex items-center justify-between pt-2 border-t border-[#111111] text-[10px] text-[#666666] font-medium">
            <div className="flex items-center gap-2 min-w-0">
              <div className="w-5 h-5 rounded-full bg-blue-950/40 border border-blue-900/30 flex items-center justify-center text-blue-400 font-bold shrink-0">
                {currentUser.name.charAt(0).toUpperCase()}
              </div>
              <div className="min-w-0">
                <span className="block font-semibold text-zinc-300 truncate" title={currentUser.name}>{currentUser.name}</span>
                <span className="text-[8px] text-[#888888] block truncate leading-none" title={currentUser.identifier}>{currentUser.identifier}</span>
                <span className="text-[8px] text-blue-400 block mt-0.5 font-mono">{currentUser.targetAttempt}</span>
              </div>
            </div>
            <div className="flex flex-col items-end gap-1 shrink-0">
              <button
                onClick={onOpenLogin}
                className="px-1.5 py-0.5 rounded hover:bg-zinc-900 text-zinc-500 hover:text-blue-400 transition-colors font-mono text-[8px] uppercase tracking-wider"
                title="Switch Account / Sign In"
              >
                Switch
              </button>
              {onLogout && (
                <button
                  onClick={onLogout}
                  className="px-1.5 py-0.5 rounded hover:bg-zinc-900 text-zinc-500 hover:text-rose-400 transition-colors font-mono text-[8px] uppercase tracking-wider"
                  title="Log Out of Study Desk"
                >
                  Logout
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

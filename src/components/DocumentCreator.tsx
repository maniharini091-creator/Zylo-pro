import React, { useState, useEffect } from "react";
import { StudyDocument } from "../types";
import { 
  FileText, FileCheck, BookOpen, Zap, Sparkles, 
  Trash2, Download, Copy, Printer, Plus, AlertCircle, CheckCircle, ArrowLeft, Loader2,
  FolderOpen, Link, Check, LogOut, FileCode, ShieldAlert
} from "lucide-react";
import MarkdownRenderer from "./MarkdownRenderer";
import { 
  initAuth, 
  googleSignIn, 
  logout, 
  extractFileIdFromUrl, 
  fetchDriveFileContent 
} from "../lib/driveAuth";
import { User } from "firebase/auth";

interface DocumentCreatorProps {
  userName: string;
}

const DOCUMENT_TYPES = [
  { id: "question_paper", label: "Question Paper (Mock)", desc: "ICAI standard practice exam questions", icon: FileCheck, color: "text-rose-400 border-rose-950/40 bg-rose-950/10" },
  { id: "revision_notes", label: "Revision Notes", desc: "Detailed breakdown of provisions & rules", icon: FileText, color: "text-blue-400 border-blue-950/40 bg-blue-950/10" },
  { id: "chapter_summary", label: "Chapter Summary", desc: "Crisp cheat-sheet with core points", icon: BookOpen, color: "text-emerald-400 border-emerald-950/40 bg-emerald-950/10" },
  { id: "section_citations", label: "Sections Checklist", desc: "Section numbers, laws & memory hacks", icon: Zap, color: "text-amber-400 border-amber-950/40 bg-amber-950/10" },
] as const;

const SUBJECTS = [
  "Paper 1: Advanced Accounting",
  "Paper 2: Corporate and Other Laws",
  "Paper 3: Taxation",
  "Paper 4: Cost and Management Accounting",
  "Paper 5: Auditing and Ethics",
  "Paper 6: Financial Management & Strategic Management"
];

export default function DocumentCreator({ userName }: DocumentCreatorProps) {
  // Saved documents state
  const [documents, setDocuments] = useState<StudyDocument[]>([]);
  const [selectedDocId, setSelectedDocId] = useState<string | null>(null);
  
  // New document form states
  const [docType, setDocType] = useState<typeof DOCUMENT_TYPES[number]["id"]>("question_paper");
  const [subject, setSubject] = useState(SUBJECTS[0]);
  const [topic, setTopic] = useState("");
  const [extraInstructions, setExtraInstructions] = useState("");
  
  // Interactive UI states
  const [isGenerating, setIsGenerating] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  // Google Drive integration states
  const [driveUser, setDriveUser] = useState<User | null>(null);
  const [driveToken, setDriveToken] = useState<string | null>(null);
  const [driveUrl, setDriveUrl] = useState("");
  const [isExtracting, setIsExtracting] = useState(false);
  const [extractedContent, setExtractedContent] = useState<string | null>(null);
  const [extractedFileName, setExtractedFileName] = useState<string | null>(null);

  // Load from local storage and initialize Google Drive auth
  useEffect(() => {
    const savedDocs = localStorage.getItem("zylo_documents");
    if (savedDocs) {
      try {
        setDocuments(JSON.parse(savedDocs));
      } catch (err) {
        console.error("Failed to load generated documents:", err);
      }
    }

    // Bind auth listener to catch auto-logins
    const unsubscribe = initAuth(
      (user, token) => {
        setDriveUser(user);
        setDriveToken(token);
      },
      () => {
        setDriveUser(null);
        setDriveToken(null);
      }
    );

    return () => unsubscribe();
  }, []);

  // Save to local storage
  const saveDocuments = (updatedDocs: StudyDocument[]) => {
    setDocuments(updatedDocs);
    localStorage.setItem("zylo_documents", JSON.stringify(updatedDocs));
  };

  // Google Drive Login handler
  const handleDriveLogin = async () => {
    setErrorMsg(null);
    try {
      const result = await googleSignIn();
      if (result) {
        setDriveUser(result.user);
        setDriveToken(result.accessToken);
        setSuccessMsg("Connected to Google Drive successfully!");
      }
    } catch (err: any) {
      console.error(err);
      setErrorMsg("Failed to connect to Google Drive: " + (err.message || err));
    }
  };

  // Google Drive Logout handler
  const handleDriveLogout = async () => {
    try {
      await logout();
      setDriveUser(null);
      setDriveToken(null);
      setExtractedContent(null);
      setExtractedFileName(null);
      setDriveUrl("");
      setSuccessMsg("Disconnected from Google Drive.");
    } catch (err: any) {
      console.error(err);
    }
  };

  // Extract content from drive URL handler
  const handleExtractDriveFile = async () => {
    if (!driveUrl.trim()) {
      setErrorMsg("Please paste a Google Drive shareable link first.");
      return;
    }

    const token = driveToken;
    if (!token) {
      setErrorMsg("Please connect your Google Drive account first.");
      return;
    }

    const fileId = extractFileIdFromUrl(driveUrl);
    if (!fileId) {
      setErrorMsg("Invalid URL. Please enter a valid Google Drive or Google Docs/Sheets link.");
      return;
    }

    setIsExtracting(true);
    setErrorMsg(null);
    setSuccessMsg(null);

    try {
      const result = await fetchDriveFileContent(fileId, token);
      setExtractedContent(result.content);
      setExtractedFileName(result.name);
      
      // Auto-populate the Topic field with the name of the file to make it convenient!
      setTopic(result.name);
      setSuccessMsg(`Successfully extracted contents of "${result.name}"!`);
    } catch (err: any) {
      console.error(err);
      setErrorMsg(err.message || "Failed to extract contents from Google Drive. Please make sure the link is shareable and you have permissions.");
    } finally {
      setIsExtracting(false);
    }
  };

  const handleClearDriveSource = () => {
    setExtractedContent(null);
    setExtractedFileName(null);
    setDriveUrl("");
  };

  // Generate document API call
  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!topic.trim()) {
      setErrorMsg("Please specify the study topic or focus query.");
      return;
    }

    setIsGenerating(true);
    setErrorMsg(null);
    setSuccessMsg(null);

    try {
      const typeLabel = DOCUMENT_TYPES.find(d => d.id === docType)?.label || "Study Notes";
      const response = await fetch("/api/zylo/generate-document", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          documentType: docType,
          subject,
          topic,
          extraInstructions,
          userName,
          driveContext: extractedContent // Pass Google Drive text block!
        })
      });

      if (!response.ok) {
        throw new Error(`Failed to generate: Server returned status code ${response.status}`);
      }

      const data = await response.json();
      
      const newDoc: StudyDocument = {
        id: "doc_" + Date.now(),
        title: `${typeLabel}: ${topic}`,
        type: docType,
        subject,
        topic,
        content: data.content,
        createdAt: new Date().toLocaleDateString("en-IN", {
          day: "2-digit",
          month: "short",
          year: "numeric",
          hour: "2-digit",
          minute: "2-digit"
        })
      };

      const updatedDocs = [newDoc, ...documents];
      saveDocuments(updatedDocs);
      setSelectedDocId(newDoc.id);
      setSuccessMsg(`"${newDoc.title}" successfully compiled & prepared!`);
      
      // Reset form focus (but keep Drive connected for further practice)
      setTopic("");
      setExtraInstructions("");
    } catch (err: any) {
      console.error(err);
      setErrorMsg(err.message || "Tutor engine disconnected. Please check your internet connection and API keys.");
    } finally {
      setIsGenerating(false);
    }
  };

  // Delete document
  const handleDelete = (id: string, event: React.MouseEvent) => {
    event.stopPropagation();
    if (confirm("Are you sure you want to permanently delete this study file?")) {
      const updated = documents.filter(d => d.id !== id);
      saveDocuments(updated);
      if (selectedDocId === id) {
        setSelectedDocId(null);
      }
    }
  };

  // Copy to clipboard helper
  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Download document as .txt file helper
  const handleDownload = (doc: StudyDocument) => {
    const header = `==================================================\n` +
                   `ZYLO STUDENT DOCUMENT CENTER\n` +
                   `Title: ${doc.title}\n` +
                   `Subject: ${doc.subject}\n` +
                   `Prepared For: ${userName}\n` +
                   `Date: ${doc.createdAt}\n` +
                   `==================================================\n\n`;
    const fullText = header + doc.content;
    const blob = new Blob([fullText], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `${doc.title.replace(/[^a-zA-Z0-9]/g, "_")}.txt`;
    link.click();
    URL.revokeObjectURL(url);
  };

  // Print document
  const handlePrint = () => {
    window.print();
  };

  const selectedDoc = documents.find(d => d.id === selectedDocId);

  return (
    <div className="flex-1 flex flex-col md:flex-row gap-6 h-full max-h-[85vh] overflow-hidden text-zinc-100 select-none animate-in fade-in duration-300">
      
      {/* LEFT COLUMN: Sidebar listing all generated documents */}
      <div className="w-full md:w-80 bg-zinc-950/30 border border-zinc-900/50 rounded-2xl p-4 flex flex-col gap-4 shrink-0">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-cyan-950/30 border border-cyan-900/30 text-cyan-400">
              <Plus className="w-4 h-4" />
            </div>
            <h3 className="text-sm font-semibold tracking-tight text-zinc-200">Prepared Files</h3>
          </div>
          <button
            onClick={() => setSelectedDocId(null)}
            className="p-1.5 rounded-lg text-zinc-400 hover:text-cyan-400 hover:bg-zinc-900 transition-colors"
            title="Create new document"
          >
            <Plus className="w-4 h-4" />
          </button>
        </div>

        {/* Scrollable list of generated items */}
        <div className="flex-1 overflow-y-auto space-y-2 pr-1">
          {documents.length === 0 ? (
            <div className="h-40 flex flex-col items-center justify-center text-center p-4 border border-dashed border-zinc-900 rounded-xl">
              <FileText className="w-8 h-8 text-zinc-700 mb-2" />
              <p className="text-xs text-zinc-500 font-medium leading-relaxed">
                No study files or question papers prepared yet. Use the tool on the right to compile one!
              </p>
            </div>
          ) : (
            documents.map(doc => {
              const dType = DOCUMENT_TYPES.find(d => d.id === doc.type);
              const Icon = dType?.icon || FileText;
              const isSelected = doc.id === selectedDocId;

              return (
                <div
                  key={doc.id}
                  onClick={() => setSelectedDocId(doc.id)}
                  className={`group relative p-3 rounded-xl border text-left cursor-pointer transition-all duration-300 flex items-start gap-3 ${
                    isSelected 
                      ? "bg-zinc-900/80 border-cyan-900/50 text-cyan-200 shadow-md shadow-cyan-950/10" 
                      : "bg-zinc-950/20 hover:bg-zinc-900/40 border-zinc-900/50 hover:border-zinc-800 text-zinc-400"
                  }`}
                >
                  <div className={`p-1.5 rounded-lg border shrink-0 ${isSelected ? "bg-cyan-950/30 border-cyan-800/40 text-cyan-400" : dType?.color || "text-zinc-500 bg-zinc-900 border-zinc-800"}`}>
                    <Icon className="w-4 h-4" />
                  </div>
                  <div className="flex-1 min-w-0 pr-6">
                    <h4 className={`text-xs font-semibold truncate ${isSelected ? "text-cyan-200" : "text-zinc-200"}`}>
                      {doc.title}
                    </h4>
                    <p className="text-[10px] text-zinc-500 font-medium truncate mt-0.5">
                      {doc.subject}
                    </p>
                    <p className="text-[9px] text-zinc-600 font-mono mt-1">
                      {doc.createdAt}
                    </p>
                  </div>
                  {/* Delete button only appears on hover or selection */}
                  <button
                    onClick={(e) => handleDelete(doc.id, e)}
                    className="absolute right-2 top-3 p-1 rounded-md text-zinc-600 hover:text-rose-400 hover:bg-zinc-900 opacity-0 group-hover:opacity-100 transition-opacity"
                    title="Delete study file"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* RIGHT COLUMN: Document Workspace Area */}
      <div className="flex-1 bg-zinc-950/10 border border-zinc-900/50 rounded-2xl flex flex-col overflow-hidden relative">
        
        {/* State 1: A document is selected to be read / copied / exported */}
        {selectedDoc ? (
          <div className="flex-1 flex flex-col h-full overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            {/* Header toolbar for document read view */}
            <div className="p-4 border-b border-zinc-900 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 bg-zinc-950/30 shrink-0">
              <div className="flex-1 min-w-0 text-left">
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setSelectedDocId(null)}
                    className="sm:hidden p-1 rounded-md hover:bg-zinc-900 text-zinc-400"
                    title="Back to generator"
                  >
                    <ArrowLeft className="w-4 h-4" />
                  </button>
                  <h2 className="text-sm font-bold text-zinc-100 truncate">{selectedDoc.title}</h2>
                </div>
                <p className="text-xs text-zinc-500 font-medium truncate mt-0.5">
                  {selectedDoc.subject} — Prepared on {selectedDoc.createdAt}
                </p>
              </div>

              {/* Action Toolbar */}
              <div className="flex items-center gap-2 self-end sm:self-auto shrink-0 select-none">
                <button
                  onClick={() => handleCopy(selectedDoc.content)}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-zinc-900 hover:bg-zinc-850 text-zinc-300 text-xs font-semibold border border-zinc-800 transition-colors"
                  title="Copy markdown to clipboard"
                >
                  {copied ? (
                    <>
                      <CheckCircle className="w-3.5 h-3.5 text-emerald-400" />
                      <span className="text-emerald-400">Copied</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" />
                      <span>Copy</span>
                    </>
                  )}
                </button>
                <button
                  onClick={() => handleDownload(selectedDoc)}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-zinc-900 hover:bg-zinc-850 text-zinc-300 text-xs font-semibold border border-zinc-800 transition-colors"
                  title="Download raw text file"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Download</span>
                </button>
                <button
                  onClick={handlePrint}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-zinc-900 hover:bg-zinc-850 text-zinc-300 text-xs font-semibold border border-zinc-800 transition-colors"
                  title="Print paper or save as PDF"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>Print / PDF</span>
                </button>
                <button
                  onClick={() => setSelectedDocId(null)}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-zinc-900/40 hover:bg-zinc-900 text-zinc-500 hover:text-zinc-300 text-xs font-semibold border border-transparent transition-colors"
                  title="Close document view"
                >
                  <span>Close</span>
                </button>
              </div>
            </div>

            {/* Markdown Display Body (Print optimized) */}
            <div className="flex-1 overflow-y-auto p-6 md:p-8 text-left selection:bg-cyan-500/20 selection:text-cyan-200 print:bg-white print:text-black">
              <div className="max-w-3xl mx-auto prose prose-invert print:prose-neutral">
                <MarkdownRenderer content={selectedDoc.content} />
              </div>
            </div>
          </div>
        ) : (
          /* State 2: No doc selected / Idle / Form to generate new document */
          <div className="flex-1 overflow-y-auto p-6 md:p-8 flex flex-col justify-center items-center">
            
            {/* Ambient Background Aura */}
            <div className="absolute inset-0 pointer-events-none flex items-center justify-center opacity-10 z-0">
              <div className="w-80 h-80 rounded-full bg-gradient-to-tr from-cyan-600 to-purple-600 blur-[80px]" />
            </div>

            <form onSubmit={handleGenerate} className="max-w-xl w-full space-y-6 relative z-10 text-left">
              <div className="space-y-2 text-center sm:text-left">
                <div className="flex items-center gap-2.5 justify-center sm:justify-start">
                  <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-cyan-500 to-purple-500 flex items-center justify-center text-white font-bold text-lg shadow-lg shadow-purple-950/20">
                    <Sparkles className="w-4.5 h-4.5" />
                  </div>
                  <h2 className="text-xl font-bold tracking-tight text-zinc-100">Study Document Generator</h2>
                </div>
                <p className="text-xs text-zinc-400 leading-relaxed">
                  Compile custom question papers, mock tests, revision summaries, or key section reference files tailored specifically to the CA Intermediate syllabus under ICAI.
                </p>
              </div>

              {/* Status messaging */}
              {successMsg && (
                <div className="p-3 bg-emerald-950/20 border border-emerald-900/40 rounded-xl flex gap-2.5 text-xs text-emerald-300">
                  <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                  <span>{successMsg}</span>
                </div>
              )}
              {errorMsg && (
                <div className="p-3 bg-rose-950/20 border border-rose-900/40 rounded-xl flex gap-2.5 text-xs text-rose-300">
                  <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                  <span>{errorMsg}</span>
                </div>
              )}

              {/* Select Document Type Grid */}
              <div className="space-y-2">
                <label className="text-xs font-semibold text-zinc-400 uppercase tracking-wider font-sans">Document Type</label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {DOCUMENT_TYPES.map(type => {
                    const Icon = type.icon;
                    const isSelected = docType === type.id;
                    return (
                      <button
                        key={type.id}
                        type="button"
                        onClick={() => setDocType(type.id)}
                        className={`p-3.5 rounded-xl border text-left transition-all duration-300 flex items-start gap-3 ${
                          isSelected 
                            ? "bg-zinc-900/80 border-cyan-500/50 text-cyan-200 shadow-md shadow-cyan-950/10" 
                            : "bg-zinc-950/25 hover:bg-zinc-900/40 border-zinc-900 text-zinc-400 hover:text-zinc-200"
                        }`}
                      >
                        <div className={`p-1.5 rounded-lg border shrink-0 ${isSelected ? "bg-cyan-950/30 border-cyan-800/40 text-cyan-400" : type.color}`}>
                          <Icon className="w-4 h-4" />
                        </div>
                        <div>
                          <p className="text-xs font-bold leading-none">{type.label}</p>
                          <p className="text-[10px] text-zinc-500 font-medium leading-normal mt-1">{type.desc}</p>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Subject Selection dropdown */}
              <div className="space-y-2">
                <label htmlFor="subj" className="text-xs font-semibold text-zinc-400 uppercase tracking-wider font-sans">Subject / Paper</label>
                <select
                  id="subj"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-zinc-900/80 border border-zinc-800 rounded-xl focus:outline-none focus:border-cyan-500 text-xs transition-colors text-zinc-200 font-medium"
                >
                  {SUBJECTS.map((sub, idx) => (
                    <option key={idx} value={sub} className="bg-[#1c1c1e] text-zinc-300">{sub}</option>
                  ))}
                </select>
              </div>

              {/* Google Drive Link Extractor Widget */}
              <div className="p-4 rounded-2xl border border-zinc-900 bg-zinc-950/40 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <FolderOpen className="w-4 h-4 text-cyan-400" />
                    <span className="text-xs font-semibold tracking-wider uppercase text-zinc-300">Extract from Google Drive</span>
                  </div>
                  {driveUser ? (
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] text-zinc-500 font-medium truncate max-w-[120px]" title={driveUser.email || undefined}>
                        {driveUser.email}
                      </span>
                      <button
                        type="button"
                        onClick={handleDriveLogout}
                        className="p-1 rounded-md text-zinc-600 hover:text-rose-400 hover:bg-zinc-900 transition-all cursor-pointer"
                        title="Disconnect Drive"
                      >
                        <LogOut className="w-3 h-3" />
                      </button>
                    </div>
                  ) : null}
                </div>

                {!driveUser ? (
                  <div className="space-y-2">
                    <p className="text-[11px] text-zinc-500 leading-normal">
                      Connect your Google account to extract question paper materials, revision docs, or study notes directly from your Google Drive links.
                    </p>
                    <button
                      type="button"
                      onClick={handleDriveLogin}
                      className="inline-flex items-center gap-2 px-4 py-2.5 bg-zinc-900 hover:bg-zinc-850 border border-zinc-850 hover:border-zinc-800 rounded-xl text-xs font-semibold text-zinc-300 transition-all active:scale-[0.98] shadow-sm cursor-pointer"
                    >
                      <svg className="w-4 h-4 shrink-0" viewBox="0 0 48 48">
                        <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z" />
                        <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z" />
                        <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z" />
                        <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z" />
                      </svg>
                      <span>Connect with Google Drive</span>
                    </button>
                  </div>
                ) : (
                  <div className="space-y-3">
                    <div className="flex gap-2">
                      <div className="relative flex-1">
                        <Link className="absolute left-3 top-2.5 w-3.5 h-3.5 text-zinc-600" />
                        <input
                          type="text"
                          value={driveUrl}
                          onChange={(e) => setDriveUrl(e.target.value)}
                          placeholder="Paste shareable Google Drive/Doc/Sheet URL..."
                          className="w-full pl-9 pr-3 py-2 bg-zinc-900 border border-zinc-800 rounded-xl text-xs text-zinc-200 placeholder-zinc-600 focus:outline-none focus:border-cyan-500"
                        />
                      </div>
                      <button
                        type="button"
                        onClick={handleExtractDriveFile}
                        disabled={isExtracting || !driveUrl.trim()}
                        className={`px-4 py-2 text-xs font-semibold rounded-xl border transition-all cursor-pointer shrink-0 ${
                          isExtracting || !driveUrl.trim()
                            ? "bg-[#161616] border-[#222] text-zinc-600 cursor-not-allowed"
                            : "bg-cyan-950/40 hover:bg-cyan-900/40 border-cyan-800/40 text-cyan-300"
                        }`}
                      >
                        {isExtracting ? (
                          <span className="flex items-center gap-1">
                            <Loader2 className="w-3 h-3 animate-spin" />
                            <span>Extracting...</span>
                          </span>
                        ) : (
                          <span>Extract File</span>
                        )}
                      </button>
                    </div>

                    {extractedContent ? (
                      <div className="p-3 rounded-xl bg-cyan-950/10 border border-cyan-900/20 flex items-start justify-between gap-3 animate-in fade-in slide-in-from-top-1">
                        <div className="flex gap-2">
                          <FileCode className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
                          <div>
                            <p className="text-[11px] font-bold text-cyan-300 truncate max-w-[280px]">
                              Extracted: {extractedFileName}
                            </p>
                            <p className="text-[10px] text-zinc-500 mt-0.5 font-mono">
                              {extractedContent.length.toLocaleString()} characters ready. Zylo will prioritize this source.
                            </p>
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={handleClearDriveSource}
                          className="text-[10px] font-medium text-rose-400 hover:text-rose-300 hover:underline shrink-0 cursor-pointer"
                        >
                          Clear
                        </button>
                      </div>
                    ) : null}
                  </div>
                )}
              </div>

              {/* Topic / Focus Input */}
              <div className="space-y-2">
                <label htmlFor="top" className="text-xs font-semibold text-zinc-400 uppercase tracking-wider font-sans">Chapter Topic or Query</label>
                <input
                  id="top"
                  type="text"
                  value={topic}
                  onChange={(e) => setTopic(e.target.value)}
                  placeholder="e.g. AS 10 valuation, Auditor Rotation Sec 139, Buyback Provisions, etc."
                  className="w-full px-3.5 py-2.5 bg-zinc-900/80 border border-zinc-800 rounded-xl focus:outline-none focus:border-cyan-500 text-xs transition-colors placeholder-zinc-600 text-zinc-200"
                />
              </div>

              {/* Extra optional preferences */}
              <div className="space-y-2">
                <label htmlFor="pref" className="text-xs font-semibold text-zinc-400 uppercase tracking-wider font-sans">Customize Structure & Preferences (Optional)</label>
                <textarea
                  id="pref"
                  rows={2}
                  value={extraInstructions}
                  onChange={(e) => setExtraInstructions(e.target.value)}
                  placeholder="e.g. Make it a 14-marks practice question with full answers at the bottom, or keep it extremely brief with Tamil-infused memory triggers."
                  className="w-full px-3.5 py-2.5 bg-zinc-900/80 border border-zinc-800 rounded-xl focus:outline-none focus:border-cyan-500 text-xs transition-colors placeholder-zinc-600 text-zinc-200 resize-none font-sans"
                />
              </div>

              {/* Submit / Generate button */}
              <button
                type="submit"
                disabled={isGenerating || !topic.trim()}
                className={`w-full py-3 rounded-xl font-bold text-xs tracking-wider uppercase transition-all duration-300 flex items-center justify-center gap-2 ${
                  isGenerating || !topic.trim()
                    ? "bg-[#1a1a1a] text-[#444444] border border-transparent cursor-not-allowed"
                    : "bg-gradient-to-r from-cyan-600 to-purple-600 text-white hover:scale-[1.01] active:scale-95 shadow-lg shadow-purple-900/10 hover:shadow-cyan-500/10"
                }`}
              >
                {isGenerating ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin text-zinc-300" />
                    <span>Compiling Study File with Zylo...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4.5 h-4.5 text-cyan-200" />
                    <span>Generate Document</span>
                  </>
                )}
              </button>
            </form>
          </div>
        )}
      </div>

    </div>
  );
}

import React, { useState } from "react";
import { UserLogin } from "../syllabus";
import { X, User, Mail, Phone, Calendar, LogIn, Sparkles } from "lucide-react";

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLogin: (user: UserLogin) => void;
  currentUser: UserLogin;
}

export default function LoginModal({ isOpen, onClose, onLogin, currentUser }: LoginModalProps) {
  const [name, setName] = useState(currentUser.name);
  const [identifier, setIdentifier] = useState(currentUser.identifier);
  const [targetAttempt, setTargetAttempt] = useState(currentUser.targetAttempt);
  const [error, setError] = useState("");

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setError("Please enter your name");
      return;
    }
    if (!identifier.trim()) {
      setError("Please enter your Email or Mobile number");
      return;
    }
    setError("");
    onLogin({
      name: name.trim(),
      identifier: identifier.trim(),
      targetAttempt
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-sm">
      <div className="w-full max-w-md overflow-hidden border border-[#222222] rounded-3xl bg-black text-zinc-100 shadow-2xl flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-[#111111] bg-[#080808]">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
              <span className="text-white font-bold text-sm">Z</span>
            </div>
            <div>
              <h2 className="text-md font-semibold tracking-tight text-zinc-100">Student Sign In</h2>
              <p className="text-[11px] text-zinc-500">Personalize your CA study desk</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-zinc-900 text-zinc-400 hover:text-zinc-200 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="p-3 rounded-xl bg-blue-950/20 border border-blue-900/30 flex gap-2.5 items-start">
            <Sparkles className="w-4 h-4 text-blue-400 shrink-0 mt-0.5" />
            <p className="text-[11px] text-zinc-400 leading-relaxed">
              Logging in preserves your study goals, customized checklists, and helps Zylo address you personally!
            </p>
          </div>

          {/* Name Field */}
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-zinc-400 flex items-center gap-1.5">
              <User className="w-3.5 h-3.5 text-blue-400" />
              Full Name
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-[#0a0a0a] border border-[#222222] rounded-xl focus:outline-none focus:border-blue-500 text-sm text-zinc-200 transition-all placeholder-zinc-700"
              placeholder="e.g. Praveen"
              required
            />
          </div>

          {/* Email or Mobile Number */}
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-zinc-400 flex items-center gap-1.5">
              <Mail className="w-3.5 h-3.5 text-purple-400" />
              Email Address / Mobile Number
            </label>
            <input
              type="text"
              value={identifier}
              onChange={(e) => setIdentifier(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-[#0a0a0a] border border-[#222222] rounded-xl focus:outline-none focus:border-blue-500 text-sm text-zinc-200 transition-all placeholder-zinc-700"
              placeholder="e.g. student@mail.com or +91 9876543210"
              required
            />
          </div>

          {/* Target Attempt */}
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-zinc-400 flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-pink-400" />
              Target CA attempt
            </label>
            <select
              value={targetAttempt}
              onChange={(e) => setTargetAttempt(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-[#0a0a0a] border border-[#222222] rounded-xl focus:outline-none focus:border-blue-500 text-sm text-zinc-200 transition-all cursor-pointer"
            >
              <option value="September 2026">September 2026 Attempt (New Scheme)</option>
              <option value="January 2026">January 2026 Attempt</option>
              <option value="May 2026">May 2026 Attempt</option>
              <option value="November 2026">November 2026 Attempt</option>
            </select>
          </div>

          {error && (
            <p className="text-xs text-rose-400 font-medium">{error}</p>
          )}

          {/* Submit */}
          <div className="pt-2 flex justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs text-zinc-400 hover:text-zinc-200 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex items-center gap-2 px-5 py-2.5 text-xs font-medium bg-blue-600 hover:bg-blue-500 rounded-xl text-white transition-all shadow-md shadow-blue-950/20"
            >
              <LogIn className="w-3.5 h-3.5" />
              Sign In
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

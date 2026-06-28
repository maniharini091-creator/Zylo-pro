import React, { useState } from "react";
import { UserLogin } from "../syllabus";
import { ZyloLogo, getNameFromEmail } from "../App";
import { 
  User, Mail, Calendar, ArrowRight, Sparkles, ShieldCheck, 
  GraduationCap, BookOpen, Star, HelpCircle, Trophy
} from "lucide-react";

interface AuthScreenProps {
  onLogin: (user: UserLogin) => void;
}

export default function AuthScreen({ onLogin }: AuthScreenProps) {
  const [isSignUp, setIsSignUp] = useState(true);
  const [name, setName] = useState("");
  const [identifier, setIdentifier] = useState("");
  const [targetAttempt, setTargetAttempt] = useState("September 2026");
  const [error, setError] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (isSignUp && !name.trim()) {
      setError("Please enter your full name.");
      return;
    }
    if (!identifier.trim()) {
      setError("Please enter your email or mobile number.");
      return;
    }

    let finalName = name.trim();
    if (!isSignUp) {
      // For sign-in, if name is empty, we infer from email or assign a default
      finalName = getNameFromEmail(identifier.trim());
    }

    onLogin({
      name: finalName,
      identifier: identifier.trim(),
      targetAttempt
    });
  };

  return (
    <div className="min-h-screen w-screen bg-black text-zinc-100 flex items-center justify-center p-4 relative overflow-hidden font-sans">
      
      {/* Decorative ambient glowing backdrops */}
      <div className="absolute top-1/4 left-1/4 -translate-x-1/2 -translate-y-1/2 w-[350px] h-[350px] rounded-full bg-blue-600/10 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 translate-x-1/2 translate-y-1/2 w-[400px] h-[400px] rounded-full bg-purple-600/10 blur-[130px] pointer-events-none" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] rounded-full bg-pink-600/5 blur-[150px] pointer-events-none" />

      {/* Grid subtle background pattern */}
      <div className="absolute inset-0 bg-[radial-gradient(#111111_1px,transparent_1px)] [background-size:24px_24px] opacity-35 pointer-events-none" />

      {/* Main Container */}
      <div className="w-full max-w-[950px] grid md:grid-cols-12 gap-0 border border-zinc-800/80 rounded-[32px] bg-zinc-950/60 backdrop-blur-xl overflow-hidden shadow-2xl relative z-10">
        
        {/* Left Side: Product Showcase & Brand Info */}
        <div className="md:col-span-5 bg-[#050505] p-8 md:p-10 border-b md:border-b-0 md:border-r border-zinc-900/90 flex flex-col justify-between relative overflow-hidden">
          
          {/* subtle radial highlights */}
          <div className="absolute top-0 left-0 right-0 h-[200px] bg-gradient-to-b from-blue-950/20 to-transparent pointer-events-none" />
          
          <div className="space-y-8 relative z-10">
            {/* Logo */}
            <div className="flex items-center gap-3">
              <ZyloLogo className="w-10 h-10" />
              <div>
                <span className="font-semibold text-lg tracking-wider text-zinc-100 font-mono">ZYLO AI</span>
                <span className="block text-[10px] text-zinc-500 font-medium tracking-widest uppercase">CA Inter Companion</span>
              </div>
            </div>

            {/* Core Pillars / Bullet Points */}
            <div className="space-y-5 pt-4">
              <div className="flex gap-3">
                <div className="w-8 h-8 rounded-lg bg-zinc-900 border border-zinc-800 flex items-center justify-center shrink-0 text-blue-400">
                  <GraduationCap className="w-4 h-4" />
                </div>
                <div className="space-y-0.5">
                  <h4 className="text-xs font-semibold text-zinc-200">CA Inter Exam Prep</h4>
                  <p className="text-[11px] text-zinc-400 leading-relaxed">Integrated syllabus, structured schedules, and direct practice planner customization.</p>
                </div>
              </div>

              <div className="flex gap-3">
                <div className="w-8 h-8 rounded-lg bg-zinc-900 border border-zinc-800 flex items-center justify-center shrink-0 text-purple-400">
                  <Sparkles className="w-4 h-4" />
                </div>
                <div className="space-y-0.5">
                  <h4 className="text-xs font-semibold text-zinc-200">AI-Powered Evaluations</h4>
                  <p className="text-[11px] text-zinc-400 leading-relaxed">Upload handwritten answers, get immediate evaluations, markdowns, and section citations.</p>
                </div>
              </div>

              <div className="flex gap-3">
                <div className="w-8 h-8 rounded-lg bg-zinc-900 border border-zinc-800 flex items-center justify-center shrink-0 text-pink-400">
                  <Trophy className="w-4 h-4" />
                </div>
                <div className="space-y-0.5">
                  <h4 className="text-xs font-semibold text-zinc-200">Study Tracker & Planner</h4>
                  <p className="text-[11px] text-zinc-400 leading-relaxed">Organize tasks, track chapter completions, and generate custom revision guides in PDF.</p>
                </div>
              </div>
            </div>
          </div>

          {/* Footer stats badge */}
          <div className="pt-8 border-t border-zinc-900 mt-8 relative z-10">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
              <span className="text-[10px] text-zinc-400 font-medium font-mono">100% Client-Side Private Secure Memory</span>
            </div>
          </div>
        </div>

        {/* Right Side: Sign In / Sign Up Form */}
        <div className="md:col-span-7 p-8 md:p-12 flex flex-col justify-center">
          <div className="max-w-sm mx-auto w-full space-y-6 text-left">
            
            {/* Header switcher */}
            <div className="space-y-2">
              <div className="inline-flex p-0.5 bg-zinc-900/80 border border-zinc-800/80 rounded-xl">
                <button
                  type="button"
                  onClick={() => {
                    setIsSignUp(true);
                    setError("");
                  }}
                  className={`px-3 py-1.5 text-xs rounded-lg font-medium transition-all ${
                    isSignUp 
                      ? "bg-zinc-800 text-zinc-100 shadow-sm border border-zinc-700/50" 
                      : "text-zinc-500 hover:text-zinc-300"
                  }`}
                >
                  Create Account
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setIsSignUp(false);
                    setError("");
                  }}
                  className={`px-3 py-1.5 text-xs rounded-lg font-medium transition-all ${
                    !isSignUp 
                      ? "bg-zinc-800 text-zinc-100 shadow-sm border border-zinc-700/50" 
                      : "text-zinc-500 hover:text-zinc-300"
                  }`}
                >
                  Sign In
                </button>
              </div>
              
              <h2 className="text-xl md:text-2xl font-bold tracking-tight text-zinc-100 pt-2">
                {isSignUp ? "Set up your CA Study Desk" : "Welcome back, Student"}
              </h2>
              <p className="text-xs text-zinc-400">
                {isSignUp 
                  ? "Enter your details to create a study profile and generate your custom planners." 
                  : "Enter your registered credentials to access your session logs and dashboard."}
              </p>
            </div>

            {/* Main Form */}
            <form onSubmit={handleSubmit} className="space-y-4 pt-2">
              
              {/* Name (Only for Sign Up) */}
              {isSignUp && (
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-zinc-400 flex items-center gap-1.5">
                    <User className="w-3.5 h-3.5 text-blue-400 shrink-0" />
                    Full Name
                  </label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                    className="w-full px-4 py-2.5 bg-zinc-950 border border-zinc-800 rounded-xl focus:outline-none focus:border-blue-500 text-sm text-zinc-200 placeholder-zinc-700 transition-all font-medium"
                    placeholder="e.g. Praveen Kumar"
                  />
                </div>
              )}

              {/* Identifier (Email / Mobile) */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-zinc-400 flex items-center gap-1.5">
                  <Mail className="w-3.5 h-3.5 text-purple-400 shrink-0" />
                  Email Address / Mobile Number
                </label>
                <input
                  type="text"
                  value={identifier}
                  onChange={(e) => setIdentifier(e.target.value)}
                  required
                  className="w-full px-4 py-2.5 bg-zinc-950 border border-zinc-800 rounded-xl focus:outline-none focus:border-blue-500 text-sm text-zinc-200 placeholder-zinc-700 transition-all font-medium"
                  placeholder={isSignUp ? "e.g. student@mail.com or +91 9876543210" : "Enter email or mobile"}
                />
              </div>

              {/* Target Attempt */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-zinc-400 flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5 text-pink-400 shrink-0" />
                  Target CA Attempt
                </label>
                <select
                  value={targetAttempt}
                  onChange={(e) => setTargetAttempt(e.target.value)}
                  className="w-full px-4 py-2.5 bg-zinc-950 border border-zinc-800 rounded-xl focus:outline-none focus:border-blue-500 text-sm text-zinc-200 transition-all cursor-pointer font-medium"
                >
                  <option value="September 2026">September 2026 Attempt (New Scheme)</option>
                  <option value="January 2026">January 2026 Attempt</option>
                  <option value="May 2026">May 2026 Attempt</option>
                  <option value="November 2026">November 2026 Attempt</option>
                </select>
              </div>

              {error && (
                <div className="p-3 rounded-lg bg-rose-950/30 border border-rose-900/50 text-rose-300 text-xs font-medium">
                  {error}
                </div>
              )}

              {/* Submit Button */}
              <button
                type="submit"
                className="w-full flex items-center justify-center gap-2 px-5 py-3 text-xs font-bold bg-blue-600 hover:bg-blue-500 active:scale-[0.98] rounded-xl text-white transition-all shadow-lg shadow-blue-950/35 mt-4"
              >
                <span>{isSignUp ? "Create Account & Enter" : "Sign In to Workspace"}</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </form>

            {/* Switch mode quick prompt */}
            <div className="text-center pt-2">
              <button
                type="button"
                onClick={() => {
                  setIsSignUp(!isSignUp);
                  setError("");
                }}
                className="text-xs text-zinc-500 hover:text-zinc-300 underline underline-offset-4 transition-colors font-medium"
              >
                {isSignUp 
                  ? "Already have an account? Sign In instead" 
                  : "New student? Create your CA study profile"}
              </button>
            </div>

          </div>
        </div>

      </div>
    </div>
  );
}

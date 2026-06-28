import React, { useState } from "react";
import { UserMemoryProfile } from "../types";
import { X, Brain, Plus, Trash, Save, Languages, Sparkles, BookOpen } from "lucide-react";

interface MemoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  profile: UserMemoryProfile;
  onSave: (updated: UserMemoryProfile) => void;
}

export default function MemoryModal({ isOpen, onClose, profile, onSave }: MemoryModalProps) {
  const [editedProfile, setEditedProfile] = useState<UserMemoryProfile>({ ...profile });
  const [newWeakArea, setNewWeakArea] = useState("");
  const [newStrength, setNewStrength] = useState("");

  if (!isOpen) return null;

  const handleSave = () => {
    onSave(editedProfile);
    onClose();
  };

  const addWeakArea = () => {
    if (newWeakArea.trim() && !editedProfile.weakAreas.includes(newWeakArea.trim())) {
      setEditedProfile({
        ...editedProfile,
        weakAreas: [...editedProfile.weakAreas, newWeakArea.trim()],
      });
      setNewWeakArea("");
    }
  };

  const removeWeakArea = (index: number) => {
    setEditedProfile({
      ...editedProfile,
      weakAreas: editedProfile.weakAreas.filter((_, i) => i !== index),
    });
  };

  const addStrength = () => {
    if (newStrength.trim() && !editedProfile.strengths.includes(newStrength.trim())) {
      setEditedProfile({
        ...editedProfile,
        strengths: [...editedProfile.strengths, newStrength.trim()],
      });
      setNewStrength("");
    }
  };

  const removeStrength = (index: number) => {
    setEditedProfile({
      ...editedProfile,
      strengths: editedProfile.strengths.filter((_, i) => i !== index),
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
      <div className="w-full max-w-xl overflow-hidden border border-zinc-800 rounded-2xl bg-zinc-950 text-zinc-100 shadow-2xl flex flex-col max-h-[85vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-800 bg-zinc-900/50">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-cyan-950/50 border border-cyan-850/50">
              <Brain className="w-5 h-5 text-cyan-400" />
            </div>
            <div>
              <h2 className="text-lg font-display font-medium text-zinc-100">Zylo's Cognitive Memory</h2>
              <p className="text-xs text-zinc-500">Adapting to your CA Intermediate style</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg hover:bg-zinc-800 text-zinc-400 hover:text-zinc-200 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Vibe Notice */}
          <div className="p-4 rounded-xl bg-zinc-900 border border-zinc-800 flex gap-3">
            <Sparkles className="w-5 h-5 text-yellow-500 shrink-0 mt-0.5" />
            <p className="text-xs text-zinc-400 leading-relaxed">
              As you chat, Zylo naturally analyzes your answers, mistakes, and language styles to adapt its tutor personality. You can inspect or manually tweak this memory below!
            </p>
          </div>

          {/* Preferred Language */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-zinc-300 flex items-center gap-2">
              <Languages className="w-4 h-4 text-purple-400" />
              Tutor Language Preference
            </label>
            <input
              type="text"
              value={editedProfile.preferredLanguage}
              onChange={(e) => setEditedProfile({ ...editedProfile, preferredLanguage: e.target.value })}
              className="w-full px-3 py-2 bg-zinc-900 border border-zinc-800 rounded-xl focus:outline-none focus:border-cyan-500 text-sm transition-colors"
              placeholder="e.g. English, Tanglish, Tamil-mix"
            />
          </div>

          {/* Weak Areas (Focus zones) */}
          <div className="space-y-3">
            <label className="text-sm font-medium text-zinc-300 flex items-center gap-2">
              <Trash className="w-4 h-4 text-rose-400" />
              Struggle Zones (Weak Areas)
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                value={newWeakArea}
                onChange={(e) => setNewWeakArea(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && addWeakArea()}
                className="flex-1 px-3 py-2 bg-zinc-900 border border-zinc-800 rounded-xl focus:outline-none focus:border-cyan-500 text-sm transition-colors"
                placeholder="e.g. AS 10 PPE, Auditor Rotation"
              />
              <button
                onClick={addWeakArea}
                className="px-3 py-2 bg-zinc-850 hover:bg-zinc-800 border border-zinc-800 rounded-xl text-zinc-200 transition-colors flex items-center justify-center"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>
            <div className="flex flex-wrap gap-2">
              {editedProfile.weakAreas.length === 0 ? (
                <span className="text-xs text-zinc-600">No weak areas logged yet. Zylo will auto-detect!</span>
              ) : (
                editedProfile.weakAreas.map((area, idx) => (
                  <span
                    key={idx}
                    className="flex items-center gap-1.5 px-2.5 py-1 text-xs rounded-lg bg-rose-950/30 border border-rose-900/50 text-rose-300"
                  >
                    {area}
                    <button onClick={() => removeWeakArea(idx)} className="hover:text-rose-100">
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                ))
              )}
            </div>
          </div>

          {/* Strengths */}
          <div className="space-y-3">
            <label className="text-sm font-medium text-zinc-300 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-emerald-400" />
              Mastered Zones (Strengths)
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                value={newStrength}
                onChange={(e) => setNewStrength(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && addStrength()}
                className="flex-1 px-3 py-2 bg-zinc-900 border border-zinc-800 rounded-xl focus:outline-none focus:border-cyan-500 text-sm transition-colors"
                placeholder="e.g. Audit Strategy, Corporate law"
              />
              <button
                onClick={addStrength}
                className="px-3 py-2 bg-zinc-850 hover:bg-zinc-800 border border-zinc-800 rounded-xl text-zinc-200 transition-colors flex items-center justify-center"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>
            <div className="flex flex-wrap gap-2">
              {editedProfile.strengths.length === 0 ? (
                <span className="text-xs text-zinc-600">No mastered areas logged yet. Get answers correct to fill this!</span>
              ) : (
                editedProfile.strengths.map((str, idx) => (
                  <span
                    key={idx}
                    className="flex items-center gap-1.5 px-2.5 py-1 text-xs rounded-lg bg-emerald-950/30 border border-emerald-900/50 text-emerald-300"
                  >
                    {str}
                    <button onClick={() => removeStrength(idx)} className="hover:text-emerald-100">
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                ))
              )}
            </div>
          </div>

          {/* Tutor Custom Instructions & Notes */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-zinc-300 flex items-center gap-2">
              <BookOpen className="w-4 h-4 text-blue-400" />
              Tutor Personalization Notes (Manual Override)
            </label>
            <textarea
              rows={4}
              value={editedProfile.notes}
              onChange={(e) => setEditedProfile({ ...editedProfile, notes: e.target.value })}
              className="w-full px-3 py-2 bg-zinc-900 border border-zinc-800 rounded-xl focus:outline-none focus:border-cyan-500 text-sm transition-colors resize-none leading-relaxed"
              placeholder="e.g. Praveen gets confused by ITC 180-day repayment. Explain with simple calculations."
            />
            <p className="text-[10px] text-zinc-500">
              Customize Zylo's instructions directly by typing custom coaching guidelines.
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-zinc-800 bg-zinc-900/50">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm text-zinc-400 hover:text-zinc-200 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="flex items-center gap-2 px-4 py-2 text-sm font-medium bg-cyan-550 hover:bg-cyan-600 border border-cyan-500 rounded-xl text-zinc-950 transition-colors shadow-lg shadow-cyan-950/20"
          >
            <Save className="w-4 h-4" />
            Save Cognitive State
          </button>
        </div>
      </div>
    </div>
  );
}

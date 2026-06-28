import React, { useState } from "react";
import { INBUILT_SYLLABUS, SyllabusSubject, SyllabusTopic } from "../syllabus";
import { CheckCircle, Circle, ChevronDown, ChevronUp, BookOpen, GraduationCap, Award, Sparkles } from "lucide-react";

interface SyllabusTrackerProps {
  completedTopics: string[];
  onToggleTopic: (id: string) => void;
  onStudyTopic: (topicName: string, subjectName: string) => void;
}

export default function SyllabusTracker({ completedTopics, onToggleTopic, onStudyTopic }: SyllabusTrackerProps) {
  const [expandedPapers, setExpandedPapers] = useState<Record<string, boolean>>({
    p1_accounting: true, // Keep Advanced Accounting open by default!
  });

  const togglePaperExpanded = (paperId: string) => {
    setExpandedPapers(prev => ({
      ...prev,
      [paperId]: !prev[paperId]
    }));
  };

  // Calculations
  const totalTopicsCount = INBUILT_SYLLABUS.reduce((acc, sub) => acc + sub.topics.length, 0);
  const totalCompletedCount = completedTopics.length;
  const overallProgress = totalTopicsCount > 0 ? Math.round((totalCompletedCount / totalTopicsCount) * 100) : 0;

  // Group calculations
  const group1Subjects = INBUILT_SYLLABUS.filter(s => s.group === 1);
  const group1TotalTopics = group1Subjects.reduce((acc, sub) => acc + sub.topics.length, 0);
  const group1CompletedCount = group1Subjects.reduce(
    (acc, sub) => acc + sub.topics.filter(t => completedTopics.includes(t.id)).length, 
    0
  );
  const group1Progress = group1TotalTopics > 0 ? Math.round((group1CompletedCount / group1TotalTopics) * 100) : 0;

  const group2Subjects = INBUILT_SYLLABUS.filter(s => s.group === 2);
  const group2TotalTopics = group2Subjects.reduce((acc, sub) => acc + sub.topics.length, 0);
  const group2CompletedCount = group2Subjects.reduce(
    (acc, sub) => acc + sub.topics.filter(t => completedTopics.includes(t.id)).length, 
    0
  );
  const group2Progress = group2TotalTopics > 0 ? Math.round((group2CompletedCount / group2TotalTopics) * 100) : 0;

  // Subject-specific calculations
  const getSubjectProgress = (subject: SyllabusSubject) => {
    const completed = subject.topics.filter(t => completedTopics.includes(t.id)).length;
    return {
      completed,
      total: subject.topics.length,
      percentage: Math.round((completed / subject.topics.length) * 100)
    };
  };

  return (
    <div className="w-full max-w-4xl mx-auto space-y-6 pb-24 text-zinc-100 px-2 sm:px-4">
      {/* Visual Progress Dashboard */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Overall progress */}
        <div className="bg-[#080808] border border-[#1a1a1a] rounded-2xl p-5 flex flex-col justify-between relative overflow-hidden">
          <div className="absolute right-4 top-4 text-zinc-850">
            <Award className="w-16 h-16 stroke-[1]" />
          </div>
          <div className="space-y-1">
            <span className="text-xs text-zinc-500 font-mono uppercase tracking-wider">Overall Syllabus</span>
            <h3 className="text-3xl font-light tracking-tight text-white">
              {overallProgress}% <span className="text-xs text-[#555555] font-mono">({totalCompletedCount}/{totalTopicsCount} Chapters)</span>
            </h3>
          </div>
          <div className="mt-4 space-y-1.5 z-10">
            <div className="w-full bg-[#111111] h-1.5 rounded-full overflow-hidden border border-[#222222]">
              <div 
                className="bg-gradient-to-r from-blue-500 to-purple-600 h-full transition-all duration-500"
                style={{ width: `${overallProgress}%` }}
              />
            </div>
            <p className="text-[10px] text-[#666666]">Target Attempt: Sept 2026 (ICAI New Scheme)</p>
          </div>
        </div>

        {/* Group 1 progress */}
        <div className="bg-[#080808] border border-[#1a1a1a] rounded-2xl p-5 flex flex-col justify-between relative overflow-hidden">
          <div className="space-y-1">
            <span className="text-xs text-zinc-500 font-mono uppercase tracking-wider">Group 1 Completion</span>
            <h3 className="text-3xl font-light tracking-tight text-blue-400">
              {group1Progress}% <span className="text-xs text-[#555555] font-mono">({group1CompletedCount}/{group1TotalTopics} Ch)</span>
            </h3>
          </div>
          <div className="mt-4 space-y-1.5 z-10">
            <div className="w-full bg-[#111111] h-1.5 rounded-full overflow-hidden border border-[#222222]">
              <div 
                className="bg-blue-500 h-full transition-all duration-500"
                style={{ width: `${group1Progress}%` }}
              />
            </div>
            <p className="text-[10px] text-[#666666]">Papers 1, 2, and 3 (Accounts, Law, Taxation)</p>
          </div>
        </div>

        {/* Group 2 progress */}
        <div className="bg-[#080808] border border-[#1a1a1a] rounded-2xl p-5 flex flex-col justify-between relative overflow-hidden">
          <div className="space-y-1">
            <span className="text-xs text-zinc-500 font-mono uppercase tracking-wider">Group 2 Completion</span>
            <h3 className="text-3xl font-light tracking-tight text-purple-400">
              {group2Progress}% <span className="text-xs text-[#555555] font-mono">({group2CompletedCount}/{group2TotalTopics} Ch)</span>
            </h3>
          </div>
          <div className="mt-4 space-y-1.5 z-10">
            <div className="w-full bg-[#111111] h-1.5 rounded-full overflow-hidden border border-[#222222]">
              <div 
                className="bg-purple-600 h-full transition-all duration-500"
                style={{ width: `${group2Progress}%` }}
              />
            </div>
            <p className="text-[10px] text-[#666666]">Papers 4, 5, and 6 (Costing, Audit, FM-SM)</p>
          </div>
        </div>
      </div>

      {/* Main Papers List */}
      <div className="space-y-4">
        <h2 className="text-lg font-semibold tracking-tight text-zinc-300 border-b border-[#111111] pb-2 flex items-center gap-2">
          <GraduationCap className="w-5 h-5 text-blue-400" />
          September 2026 Curriculum Breakdown
        </h2>

        {/* Group 1 Papers section */}
        <div className="space-y-3">
          <div className="text-[10px] uppercase font-bold tracking-widest text-blue-500 bg-blue-950/10 border border-blue-900/20 px-2.5 py-1 rounded-md w-fit">
            GROUP I
          </div>
          <div className="space-y-3">
            {group1Subjects.map(sub => {
              const { completed, total, percentage } = getSubjectProgress(sub);
              const isExpanded = !!expandedPapers[sub.id];
              return (
                <div key={sub.id} className="bg-[#080808] border border-[#1a1a1a] rounded-2xl overflow-hidden transition-all">
                  {/* Paper Title Header Card */}
                  <div 
                    onClick={() => togglePaperExpanded(sub.id)}
                    className="p-4 sm:p-5 flex items-center justify-between cursor-pointer hover:bg-[#0c0c0c] transition-colors"
                  >
                    <div className="space-y-1 min-w-0 flex-1 pr-3">
                      <div className="flex items-center gap-2.5">
                        <h4 className="font-medium text-zinc-200 text-sm sm:text-base truncate">{sub.paperName}</h4>
                        <span className="text-[10px] text-[#666666] font-mono font-bold bg-[#111111] border border-[#222222] px-1.5 py-0.5 rounded shrink-0">
                          {sub.marks} Marks
                        </span>
                      </div>
                      
                      {/* Interactive Progress Indicators */}
                      <div className="flex items-center gap-3">
                        <div className="w-24 sm:w-32 bg-[#111111] h-1.5 rounded-full overflow-hidden border border-[#222222] shrink-0">
                          <div 
                            className="bg-blue-500 h-full transition-all duration-300"
                            style={{ width: `${percentage}%` }}
                          />
                        </div>
                        <span className="text-xs text-[#888888] font-mono">
                          {percentage}% completed ({completed}/{total} chapters)
                        </span>
                      </div>
                    </div>

                    <button className="p-1 rounded-lg bg-[#111111] border border-[#222222] text-zinc-400 hover:text-zinc-200">
                      {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                    </button>
                  </div>

                  {/* Topics List checklist */}
                  {isExpanded && (
                    <div className="border-t border-[#111111] bg-[#020202] p-4 space-y-2">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        {sub.topics.map(topic => {
                          const isDone = completedTopics.includes(topic.id);
                          return (
                            <div 
                              key={topic.id}
                              className={`flex items-center justify-between p-3 rounded-xl border transition-all ${
                                isDone 
                                  ? "bg-[#111111]/30 border-blue-900/30 text-zinc-300" 
                                  : "bg-[#060606] border-[#161616] hover:border-[#222222] text-zinc-400"
                              }`}
                            >
                              <div 
                                onClick={() => onToggleTopic(topic.id)}
                                className="flex items-center gap-3 cursor-pointer flex-1 min-w-0 pr-2"
                              >
                                {isDone ? (
                                  <CheckCircle className="w-4 h-4 text-blue-500 shrink-0" />
                                ) : (
                                  <Circle className="w-4 h-4 text-zinc-700 shrink-0" />
                                )}
                                <span className="text-xs truncate leading-relaxed">{topic.name}</span>
                              </div>
                              
                              <button
                                onClick={() => onStudyTopic(topic.name, sub.paperName)}
                                className="px-2 py-1 text-[10px] bg-[#111111] hover:bg-blue-600 border border-[#222222] hover:border-blue-500 text-zinc-400 hover:text-white rounded-lg transition-all flex items-center gap-1 shrink-0"
                                title="Start study dialog with Zylo AI on this subject"
                              >
                                <Sparkles className="w-3 h-3 text-blue-400" />
                                Study
                              </button>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Group 2 Papers section */}
        <div className="space-y-3 pt-4">
          <div className="text-[10px] uppercase font-bold tracking-widest text-purple-500 bg-purple-950/10 border border-purple-900/20 px-2.5 py-1 rounded-md w-fit">
            GROUP II
          </div>
          <div className="space-y-3">
            {group2Subjects.map(sub => {
              const { completed, total, percentage } = getSubjectProgress(sub);
              const isExpanded = !!expandedPapers[sub.id];
              return (
                <div key={sub.id} className="bg-[#080808] border border-[#1a1a1a] rounded-2xl overflow-hidden transition-all">
                  {/* Paper Title Header Card */}
                  <div 
                    onClick={() => togglePaperExpanded(sub.id)}
                    className="p-4 sm:p-5 flex items-center justify-between cursor-pointer hover:bg-[#0c0c0c] transition-colors"
                  >
                    <div className="space-y-1 min-w-0 flex-1 pr-3">
                      <div className="flex items-center gap-2.5">
                        <h4 className="font-medium text-zinc-200 text-sm sm:text-base truncate">{sub.paperName}</h4>
                        <span className="text-[10px] text-[#666666] font-mono font-bold bg-[#111111] border border-[#222222] px-1.5 py-0.5 rounded shrink-0">
                          {sub.marks} Marks
                        </span>
                      </div>
                      
                      {/* Interactive Progress Indicators */}
                      <div className="flex items-center gap-3">
                        <div className="w-24 sm:w-32 bg-[#111111] h-1.5 rounded-full overflow-hidden border border-[#222222] shrink-0">
                          <div 
                            className="bg-purple-600 h-full transition-all duration-300"
                            style={{ width: `${percentage}%` }}
                          />
                        </div>
                        <span className="text-xs text-[#888888] font-mono">
                          {percentage}% completed ({completed}/{total} chapters)
                        </span>
                      </div>
                    </div>

                    <button className="p-1 rounded-lg bg-[#111111] border border-[#222222] text-zinc-400 hover:text-zinc-200">
                      {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                    </button>
                  </div>

                  {/* Topics List checklist */}
                  {isExpanded && (
                    <div className="border-t border-[#111111] bg-[#020202] p-4 space-y-2">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        {sub.topics.map(topic => {
                          const isDone = completedTopics.includes(topic.id);
                          return (
                            <div 
                              key={topic.id}
                              className={`flex items-center justify-between p-3 rounded-xl border transition-all ${
                                isDone 
                                  ? "bg-[#111111]/30 border-purple-900/30 text-zinc-300" 
                                  : "bg-[#060606] border-[#161616] hover:border-[#222222] text-zinc-400"
                              }`}
                            >
                              <div 
                                onClick={() => onToggleTopic(topic.id)}
                                className="flex items-center gap-3 cursor-pointer flex-1 min-w-0 pr-2"
                              >
                                {isDone ? (
                                  <CheckCircle className="w-4 h-4 text-purple-500 shrink-0" />
                                ) : (
                                  <Circle className="w-4 h-4 text-zinc-700 shrink-0" />
                                )}
                                <span className="text-xs truncate leading-relaxed">{topic.name}</span>
                              </div>
                              
                              <button
                                onClick={() => onStudyTopic(topic.name, sub.paperName)}
                                className="px-2 py-1 text-[10px] bg-[#111111] hover:bg-purple-600 border border-[#222222] hover:border-purple-500 text-zinc-400 hover:text-white rounded-lg transition-all flex items-center gap-1 shrink-0"
                                title="Start study dialog with Zylo AI on this subject"
                              >
                                <Sparkles className="w-3 h-3 text-purple-400" />
                                Study
                              </button>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

      </div>
    </div>
  );
}

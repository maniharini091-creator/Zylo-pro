import React, { useState, useEffect } from "react";
import { StudyTask } from "../syllabus";
import { 
  Download, Calendar, Clock, AlertTriangle, CheckSquare, Sparkles, Plus, Trash2, 
  Check, Info, RefreshCw, Layers, CalendarCheck, FileSpreadsheet
} from "lucide-react";
import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";

interface StudyPlannerProps {
  tasks: StudyTask[];
  onAddTask: (task: Omit<StudyTask, "id">) => void;
  onDeleteTask: (id: string) => void;
  onUpdateTaskStatus: (id: string, status: StudyTask["status"]) => void;
  onStudyTask: (taskTitle: string, subjectName: string) => void;
}

// Predefined Syllabus from ICAIXD html
const SUBJECTS_DATA = {
  G1: [
    { id: "adv", name: "Paper 1: Advanced Accounts", badge: "b-adv", label: "Adv. Acc.", days: 10 },
    { id: "law", name: "Paper 2: Corporate & Other Laws", badge: "b-law", label: "Laws", days: 8 },
    { id: "tax", name: "Paper 3: Taxation", badge: "b-tax", label: "Taxation", days: 8 }
  ],
  G2: [
    { id: "cost", name: "Paper 4: Cost & Management Acc.", badge: "b-cost", label: "Costing", days: 8 },
    { id: "audit", name: "Paper 5: Auditing & Ethics", badge: "b-audit", label: "Audit", days: 10 },
    { id: "fm", name: "Paper 6: FM & Strategic Mgmt.", badge: "b-fm", label: "FM & SM", days: 8 }
  ],
  BOTH: [
    { id: "adv", name: "Paper 1: Advanced Accounts", badge: "b-adv", label: "Adv. Acc.", days: 10 },
    { id: "law", name: "Paper 2: Corporate & Other Laws", badge: "b-law", label: "Laws", days: 8 },
    { id: "tax", name: "Paper 3: Taxation", badge: "b-tax", label: "Taxation", days: 8 },
    { id: "cost", name: "Paper 4: Cost & Management Acc.", badge: "b-cost", label: "Costing", days: 8 },
    { id: "audit", name: "Paper 5: Auditing & Ethics", badge: "b-audit", label: "Audit", days: 10 },
    { id: "fm", name: "Paper 6: FM & Strategic Mgmt.", badge: "b-fm", label: "FM & SM", days: 8 }
  ]
};

const SYLLABUS_DATA: Record<string, string[][]> = {
  adv: [
    ["Buyback of Securities, AS 20, AS 17"],
    ["Internal Reconstruction, AS 12, AS 24"],
    ["Cash Flow Statement, AS 10, AS 4"],
    ["AS 13, AS 29, AS 5"],
    ["AS 11, AS 15, AS 19"],
    ["AS 16, AS 7, AS 22"],
    ["AS 18, AS 26, AS 2, AS 9"],
    ["AS 28, Framework, Branch Accounts"],
    ["AS 21, AS 25"],
    ["Schedule III, Accounting for Amalgamations"]
  ],
  law: [
    ["Dividend, FEMA"],
    ["Company Incorporated Outside India, Accounts of Company"],
    ["Audit & Auditors, Share & Debenture"],
    ["LLP Act, Incorporation, Acceptance of Deposits"],
    ["Prospectus, General Clauses Act, Preliminary"],
    ["Management & Administration, Registration of Charges"],
    ["Dividend, FEMA, Co. Inc. Outside India, Accounts"],
    ["Audit, Share & Debenture, LLP, Incorporation, Deposits"]
  ],
  tax: [
    ["Basic Tax Calculation, Residence & Scope of Total Income"],
    ["Supply under GST, E-Way Bill, Charge of GST, Exemptions"],
    ["Income from House Property, Value of Supply"],
    ["Place of Supply, Time of Supply"],
    ["Income from Other Sources, Clubbing of Income, PGBP"],
    ["Set-Off & Carry Forward of Losses, Deductions"],
    ["ITC, Advance Tax, TDS/TCS, Returns, Registration"],
    ["Salary, Capital Gains, Accounts & Records, Tax Invoice, GST Returns"]
  ],
  cost: [
    ["Cost Sheet, Unit & Batch Costing"],
    ["Material Costing, Job Costing"],
    ["Marginal Costing, Reconciliation Statement"],
    ["ABC Costing, Overheads"],
    ["Service Costing, Employee Costing"],
    ["Process Costing, Joint Products & By-Products"],
    ["Budgets & Budgetary Control, Intro to CMA"],
    ["Standard Costing"]
  ],
  audit: [
    ["SA 710, SA 299, SA 700, SA 706, SA 701, SA 705"],
    ["SA 580, SA 560, SA 570, SA 450, SA 260, SA 265"],
    ["SA 550, SA 510, SA 610, SA 505, SA 600, SA 520"],
    ["SA 530, SA 501, SA 500, SA 300"],
    ["Chapter 11, Chapter 1, SA 230"],
    ["SA 315, SA 330, SA 320, CARO, Chapter 5 Assertions"],
    ["Bank Audit, Chapter 5 Question Bank"],
    ["Chapter 9, Remaining Chapter 5 Coverage"],
    ["Revision Planner – Remaining SAs"],
    ["Remaining Audit Coverage / Important Areas"]
  ],
  fm: [
    ["Leverage, Strategic Analysis: Internal Environment"],
    ["Cost of Capital, Strategic Choices"],
    ["Capital Structure, Strategic Analysis: External Environment"],
    ["Dividend Decision, Introduction to Strategic Management"],
    ["Strategy Implementation & Evaluation, Ratio Analysis"],
    ["Capital Budgeting"],
    ["Working Capital Management (Part 1)"],
    ["Working Capital Management (Part 2)"],
    ["Case Based MCQs (ICAI Booklet)"]
  ]
};

interface ScheduleRow {
  day: number;
  date: string;
  subject: string;
  badge: string;
  type: string;
  topics: string;
  cumTest: string;
  isTest?: boolean;
}

export default function StudyPlanner({ tasks, onAddTask, onDeleteTask, onUpdateTaskStatus, onStudyTask }: StudyPlannerProps) {
  // Navigation tabs within study screen
  const [plannerMode, setPlannerMode] = useState<"icaixd" | "tasks">("icaixd");

  // ICAIXD Planner Config States
  const [selectedGroup, setSelectedGroup] = useState<"G1" | "G2" | "BOTH">("G1");
  const [activeSubjects, setActiveSubjects] = useState<Record<string, boolean>>({
    adv: true,
    law: true,
    tax: true
  });
  const [exemptedSubjects, setExemptedSubjects] = useState<Record<string, boolean>>({
    adv: false,
    law: false,
    tax: false
  });

  const [startDate, setStartDate] = useState(() => {
    return new Date().toISOString().split("T")[0];
  });
  const [examDate, setExamDate] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() + 42); // Default 42 days study block
    return d.toISOString().split("T")[0];
  });
  const [hoursPerDay, setHoursPerDay] = useState(8);

  // Output State for Scheduled Schedule
  const [schedule, setSchedule] = useState<ScheduleRow[]>([]);
  const [hasGenerated, setHasGenerated] = useState(false);
  const [totalDays, setTotalDays] = useState(0);
  const [totalStudyDays, setTotalStudyDays] = useState(0);
  const [testDaysCount, setTestDaysCount] = useState(0);
  const [isCompressed, setIsCompressed] = useState(false);
  const [compressionRatio, setCompressionRatio] = useState(1);

  // Tasks Filter / Form State
  const [subjectId, setSubjectId] = useState("adv");
  const [title, setTitle] = useState("");
  const [taskTargetDate, setTaskTargetDate] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() + 7);
    return d.toISOString().slice(0, 10);
  });
  const [priority, setPriority] = useState<StudyTask["priority"]>("High");
  const [status, setStatus] = useState<StudyTask["status"]>("To Do");
  const [notes, setNotes] = useState("");
  const [showAddForm, setShowAddForm] = useState(false);

  // Sync active subjects list when selected Group changes
  useEffect(() => {
    const subs = SUBJECTS_DATA[selectedGroup];
    const initialActive: Record<string, boolean> = {};
    const initialExempt: Record<string, boolean> = {};
    subs.forEach(s => {
      initialActive[s.id] = true;
      initialExempt[s.id] = false;
    });
    setActiveSubjects(initialActive);
    setExemptedSubjects(initialExempt);
  }, [selectedGroup]);

  const toggleSubjectActive = (id: string) => {
    if (exemptedSubjects[id]) return;
    setActiveSubjects(prev => ({
      ...prev,
      [id]: !prev[id]
    }));
  };

  const toggleSubjectExempt = (id: string) => {
    const isExempt = !exemptedSubjects[id];
    setExemptedSubjects(prev => ({
      ...prev,
      [id]: isExempt
    }));
    setActiveSubjects(prev => ({
      ...prev,
      [id]: !isExempt
    }));
  };

  const getDaysBetween = (d1: string, d2: string) => {
    const diffTime = new Date(d2).getTime() - new Date(d1).getTime();
    return Math.max(1, Math.round(diffTime / (1000 * 60 * 60 * 24)));
  };

  const addDays = (dateStr: string, n: number) => {
    const [year, month, day] = dateStr.split("-").map(Number);
    const d = new Date(Date.UTC(year, month - 1, day));
    d.setUTCDate(d.getUTCDate() + n);
    return d.toISOString().split("T")[0];
  };

  const formatDate = (dateStr: string) => {
    const [year, month, day] = dateStr.split("-").map(Number);
    const d = new Date(Date.UTC(year, month - 1, day));
    return d.toLocaleDateString("en-IN", { 
      day: "2-digit", 
      month: "short", 
      weekday: "short",
      timeZone: "UTC"
    });
  };

  const generatePlanner = () => {
    if (!examDate || !startDate) {
      alert("Please set both start date and exam date.");
      return;
    }
    if (new Date(examDate) <= new Date(startDate)) {
      alert("Exam date must be after the start date.");
      return;
    }

    const calculatedTotalDays = getDaysBetween(startDate, examDate) - 1;
    const activeSubs = SUBJECTS_DATA[selectedGroup].filter(s => activeSubjects[s.id] && !exemptedSubjects[s.id]);

    if (!activeSubs.length) {
      alert("Please select at least one active subject.");
      return;
    }

    const calculatedTotalStudyDays = activeSubs.reduce((acc, s) => acc + s.days, 0);
    const testDaysNeeded = activeSubs.length * 5;
    const baseDaysNeeded = calculatedTotalStudyDays + testDaysNeeded;
    const calculatedRatio = Math.min(1, calculatedTotalDays / baseDaysNeeded);
    const compressed = calculatedRatio < 0.85;

    // Build schedule logic
    const rows: ScheduleRow[] = [];
    let currentDate = startDate;
    let dayNum = 1;

    if (calculatedRatio >= 0.85) {
      // Normal schedule: interleaved 2-study + 1-test per subject block
      const subjectQueues: Record<string, string[][]> = {};
      activeSubs.forEach(s => {
        subjectQueues[s.id] = [...SYLLABUS_DATA[s.id]];
      });

      const testCount: Record<string, number> = {};
      activeSubs.forEach(s => {
        testCount[s.id] = 0;
      });

      let allDone = false;
      let round = 0;
      while (!allDone && dayNum <= calculatedTotalDays + 5) {
        allDone = true;
        activeSubs.forEach(sub => {
          // Check if any study chapters are left in queue for this subject
          let topicsAddedThisBlock: string[] = [];
          for (let i = 0; i < 2; i++) {
            const topic = subjectQueues[sub.id].shift();
            if (topic) {
              allDone = false;
              topicsAddedThisBlock.push(topic.join(", "));
              rows.push({
                day: dayNum,
                date: currentDate,
                subject: sub.name,
                badge: sub.badge,
                type: "Study",
                topics: topic.join(", "),
                cumTest: ""
              });
              currentDate = addDays(currentDate, 1);
              dayNum++;
            }
          }
          // Only add a test day if we actually had study content or are continuing the revision rounds
          if (topicsAddedThisBlock.length > 0 || testCount[sub.id] < 5) {
            testCount[sub.id]++;
            const tc = testCount[sub.id];
            const isFull = tc >= 5;
            rows.push({
              day: dayNum,
              date: currentDate,
              subject: sub.name,
              badge: sub.badge,
              type: `TEST ${tc}`,
              topics: "Revision + Practice Test",
              cumTest: isFull ? "Full Syllabus" : `Cumulative T${tc}`,
              isTest: true
            });
            currentDate = addDays(currentDate, 1);
            dayNum++;
          }
        });
        round++;
        if (round > 25) break;
      }
    } else {
      // Compressed: merge topics, fewer test days
      activeSubs.forEach(sub => {
        const topics = [...SYLLABUS_DATA[sub.id]];
        const studyDaysForSub = Math.max(2, Math.round(sub.days * calculatedRatio));
        const topicsPerDay = Math.ceil(topics.length / studyDaysForSub);
        let idx = 0;
        while (idx < topics.length) {
          const chunk = topics.slice(idx, idx + topicsPerDay).map(t => t[0]);
          rows.push({
            day: dayNum,
            date: currentDate,
            subject: sub.name,
            badge: sub.badge,
            type: "Study",
            topics: chunk.join(" + "),
            cumTest: ""
          });
          currentDate = addDays(currentDate, 1);
          dayNum++;
          idx += topicsPerDay;
        }
        // Add 2 test days per subject (compressed)
        for (let t = 1; t <= 2; t++) {
          rows.push({
            day: dayNum,
            date: currentDate,
            subject: sub.name,
            badge: sub.badge,
            type: `TEST ${t}`,
            topics: "High-Yield Revision & Practice",
            cumTest: t === 2 ? "Full Syllabus" : "Mid-Syllabus",
            isTest: true
          });
          currentDate = addDays(currentDate, 1);
          dayNum++;
        }
      });
      // Final full revision day
      rows.push({
        day: dayNum,
        date: currentDate,
        subject: "All Subjects",
        badge: "b-test",
        type: "FINAL REV",
        topics: "Complete Syllabus Quick Revision",
        cumTest: "Full Syllabus Mock",
        isTest: true
      });
    }

    setSchedule(rows);
    setTotalDays(calculatedTotalDays);
    setTotalStudyDays(calculatedTotalStudyDays);
    setTestDaysCount(rows.filter(r => r.isTest).length);
    setIsCompressed(compressed);
    setCompressionRatio(calculatedRatio);
    setHasGenerated(true);
  };

  const downloadPDF = () => {
    if (schedule.length === 0) return;

    const doc = new jsPDF({ orientation: "landscape", unit: "mm", format: "a4" });
    const pageW = doc.internal.pageSize.getWidth();
    const pageH = doc.internal.pageSize.getHeight();

    // Custom Blue Theme color palette
    doc.setFillColor(12, 74, 124); // Dark blue accent
    doc.rect(0, 0, pageW, 18, "F");
    
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(14);
    doc.setFont("helvetica", "bold");
    doc.text("CA Inter Test Planner", 14, 11);
    
    doc.setFontSize(8);
    doc.setFont("helvetica", "normal");
    const labelGroup = selectedGroup === "BOTH" ? "Both Groups" : selectedGroup;
    doc.text(`${labelGroup} Plan | Start: ${startDate} | Exam: ${examDate} | ${hoursPerDay} Hrs/Day`, 14, 16);

    doc.setTextColor(0, 0, 0);

    // Prepare table data
    const tableData = schedule.map(r => [
      r.day,
      formatDate(r.date),
      r.subject,
      r.type,
      r.topics,
      r.cumTest || "—"
    ]);

    // Render AutoTable
    autoTable(doc, {
      startY: 22,
      head: [["Day", "Date", "Subject", "Type", "Topics / Chapters Coverage", "Cumulative Focus"]],
      body: tableData,
      styles: { fontSize: 8, cellPadding: 2, overflow: "linebreak" },
      headStyles: { fillColor: [12, 74, 124], textColor: 255, fontStyle: "bold", fontSize: 8.5 },
      columnStyles: {
        0: { cellWidth: 12, halign: "center" },
        1: { cellWidth: 24 },
        2: { cellWidth: 35 },
        3: { cellWidth: 20 },
        4: { cellWidth: 105 },
        5: { cellWidth: 30 }
      },
      didParseCell: (data: any) => {
        if (data.row.section === "body" && data.row.raw && String(data.row.raw[3]).startsWith("TEST")) {
          if (data.column.index === 3) {
            data.cell.styles.fillColor = [250, 238, 218];
            data.cell.styles.textColor = [163, 45, 45];
            data.cell.styles.fontStyle = "bold";
          } else {
            data.cell.styles.fillColor = [250, 238, 218];
          }
        }
      },
      didDrawPage: (data: any) => {
        doc.setFontSize(7.5);
        doc.setTextColor(140);
        doc.text("CA Inter Test Planner · Personal Study Schedule Guide", pageW / 2, pageH - 5, { align: "center" });
        doc.text(`Page ${data.pageNumber}`, pageW - 14, pageH - 5, { align: "right" });
      },
      margin: { left: 10, right: 10 }
    });

    doc.save(`CA_Inter_Planner_${selectedGroup}.pdf`);
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    const matched = SUBJECTS_DATA.BOTH.find(s => s.id === subjectId);
    const subjectName = matched ? matched.name : "Advanced Accounts";

    onAddTask({
      subjectId,
      subjectName,
      title: title.trim(),
      targetDate: taskTargetDate,
      priority,
      status,
      notes: notes.trim() || undefined
    });

    setTitle("");
    setNotes("");
    setShowAddForm(false);
  };

  // Badge dynamic style mapping
  const getBadgeStyle = (badge: string) => {
    switch (badge) {
      case "b-adv": return "bg-blue-950/40 text-blue-300 border-blue-900/50";
      case "b-law": return "bg-amber-950/40 text-amber-300 border-amber-900/50";
      case "b-tax": return "bg-emerald-950/40 text-emerald-300 border-emerald-900/50";
      case "b-cost": return "bg-indigo-950/40 text-indigo-300 border-indigo-900/50";
      case "b-audit": return "bg-rose-950/40 text-rose-300 border-rose-900/50";
      case "b-fm": return "bg-fuchsia-950/40 text-fuchsia-300 border-fuchsia-900/50";
      default: return "bg-zinc-800 text-zinc-300 border-zinc-700";
    }
  };

  const getPriorityColor = (p: StudyTask["priority"]) => {
    switch (p) {
      case "High": return "bg-rose-950/40 border-rose-900/50 text-rose-300";
      case "Medium": return "bg-amber-950/40 border-amber-900/50 text-amber-300";
      case "Low": return "bg-blue-950/40 border-blue-900/50 text-blue-300";
    }
  };

  const getStatusColor = (s: StudyTask["status"]) => {
    switch (s) {
      case "Completed": return "bg-emerald-950/40 border-emerald-900/50 text-emerald-400";
      case "In Progress": return "bg-blue-950/40 border-blue-900/50 text-blue-400";
      case "Under Revision": return "bg-purple-950/40 border-purple-900/50 text-purple-400";
      case "To Do":
      default:
        return "bg-zinc-900 border-zinc-800 text-zinc-400";
    }
  };

  return (
    <div className="w-full max-w-5xl mx-auto space-y-6 pb-24 text-zinc-100 px-2 sm:px-4 select-none animate-in fade-in duration-300">
      
      {/* Segmented Top Navigation Control */}
      <div className="flex border-b border-zinc-900 pb-px">
        <button
          onClick={() => setPlannerMode("icaixd")}
          className={`flex items-center gap-2 px-6 py-3 text-xs font-bold uppercase tracking-wider transition-all border-b-2 -mb-px ${
            plannerMode === "icaixd"
              ? "border-cyan-500 text-cyan-400"
              : "border-transparent text-zinc-500 hover:text-zinc-300"
          }`}
        >
          <CalendarCheck className="w-4 h-4" />
          <span>CA Inter Test Planner</span>
        </button>
        <button
          onClick={() => setPlannerMode("tasks")}
          className={`flex items-center gap-2 px-6 py-3 text-xs font-bold uppercase tracking-wider transition-all border-b-2 -mb-px ${
            plannerMode === "tasks"
              ? "border-cyan-500 text-cyan-400"
              : "border-transparent text-zinc-500 hover:text-zinc-300"
          }`}
        >
          <Layers className="w-4 h-4" />
          <span>Study Goal Tracker ({tasks.length})</span>
        </button>
      </div>

      {plannerMode === "icaixd" ? (
        /* ================= CA INTER TEST PLANNER VIEW ================= */
        <div className="space-y-6">
          <div className="bg-gradient-to-r from-zinc-950 to-zinc-900 border border-zinc-900 rounded-2xl p-6 relative overflow-hidden">
            <div className="absolute top-0 right-0 p-4 opacity-5 pointer-events-none">
              <CalendarCheck className="w-40 h-40 text-white" />
            </div>

            <div className="space-y-1 relative z-10 text-left">
              <h1 className="text-xl font-extrabold tracking-tight text-zinc-100">CA Inter Test Planner</h1>
              <p className="text-xs text-zinc-400 leading-relaxed max-w-xl">
                Customize your full revision and practice exam schedule based on your remaining preparation days to maximize your recall and exam preparedness.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            
            {/* Planner Left Config Panels (Takes 1/3 space) */}
            <div className="space-y-6 md:col-span-1 text-left">
              
              {/* Card 1: Attempt Selection */}
              <div className="p-5 rounded-2xl border border-zinc-900 bg-zinc-950/45 space-y-4">
                <div className="flex items-center gap-2">
                  <div className="w-1.5 h-3 bg-cyan-500 rounded" />
                  <span className="text-xs font-semibold uppercase tracking-wider text-zinc-400">Select Attempt Target</span>
                </div>
                <div className="grid grid-cols-3 gap-1.5 bg-zinc-900 p-1 rounded-xl">
                  {(["G1", "G2", "BOTH"] as const).map(group => (
                    <button
                      key={group}
                      onClick={() => setSelectedGroup(group)}
                      className={`py-2 text-[10px] font-bold uppercase tracking-wider rounded-lg transition-all ${
                        selectedGroup === group
                          ? "bg-cyan-500 text-black shadow-lg"
                          : "text-zinc-400 hover:text-zinc-200"
                      }`}
                    >
                      {group === "BOTH" ? "Both" : group}
                    </button>
                  ))}
                </div>
              </div>

              {/* Card 2: Active Subjects Checklist */}
              <div className="p-5 rounded-2xl border border-zinc-900 bg-zinc-950/45 space-y-4">
                <div className="flex items-center gap-2">
                  <div className="w-1.5 h-3 bg-cyan-500 rounded" />
                  <div>
                    <span className="text-xs font-semibold uppercase tracking-wider text-zinc-400 block">Active Subjects</span>
                    <span className="text-[10px] text-zinc-500">Uncheck subject if you are exempted</span>
                  </div>
                </div>

                <div className="space-y-2">
                  {SUBJECTS_DATA[selectedGroup].map(subj => {
                    const isActive = activeSubjects[subj.id] && !exemptedSubjects[subj.id];
                    const isExempt = exemptedSubjects[subj.id];

                    return (
                      <div
                        key={subj.id}
                        onClick={() => toggleSubjectActive(subj.id)}
                        className={`p-3 rounded-xl border transition-all duration-300 flex items-center justify-between gap-3 cursor-pointer ${
                          isActive
                            ? "bg-zinc-900 border-cyan-900/45 text-cyan-200"
                            : isExempt
                            ? "bg-emerald-950/10 border-emerald-950/30 text-emerald-500/70 opacity-60"
                            : "bg-zinc-950 border-zinc-900/60 text-zinc-500"
                        }`}
                      >
                        <div className="flex items-center gap-2.5 min-w-0">
                          <div className={`w-4 h-4 rounded-md border flex items-center justify-center shrink-0 transition-colors ${
                            isActive
                              ? "bg-cyan-500 border-cyan-500 text-black"
                              : isExempt
                              ? "bg-emerald-900/20 border-emerald-800 text-emerald-400"
                              : "border-zinc-800"
                          }`}>
                            {isActive ? <Check className="w-3 h-3 stroke-[3]" /> : isExempt ? <Check className="w-2.5 h-2.5" /> : null}
                          </div>
                          <span className="text-xs font-semibold truncate leading-none">{subj.name}</span>
                        </div>

                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            toggleSubjectExempt(subj.id);
                          }}
                          className={`text-[9px] font-bold px-2 py-1 rounded transition-colors shrink-0 uppercase tracking-wider ${
                            isExempt
                              ? "bg-emerald-950/30 border border-emerald-800/40 text-emerald-400"
                              : "bg-zinc-800 text-zinc-400 hover:text-zinc-200"
                          }`}
                        >
                          {isExempt ? "Exempted" : "Exempt?"}
                        </button>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Card 3: Date Range & Study Settings */}
              <div className="p-5 rounded-2xl border border-zinc-900 bg-zinc-950/45 space-y-4">
                <div className="flex items-center gap-2">
                  <div className="w-1.5 h-3 bg-cyan-500 rounded" />
                  <span className="text-xs font-semibold uppercase tracking-wider text-zinc-400">Schedule Settings</span>
                </div>

                <div className="space-y-3">
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-zinc-500 uppercase">Start From</label>
                      <input
                        type="date"
                        value={startDate}
                        onChange={(e) => setStartDate(e.target.value)}
                        className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-2.5 py-2 text-xs font-medium text-zinc-200 focus:outline-none focus:border-cyan-500"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-zinc-500 uppercase">Exam Date</label>
                      <input
                        type="date"
                        value={examDate}
                        onChange={(e) => setExamDate(e.target.value)}
                        className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-2.5 py-2 text-xs font-medium text-zinc-200 focus:outline-none focus:border-cyan-500"
                      />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-zinc-500 uppercase block">Study Hours Per Day</label>
                    <input
                      type="number"
                      value={hoursPerDay}
                      onChange={(e) => setHoursPerDay(Math.max(2, Math.min(16, parseInt(e.target.value) || 8)))}
                      min={2}
                      max={16}
                      className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-2.5 py-2 text-xs font-medium text-zinc-200 focus:outline-none focus:border-cyan-500"
                    />
                  </div>
                </div>
              </div>

              {/* Primary action trigger */}
              <button
                onClick={generatePlanner}
                className="w-full py-3.5 bg-gradient-to-r from-cyan-600 to-blue-600 text-white hover:scale-[1.01] active:scale-[0.98] transition-all rounded-xl text-xs font-bold tracking-wider uppercase flex items-center justify-center gap-2 shadow-lg shadow-cyan-950/20"
              >
                <RefreshCw className="w-4 h-4" />
                <span>Generate My Planner →</span>
              </button>

            </div>

            {/* Planner Right Output Panel (Takes 2/3 space) */}
            <div className="md:col-span-2 space-y-6">
              
              {!hasGenerated ? (
                <div className="h-full min-h-[350px] border border-dashed border-zinc-900 rounded-2xl flex flex-col justify-center items-center text-center p-8 bg-zinc-950/10">
                  <FileSpreadsheet className="w-12 h-12 text-zinc-800 mb-3" />
                  <h3 className="text-sm font-semibold text-zinc-400">Generate Your Study Calendar</h3>
                  <p className="text-xs text-zinc-600 leading-relaxed max-w-sm mt-1">
                    Configure your remaining exam days and subject exemptions, then click the compilation button to assemble your custom test-series calendar!
                  </p>
                </div>
              ) : (
                <div className="space-y-4 text-left animate-in fade-in duration-300">
                  
                  {/* Status header containing details & PDF download */}
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 bg-zinc-950/30 p-4 border border-zinc-900 rounded-2xl">
                    <div>
                      <h2 className="text-sm font-extrabold text-zinc-200 uppercase tracking-wider">
                        Your {selectedGroup === "BOTH" ? "Both Groups" : selectedGroup} Schedule
                      </h2>
                      <p className="text-xs text-zinc-500">
                        Exam target prep mapped over {totalDays} study days
                      </p>
                    </div>
                    <button
                      onClick={downloadPDF}
                      className="flex items-center gap-1.5 px-4 py-2 bg-cyan-950/40 hover:bg-cyan-900/40 border border-cyan-800/40 text-cyan-300 text-xs font-bold uppercase tracking-wider rounded-xl transition-all shadow cursor-pointer self-stretch sm:self-auto justify-center"
                    >
                      <Download className="w-4 h-4" />
                      <span>Download PDF</span>
                    </button>
                  </div>

                  {/* If compressed schedule warning alerts */}
                  {isCompressed && (
                    <div className="p-3.5 bg-amber-950/20 border border-amber-900/35 rounded-xl flex gap-3 text-xs text-amber-300">
                      <Info className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                      <span className="leading-relaxed">
                        ⚡ <strong>Compressed Study Mode</strong> — Only {totalDays} preparation days available. 
                        Zylo tutor engine has grouped syllabus topics to safely fit within your timeline. 
                        Please secure a minimum of <strong>{hoursPerDay} hours</strong> study dedication daily.
                      </span>
                    </div>
                  )}

                  {/* Summary Stats Grid */}
                  <div className="grid grid-cols-3 gap-3">
                    <div className="bg-zinc-950/30 border border-zinc-900 rounded-2xl p-4 text-center">
                      <span className="text-[10px] text-zinc-500 font-bold block uppercase tracking-wider">Remaining Days</span>
                      <span className="text-xl font-black text-cyan-400 font-mono mt-1 block">{totalDays}</span>
                    </div>
                    <div className="bg-zinc-950/30 border border-zinc-900 rounded-2xl p-4 text-center">
                      <span className="text-[10px] text-zinc-500 font-bold block uppercase tracking-wider">Planned Slots</span>
                      <span className="text-xl font-black text-zinc-200 font-mono mt-1 block">{schedule.length}</span>
                    </div>
                    <div className="bg-zinc-950/30 border border-zinc-900 rounded-2xl p-4 text-center">
                      <span className="text-[10px] text-zinc-500 font-bold block uppercase tracking-wider">Test Days</span>
                      <span className="text-xl font-black text-rose-400 font-mono mt-1 block">{testDaysCount}</span>
                    </div>
                  </div>

                  {/* Complete schedule table container - Hidden on Mobile, Shown on Desktop */}
                  <div className="hidden md:block border border-zinc-900 rounded-2xl overflow-hidden bg-zinc-950/20">
                    <div className="overflow-x-auto">
                      <table className="w-full text-left border-collapse text-xs select-none">
                        <thead>
                          <tr className="border-b border-zinc-900 bg-zinc-950/40 text-zinc-400 uppercase font-mono tracking-wider text-[10px]">
                            <th className="p-3 text-center w-12">Day</th>
                            <th className="p-3 w-28">Date</th>
                            <th className="p-3 w-36">Subject</th>
                            <th className="p-3 w-20">Type</th>
                            <th className="p-3">Syllabus Chapters Coverage / Focus Area</th>
                            <th className="p-3 w-28">Cumulative</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-zinc-900/50">
                          {schedule.map((row, idx) => (
                            <tr 
                              key={idx}
                              className={`transition-colors hover:bg-zinc-900/20 ${row.isTest ? "bg-[#1f1b13]/40 font-medium" : ""}`}
                            >
                              <td className="p-3 text-center text-zinc-500 font-mono font-bold">{row.day}</td>
                              <td className="p-3 text-zinc-300 font-mono truncate">{formatDate(row.date)}</td>
                              <td className="p-3">
                                <span className={`px-2.5 py-1 text-[10px] font-bold rounded-lg border tracking-wide uppercase truncate block text-center max-w-[140px] ${getBadgeStyle(row.badge)}`}>
                                  {row.subject.split("&")[0].trim()}
                                </span>
                              </td>
                              <td className={`p-3 font-mono font-bold text-[10px] ${row.isTest ? "text-rose-400" : "text-zinc-500"}`}>
                                {row.type}
                              </td>
                              <td className="p-3 text-zinc-300 text-[11px] leading-relaxed">
                                {row.topics}
                              </td>
                              <td className="p-3 text-zinc-500 text-[11px] font-medium font-mono truncate">
                                {row.cumTest || "—"}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>

                  {/* Mobile-First Timeline Card View - Visible on Mobile, Hidden on Desktop */}
                  <div className="block md:hidden space-y-3">
                    {schedule.map((row, idx) => (
                      <div 
                        key={idx}
                        className={`p-4 rounded-2xl border transition-all ${
                          row.isTest 
                            ? "bg-[#1f1b13]/30 border-amber-900/30 shadow-inner" 
                            : "bg-zinc-950/40 border-zinc-900/80"
                        }`}
                      >
                        <div className="flex items-center justify-between gap-2 mb-2">
                          <div className="flex items-center gap-1.5">
                            <span className="text-xs font-mono font-black text-cyan-400">Day {row.day}</span>
                            <span className="text-[11px] font-mono text-zinc-500">· {formatDate(row.date)}</span>
                          </div>
                          <span className={`px-2.5 py-0.5 text-[9px] font-bold rounded-md border tracking-wide uppercase truncate max-w-[150px] ${getBadgeStyle(row.badge)}`}>
                            {row.subject.split("&")[0].trim()}
                          </span>
                        </div>

                        <div className="space-y-1">
                          <div className="flex flex-wrap items-center gap-1.5">
                            <span className={`text-[9px] font-mono font-black uppercase tracking-wider px-1.5 py-0.5 rounded ${
                              row.isTest ? "bg-rose-950/30 text-rose-400 border border-rose-900/30" : "bg-zinc-900 text-zinc-400 border border-zinc-800"
                            }`}>
                              {row.type}
                            </span>
                            {row.cumTest && (
                              <span className="text-[9px] font-mono font-bold text-zinc-500 bg-zinc-900 border border-zinc-850 px-1.5 py-0.5 rounded">
                                {row.cumTest}
                              </span>
                            )}
                          </div>
                          <p className="text-xs text-zinc-300 leading-relaxed font-sans pt-1 font-medium">{row.topics}</p>
                        </div>
                      </div>
                    ))}
                  </div>

                </div>
              )}

            </div>

          </div>

        </div>
      ) : (
        /* ================= PERSONAL TASK LOG TRACKER ================= */
        <div className="space-y-6 text-left">
          
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 border-b border-zinc-900 pb-4">
            <div>
              <h2 className="text-base font-extrabold text-zinc-200">Personal CA Inter Study Goals</h2>
              <p className="text-xs text-zinc-500">Insert custom mock test milestones, reading goals, and standard revision checks</p>
            </div>
            
            <button
              onClick={() => setShowAddForm(!showAddForm)}
              className="flex items-center justify-center gap-1.5 py-2 px-4 bg-cyan-600 hover:bg-cyan-500 text-black rounded-xl text-xs font-extrabold transition-all self-end sm:self-auto cursor-pointer shadow-md shadow-cyan-950/20"
            >
              <Plus className="w-4 h-4" />
              <span>Add Study Goal</span>
            </button>
          </div>

          {showAddForm && (
            <form onSubmit={handleFormSubmit} className="bg-zinc-950/40 border border-zinc-900 p-5 rounded-2xl space-y-4 animate-in fade-in slide-in-from-top-2 duration-200">
              <h3 className="text-xs font-bold text-zinc-300 uppercase tracking-wider">New Custom Study Task</h3>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-zinc-500 uppercase">Syllabus Subject</label>
                  <select
                    value={subjectId}
                    onChange={(e) => setSubjectId(e.target.value)}
                    className="w-full bg-zinc-900 border border-zinc-800 rounded-xl text-xs text-zinc-200 p-2.5 focus:outline-none focus:border-cyan-500 cursor-pointer"
                  >
                    {SUBJECTS_DATA.BOTH.map(sub => (
                      <option key={sub.id} value={sub.id} className="bg-zinc-950">{sub.name}</option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-zinc-500 uppercase">Target Due Date</label>
                  <input
                    type="date"
                    value={taskTargetDate}
                    onChange={(e) => setTaskTargetDate(e.target.value)}
                    className="w-full bg-zinc-900 border border-zinc-800 rounded-xl text-xs text-zinc-200 p-2.5 focus:outline-none focus:border-cyan-500"
                    required
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-zinc-500 uppercase">Study Chapter or Description</label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Solve Section 148 Company Audit mock papers"
                  className="w-full bg-zinc-900 border border-zinc-800 rounded-xl text-xs text-zinc-200 p-2.5 focus:outline-none focus:border-cyan-500"
                  required
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-zinc-500 uppercase">Priority weight</label>
                  <div className="flex gap-2">
                    {(["High", "Medium", "Low"] as const).map(p => (
                      <button
                        key={p}
                        type="button"
                        onClick={() => setPriority(p)}
                        className={`flex-1 py-1.5 rounded-lg border text-xs font-bold transition-all cursor-pointer ${
                          priority === p 
                            ? "bg-cyan-950/30 border-cyan-500 text-cyan-400" 
                            : "bg-zinc-900 border-zinc-800 text-zinc-500"
                        }`}
                      >
                        {p}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-zinc-500 uppercase">Progress Status</label>
                  <select
                    value={status}
                    onChange={(e) => setStatus(e.target.value as any)}
                    className="w-full bg-zinc-900 border border-zinc-800 rounded-xl text-xs text-zinc-200 p-2.5 focus:outline-none focus:border-cyan-500 cursor-pointer"
                  >
                    <option value="To Do" className="bg-zinc-950">To Do</option>
                    <option value="In Progress" className="bg-zinc-950">In Progress</option>
                    <option value="Under Revision" className="bg-zinc-950">Under Revision</option>
                    <option value="Completed" className="bg-zinc-950">Completed</option>
                  </select>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-zinc-500 uppercase">Optional Reference Notes</label>
                <input
                  type="text"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="e.g. Focus specifically on SA 230 guidelines"
                  className="w-full bg-zinc-900 border border-zinc-800 rounded-xl text-xs text-zinc-200 p-2.5 focus:outline-none focus:border-cyan-500"
                />
              </div>

              <div className="flex justify-end gap-2.5 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddForm(false)}
                  className="px-4 py-2 text-xs font-semibold text-zinc-500 hover:text-zinc-300 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-cyan-600 hover:bg-cyan-500 text-black font-extrabold rounded-xl text-xs transition-all cursor-pointer"
                >
                  Add Task
                </button>
              </div>
            </form>
          )}

          <div className="space-y-3">
            {tasks.length === 0 ? (
              <div className="p-8 border border-dashed border-zinc-900 rounded-2xl text-center text-zinc-600 space-y-2">
                <CheckSquare className="w-8 h-8 mx-auto text-zinc-700" />
                <p className="text-xs font-semibold text-zinc-400">No active goals logged yet.</p>
                <p className="text-[10px] text-zinc-600">Click the "Add Study Goal" button above to insert custom study checkpoints!</p>
              </div>
            ) : (
              tasks.map(task => (
                <div 
                  key={task.id}
                  className="p-4 sm:p-5 bg-zinc-950/20 border border-zinc-900 hover:border-zinc-850 rounded-2xl transition-all flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4"
                >
                  <div className="space-y-2 min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-[9px] font-mono font-bold text-zinc-400 bg-zinc-900 border border-zinc-850 px-2 py-0.5 rounded-md uppercase">
                        {task.subjectName.split(":")[0]}
                      </span>
                      
                      <span className={`text-[9px] font-bold uppercase tracking-wider border px-2 py-0.5 rounded-md ${getPriorityColor(task.priority)}`}>
                        {task.priority} Priority
                      </span>

                      <select
                        value={task.status}
                        onChange={(e) => onUpdateTaskStatus(task.id, e.target.value as any)}
                        className={`text-[9px] font-bold border px-2 py-0.5 rounded-md cursor-pointer focus:outline-none ${getStatusColor(task.status)} bg-black`}
                      >
                        <option value="To Do" className="bg-zinc-950 text-zinc-400">To Do</option>
                        <option value="In Progress" className="bg-zinc-950 text-blue-400">In Progress</option>
                        <option value="Under Revision" className="bg-zinc-950 text-purple-400">Under Revision</option>
                        <option value="Completed" className="bg-zinc-950 text-emerald-400">Completed</option>
                      </select>
                    </div>

                    <div className="space-y-0.5">
                      <h4 className="text-sm font-bold text-zinc-200 leading-snug">{task.title}</h4>
                      {task.notes && (
                        <p className="text-xs text-zinc-500 leading-relaxed italic">Note: {task.notes}</p>
                      )}
                    </div>

                    <div className="flex items-center gap-2 text-[10px] text-zinc-500">
                      <Calendar className="w-3.5 h-3.5 text-zinc-600" />
                      <span>Due Date: <strong className="text-zinc-400">{new Date(task.targetDate).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}</strong></span>
                    </div>
                  </div>

                  <div className="flex items-center justify-end gap-2 shrink-0 border-t sm:border-t-0 border-zinc-900/60 pt-3 sm:pt-0">
                    <button
                      onClick={() => onStudyTask(task.title, task.subjectName)}
                      className="flex items-center gap-1.5 py-1.5 px-3 bg-zinc-900 hover:bg-cyan-950/20 border border-zinc-800 hover:border-cyan-500/40 text-zinc-400 hover:text-cyan-400 rounded-xl text-xs transition-all font-bold cursor-pointer"
                    >
                      <Sparkles className="w-3.5 h-3.5 text-cyan-400 shrink-0 animate-pulse" />
                      <span>Ask Zylo</span>
                    </button>

                    <button
                      onClick={() => onDeleteTask(task.id)}
                      className="p-2 rounded-xl bg-transparent border border-transparent hover:border-rose-950 hover:bg-rose-950/20 text-zinc-600 hover:text-rose-400 transition-colors cursor-pointer"
                      title="Delete goal"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>

        </div>
      )}

    </div>
  );
}

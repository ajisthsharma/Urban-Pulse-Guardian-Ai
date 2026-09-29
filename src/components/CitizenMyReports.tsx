import React, { useState } from "react";
import { Report } from "../types";
import { 
  FileText, CheckCircle2, Clock, MapPin, Eye, ArrowRight, 
  Sparkles, Wrench, ShieldCheck, Check, AlertCircle, ChevronDown, ChevronUp
} from "lucide-react";

interface CitizenMyReportsProps {
  reports: Report[];
  currentUserEmail: string;
  onSelectReport: (report: Report) => void;
  onNavigateToReport: () => void;
}

interface TimelineStage {
  key: string;
  label: string;
  isComplete: boolean;
  isCurrent: boolean;
}

export default function CitizenMyReports({
  reports,
  currentUserEmail,
  onSelectReport,
  onNavigateToReport
}: CitizenMyReportsProps) {
  const [filterCategory, setFilterCategory] = useState<string>("All");
  const [expandedReportId, setExpandedReportId] = useState<string | null>(null);

  // Filter for reports filed by this citizen
  const myReports = reports.filter(
    (r) => r.reporterEmail?.toLowerCase() === currentUserEmail?.toLowerCase()
  );

  const filteredReports = myReports.filter((r) => {
    if (filterCategory === "All") return true;
    return r.category === filterCategory;
  });

  const getRelativeTime = (isoString?: string) => {
    if (!isoString) return "Recently";
    try {
      const diffMs = Date.now() - new Date(isoString).getTime();
      const diffMin = Math.floor(diffMs / 60000);
      if (diffMin < 1) return "Just now";
      if (diffMin < 60) return `${diffMin}m ago`;
      const diffHrs = Math.floor(diffMin / 60);
      if (diffHrs < 24) return `${diffHrs}h ago`;
      const diffDays = Math.floor(diffHrs / 24);
      return `${diffDays}d ago`;
    } catch {
      return "Recently";
    }
  };

  /**
   * Computes the 6-stage lifecycle timeline accurately based on actual report fields:
   * 1. Reported
   * 2. AI Reviewed
   * 3. Assigned to Municipal Field Team
   * 4. Repair In Progress
   * 5. AI Verification
   * 6. Resolved
   */
  const computeTimelineStages = (report: Report): TimelineStage[] => {
    const isResolved = report.status === "Resolved";
    const isVerified = Boolean(report.fieldVerification || report.fieldStatus === "VERIFIED");
    const isInProgress = report.status === "In Progress" || Boolean(report.fieldStatus === "ON_SITE" || report.fieldStatus === "ACTION_STARTED");
    const isAssigned = report.status === "Assigned" || Boolean(report.assignedTo || report.assignment);
    const isAiReviewed = Boolean(report.aiAnalysis || report.source === "ROAD_SCANNER" || report.workflowState === "AI VERIFIED");

    const stages: TimelineStage[] = [
      {
        key: "reported",
        label: "Reported",
        isComplete: true, // Always completed once report exists
        isCurrent: !isAiReviewed && !isAssigned && !isInProgress && !isVerified && !isResolved
      },
      {
        key: "ai_reviewed",
        label: "AI Reviewed",
        isComplete: isAiReviewed || isAssigned || isInProgress || isVerified || isResolved,
        isCurrent: isAiReviewed && !isAssigned && !isInProgress && !isVerified && !isResolved
      },
      {
        key: "assigned",
        label: "Assigned to Municipal Field Team",
        isComplete: isAssigned || isInProgress || isVerified || isResolved,
        isCurrent: isAssigned && !isInProgress && !isVerified && !isResolved
      },
      {
        key: "in_progress",
        label: "Repair In Progress",
        isComplete: isInProgress || isVerified || isResolved,
        isCurrent: isInProgress && !isVerified && !isResolved
      },
      {
        key: "ai_verification",
        label: "AI Verification",
        isComplete: isVerified || isResolved,
        isCurrent: isVerified && !isResolved
      },
      {
        key: "resolved",
        label: "Resolved",
        isComplete: isResolved,
        isCurrent: isResolved
      }
    ];

    return stages;
  };

  return (
    <div className="w-full flex flex-col gap-6 text-left">
      
      {/* Header Bar */}
      <div className="bg-white border border-[#E2E8F0] shadow-xs rounded-2xl p-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#F1F5F9]">
          <div>
            <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-[#2563EB] block">
              CITIZEN RESOLUTION TRACKER
            </span>
            <h1 className="text-xl sm:text-2xl font-extrabold text-[#172033] tracking-tight">
              MY REPORTS
            </h1>
            <p className="text-xs text-[#64748B] mt-0.5">
              Track the exact progress and municipal repair status of all your submitted road issues.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <span className="text-xs font-bold font-mono px-3 py-1.5 bg-[#EFF6FF] text-[#1D4ED8] border border-[#BFDBFE] rounded-full">
              {myReports.length} Submitted Incident{myReports.length !== 1 ? "s" : ""}
            </span>

            <button
              onClick={onNavigateToReport}
              className="px-4 py-2 bg-[#2563EB] hover:bg-[#1D4ED8] text-white text-xs font-bold rounded-xl transition-all shadow-xs cursor-pointer"
            >
              Report New Issue
            </button>
          </div>
        </div>

        {/* Categories Filter */}
        <div className="flex items-center gap-2 pt-4 flex-wrap text-xs">
          <span className="text-[10px] font-bold text-[#64748B] uppercase">Filter:</span>
          {["All", "Pothole", "Road Crack", "Damaged Road Surface", "Waterlogging", "Broken Streetlight", "Road Obstruction"].map((cat) => (
            <button
              key={cat}
              onClick={() => setFilterCategory(cat)}
              className={`px-3 py-1 rounded-lg font-bold transition-all cursor-pointer ${
                filterCategory === cat
                  ? "bg-[#172033] text-white shadow-2xs"
                  : "bg-[#F8FAFC] text-[#64748B] hover:bg-[#F1F5F9]"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Reports List */}
      {filteredReports.length === 0 ? (
        <div className="bg-white border-2 border-dashed border-[#E2E8F0] rounded-2xl p-12 text-center max-w-lg mx-auto w-full">
          <div className="w-14 h-14 rounded-2xl bg-[#EFF6FF] text-[#2563EB] flex items-center justify-center mx-auto mb-3">
            <FileText className="w-7 h-7" />
          </div>
          <h3 className="text-base font-bold text-[#172033] mb-1">
            {myReports.length === 0 ? "No road reports lodged yet" : "No reports match selected category"}
          </h3>
          <p className="text-xs text-[#64748B] mb-5 max-w-sm mx-auto leading-relaxed">
            {myReports.length === 0
              ? "You haven't reported any road infrastructure hazards. Upload photo evidence using Report Issue to get started."
              : "Try switching to 'All' to view your other submitted incident tickets."}
          </p>
          <button
            onClick={onNavigateToReport}
            className="px-5 py-2.5 bg-[#2563EB] hover:bg-[#1D4ED8] text-white text-xs font-bold rounded-xl transition-all shadow-xs cursor-pointer inline-flex items-center gap-2"
          >
            <Sparkles className="w-4 h-4" />
            <span>Report a Road Issue</span>
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredReports.map((rep) => {
            const stages = computeTimelineStages(rep);
            const isExpanded = expandedReportId === rep.id;

            return (
              <div
                key={rep.id}
                className="bg-white border border-[#E2E8F0] hover:border-[#BFDBFE] rounded-2xl p-5 shadow-xs transition-all text-left space-y-4"
              >
                {/* Top Summary Bar */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[#F1F5F9]">
                  <div className="flex items-center gap-2.5">
                    <span className="font-mono text-xs font-black text-[#1D4ED8] px-2.5 py-0.5 bg-[#EFF6FF] rounded-lg border border-[#BFDBFE]">
                      {rep.id}
                    </span>
                    <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full border ${
                      rep.status === "Resolved"
                        ? "bg-[#F0FDF4] text-[#16A34A] border-[#BBF7D0]"
                        : rep.status === "In Progress"
                        ? "bg-[#EFF6FF] text-[#2563EB] border-[#BFDBFE]"
                        : rep.status === "Assigned"
                        ? "bg-[#F5F3FF] text-[#7C3AED] border-[#DDD6FE]"
                        : "bg-[#FFFBEB] text-[#D97706] border-[#FDE68A]"
                    }`}>
                      ● {rep.status}
                    </span>
                    <span className="text-[10px] font-mono text-[#94A3B8]">
                      {getRelativeTime(rep.createdAt)}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="text-[11px] font-mono text-[#64748B]">
                      Risk: <strong className="text-[#172033]">{rep.severity}/100</strong>
                    </span>

                    <button
                      onClick={() => onSelectReport(rep)}
                      className="px-3 py-1.5 bg-[#F8FAFC] hover:bg-[#EFF6FF] text-[#1D4ED8] border border-[#E2E8F0] hover:border-[#BFDBFE] rounded-xl text-xs font-bold transition-all flex items-center gap-1 cursor-pointer"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      <span>Details</span>
                    </button>
                  </div>
                </div>

                {/* Issue Info & Location */}
                <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-start">
                  <div className="md:col-span-8">
                    <h3 className="text-sm font-extrabold text-[#172033] leading-snug">
                      {rep.title}
                    </h3>
                    {rep.description && (
                      <p className="text-xs text-[#64748B] mt-1 line-clamp-2 leading-relaxed">
                        {rep.description}
                      </p>
                    )}
                    <div className="flex items-center gap-1 text-xs text-[#475569] mt-2 font-medium">
                      <MapPin className="w-3.5 h-3.5 text-[#2563EB] shrink-0" />
                      <span className="truncate">{rep.location}</span>
                    </div>
                  </div>

                  {rep.image && (
                    <div className="md:col-span-4 shrink-0">
                      <div className="aspect-video max-h-24 rounded-xl overflow-hidden border border-[#E2E8F0] bg-slate-100">
                        <img 
                          src={rep.image} 
                          alt="Evidence" 
                          className="w-full h-full object-cover" 
                          referrerPolicy="no-referrer"
                        />
                      </div>
                    </div>
                  )}
                </div>

                {/* 7. CLEAR STATUS TIMELINE STEPPER */}
                <div className="pt-3 border-t border-[#F1F5F9]">
                  <span className="text-[10px] font-bold uppercase font-mono tracking-wider text-[#64748B] block mb-3">
                    INCIDENT RESOLUTION TIMELINE
                  </span>

                  <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2">
                    {stages.map((stage, idx) => (
                      <div
                        key={stage.key}
                        className={`p-2.5 rounded-xl border transition-all text-left flex flex-col justify-between gap-1.5 ${
                          stage.isCurrent
                            ? "bg-[#EFF6FF] border-[#2563EB] shadow-2xs"
                            : stage.isComplete
                            ? "bg-[#F8FAFC] border-[#CBD5E1]"
                            : "bg-[#FAFAFA] border-[#F1F5F9] opacity-60"
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-mono text-[9px] font-bold text-[#64748B]">
                            0{idx + 1}
                          </span>
                          {stage.isComplete ? (
                            <div className="w-4 h-4 rounded-full bg-[#16A34A] text-white flex items-center justify-center">
                              <Check className="w-2.5 h-2.5" />
                            </div>
                          ) : stage.isCurrent ? (
                            <span className="w-2.5 h-2.5 rounded-full bg-[#2563EB] animate-pulse" />
                          ) : (
                            <span className="w-2 h-2 rounded-full bg-[#CBD5E1]" />
                          )}
                        </div>

                        <div>
                          <p className={`text-[10.5px] font-bold leading-tight ${
                            stage.isCurrent ? "text-[#1D4ED8]" :
                            stage.isComplete ? "text-[#172033]" : "text-[#94A3B8]"
                          }`}>
                            {stage.label}
                          </p>
                          <span className="text-[8.5px] font-mono text-[#64748B] block mt-0.5">
                            {stage.isCurrent ? "Active Stage" : stage.isComplete ? "Completed" : "Pending"}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

              </div>
            );
          })}
        </div>
      )}

    </div>
  );
}

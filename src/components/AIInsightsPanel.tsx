import React from "react";
import { Report } from "../types";
import { computeExecutiveAnalytics } from "../utils/geoAnalytics";
import { 
  Sparkles, AlertTriangle, TrendingUp, ShieldAlert, CheckCircle, 
  ArrowRight, Camera, FileText, MapPin, Database, Zap
} from "lucide-react";

interface AIInsightsPanelProps {
  reports: Report[];
  onSelectSector?: (sectorName: string) => void;
}

export default function AIInsightsPanel({ reports, onSelectSector }: AIInsightsPanelProps) {
  const metrics = computeExecutiveAnalytics(reports);

  const activeReports = reports.filter(r => r.status !== "Resolved");
  const highRiskIssues = activeReports.filter(r => r.severity >= 75);
  const roadScannerActive = activeReports.filter(r => r.source === "ROAD_SCANNER");

  const mostRiskReport = highRiskIssues.length > 0 
    ? [...highRiskIssues].sort((a, b) => b.severity - a.severity)[0] 
    : activeReports.length > 0 
      ? [...activeReports].sort((a, b) => b.severity - a.severity)[0]
      : reports[0] || null;

  const primarySectorName = mostRiskReport ? mostRiskReport.location.split(",")[0].trim() : "Delhi NCR Sector";

  // Formulate real data-derived insights
  const generatedInsights = [
    {
      id: "insight_1",
      icon: ShieldAlert,
      color: "border-l-red-500 bg-red-50/50 text-red-900",
      iconColor: "text-red-600",
      tag: "Priority Spatial Risk",
      text: mostRiskReport 
        ? `Critical attention required at ${primarySectorName} due to active "${mostRiskReport.title}" (${mostRiskReport.severity}% severity).`
        : "No critical hazard alerts active in the municipal grid.",
      metric: `${highRiskIssues.length} Critical Issues`
    },
    {
      id: "insight_2",
      icon: Camera,
      color: "border-l-purple-500 bg-purple-50/50 text-purple-900",
      iconColor: "text-purple-600",
      tag: "AI Road Scanner Telemetry",
      text: roadScannerActive.length > 0
        ? `AI Road Scanner identified ${roadScannerActive.length} active road surface defects requiring asphalt triage.`
        : "AI Road Scanner reports are currently operating within nominal baseline parameters.",
      metric: `${metrics.scannerCount} Total AI Scans`
    },
    {
      id: "insight_3",
      icon: TrendingUp,
      color: "border-l-blue-500 bg-blue-50/50 text-blue-900",
      iconColor: "text-blue-600",
      tag: "Resolution Efficiency",
      text: metrics.totalCount > 0
        ? `Municipal teams have resolved ${metrics.resolvedCount} of ${metrics.totalCount} total logged cases (${metrics.resolutionRate}% SLA resolution rate).`
        : "Awaiting incoming citizen and automated sensor reports.",
      metric: `${metrics.resolutionRate}% Resolved`
    },
    {
      id: "insight_4",
      icon: CheckCircle,
      color: "border-l-emerald-500 bg-emerald-50/50 text-emerald-900",
      iconColor: "text-emerald-600",
      tag: "Top Sector Performance",
      text: metrics.safestWards.length > 0
        ? `${metrics.safestWards[0].name} leads municipal rankings with ${metrics.safestWards[0].scoreLabel} health index.`
        : "Sector standings will compute as reports populate across districts.",
      metric: metrics.safestWards[0] ? metrics.safestWards[0].scoreLabel : "N/A"
    }
  ];

  return (
    <div className="bg-white dark:bg-slate-800/60 border border-slate-200 shadow-xs rounded-2xl p-5 flex flex-col gap-4 text-left" id="ai-insights-panel">
      
      {/* Header section */}
      <div className="flex items-center justify-between pb-2.5 border-b border-slate-100">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-blue-50 text-blue-600 rounded-lg flex items-center justify-center border border-blue-100">
            <Sparkles className="w-4 h-4 animate-pulse" />
          </div>
          <div>
            <h3 className="font-display font-bold text-sm text-slate-850 tracking-tight">AI Urban Intelligence & Operations Radar</h3>
            <p className="text-[10px] text-slate-400 mt-0.5">Real-time heuristics synthesized from live Firestore incident records.</p>
          </div>
        </div>
        <span className="text-[9.5px] font-mono font-bold text-blue-700 bg-blue-50 border border-blue-100 px-2 py-0.5 rounded-full uppercase tracking-wider flex items-center gap-1">
          <Database className="w-2.5 h-2.5" />
          {metrics.totalCount} Live Reports Analyzed
        </span>
      </div>

      {/* DAILY AI BRIEFING WIDGET */}
      {mostRiskReport ? (
        <div className="bg-slate-900 border border-slate-800 text-slate-100 p-4.5 rounded-xl border-l-4 border-blue-500 shadow-sm flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 text-left">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-1.5 text-[9px] font-bold text-blue-400 uppercase tracking-wider">
              <Sparkles className="w-3.5 h-3.5" />
              <span>DAILY AI OPERATIONS BRIEFING (Active Turn)</span>
            </div>
            <h4 className="text-[13px] font-extrabold text-white mt-1">
              Incident Focus Vector: <span className="text-amber-400 font-bold">{primarySectorName}</span>
            </h4>
            <p className="text-[11px] text-slate-300 mt-1 font-sans leading-relaxed">
              <strong>Primary Alert:</strong> {mostRiskReport.title} ({mostRiskReport.category} • Severity: <strong className="text-red-400 font-mono">{mostRiskReport.severity}%</strong>).
            </p>
            <p className="text-[11px] text-slate-300 mt-0.5 font-sans leading-relaxed">
              <strong>AI Recommended Dispatch:</strong> {
                mostRiskReport.aiAnalysis?.recommendedActions?.[0] ||
                (mostRiskReport.category === "Garbage Overflow" 
                  ? "Dispatch dynamic waste management crews & compactors to restore site safety." 
                  : mostRiskReport.category === "Broken Streetlight" 
                    ? "Issue urgent service ticket for electrical grid contractors." 
                    : "Mobilize designated asphalt and utility division responders.")
              }
            </p>
          </div>
          <div className="bg-slate-800 p-3 rounded-lg border border-slate-700/60 shrink-0 text-center flex flex-col items-center justify-center min-w-[130px]">
            <span className="text-[8px] text-slate-400 uppercase font-semibold block">Composite Risk</span>
            <span className={`text-base font-extrabold font-mono mt-0.5 ${metrics.cityRiskScore >= 70 ? "text-emerald-400" : "text-amber-400"}`}>
              {metrics.cityRiskScore}/100 Score
            </span>
            <span className="text-[8px] text-slate-400 uppercase font-semibold mt-0.5 block">{metrics.riskTrendLabel}</span>
          </div>
        </div>
      ) : (
        <div className="bg-slate-50 border border-dashed border-slate-200 p-6 rounded-xl text-center text-slate-400 font-mono text-xs">
          No active reports lodged in database. As citizen and automated AI Road Scanner reports populate the database, AI Urban Insights will highlight spatial risk vectors.
        </div>
      )}

      {/* Grid containing list items matching requirements */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {generatedInsights.map((ins) => {
          const Icon = ins.icon;
          return (
            <div 
              key={ins.id}
              className={`p-3 rounded-xl border border-slate-200/70 border-l-4 ${ins.color} flex items-start gap-3 transition-all hover:shadow-2xs`}
            >
              <div className={`p-1.5 rounded-lg bg-white dark:bg-slate-800/60 shadow-3xs ${ins.iconColor} mt-0.5 shrink-0`}>
                <Icon className="w-4 h-4" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-1.5">
                  <span className={`text-[9px] font-extrabold uppercase tracking-widest ${ins.iconColor}`}>
                    {ins.tag}
                  </span>
                  <span className="text-[9px] font-mono font-bold text-slate-500 bg-white dark:bg-slate-800/60/80 dark:bg-slate-900/80 px-1.5 py-0.2 rounded border border-slate-200/50">
                    {ins.metric}
                  </span>
                </div>
                <p className="text-xs font-semibold text-slate-800 leading-relaxed mt-1 text-left">
                  {ins.text}
                </p>
              </div>
            </div>
          );
        })}
      </div>

    </div>
  );
}

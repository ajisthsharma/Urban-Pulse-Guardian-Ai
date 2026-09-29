import { Report } from "../types";
import { AlertTriangle, CheckCircle, Clock, Database, ChevronUp, ChevronDown } from "lucide-react";

interface DashboardStatsProps {
  reports: Report[];
}

export default function DashboardStats({ reports }: DashboardStatsProps) {
  const total = reports.length;
  const pending = reports.filter(r => r.status === "Pending").length;
  const resolved = reports.filter(r => r.status === "Resolved").length;
  const activeHighRisk = reports.filter(r => r.severity >= 75 && r.status !== "Resolved").length;

  // Trend percentages
  const resolvedRate = total > 0 ? Math.round((resolved / total) * 100) : 0;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      
      {/* Total Reports Card */}
      <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-xs flex items-start justify-between min-h-[110px]">
        <div>
          <span className="text-xs font-bold text-slate-500 dark:text-slate-300 uppercase tracking-wider">Total Reports</span>
          <div className="font-display font-bold text-3xl text-slate-900 dark:text-white mt-1">{total}</div>
        </div>
        <div className="p-3 bg-blue-50 dark:bg-blue-900/20 text-slate-900 dark:text-white rounded-xl border border-[#DBEAFE]">
          <Database className="w-5 h-5" />
        </div>
      </div>

      {/* Pending Reports Card */}
      <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-xs flex items-start justify-between min-h-[110px]">
        <div>
          <span className="text-xs font-bold text-slate-500 dark:text-slate-300 uppercase tracking-wider">Active Queue</span>
          <div className="font-display font-bold text-3xl text-slate-900 dark:text-white mt-1">{pending}</div>
          <div className="flex items-center gap-1.5 text-[11px] text-amber-500 dark:text-amber-400 mt-2 font-medium">
            <Clock className="w-3.5 h-3.5" />
            <span>Avg dispatch response: 18m</span>
          </div>
        </div>
        <div className="p-3 bg-[#FFFBEB] text-amber-500 dark:text-amber-400 rounded-xl border border-[#FEF3C7]">
          <Clock className="w-5 h-5" />
        </div>
      </div>

      {/* High-Risk Issues Card */}
      <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-xs flex items-start justify-between min-h-[110px]">
        <div>
          <span className="text-xs font-bold text-slate-500 dark:text-slate-300 uppercase tracking-wider">Active Critical Risks</span>
          <div className="font-display text-3xl text-red-600 dark:text-red-400 font-bold mt-1">{activeHighRisk}</div>
          <div className="flex items-center gap-1.5 text-[11px] text-red-600 dark:text-red-400 mt-2 font-medium">
            <AlertTriangle className="w-3.5 h-3.5 animate-pulse" />
            <span>Assigned to Elite Response Squads</span>
          </div>
        </div>
        <div className="p-3 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded-xl border border-red-200 dark:border-red-800/50">
          <AlertTriangle className="w-5 h-5" />
        </div>
      </div>

      {/* Resolved Reports Card */}
      <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-xs flex items-start justify-between min-h-[110px]">
        <div>
          <span className="text-xs font-bold text-slate-500 dark:text-slate-300 uppercase tracking-wider">Resolution Efficiency</span>
          <div className="font-display font-bold text-3xl text-slate-900 dark:text-white mt-1">{resolvedRate}%</div>
          <div className="flex items-center gap-1.5 text-[11px] text-green-600 dark:text-green-400 mt-2 font-medium">
            <CheckCircle className="w-3.5 h-3.5" />
            <span>{resolved} issues corrected</span>
          </div>
        </div>
        <div className="p-3 bg-green-50 dark:bg-green-900/30 text-green-600 dark:text-green-400 dark:text-green-400 rounded-xl border border-[#DCFCE7]">
          <CheckCircle className="w-5 h-5" />
        </div>
      </div>

    </div>
  );
}

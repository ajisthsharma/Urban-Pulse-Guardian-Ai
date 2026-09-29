import React from "react";
import { Bell, AlertTriangle, CheckCircle2, Clock, MapPin, ShieldAlert, Check } from "lucide-react";
import { Notification, Report } from "../types";

interface CitizenAlertsProps {
  notifications: Notification[];
  reports: Report[];
  onMarkRead: () => void;
  onSelectReport?: (report: Report) => void;
}

export default function CitizenAlerts({
  notifications,
  reports,
  onMarkRead,
  onSelectReport
}: CitizenAlertsProps) {
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

  const highRiskReports = reports.filter((r) => r.severity >= 75 && r.status !== "Resolved");

  return (
    <div className="w-full flex flex-col gap-6 text-left animate-in fade-in duration-300">
      
      {/* Header */}
      <div className="bg-white border border-[#E2E8F0] shadow-xs rounded-2xl p-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#F1F5F9]">
          <div>
            <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-[#2563EB] block">
              CIVIC SAFETY BROADCASTS
            </span>
            <h1 className="text-xl sm:text-2xl font-extrabold text-[#172033] tracking-tight">
              ALERTS & NOTIFICATIONS
            </h1>
            <p className="text-xs text-[#64748B] mt-0.5">
              Real-time advisories regarding critical road hazards, repair work, and status transitions on your reports.
            </p>
          </div>

          {notifications.some((n) => !n.read) && (
            <button
              onClick={onMarkRead}
              className="px-3.5 py-1.5 bg-[#EFF6FF] hover:bg-[#DBEAFE] text-[#1D4ED8] rounded-xl text-xs font-bold transition-all border border-[#BFDBFE] cursor-pointer self-start sm:self-auto flex items-center gap-1.5"
            >
              <Check className="w-3.5 h-3.5" />
              <span>Mark All as Read</span>
            </button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
        
        {/* Notifications stream (Span 7) */}
        <div className="lg:col-span-7 bg-white border border-[#E2E8F0] shadow-xs rounded-2xl p-5 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-[#F1F5F9]">
            <span className="text-xs font-bold text-[#172033] flex items-center gap-1.5">
              <Bell className="w-4 h-4 text-[#2563EB]" />
              <span>Direct Activity Notifications</span>
            </span>
            <span className="text-[10px] font-mono text-[#64748B]">
              {notifications.length} Total
            </span>
          </div>

          <div className="space-y-2.5">
            {notifications.length === 0 ? (
              <div className="p-8 text-center text-[#94A3B8] text-xs border border-dashed border-[#E2E8F0] rounded-xl">
                No notifications logged yet. When your reports are reviewed or updated, alerts appear here.
              </div>
            ) : (
              notifications.map((notif) => (
                <div
                  key={notif.id}
                  className={`p-3.5 rounded-xl border text-xs transition-all ${
                    !notif.read
                      ? "bg-[#EFF6FF] border-[#BFDBFE]"
                      : "bg-slate-50 dark:bg-[#111111]/50 border-[#E2E8F0]"
                  }`}
                >
                  <div className="flex items-center justify-between gap-2 mb-1">
                    <span className="font-bold text-[#172033] flex items-center gap-1.5">
                      <span className={`w-2 h-2 rounded-full ${!notif.read ? "bg-[#2563EB]" : "bg-[#94A3B8]"}`} />
                      {notif.title}
                    </span>
                    <span className="text-[10px] font-mono text-[#64748B]">
                      {getRelativeTime(notif.createdAt)}
                    </span>
                  </div>
                  <p className="text-[#475569] leading-relaxed text-[11.5px] pl-3.5">
                    {notif.message}
                  </p>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Priority Area Hazard Advisories (Span 5) */}
        <div className="lg:col-span-5 bg-white border border-[#E2E8F0] shadow-xs rounded-2xl p-5 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-[#F1F5F9]">
            <span className="text-xs font-bold text-[#172033] flex items-center gap-1.5">
              <ShieldAlert className="w-4 h-4 text-[#DC2626]" />
              <span>Active Road Hazard Advisories</span>
            </span>
            <span className="text-[10px] font-mono font-bold text-[#DC2626] bg-[#FEF2F2] px-2 py-0.5 rounded-full border border-[#FECACA]">
              {highRiskReports.length} High Risk
            </span>
          </div>

          <div className="space-y-3">
            {highRiskReports.length === 0 ? (
              <p className="text-xs text-[#64748B] text-center py-6">
                No critical road safety hazards active in your sector.
              </p>
            ) : (
              highRiskReports.slice(0, 5).map((rep) => (
                <div
                  key={rep.id}
                  onClick={() => onSelectReport && onSelectReport(rep)}
                  className="p-3 bg-[#FEF2F2]/60 hover:bg-[#FEF2F2] border border-[#FECACA] rounded-xl transition-all cursor-pointer space-y-1"
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-mono text-[9px] font-bold text-[#991B1B]">
                      {rep.id} • {rep.category}
                    </span>
                    <span className="text-[9px] font-mono font-bold text-[#DC2626]">
                      Severity: {rep.severity}%
                    </span>
                  </div>
                  <h4 className="text-xs font-bold text-[#172033] truncate">
                    {rep.title}
                  </h4>
                  <div className="flex items-center gap-1 text-[10.5px] text-[#64748B]">
                    <MapPin className="w-3 h-3 text-[#DC2626] shrink-0" />
                    <span className="truncate">{rep.location}</span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

      </div>

    </div>
  );
}

import React from "react";
import { User, Mail, Shield, CheckCircle2, FileText, Award, Calendar, LogOut } from "lucide-react";
import { Report } from "../types";

interface CitizenProfileProps {
  currentUser: {
    fullName: string;
    email: string;
    role: string;
  };
  reports: Report[];
  onLogout: () => void;
  onNavigateToReports: () => void;
}

export default function CitizenProfile({
  currentUser,
  reports,
  onLogout,
  onNavigateToReports
}: CitizenProfileProps) {
  const userReports = reports.filter(
    (r) => r.reporterEmail?.toLowerCase() === currentUser.email?.toLowerCase()
  );
  const resolvedCount = userReports.filter((r) => r.status === "Resolved").length;
  const inProgressCount = userReports.filter((r) => r.status === "In Progress" || r.status === "Assigned").length;

  return (
    <div className="w-full max-w-2xl mx-auto flex flex-col gap-6 text-left animate-in fade-in duration-300">
      
      {/* Profile Header Card */}
      <div className="bg-white border border-[#E2E8F0] shadow-xs rounded-2xl p-6 sm:p-8 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-[#F1F5F9]">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-[#EFF6FF] border border-[#BFDBFE] text-[#2563EB] flex items-center justify-center font-extrabold text-2xl shadow-2xs">
              {currentUser.fullName ? currentUser.fullName.charAt(0).toUpperCase() : "C"}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl sm:text-2xl font-extrabold text-[#172033] tracking-tight">
                  {currentUser.fullName || "Citizen User"}
                </h1>
                <span className="px-2.5 py-0.5 bg-[#F0FDF4] text-[#16A34A] border border-[#BBF7D0] rounded-full text-[10px] font-bold font-mono">
                  Verified
                </span>
              </div>
              <p className="text-xs text-[#64748B] flex items-center gap-1.5 mt-1 font-mono">
                <Mail className="w-3.5 h-3.5 text-[#64748B]" />
                <span>{currentUser.email}</span>
              </p>
            </div>
          </div>

          <button
            onClick={onLogout}
            className="px-4 py-2 bg-[#FEF2F2] hover:bg-[#FEE2E2] text-[#DC2626] border border-[#FECACA] rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer self-start sm:self-auto"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Sign Out</span>
          </button>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-3 gap-3 text-xs">
          <div 
            onClick={onNavigateToReports}
            className="bg-slate-50 dark:bg-[#111111]/50 hover:bg-[#EFF6FF] border border-[#E2E8F0] hover:border-[#BFDBFE] p-4 rounded-xl transition-all cursor-pointer text-left"
          >
            <span className="text-[10px] font-bold text-[#64748B] uppercase block">Total Reports</span>
            <span className="text-2xl font-black text-[#172033] block mt-1 font-mono">
              {userReports.length}
            </span>
            <span className="text-[10px] text-[#2563EB] font-bold mt-1 block">View in My Reports →</span>
          </div>

          <div className="bg-slate-50 dark:bg-[#111111]/50 border border-[#E2E8F0] p-4 rounded-xl text-left">
            <span className="text-[10px] font-bold text-[#64748B] uppercase block">Remediated</span>
            <span className="text-2xl font-black text-[#16A34A] block mt-1 font-mono">
              {resolvedCount}
            </span>
            <span className="text-[10px] text-[#64748B] mt-1 block">Issues fixed</span>
          </div>

          <div className="bg-slate-50 dark:bg-[#111111]/50 border border-[#E2E8F0] p-4 rounded-xl text-left">
            <span className="text-[10px] font-bold text-[#64748B] uppercase block">In Field Queue</span>
            <span className="text-2xl font-black text-[#2563EB] block mt-1 font-mono">
              {inProgressCount}
            </span>
            <span className="text-[10px] text-[#64748B] mt-1 block">Active work</span>
          </div>
        </div>

        {/* Account Details */}
        <div className="bg-slate-50 dark:bg-[#111111]/50 p-4 rounded-xl border border-[#E2E8F0] space-y-2.5 text-xs text-[#475569]">
          <span className="text-[10px] font-bold uppercase tracking-wider text-[#64748B] block mb-1">
            ACCOUNT CLEARANCE & METRICS
          </span>

          <div className="flex items-center justify-between pb-2 border-b border-[#E2E8F0]">
            <span className="text-[#64748B]">Platform Access Role</span>
            <span className="font-bold text-[#172033] capitalize">Public Citizen Contributor</span>
          </div>

          <div className="flex items-center justify-between pb-2 border-b border-[#E2E8F0]">
            <span className="text-[#64748B]">Data Verification Status</span>
            <span className="font-bold text-[#16A34A] flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5" /> Authenticated
            </span>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-[#64748B]">Jurisdiction</span>
            <span className="font-bold text-[#172033]">Delhi NCR Municipal Network</span>
          </div>
        </div>

      </div>

    </div>
  );
}

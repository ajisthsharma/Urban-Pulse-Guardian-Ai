import React from 'react';
import { Camera, AlertCircle, FileText, Sparkles, ChevronRight, LayoutDashboard, MapPin, CheckCircle2 } from 'lucide-react';

interface CitizenHomeProps {
  onNavigate: (tab: string) => void;
  reportsCount: number;
  userName: string;
}

export default function CitizenHome({ onNavigate, reportsCount, userName }: CitizenHomeProps) {
  return (
    <div className="flex flex-col gap-6 text-left animate-in fade-in duration-300">
      
      {/* Welcome Hero Banner */}
      <div className="bg-gradient-to-r from-[#EFF6FF] via-[#F8FAFC] to-[#FFFFFF] rounded-3xl p-6 sm:p-8 text-[#172033] relative overflow-hidden shadow-xs border border-[#DBEAFE]">
        <div className="absolute top-0 right-0 p-8 text-[#2563EB] opacity-5 pointer-events-none">
           <LayoutDashboard className="w-48 h-48 rotate-12" />
        </div>
        
        <div className="relative z-10 max-w-2xl">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-white text-[#1D4ED8] rounded-full text-xs font-bold font-mono border border-[#BFDBFE] mb-3 shadow-2xs">
            <Sparkles className="w-3.5 h-3.5 text-[#2563EB]" />
            <span>CITIZEN ROAD SAFETY PORTAL</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight mb-2 text-[#172033]">
            Welcome to UrbanPulse{userName ? `, ${userName}` : ""} 👋
          </h1>
          <p className="text-xs sm:text-sm text-[#475569] leading-relaxed">
            Report road hazards, scan streets with AI vision, track live repair statuses, and keep commuter corridors safe.
          </p>
        </div>
      </div>

      {/* Primary Road Actions Grid */}
      <div>
        <h2 className="text-xs font-bold text-[#64748B] uppercase tracking-widest mb-3 font-mono">
          ROAD INTELLIGENCE & CIVIC ACTIONS
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          
          {/* Report Issue */}
          <button
            onClick={() => onNavigate('infrastructure')}
            className="bg-white border border-[#E2E8F0] p-5 rounded-2xl shadow-xs hover:shadow-md hover:border-[#2563EB] transition-all text-left group flex flex-col items-start gap-4 cursor-pointer"
          >
            <div className="w-12 h-12 bg-[#EFF6FF] text-[#2563EB] border border-[#BFDBFE] rounded-xl flex items-center justify-center group-hover:scale-105 transition-transform shadow-2xs">
              <AlertCircle className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-bold text-[#172033] text-sm mb-1 group-hover:text-[#2563EB] transition-colors flex items-center justify-between">
                Report Issue
                <ChevronRight className="w-4 h-4 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all text-[#2563EB]" />
              </h3>
              <p className="text-xs text-[#64748B] line-clamp-2">
                Upload evidence of potholes, road cracks, or defects for AI analysis.
              </p>
            </div>
          </button>

          {/* AI Road Scanner */}
          <button
            onClick={() => onNavigate('road-scanner')}
            className="bg-white border border-[#E2E8F0] p-5 rounded-2xl shadow-xs hover:shadow-md hover:border-[#2563EB] transition-all text-left group flex flex-col items-start gap-4 cursor-pointer"
          >
            <div className="w-12 h-12 bg-[#EFF6FF] text-[#2563EB] border border-[#BFDBFE] rounded-xl flex items-center justify-center group-hover:scale-105 transition-transform shadow-2xs">
              <Camera className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-bold text-[#172033] text-sm mb-1 group-hover:text-[#2563EB] transition-colors flex items-center justify-between">
                AI Road Scanner
                <ChevronRight className="w-4 h-4 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all text-[#2563EB]" />
              </h3>
              <p className="text-xs text-[#64748B] line-clamp-2">
                Scan roads with vehicle dashcam or phone camera for automated detection.
              </p>
            </div>
          </button>

          {/* Road Risk Map */}
          <button
            onClick={() => onNavigate('safety')}
            className="bg-white border border-[#E2E8F0] p-5 rounded-2xl shadow-xs hover:shadow-md hover:border-[#2563EB] transition-all text-left group flex flex-col items-start gap-4 cursor-pointer"
          >
            <div className="w-12 h-12 bg-[#EFF6FF] text-[#2563EB] border border-[#BFDBFE] rounded-xl flex items-center justify-center group-hover:scale-105 transition-transform shadow-2xs">
              <MapPin className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-bold text-[#172033] text-sm mb-1 group-hover:text-[#2563EB] transition-colors flex items-center justify-between">
                Road Risk Map
                <ChevronRight className="w-4 h-4 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all text-[#2563EB]" />
              </h3>
              <p className="text-xs text-[#64748B] line-clamp-2">
                Inspect spatial risk levels and active road hazards nearby.
              </p>
            </div>
          </button>

          {/* My Reports */}
          <button
            onClick={() => onNavigate('my-reports')}
            className="bg-white border border-[#E2E8F0] p-5 rounded-2xl shadow-xs hover:shadow-md hover:border-[#2563EB] transition-all text-left group flex flex-col items-start gap-4 cursor-pointer"
          >
            <div className="w-12 h-12 bg-[#EFF6FF] text-[#2563EB] border border-[#BFDBFE] rounded-xl flex items-center justify-center group-hover:scale-105 transition-transform shadow-2xs">
              <FileText className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-bold text-[#172033] text-sm mb-1 group-hover:text-[#2563EB] transition-colors flex items-center justify-between">
                My Reports
                <ChevronRight className="w-4 h-4 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all text-[#2563EB]" />
              </h3>
              <p className="text-xs text-[#64748B] line-clamp-2">
                Track the 6-stage remediation timeline of your submissions.
              </p>
            </div>
          </button>

        </div>
      </div>

      {/* Secondary Status Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-1">
        <div className="bg-white border border-[#E2E8F0] rounded-2xl p-6 shadow-xs flex items-center justify-between">
          <div>
            <h4 className="font-bold text-[#172033] text-sm mb-0.5">My Reports Tracker</h4>
            <p className="text-xs text-[#64748B] mb-3">Live status updates from municipal maintenance teams.</p>
            {reportsCount > 0 ? (
              <span className="text-xl font-extrabold text-[#2563EB] font-mono">{reportsCount} Active Ticket{reportsCount > 1 ? "s" : ""}</span>
            ) : (
              <span className="text-xs font-medium text-[#94A3B8]">No reports submitted yet.</span>
            )}
          </div>
          <button 
            onClick={() => onNavigate('my-reports')} 
            className="px-4 py-2 bg-[#F8FAFC] hover:bg-[#EFF6FF] border border-[#E2E8F0] hover:border-[#BFDBFE] text-[#172033] hover:text-[#2563EB] text-xs font-bold rounded-xl transition-colors cursor-pointer"
          >
            View My Reports
          </button>
        </div>

        <div className="bg-white border border-[#E2E8F0] rounded-2xl p-6 shadow-xs flex items-center justify-between">
          <div>
            <h4 className="font-bold text-[#172033] text-sm mb-0.5">Report a Road Hazard</h4>
            <p className="text-xs text-[#64748B] mb-3">Potholes, surface cracks, waterlogging, or missing signs.</p>
            <span className="text-xs font-bold text-[#16A34A] flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5 text-[#16A34A]" /> AI Fast-Routing Active
            </span>
          </div>
          <button 
            onClick={() => onNavigate('infrastructure')} 
            className="px-4 py-2 bg-[#2563EB] hover:bg-[#1D4ED8] text-white text-xs font-bold rounded-xl transition-colors cursor-pointer"
          >
            Report Issue
          </button>
        </div>
      </div>

    </div>
  );
}

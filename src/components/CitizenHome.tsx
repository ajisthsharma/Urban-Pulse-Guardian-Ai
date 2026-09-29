import React from 'react';
import { Camera, Navigation, AlertTriangle, FileText, Sparkles, ChevronRight, LayoutDashboard } from 'lucide-react';

interface CitizenHomeProps {
  onNavigate: (tab: string) => void;
  reportsCount: number;
  userName: string;
}

export default function CitizenHome({ onNavigate, reportsCount, userName }: CitizenHomeProps) {
  return (
    <div className="flex flex-col gap-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      
      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-[#EFF6FF] to-[#FFFFFF] rounded-3xl p-8 sm:p-10 text-slate-900 dark:text-slate-50 relative overflow-hidden shadow-xs border border-[#DBEAFE]">
        <div className="absolute top-0 right-0 p-12 text-zinc-900 dark:text-zinc-100 opacity-5 pointer-events-none">
           <LayoutDashboard className="w-48 h-48 rotate-12" />
        </div>
        
        <div className="relative z-10 max-w-2xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-[#F5F3FF] text-[#7C3AED] rounded-full text-xs font-bold font-mono border border-[#DDD6FE] mb-4">
            <Sparkles className="w-3.5 h-3.5 text-[#7C3AED]" />
            AI-POWERED CITIZEN NODE
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight mb-3 text-slate-900 dark:text-slate-50">
            Welcome to UrbanPulse 👋
          </h1>
          <p className="text-zinc-900 dark:text-zinc-100 text-sm sm:text-base mb-2 font-semibold">
            Your AI-powered urban safety and infrastructure intelligence platform.
          </p>
          <p className="text-slate-500 dark:text-slate-400 text-xs sm:text-sm max-w-xl leading-relaxed">
            Detect. Report. Respond. Protect. Report urban problems, scan roads with AI, find safer routes, and stay informed about your city's infrastructure.
          </p>
        </div>
      </div>

      {/* Primary Actions Grid */}
      <div>
        <h2 className="text-sm font-bold text-slate-900 dark:text-slate-50 uppercase tracking-widest mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          
          <button
            onClick={() => onNavigate('infrastructure')}
            className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 rounded-2xl shadow-xs hover:shadow-md hover:border-[#2563EB] transition-all text-left group flex flex-col items-start gap-4 cursor-pointer"
          >
            <div className="w-12 h-12 bg-blue-50 dark:bg-blue-900/20 text-zinc-900 dark:text-zinc-100 border border-[#DBEAFE] rounded-xl flex items-center justify-center group-hover:scale-105 transition-transform">
              <FileText className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 dark:text-slate-50 text-sm mb-1 group-hover:text-zinc-900 dark:text-zinc-100 transition-colors flex items-center justify-between">
                Report Issue
                <ChevronRight className="w-4 h-4 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all text-zinc-900 dark:text-zinc-100" />
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2">Report potholes, garbage, lighting and other urban issues.</p>
            </div>
          </button>

          <button
            onClick={() => onNavigate('road-scanner')}
            className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 rounded-2xl shadow-xs hover:shadow-md hover:border-[#7C3AED] transition-all text-left group flex flex-col items-start gap-4 cursor-pointer"
          >
            <div className="w-12 h-12 bg-[#F5F3FF] text-[#7C3AED] border border-[#DDD6FE] rounded-xl flex items-center justify-center group-hover:scale-105 transition-transform">
              <Camera className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 dark:text-slate-50 text-sm mb-1 group-hover:text-[#7C3AED] transition-colors flex items-center justify-between">
                AI Road Scanner
                <ChevronRight className="w-4 h-4 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all text-[#7C3AED]" />
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2">Scan roads using your camera, GPS and Gemini AI to detect hazards.</p>
            </div>
          </button>

          <button
            onClick={() => onNavigate('safe-route')}
            className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 rounded-2xl shadow-xs hover:shadow-md hover:border-[#16A34A] transition-all text-left group flex flex-col items-start gap-4 cursor-pointer"
          >
            <div className="w-12 h-12 bg-[#F0FDF4] text-green-600 dark:text-green-400 border border-green-200 dark:border-green-800 rounded-xl flex items-center justify-center group-hover:scale-105 transition-transform">
              <Navigation className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 dark:text-slate-50 text-sm mb-1 group-hover:text-green-600 dark:text-green-400 transition-colors flex items-center justify-between">
                Safe Route
                <ChevronRight className="w-4 h-4 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all text-green-600 dark:text-green-400" />
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2">Find routes with lower reported hazard exposure.</p>
            </div>
          </button>

          <button
            onClick={() => onNavigate('emergency-sos')}
            className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 rounded-2xl shadow-xs hover:shadow-md hover:border-[#DC2626] transition-all text-left group flex flex-col items-start gap-4 cursor-pointer"
          >
            <div className="w-12 h-12 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 border border-red-200 dark:border-red-800/50 rounded-xl flex items-center justify-center group-hover:scale-105 transition-transform">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 dark:text-slate-50 text-sm mb-1 group-hover:text-red-600 dark:text-red-400 transition-colors flex items-center justify-between">
                Emergency SOS
                <ChevronRight className="w-4 h-4 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all text-red-600 dark:text-red-400" />
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2">Broadcast critical infrastructure collapse or accident beacon.</p>
            </div>
          </button>

        </div>
      </div>

      {/* Secondary Status Section */}
      <div className="mt-2">
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-xs flex items-center justify-between">
          <div>
            <h4 className="font-bold text-slate-900 dark:text-slate-50 text-sm mb-1">My Reports</h4>
            <p className="text-xs text-slate-500 dark:text-slate-400 mb-4">Track the status of issues you've submitted.</p>
            {reportsCount > 0 ? (
              <span className="text-2xl font-black text-zinc-900 dark:text-zinc-100">{reportsCount} Active</span>
            ) : (
              <span className="text-sm font-medium text-slate-400 dark:text-slate-500">Your submitted issues will appear here.</span>
            )}
          </div>
          <button onClick={() => onNavigate('my-reports')} className="px-4 py-2 bg-zinc-50 dark:bg-zinc-900 hover:bg-zinc-100 dark:hover:bg-zinc-800 border border-zinc-200 dark:border-zinc-800 text-zinc-800 dark:text-zinc-200 text-xs font-bold rounded-xl transition-colors cursor-pointer">
            View All
          </button>
        </div>
      </div>

    </div>
  );
}

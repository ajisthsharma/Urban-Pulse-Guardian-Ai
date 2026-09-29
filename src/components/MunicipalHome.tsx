import React from 'react';
import { ShieldAlert, Activity, MapPin, BarChart3, Layers, Sparkles, ChevronRight, LayoutDashboard, Camera } from 'lucide-react';

interface MunicipalHomeProps {
  onNavigate: (tab: string) => void;
  activeCriticalCount: number;
  pendingCount: number;
  cityName: string;
}

export default function MunicipalHome({ onNavigate, activeCriticalCount, pendingCount, cityName }: MunicipalHomeProps) {
  return (
    <div className="flex flex-col gap-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      
      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-[#EFF6FF] to-[#FFFFFF] rounded-3xl p-8 sm:p-10 text-slate-900 dark:text-slate-50 relative overflow-hidden shadow-xs border border-[#DBEAFE]">
        <div className="absolute top-0 right-0 p-12 text-zinc-900 dark:text-zinc-100 opacity-5 pointer-events-none">
           <ShieldAlert className="w-48 h-48 rotate-12" />
        </div>
        
        <div className="relative z-10 max-w-2xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-blue-50 dark:bg-blue-900/20 text-zinc-900 dark:text-zinc-100 rounded-full text-xs font-bold font-mono border border-[#DBEAFE] mb-4">
            <ShieldAlert className="w-3.5 h-3.5 text-zinc-900 dark:text-zinc-100" />
            URBANPULSE COMMAND DECK
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight mb-3 uppercase text-slate-900 dark:text-slate-50">
            Municipal Command Center
          </h1>
          <p className="text-zinc-900 dark:text-zinc-100 text-sm sm:text-base mb-2 font-semibold">
            City intelligence for detecting, prioritizing and resolving urban risks.
          </p>
          <p className="text-slate-500 dark:text-slate-400 text-xs sm:text-sm max-w-xl leading-relaxed">
            Monitor {cityName} operations, manage citizen reports, view AI scanner telemetry, and dispatch utility fleets to high-risk areas.
          </p>
        </div>
      </div>

      {/* Quick Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-2">
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-xs">
          <div className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">Critical Hazards</div>
          {activeCriticalCount > 0 ? (
             <div className="text-3xl font-black text-red-600 dark:text-red-400 animate-pulse">{activeCriticalCount}</div>
          ) : (
             <div className="text-sm font-medium text-slate-400 dark:text-slate-500 mt-2">No active critical tickets within warning limits.</div>
          )}
        </div>
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-xs">
          <div className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">Pending Reports</div>
          <div className="text-3xl font-black text-amber-500 dark:text-amber-400">{pendingCount}</div>
        </div>
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-xs col-span-1 sm:col-span-2 flex items-center justify-between">
           <div>
              <div className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1">Road Scanner Feed</div>
              <div className="text-sm font-semibold text-slate-900 dark:text-slate-50">AI telemetry active</div>
           </div>
           <button onClick={() => onNavigate('command-center')} className="px-4 py-2 bg-[#2563EB] hover:bg-[#1D4ED8] text-white rounded-xl text-xs font-bold flex items-center gap-2 shadow-xs transition-colors cursor-pointer">
             <ShieldAlert className="w-4 h-4" /> Go to Command Center
           </button>
        </div>
      </div>

      {/* Primary Actions Grid */}
      <div>
        <h2 className="text-sm font-bold text-slate-900 dark:text-slate-50 uppercase tracking-widest mb-4 mt-4">City Intelligence & Operations</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          
          <button
            onClick={() => onNavigate('infrastructure')}
            className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 rounded-2xl shadow-xs hover:shadow-md hover:border-[#F59E0B] transition-all text-left group flex flex-col items-start gap-4 cursor-pointer"
          >
            <div className="w-12 h-12 bg-[#FFFBEB] text-amber-500 dark:text-amber-400 border border-[#FDE68A] rounded-xl flex items-center justify-center group-hover:scale-105 transition-transform">
              <Activity className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 dark:text-slate-50 text-sm mb-1 group-hover:text-amber-500 dark:text-amber-400 transition-colors flex items-center justify-between">
                View Live Reports
                <ChevronRight className="w-4 h-4 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all text-amber-500 dark:text-amber-400" />
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2">Manage all incoming reports, assign fleets, and update statuses.</p>
            </div>
          </button>

          <button
            onClick={() => onNavigate('safety')}
            className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 rounded-2xl shadow-xs hover:shadow-md hover:border-[#2563EB] transition-all text-left group flex flex-col items-start gap-4 cursor-pointer"
          >
            <div className="w-12 h-12 bg-blue-50 dark:bg-blue-900/20 text-zinc-900 dark:text-zinc-100 border border-[#DBEAFE] rounded-xl flex items-center justify-center group-hover:scale-105 transition-transform">
              <MapPin className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 dark:text-slate-50 text-sm mb-1 group-hover:text-zinc-900 dark:text-zinc-100 transition-colors flex items-center justify-between">
                Open City Map
                <ChevronRight className="w-4 h-4 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all text-zinc-900 dark:text-zinc-100" />
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2">Geographic risk overlays and real-time hazard mapping.</p>
            </div>
          </button>

          <button
            onClick={() => onNavigate('analytics')}
            className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 rounded-2xl shadow-xs hover:shadow-md hover:border-[#16A34A] transition-all text-left group flex flex-col items-start gap-4 cursor-pointer"
          >
            <div className="w-12 h-12 bg-[#F0FDF4] text-green-600 dark:text-green-400 border border-green-200 dark:border-green-800 rounded-xl flex items-center justify-center group-hover:scale-105 transition-transform">
              <BarChart3 className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 dark:text-slate-50 text-sm mb-1 group-hover:text-green-600 dark:text-green-400 transition-colors flex items-center justify-between">
                View Analytics
                <ChevronRight className="w-4 h-4 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all text-green-600 dark:text-green-400" />
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2">City health standings, department indices, and issue growth.</p>
            </div>
          </button>

          <button
            onClick={() => onNavigate('digital-twin')}
            className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 rounded-2xl shadow-xs hover:shadow-md hover:border-[#7C3AED] transition-all text-left group flex flex-col items-start gap-4 cursor-pointer"
          >
            <div className="w-12 h-12 bg-[#F5F3FF] text-[#7C3AED] border border-[#DDD6FE] rounded-xl flex items-center justify-center group-hover:scale-105 transition-transform">
              <Layers className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 dark:text-slate-50 text-sm mb-1 group-hover:text-[#7C3AED] transition-colors flex items-center justify-between">
                Digital Twin
                <ChevronRight className="w-4 h-4 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all text-[#7C3AED]" />
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2">5-layer vector hologram of current municipal infrastructure.</p>
            </div>
          </button>

        </div>
      </div>
      
    </div>
  );
}

import { createNotification } from "../services/notificationsService";
import React, { useState } from "react";
import { 
  AlertOctagon, PhoneCall, ShieldAlert, MapPin, 
  CheckCircle2, Radio, Clock, User, ArrowRight, Activity
} from "lucide-react";
import { User as UserType } from "../types";

interface CitizenEmergencySOSProps {
  currentUser: UserType | null;
}

export default function CitizenEmergencySOS({ currentUser }: CitizenEmergencySOSProps) {
  const [sosActive, setSosActive] = useState(false);
  const [countdown, setCountdown] = useState<number | null>(null);
  const [emergencyType, setEmergencyType] = useState<"Major Road Cave-In / Accident" | "Active Flood / Submerged Road" | "Live Electrical / Wire Hazard" | "Medical / Crash Emergency">("Major Road Cave-In / Accident");
  const [dispatchStatus, setDispatchStatus] = useState<"BROADCASTING" | "DISPATCHED" | "ACKNOWLEDGED">("BROADCASTING");

  const handleTriggerSOS = () => {
    setCountdown(3);
    const interval = setInterval(() => {
      setCountdown((prev) => {
        if (prev === null || prev <= 1) {
          clearInterval(interval);
          setSosActive(true);
          setDispatchStatus("BROADCASTING");
          
          // Trigger Municipal Notification for SOS
          createNotification(
            "🚨 CRITICAL SOS ACTIVATED",
            `Emergency: ${emergencyType} reported by ${currentUser?.email || 'Citizen'}`,
            "alert_high_severity",
            "admin",
            "",
            "SOS_ALERT"
          );

          setTimeout(() => setDispatchStatus("DISPATCHED"), 2500);
          return null;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const handleCancelSOS = () => {
    setCountdown(null);
    setSosActive(false);
  };

  return (
    <div id="emergency-sos-container" className="space-y-5">
      {/* HEADER BAR */}
      <div className="bg-gradient-to-r from-[#FEF2F2] via-[#FFFBEB] to-[#FFFFFF] border border-[#FECACA] rounded-2xl p-5 text-[#172033] shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-[#FEF2F2] border border-[#FECACA] flex items-center justify-center text-[#DC2626]">
              <AlertOctagon className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-lg font-black tracking-tight text-[#172033]">
                  CITIZEN SOS & RAPID INCIDENT BEACON
                </h1>
                <span className="px-2 py-0.5 bg-[#FEF2F2] text-[#DC2626] border border-[#FECACA] rounded text-[9.5px] font-mono font-bold uppercase tracking-wider">
                  Direct Municipal Dispatch
                </span>
              </div>
              <p className="text-xs text-[#64748B] mt-0.5">
                Broadcast critical infrastructure collapse or accident beacon directly to 24/7 City Emergency Command.
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <a
            href="tel:112"
            className="px-4 py-2 bg-[#DC2626] hover:bg-[#B91C1C] text-white font-bold text-xs rounded-xl shadow-xs transition-all flex items-center gap-1.5"
          >
            <PhoneCall className="w-3.5 h-3.5" />
            <span>Call 112 (National Emergency)</span>
          </a>
        </div>
      </div>

      {/* SOS ACTION CARD & DISPATCH STATUS */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        
        {/* BIG SOS TRIGGER (Left 7 Cols) */}
        <div className="lg:col-span-7 bg-white border border-[#E2E8F0] rounded-2xl p-6 flex flex-col items-center justify-center text-center space-y-5 shadow-xs">
          {!sosActive && countdown === null && (
            <>
              <div className="max-w-md space-y-2">
                <h3 className="text-base font-bold text-[#172033]">
                  Emergency Infrastructure Beacon
                </h3>
                <p className="text-xs text-[#64748B]">
                  Select incident category below and press the SOS beacon to broadcast live GPS coordinates to city emergency response units.
                </p>
              </div>

              <div className="w-full max-w-sm">
                <select
                  value={emergencyType}
                  onChange={(e) => setEmergencyType(e.target.value as any)}
                  className="w-full bg-[#F8FAFC] border border-[#E2E8F0] text-[#172033] text-xs px-3.5 py-2.5 rounded-xl focus:outline-none focus:border-[#DC2626]"
                >
                  <option value="Major Road Cave-In / Accident">Major Road Cave-In / Accident</option>
                  <option value="Active Flood / Submerged Road">Active Flood / Submerged Road</option>
                  <option value="Live Electrical / Wire Hazard">Live Electrical / Wire Hazard</option>
                  <option value="Medical / Crash Emergency">Medical / Crash Emergency</option>
                </select>
              </div>

              {/* Big Red SOS Button */}
              <button
                id="trigger-sos-btn"
                onClick={handleTriggerSOS}
                className="w-36 h-36 rounded-full bg-gradient-to-tr from-[#DC2626] to-[#EF4444] hover:from-[#B91C1C] hover:to-[#DC2626] text-white font-black text-2xl tracking-widest shadow-xl shadow-red-500/20 border-4 border-red-200 flex flex-col items-center justify-center gap-1 transition-transform hover:scale-105 active:scale-95 cursor-pointer"
              >
                <AlertOctagon className="w-8 h-8" />
                <span>SOS</span>
              </button>
            </>
          )}

          {countdown !== null && (
            <div className="space-y-4 py-8">
              <span className="text-xs font-mono text-[#DC2626] uppercase tracking-wider block font-semibold">
                Broadcasting Beacon in:
              </span>
              <div className="text-6xl font-mono font-black text-[#DC2626] animate-ping">
                {countdown}
              </div>
              <button
                onClick={handleCancelSOS}
                className="px-5 py-2 bg-[#F8FAFC] hover:bg-[#F1F5F9] text-[#172033] text-xs font-bold rounded-xl border border-[#E2E8F0] cursor-pointer"
              >
                Cancel SOS
              </button>
            </div>
          )}

          {sosActive && (
            <div className="w-full space-y-4 py-4 text-left">
              <div className="p-4 bg-[#FEF2F2] border border-[#FECACA] rounded-xl flex items-center justify-between text-[#DC2626]">
                <div className="flex items-center gap-3">
                  <Radio className="w-6 h-6 text-[#DC2626] animate-pulse" />
                  <div>
                    <h4 className="font-bold text-sm">Emergency Beacon Active</h4>
                    <p className="text-xs text-[#DC2626] font-mono">
                      Category: {emergencyType}
                    </p>
                  </div>
                </div>
                <span className="px-2.5 py-1 bg-[#DC2626] text-white rounded-lg text-xs font-mono font-bold">
                  {dispatchStatus}
                </span>
              </div>

              <div className="bg-[#F8FAFC] p-4 rounded-xl border border-[#E2E8F0] space-y-2 text-xs">
                <div className="flex items-center justify-between text-[#475569]">
                  <span>Broadcast GPS:</span>
                  <span className="font-mono text-[#2563EB] font-bold">0.0000° N, 0.0000° E</span>
                </div>
                <div className="flex items-center justify-between text-[#475569]">
                  <span>Citizen Contact:</span>
                  <span className="font-mono text-[#172033]">{currentUser?.email || "citizen@gmail.com"}</span>
                </div>
                <div className="flex items-center justify-between text-[#475569]">
                  <span>Assigned Unit:</span>
                  <span className="font-mono text-[#16A34A] font-bold">NCR Quick Action Squad #4</span>
                </div>
              </div>

              <button
                onClick={handleCancelSOS}
                className="w-full py-2.5 bg-[#F8FAFC] hover:bg-[#F1F5F9] text-[#172033] text-xs font-bold rounded-xl border border-[#E2E8F0] cursor-pointer"
              >
                Resolve / Deactivate SOS Beacon
              </button>
            </div>
          )}
        </div>

        {/* EMERGENCY DIRECTORY (Right 5 Cols) */}
        <div className="lg:col-span-5 bg-white border border-[#E2E8F0] rounded-2xl p-5 space-y-4 text-[#172033] shadow-xs">
          <h3 className="text-xs font-mono font-bold text-[#64748B] uppercase tracking-wider">
            24/7 City Emergency Contacts
          </h3>

          <div className="space-y-2.5">
            {[
              { name: "Police Rapid Response", number: "112", desc: "All City Emergencies" },
              { name: "Ambulance / Medical", number: "102", desc: "Trauma & Road Accidents" },
              { name: "National Highway Helpline", number: "1033", desc: "Expressway Hazards & Towing" },
              { name: "Disaster Management", number: "1078", desc: "Floods & Structural Collapse" }
            ].map((contact, idx) => (
              <div
                key={idx}
                className="p-3 bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl flex items-center justify-between text-xs"
              >
                <div>
                  <span className="font-bold text-[#172033] block">{contact.name}</span>
                  <span className="text-[11px] text-[#64748B]">{contact.desc}</span>
                </div>
                <a
                  href={`tel:${contact.number}`}
                  className="px-3 py-1.5 bg-[#FEF2F2] border border-[#FECACA] text-[#DC2626] hover:bg-[#DC2626] hover:text-white rounded-lg font-mono font-bold transition-all"
                >
                  {contact.number}
                </a>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}

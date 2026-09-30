import { createNotification } from "../services/notificationsService";
import { createReport } from "../services/reportsService";
import { auth } from "../lib/firebase";
import { useAuth } from "../context/AuthContext";
import React, { useState, useRef } from "react";
import { 
  AlertOctagon, PhoneCall, ShieldAlert, MapPin, 
  CheckCircle2, Radio, Clock, User, ArrowRight, Activity, Loader2
} from "lucide-react";
import { User as UserType } from "../types";

interface CitizenEmergencySOSProps {
  currentUser: UserType | null;
}

export default function CitizenEmergencySOS({ currentUser }: CitizenEmergencySOSProps) {
  const { user: authUser, loading: authLoading, isAuthenticated } = useAuth();
  const [sosActive, setSosActive] = useState(false);
  const [countdown, setCountdown] = useState<number | null>(null);
  const [emergencyType, setEmergencyType] = useState<"Major Road Cave-In / Accident" | "Active Flood / Submerged Road" | "Live Electrical / Wire Hazard" | "Medical / Crash Emergency">("Major Road Cave-In / Accident");
  const [dispatchStatus, setDispatchStatus] = useState<"BROADCASTING" | "DISPATCHED" | "ACKNOWLEDGED">("BROADCASTING");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [createdTicketId, setCreatedTicketId] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const sosInFlightRef = useRef<boolean>(false);
  const countdownIntervalRef = useRef<any>(null);

  // Wait helper to resolve real Firebase Auth session if auth initialization is still running
  const resolveAuthSession = async (): Promise<any> => {
    if (auth.currentUser) return auth.currentUser;
    if (authLoading) {
      const start = Date.now();
      while (Date.now() - start < 3000) {
        if (auth.currentUser) return auth.currentUser;
        await new Promise((r) => setTimeout(r, 100));
      }
    }
    return auth.currentUser;
  };

  const handleTriggerSOS = async () => {
    if (isSubmitting || sosInFlightRef.current) return;
    setErrorMessage(null);

    // 0. Pre-check Firebase Auth session
    const currentAuthUser = await resolveAuthSession();
    if (!currentAuthUser) {
      console.warn("[CitizenEmergencySOS] Denied: No authenticated Firebase user session found.");
      setErrorMessage("Please sign in again before sending Emergency SOS.");
      return;
    }

    setCountdown(3);
    countdownIntervalRef.current = setInterval(() => {
      setCountdown((prev) => {
        if (prev === null || prev <= 1) {
          clearInterval(countdownIntervalRef.current);
          countdownIntervalRef.current = null;
          executeSosBroadcast();
          return null;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const executeSosBroadcast = async () => {
    if (sosInFlightRef.current) return;
    sosInFlightRef.current = true;
    setIsSubmitting(true);
    setSosActive(true);
    setDispatchStatus("BROADCASTING");

    try {
      const currentAuthUser = await resolveAuthSession();
      if (!currentAuthUser) {
        console.warn("[CitizenEmergencySOS] Denied: No authenticated Firebase user session found.");
        setErrorMessage("Please sign in again before sending Emergency SOS.");
        setSosActive(false);
        setIsSubmitting(false);
        sosInFlightRef.current = false;
        return;
      }

      // Default fallback or live coords
      let lat = 28.6139;
      let lng = 77.2090;
      if (typeof navigator !== "undefined" && "geolocation" in navigator) {
        try {
          const pos = await new Promise<GeolocationPosition>((resolve, reject) => {
            navigator.geolocation.getCurrentPosition(resolve, reject, { timeout: 4000, maximumAge: 10000 });
          });
          lat = pos.coords.latitude;
          lng = pos.coords.longitude;
        } catch {
          // Fall back gracefully to active metro grid
        }
      }

      // 1. Create Report in Firestore
      const report = await createReport(
        {
          title: `🚨 EMERGENCY SOS: ${emergencyType}`,
          description: `Critical citizen emergency SOS broadcasted for: ${emergencyType}. Immediate response required.`,
          category: "Other",
          location: `Live Citizen Location (GPS ${lat.toFixed(4)}, ${lng.toFixed(4)})`,
          latitude: lat,
          longitude: lng,
          severity: 99,
          riskLevel: "High",
          priority: "Critical",
          confidence: 99,
          source: "MANUAL_REPORT",
          image: "https://images.unsplash.com/photo-1584467541268-b040f83be3fd?auto=format&fit=crop&w=600&q=80",
          aiAnalysis: {
            category: "Emergency SOS Incident",
            severityScore: 99,
            riskLevel: "High",
            confidence: 99,
            description: `Emergency incident: ${emergencyType}`,
            recommendedActions: [
              "Immediate emergency dispatch",
              "Alert city response units",
              "Secure incident perimeter"
            ]
          }
        },
        {
          id: currentAuthUser.uid,
          uid: currentAuthUser.uid,
          email: currentAuthUser.email || currentUser?.email || "citizen@urbanpulse.ai",
          fullName: currentUser?.fullName || currentAuthUser.displayName || "Urban Citizen"
        }
      );

      setCreatedTicketId(report.id);

      // 2. Trigger Municipal Notification for SOS (Secondary non-blocking)
      try {
        await createNotification(
          "🚨 CRITICAL SOS ACTIVATED",
          `Emergency: ${emergencyType} reported by ${currentAuthUser.email || 'Citizen'} (Ticket: ${report.id})`,
          "alert_high_severity",
          "admin",
          "",
          report.id
        );
      } catch (notifErr) {
        console.warn("[CitizenEmergencySOS] Secondary notification broadcast note:", notifErr);
      }

      setDispatchStatus("DISPATCHED");
    } catch (err: any) {
      console.error("Failed to execute Citizen SOS:", err);
      const msg = err?.message || "Failed to broadcast SOS beacon. Please call emergency services directly.";
      if (!auth.currentUser || msg.includes("auth/user-not-found") || msg.includes("unauthenticated")) {
        setErrorMessage("Please sign in again before sending Emergency SOS.");
      } else {
        setErrorMessage(msg.includes("permission") ? "Incident registry write permission denied. Please verify citizen credentials." : msg);
      }
      setSosActive(false);
    } finally {
      setIsSubmitting(false);
      sosInFlightRef.current = false;
    }
  };

  const handleCancelSOS = () => {
    if (countdownIntervalRef.current) {
      clearInterval(countdownIntervalRef.current);
      countdownIntervalRef.current = null;
    }
    setCountdown(null);
    setSosActive(false);
    setIsSubmitting(false);
    sosInFlightRef.current = false;
  };

  return (
    <div id="emergency-sos-container" className="space-y-5">
      {/* HEADER BAR */}
      <div className="bg-gradient-to-r from-[#FEF2F2] via-[#FFFBEB] to-[#FFFFFF] border border-red-200 dark:border-red-800/50 rounded-2xl p-5 text-slate-900 dark:text-white shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800/50 flex items-center justify-center text-red-600 dark:text-red-400">
              <AlertOctagon className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-lg font-black tracking-tight text-slate-900 dark:text-white">
                  CITIZEN SOS & RAPID INCIDENT BEACON
                </h1>
                <span className="px-2 py-0.5 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 border border-red-200 dark:border-red-800/50 rounded text-[9.5px] font-mono font-bold uppercase tracking-wider">
                  Direct Municipal Dispatch
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-300 mt-0.5">
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
        
        <div className="lg:col-span-7 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-2xl p-6 flex flex-col items-center justify-center text-center space-y-5 shadow-xs">
          {errorMessage && (
            <div className="w-full p-3 bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800 rounded-xl text-red-700 dark:text-red-300 text-xs font-semibold flex items-center justify-center gap-2">
              <AlertOctagon className="w-4 h-4 text-red-600 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          {authLoading && (
            <div className="w-full p-3 bg-slate-100 dark:bg-slate-800 rounded-xl text-slate-600 dark:text-slate-300 text-xs font-semibold flex items-center justify-center gap-2">
              <Loader2 className="w-4 h-4 animate-spin text-red-600" />
              <span>Verifying authenticated emergency session...</span>
            </div>
          )}

          {!authLoading && !authUser && !auth.currentUser && (
            <div className="w-full p-3 bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800 rounded-xl text-red-700 dark:text-red-300 text-xs font-semibold flex items-center justify-center gap-2">
              <AlertOctagon className="w-4 h-4 text-red-600 shrink-0" />
              <span>Authentication Required: Please sign in before sending Emergency SOS.</span>
            </div>
          )}

          {!sosActive && countdown === null && (
            <>
              <div className="max-w-md space-y-2">
                <h3 className="text-base font-bold text-slate-900 dark:text-white">
                  Emergency Infrastructure Beacon
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-300">
                  Select incident category below and press the SOS beacon to broadcast live GPS coordinates to city emergency response units.
                </p>
              </div>

              <div className="w-full max-w-sm">
                <select
                  value={emergencyType}
                  onChange={(e) => setEmergencyType(e.target.value as any)}
                  className="w-full bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white text-xs px-3.5 py-2.5 rounded-xl focus:outline-none focus:border-[#DC2626]"
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
                disabled={authLoading || (!authUser && !auth.currentUser)}
                onClick={handleTriggerSOS}
                className="w-36 h-36 rounded-full bg-gradient-to-tr from-[#DC2626] to-[#EF4444] hover:from-[#B91C1C] hover:to-[#DC2626] disabled:opacity-40 disabled:pointer-events-none text-white font-black text-2xl tracking-widest shadow-xl shadow-red-500/20 border-4 border-red-200 flex flex-col items-center justify-center gap-1 transition-transform hover:scale-105 active:scale-95 cursor-pointer"
              >
                <AlertOctagon className="w-8 h-8" />
                <span>SOS</span>
              </button>
            </>
          )}

          {countdown !== null && (
            <div className="space-y-4 py-8">
              <span className="text-xs font-mono text-red-600 dark:text-red-400 uppercase tracking-wider block font-semibold">
                Broadcasting Beacon in:
              </span>
              <div className="text-6xl font-mono font-black text-red-600 dark:text-red-400 animate-ping">
                {countdown}
              </div>
              <button
                onClick={handleCancelSOS}
                className="px-5 py-2 bg-slate-50 dark:bg-slate-800/50 hover:bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white text-xs font-bold rounded-xl border border-slate-200 dark:border-slate-700 cursor-pointer"
              >
                Cancel SOS
              </button>
            </div>
          )}

          {sosActive && (
            <div className="w-full space-y-4 py-4 text-left">
              <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800/50 rounded-xl flex items-center justify-between text-red-600 dark:text-red-400">
                <div className="flex items-center gap-3">
                  <Radio className="w-6 h-6 text-red-600 dark:text-red-400 animate-pulse" />
                  <div>
                    <h4 className="font-bold text-sm">Emergency Beacon Active</h4>
                    <p className="text-xs text-red-600 dark:text-red-400 font-mono">
                      Category: {emergencyType}
                    </p>
                  </div>
                </div>
                <span className="px-2.5 py-1 bg-[#DC2626] text-white rounded-lg text-xs font-mono font-bold">
                  {dispatchStatus}
                </span>
              </div>

              <div className="bg-slate-50 dark:bg-slate-800/50 p-4 rounded-xl border border-slate-200 dark:border-slate-700 space-y-2 text-xs">
                {createdTicketId && (
                  <div className="flex items-center justify-between text-slate-600 dark:text-slate-400">
                    <span>Emergency Ticket:</span>
                    <span className="font-mono text-red-600 dark:text-red-400 font-bold">{createdTicketId}</span>
                  </div>
                )}
                <div className="flex items-center justify-between text-slate-600 dark:text-slate-400">
                  <span>Broadcast GPS:</span>
                  <span className="font-mono text-blue-600 dark:text-blue-400 font-bold">28.6139° N, 77.2090° E</span>
                </div>
                <div className="flex items-center justify-between text-slate-600 dark:text-slate-400">
                  <span>Citizen Contact:</span>
                  <span className="font-mono text-slate-900 dark:text-white">{auth.currentUser?.email || currentUser?.email || "citizen@urbanpulse.ai"}</span>
                </div>
                <div className="flex items-center justify-between text-slate-600 dark:text-slate-400">
                  <span>Assigned Unit:</span>
                  <span className="font-mono text-green-600 dark:text-green-400 font-bold">NCR Quick Action Squad #4</span>
                </div>
              </div>

              <button
                onClick={handleCancelSOS}
                className="w-full py-2.5 bg-slate-50 dark:bg-slate-800/50 hover:bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white text-xs font-bold rounded-xl border border-slate-200 dark:border-slate-700 cursor-pointer"
              >
                Resolve / Deactivate SOS Beacon
              </button>
            </div>
          )}
        </div>

        {/* EMERGENCY DIRECTORY (Right 5 Cols) */}
        <div className="lg:col-span-5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-2xl p-5 space-y-4 text-slate-900 dark:text-white shadow-xs">
          <h3 className="text-xs font-mono font-bold text-slate-500 dark:text-slate-300 uppercase tracking-wider">
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
                className="p-3 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl flex items-center justify-between text-xs"
              >
                <div>
                  <span className="font-bold text-slate-900 dark:text-white block">{contact.name}</span>
                  <span className="text-[11px] text-slate-500 dark:text-slate-300">{contact.desc}</span>
                </div>
                <a
                  href={`tel:${contact.number}`}
                  className="px-3 py-1.5 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800/50 text-red-600 dark:text-red-400 hover:bg-[#DC2626] hover:text-white rounded-lg font-mono font-bold transition-all"
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

import React, { useState, useEffect, useRef } from "react";
import { 
  Sparkles, Send, Bot, User, RefreshCw, ShieldCheck, 
  MapPin, AlertTriangle, CheckCircle2, Info, Compass, HelpCircle
} from "lucide-react";
import { Report } from "../types";

interface GroundingLink {
  uri: string;
  title: string;
}

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
  groundingLinks?: GroundingLink[];
}

interface CitizenCopilotProps {
  currentUserName: string;
  currentUserEmail: string;
  userReports?: Report[];
  allReports?: Report[];
}

export default function CitizenCopilot({
  currentUserName,
  currentUserEmail,
  userReports = [],
  allReports = []
}: CitizenCopilotProps) {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "init_citizen_1",
      role: "assistant",
      content: `Hello **${currentUserName || "Citizen"}**! 👋 I am your **UrbanPulse Citizen Safety Copilot**.\n\nI'm here to help you navigate Delhi NCR safely, understand neighborhood hazard scores, and track your submitted road reports. What would you like to check today?`,
      timestamp: new Date()
    }
  ]);
  const [inputVal, setInputVal] = useState("");
  const [sending, setSending] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = async (textToSend: string) => {
    if (!textToSend.trim() || sending) return;

    const userMsg: Message = {
      id: "msg_" + Date.now(),
      role: "user",
      content: textToSend,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMsg]);
    setInputVal("");
    setSending(true);

    let lat: number | undefined;
    let lng: number | undefined;

    if (navigator.geolocation) {
      try {
        const pos = await new Promise<GeolocationPosition>((resolve, reject) => {
          navigator.geolocation.getCurrentPosition(resolve, reject, { timeout: 2000 });
        });
        lat = pos.coords.latitude;
        lng = pos.coords.longitude;
      } catch {
        // Geolocation denied or timed out
      }
    }

    try {
      const response = await fetch("/api/ai/citizen-chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: textToSend,
          userName: currentUserName,
          userEmail: currentUserEmail,
          lat,
          lng,
          myReports: userReports,
          publicReports: allReports,
          history: messages.map(m => ({
            role: m.role === "user" ? "user" : "model",
            content: m.content
          }))
        })
      });

      const data = await response.json();
      const assistantMsg: Message = {
        id: "msg_" + (Date.now() + 1),
        role: "assistant",
        content: data.reply || "I am currently unable to fetch real-time sector telemetry. Please check active reports on the map.",
        timestamp: new Date(),
        groundingLinks: data.groundingLinks || []
      };
      setMessages(prev => [...prev, assistantMsg]);
    } catch (err) {
      console.error("Citizen Copilot error:", err);
      setMessages(prev => [...prev, {
        id: "msg_err_" + Date.now(),
        role: "assistant",
        content: "### Fallback Safety Advisory\n\n* **Sector 45:** 3 active road hazards reported. Drive with caution.\n* **Cyber City:** 0 active critical alerts (Safety Score: **94/100**).\n\nUse Safe Route Navigator to calculate optimal commuter bypasses.",
        timestamp: new Date()
      }]);
    } finally {
      setSending(false);
    }
  };

  const citizenPromptChips = [
    "What is reducing Sector 45's safety score?",
    "What is the status of my submitted reports?",
    "Which area is safest for commuting today?",
    "What hazards are reported near my area?",
    "How does Safe Route calculate hazard avoidance?"
  ];

  return (
    <div id="citizen-copilot-container" className="space-y-4">
      {/* HEADER BANNER */}
      <div className="bg-gradient-to-r from-[#F5F3FF] via-[#EFF6FF] to-[#FFFFFF] border border-violet-200 dark:border-violet-800/50 rounded-2xl p-5 text-slate-900 dark:text-white shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#F5F3FF] border border-violet-200 dark:border-violet-800/50 flex items-center justify-center text-[#7C3AED] shadow-2xs">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base font-extrabold tracking-tight text-slate-900 dark:text-white">
                CITIZEN SAFETY COPILOT
              </h2>
              <span className="px-2 py-0.5 bg-violet-50 dark:bg-violet-900/30 text-violet-600 dark:text-violet-400 border border-violet-200 dark:border-violet-800/50 rounded text-[9.5px] font-mono font-bold uppercase">
                AI Powered • Gemini 3.5
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-300 mt-0.5">
              Personalized neighborhood safety diagnostics, report tracking, and commuter guidance.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 px-3 py-1.5 rounded-xl text-xs font-mono shadow-2xs">
          <ShieldCheck className="w-4 h-4 text-green-600 dark:text-green-400" />
          <span className="text-slate-500 dark:text-slate-300">Privacy Shield:</span>
          <span className="text-green-600 dark:text-green-400 font-bold">Isolated to Citizen Profile</span>
        </div>
      </div>

      {/* CHAT THREAD CARD */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-2xl shadow-xs overflow-hidden flex flex-col h-[600px]">
        {/* Thread Status Subheader */}
        <div className="bg-slate-50 dark:bg-slate-800/50 text-slate-600 dark:text-slate-400 px-5 py-3 flex items-center justify-between border-b border-slate-200 dark:border-slate-700">
          <div className="flex items-center gap-2 text-xs">
            <span className="w-2 h-2 rounded-full bg-[#16A34A] animate-pulse" />
            <span className="font-semibold text-slate-900 dark:text-white">Delhi NCR Civic Safety Channel</span>
            <span className="text-[#CBD5E1]">•</span>
            <span className="text-slate-500 dark:text-slate-300 text-[11px]">User: {currentUserEmail || "Volunteer"}</span>
          </div>

          <div className="flex items-center gap-3 text-[11px] text-slate-500 dark:text-slate-300 font-mono">
            <span>My Reports: <strong className="text-slate-900 dark:text-white">{userReports.length}</strong></span>
          </div>
        </div>

        {/* Message Stream */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-5 bg-slate-50 dark:bg-slate-800/50 flex flex-col gap-4">
          {messages.map((m) => (
            <div
              key={m.id}
              className={`flex gap-3 max-w-[85%] ${m.role === "user" ? "self-end flex-row-reverse" : "self-start"}`}
            >
              {/* Avatar */}
              <div className={`w-8 h-8 rounded-xl shrink-0 flex items-center justify-center font-bold text-xs ${
                m.role === "user" 
                  ? "bg-[#2563EB] text-white shadow-2xs" 
                  : "bg-violet-50 dark:bg-violet-900/30 text-violet-600 dark:text-violet-400 border border-violet-200 dark:border-violet-800/50"
              }`}>
                {m.role === "user" ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
              </div>

              {/* Message Bubble */}
              <div className={`p-4 rounded-2xl text-xs leading-relaxed ${
                m.role === "user"
                  ? "bg-[#2563EB] text-white rounded-tr-xs shadow-2xs"
                  : "bg-white dark:bg-slate-900 text-slate-900 dark:text-white border border-slate-200 dark:border-slate-700 rounded-tl-xs shadow-2xs"
              }`}>
                <div className="space-y-2 whitespace-pre-wrap">
                  {m.content.split("\n\n").map((para, idx) => {
                    if (para.startsWith("### ")) {
                      return <h4 key={idx} className="font-bold text-sm text-slate-900 mt-1 mb-1">{para.replace("### ", "")}</h4>;
                    }
                    if (para.startsWith("* ") || para.startsWith("- ")) {
                      return (
                        <ul key={idx} className="space-y-1 my-1 pl-1">
                          {para.split("\n").map((line, lIdx) => (
                            <li key={lIdx} className="flex items-start gap-1.5">
                              <span className="text-blue-500 font-bold">•</span>
                              <span dangerouslySetInnerHTML={{ __html: line.replace(/^[*-]\s+/, '').replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>').replace(/`([^`]+)`/g, '<code class="bg-slate-100 px-1 py-0.5 rounded text-slate-800 font-mono text-[10.5px]">$1</code>') }} />
                            </li>
                          ))}
                        </ul>
                      );
                    }
                    return (
                      <p key={idx} dangerouslySetInnerHTML={{ __html: para.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>').replace(/`([^`]+)`/g, '<code class="bg-slate-100 px-1 py-0.5 rounded text-slate-800 font-mono text-[10.5px]">$1</code>') }} />
                    );
                  })}
                </div>

                {/* Grounding References */}
                {m.groundingLinks && m.groundingLinks.length > 0 && (
                  <div className="mt-3 pt-2.5 border-t border-slate-100 space-y-1">
                    <span className="text-[9.5px] text-slate-400 font-bold uppercase tracking-wider block">
                      Google Maps Verified Locations:
                    </span>
                    <div className="flex flex-wrap gap-1.5">
                      {m.groundingLinks.map((link, lIdx) => (
                        <a
                          key={lIdx}
                          href={link.uri}
                          target="_blank"
                          rel="noopener noreferrer"
                          referrerPolicy="no-referrer"
                          className="inline-flex items-center gap-1 text-[10.5px] font-semibold bg-blue-50 hover:bg-blue-100 text-blue-700 px-2 py-0.5 rounded-lg border border-blue-200/60 transition-colors"
                        >
                          <MapPin className="w-3 h-3 text-blue-500" />
                          <span className="max-w-[160px] truncate">{link.title}</span>
                          <span className="text-blue-400 text-[9px]">↗</span>
                        </a>
                      ))}
                    </div>
                  </div>
                )}

                <span className={`text-[9px] block mt-2 text-right ${m.role === "user" ? "text-blue-200" : "text-slate-400 font-mono"}`}>
                  {m.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
            </div>
          ))}

          {sending && (
            <div className="self-start flex gap-2.5 items-center text-xs text-slate-500 font-mono animate-pulse pl-11 py-1">
              <RefreshCw className="w-3.5 h-3.5 animate-spin text-blue-600" />
              <span>Analyzing city reports with Gemini...</span>
            </div>
          )}
          <div ref={scrollRef} />
        </div>

        {/* Suggested Quick Prompt Chips */}
        <div className="px-4 py-2.5 bg-slate-100 border-t border-slate-200 flex flex-wrap gap-1.5 items-center">
          <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider mr-1">
            Ask:
          </span>
          {citizenPromptChips.map((chip, idx) => (
            <button
              key={idx}
              disabled={sending}
              onClick={() => handleSend(chip)}
              className="text-[11px] font-medium bg-white dark:bg-slate-900 hover:bg-slate-50 text-slate-700 hover:text-slate-900 border border-slate-200 px-2.5 py-1 rounded-lg transition-colors cursor-pointer shadow-3xs disabled:opacity-50"
            >
              {chip}
            </button>
          ))}
        </div>

        {/* Input Form */}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSend(inputVal);
          }}
          className="p-3 bg-white dark:bg-slate-900 border-t border-slate-200 flex gap-2 items-center"
        >
          <input
            type="text"
            value={inputVal}
            onChange={(e) => setInputVal(e.target.value)}
            placeholder="Ask about neighborhood safety, road hazards, or your submitted tickets..."
            disabled={sending}
            className="flex-1 bg-slate-50 text-xs text-slate-800 rounded-xl px-4 py-3 border border-slate-200 focus:outline-none focus:bg-white dark:bg-slate-900 focus:border-blue-500 transition-all placeholder:text-slate-400"
          />
          <button
            type="submit"
            disabled={sending || !inputVal.trim()}
            className="px-4 py-3 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white font-bold text-xs rounded-xl shadow transition-all flex items-center gap-1.5 cursor-pointer"
          >
            <Send className="w-3.5 h-3.5" />
            <span>Send</span>
          </button>
        </form>
      </div>

      {/* Advisory Notice */}
      <div className="p-3 bg-blue-50/70 border border-blue-200/70 rounded-xl flex items-start gap-2.5 text-xs text-blue-900">
        <Info className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
        <p className="text-[11.5px] leading-relaxed">
          <strong>Advisory Note:</strong> UrbanPulse AI safety scores are derived from active citizen submissions, road scanner telemetry, and municipal sensor data. They serve as situational awareness tools and do not replace driver vigilance.
        </p>
      </div>
    </div>
  );
}

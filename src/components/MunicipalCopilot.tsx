import React, { useState, useEffect, useRef } from "react";
import { 
  Building2, Sparkles, Send, Bot, User, RefreshCw, ShieldAlert, 
  TrendingUp, CheckCircle2, AlertOctagon, Wrench, ArrowRight, FileText, RotateCcw
} from "lucide-react";
import { Report } from "../types";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
}

interface MunicipalCopilotProps {
  currentUserName: string;
  currentUserEmail: string;
  currentUserRole: string;
  reports: Report[];
  onNavigateToCommandCenter?: () => void;
}

export default function MunicipalCopilot({
  currentUserName,
  currentUserEmail,
  currentUserRole,
  reports = [],
  onNavigateToCommandCenter
}: MunicipalCopilotProps) {
  const activeCount = reports.filter(r => r.status !== "Resolved").length;
  const criticalCount = reports.filter(r => (r.priority === "Critical" || r.severity >= 75) && r.status !== "Resolved").length;
  const resolutionRate = reports.length > 0 ? Math.round((reports.filter(r => r.status === "Resolved").length / reports.length) * 100) : 0;

  const [messages, setMessages] = useState<Message[]>([
    {
      id: "init_muni_1",
      role: "assistant",
      content: `### UrbanPulse Municipal Operations AI Online\n\nWelcome Officer **${currentUserName || "Director"}**. I am analyzing real-time city telemetry across **${reports.length} total reports** (${activeCount} active backlog, ${criticalCount} high priority).\n\nHow may I assist municipal resource allocation, hazard triage, or dispatch strategy today?`,
      timestamp: new Date()
    }
  ]);
  const [inputVal, setInputVal] = useState("");
  const [sending, setSending] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleClearChat = () => {
    setMessages([
      {
        id: "init_muni_" + Date.now(),
        role: "assistant",
        content: `### UrbanPulse Municipal Operations AI Online\n\nWelcome Officer **${currentUserName || "Director"}**. I am analyzing real-time city telemetry across **${reports.length} total reports** (${reports.filter(r => r.status !== "Resolved").length} active backlog).\n\nHow may I assist municipal resource allocation, hazard triage, or dispatch strategy today?`,
        timestamp: new Date()
      }
    ]);
  };

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

    try {
      const response = await fetch("/api/ai/municipal-chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: textToSend,
          role: currentUserRole || "municipal",
          userName: currentUserName,
          userEmail: currentUserEmail,
          reports: reports,
          history: messages.map(m => ({
            role: m.role === "user" ? "user" : "model",
            content: m.content
          }))
        })
      });

      if (!response.ok) {
        const errData = await response.json().catch(() => ({}));
        throw new Error(errData.error || "Server error");
      }

      const data = await response.json();
      const assistantMsg: Message = {
        id: "msg_" + (Date.now() + 1),
        role: "assistant",
        content: data.reply || "⚠️ Municipal Copilot is temporarily unavailable. Please try again.",
        timestamp: new Date()
      };
      setMessages(prev => [...prev, assistantMsg]);
    } catch (err) {
      console.error("Municipal Copilot error:", err);
      setMessages(prev => [...prev, {
        id: "msg_err_" + Date.now(),
        role: "assistant",
        content: "⚠️ **Municipal Copilot is temporarily unavailable.** Please try again in a moment.",
        timestamp: new Date()
      }]);
    } finally {
      setSending(false);
    }
  };

  const municipalPromptChips = [
    "How many high priority reports are pending?",
    "Which issue should the municipality address first?",
    "What are the major hazards in the city?",
    "How many Road Scanner reports exist?",
    "What can Municipal Copilot do?"
  ];

  return (
    <div id="municipal-copilot-container" className="space-y-4">
      {/* HEADER WITH TELEMETRY BADGES */}
      <div className="bg-gradient-to-r from-blue-50 dark:from-slate-900 via-[#F8FAFC] to-[#FFFFFF] border border-[#DBEAFE] rounded-2xl p-5 text-slate-900 dark:text-white shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-900/20 border border-[#DBEAFE] flex items-center justify-center text-slate-900 dark:text-white shadow-2xs">
            <Building2 className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base font-extrabold tracking-tight text-slate-900 dark:text-white">
                MUNICIPAL DECISION COPILOT
              </h2>
              <span className="px-2 py-0.5 bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 border border-blue-200 dark:border-blue-800/50 rounded text-[9.5px] font-mono font-bold uppercase">
                Officer Clearance Required
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-300 mt-0.5">
              Strategic fleet routing, dispatch queue optimization, and cross-department SLA intelligence.
            </p>
          </div>
        </div>

        {/* Quick Operational Metrics */}
        <div className="flex items-center gap-2 font-mono text-xs">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 px-3 py-1.5 rounded-xl shadow-2xs">
            <span className="text-slate-500 dark:text-slate-300 text-[10px] uppercase block font-semibold">Active Backlog</span>
            <span className="text-amber-500 dark:text-amber-400 font-bold">{activeCount} tickets</span>
          </div>
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 px-3 py-1.5 rounded-xl shadow-2xs">
            <span className="text-slate-500 dark:text-slate-300 text-[10px] uppercase block font-semibold">Critical Priority</span>
            <span className="text-red-600 dark:text-red-400 font-bold">{criticalCount} high-risk</span>
          </div>
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 px-3 py-1.5 rounded-xl shadow-2xs">
            <span className="text-slate-500 dark:text-slate-300 text-[10px] uppercase block font-semibold">Resolution Rate</span>
            <span className="text-green-600 dark:text-green-400 font-bold">{resolutionRate}%</span>
          </div>
        </div>
      </div>

      {/* MAIN CHAT THREAD CARD */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-2xl shadow-xs overflow-hidden flex flex-col h-[620px]">
        {/* Thread Status Subheader */}
        <div className="bg-slate-50 dark:bg-slate-800/50 text-slate-600 dark:text-slate-400 px-5 py-3 flex items-center justify-between border-b border-slate-200 dark:border-slate-700">
          <div className="flex items-center gap-2 text-xs">
            <span className="w-2 h-2 rounded-full bg-[#16A34A] animate-pulse" />
            <span className="font-semibold text-slate-900 dark:text-white">Urban Operations Neural Channel</span>
            <span className="text-[#CBD5E1]">•</span>
            <span className="text-slate-500 dark:text-slate-300 text-[11px]">Clearance: {(currentUserRole || "MUNICIPAL").toUpperCase()}</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleClearChat}
              title="Reset AI conversation memory"
              className="flex items-center gap-1 text-[11px] font-medium text-slate-500 dark:text-slate-300 hover:text-slate-900 dark:text-white bg-white dark:bg-slate-900 hover:bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 px-2.5 py-1 rounded-lg transition-colors cursor-pointer"
            >
              <RotateCcw className="w-3 h-3" />
              <span>Clear Chat</span>
            </button>

            {onNavigateToCommandCenter && (
              <button
                onClick={onNavigateToCommandCenter}
                className="flex items-center gap-1 text-[11px] font-bold text-slate-900 dark:text-white hover:text-blue-700 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20 border border-[#DBEAFE] px-2.5 py-1 rounded-lg transition-colors cursor-pointer"
              >
                <span>Command Center</span>
                <ArrowRight className="w-3 h-3" />
              </button>
            )}
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
                  : "bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 border border-blue-200 dark:border-blue-800/50"
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
                    if (para.startsWith("## ")) {
                      return <h3 key={idx} className="font-bold text-base text-slate-900 mt-1 mb-1">{para.replace("## ", "")}</h3>;
                    }
                    if (para.startsWith("* ") || para.startsWith("- ")) {
                      return (
                        <ul key={idx} className="space-y-1 my-1 pl-1">
                          {para.split("\n").map((line, lIdx) => (
                            <li key={lIdx} className="flex items-start gap-1.5">
                              <span className="text-amber-500 font-bold">•</span>
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

                <span className={`text-[9px] block mt-2 text-right ${m.role === "user" ? "text-amber-200" : "text-slate-400 font-mono"}`}>
                  {m.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
            </div>
          ))}

          {sending && (
            <div className="self-start flex gap-2.5 items-center text-xs text-slate-500 font-mono animate-pulse pl-11 py-1">
              <RefreshCw className="w-3.5 h-3.5 animate-spin text-amber-600" />
              <span>Analyzing UrbanPulse data...</span>
            </div>
          )}
          <div ref={scrollRef} />
        </div>

        {/* Suggested Quick Prompt Chips */}
        <div className="px-4 py-2.5 bg-slate-100 border-t border-slate-200 flex flex-wrap gap-1.5 items-center">
          <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider mr-1">
            Dispatch Queries:
          </span>
          {municipalPromptChips.map((chip, idx) => (
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
            placeholder="Ask about pending reports, priority hazards, Road Scanner detections, or dispatch recommendations..."
            disabled={sending}
            className="flex-1 bg-slate-50 text-xs text-slate-800 rounded-xl px-4 py-3 border border-slate-200 focus:outline-none focus:bg-white dark:bg-slate-900 focus:border-amber-500 transition-all placeholder:text-slate-400"
          />
          <button
            type="submit"
            disabled={sending || !inputVal.trim()}
            className="px-4 py-3 bg-amber-600 hover:bg-amber-500 disabled:opacity-50 text-white font-bold text-xs rounded-xl shadow transition-all flex items-center gap-1.5 cursor-pointer"
          >
            <Send className="w-3.5 h-3.5" />
            <span>Advise</span>
          </button>
        </form>
      </div>

      {/* Human-In-The-Loop Safeguard Notice */}
      <div className="p-3 bg-amber-50/80 border border-amber-200/80 rounded-xl flex items-start gap-2.5 text-xs text-amber-950">
        <AlertOctagon className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
        <p className="text-[11.5px] leading-relaxed">
          <strong>Operational Directive:</strong> AI Copilot recommendations serve as decision-support heuristics. Status updates, resource dispatches, and contractor work orders must be validated by authorized municipal officers in the Command Center.
        </p>
      </div>
    </div>
  );
}


import { useState } from "react";
import { Shield, Bell, LogOut, User as UserIcon, RefreshCw, Layers, Check } from "lucide-react";
import { User, Notification } from "../types";


function getRelativeTime(dateString: string) {
  const now = new Date();
  const date = new Date(dateString);
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);
  
  if (diffInSeconds < 60) return "Just now";
  
  const diffInMinutes = Math.floor(diffInSeconds / 60);
  if (diffInMinutes < 60) return `${diffInMinutes} min ago`;
  
  const diffInHours = Math.floor(diffInMinutes / 60);
  if (diffInHours < 24) return `${diffInHours} hour${diffInHours > 1 ? 's' : ''} ago`;
  
  const diffInDays = Math.floor(diffInHours / 24);
  if (diffInDays === 1) return "Yesterday";
  
  return `${diffInDays} days ago`;
}

interface HeaderProps {
  currentUser: User | null;
  onLogout: () => void;
  notifications: Notification[];
  onMarkNotificationsRead: () => void;
  onTriggerNotificationClick: (notif: Notification) => void;
  appOnline: boolean;
}

export default function Header({
  currentUser,
  onLogout,
  notifications,
  onMarkNotificationsRead,
  onTriggerNotificationClick,
  appOnline
}: HeaderProps) {
  const [showNotifDropdown, setShowNotifDropdown] = useState(false);
  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <header id="header-bar" className="sticky top-0 z-[1100] w-full bg-white dark:bg-slate-900 border-b border-gray-200 shadow-xs backdrop-blur-md bg-white dark:bg-slate-900/95 dark:bg-slate-900/95">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        
        {/* Branding & Logo */}
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 bg-blue-600 rounded-lg flex items-center justify-center shadow-xs">
            <div className="w-4.5 h-4.5 border-2 border-white rounded-full"></div>
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-display font-bold text-lg text-slate-800 tracking-tight">URBANPULSE</span>
              <span className="font-display font-bold text-lg text-blue-600 tracking-tight">GUARDIAN AI</span>
            </div>
            <p className="text-[9px] font-semibold uppercase tracking-wider text-slate-400 -mt-0.5">City Operating System v4.2.0</p>
          </div>
        </div>

        {/* Dynamic Center System Status Bar */}
        <div className="hidden md:flex items-center gap-4">
          <div className="flex items-center gap-2 px-3 py-1 bg-slate-50 rounded-full border border-slate-150">
            <div className={`w-2 h-2 rounded-full ${appOnline ? "bg-emerald-500 animate-pulse" : "bg-red-500"}`}></div>
            <span className="text-[11px] font-bold text-slate-600 tracking-wide uppercase">{appOnline ? "SYSTEMS ONLINE" : "DISCONNECTED"}</span>
          </div>
          <div className="flex items-center gap-1.5 px-3 py-1 bg-slate-50 rounded-full border border-slate-150 text-[11px] font-bold text-slate-600">
            <Layers className="w-3.5 h-3.5 text-blue-500" />
            <span>HQ Command Node</span>
          </div>
        </div>

        {/* User profile actions & notifications */}
        <div className="flex items-center gap-3">
          
          {/* Notification dropdown trigger */}
          <div className="relative">
            <button
              id="notif-bell-btn"
              onClick={() => {
                setShowNotifDropdown(!showNotifDropdown);
                if (!showNotifDropdown && unreadCount > 0) {
                  onMarkNotificationsRead();
                }
              }}
              className="relative p-2 rounded-lg text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition-colors"
            >
              <Bell className="w-5 h-5" />
              {unreadCount > 0 && (
                <span className="absolute top-1 right-1 w-4.5 h-4.5 rounded-full bg-red-500 text-[9px] font-bold text-white flex items-center justify-center ring-2 ring-white">
                  {unreadCount}
                </span>
              )}
            </button>

            {/* Notifications panel */}
            {showNotifDropdown && (
              <div className="absolute right-0 mt-2 w-80 bg-white dark:bg-slate-900 border border-slate-200 rounded-xl shadow-xl z-50 py-1 divide-y divide-slate-100 overflow-hidden animate-in fade-in duration-100">
                <div className="px-4 py-2.5 bg-slate-50 flex items-center justify-between">
                  <h4 className="font-semibold text-xs text-slate-800">Operational Alerts</h4>
                  {unreadCount > 0 && (
                    <span onClick={onMarkNotificationsRead} className="text-[10px] text-blue-600 hover:underline cursor-pointer">
                      Mark read
                    </span>
                  )}
                </div>

                <div className="max-h-64 overflow-y-auto">
                  {notifications.length === 0 ? (
                    <div className="p-6 text-center text-gray-400 text-xs">
                      You're all caught up.
                    </div>
                  ) : (
                    notifications.map((notif) => (
                      <div
                        key={notif.id}
                        onClick={() => {
                          onTriggerNotificationClick(notif);
                          setShowNotifDropdown(false);
                        }}
                        className={`p-3 text-left hover:bg-slate-50 transition-colors cursor-pointer ${
                          !notif.read ? "bg-blue-50/40" : ""
                        }`}
                      >
                        <div className="flex items-start justify-between gap-1 mb-0.5">
                          <span className={`text-[10px] font-bold uppercase ${
                            notif.type === "alert_high_severity" ? "text-red-600" : "text-blue-600"
                          }`}>
                            {notif.type === "alert_high_severity" ? "Critical Alert" : "Update"}
                          </span>
                          <span className="text-[9px] text-gray-400">
                            {getRelativeTime(notif.createdAt)}
                          </span>
                        </div>
                        <h5 className="font-semibold text-xs text-slate-800 line-clamp-1">{notif.title}</h5>
                        <p className="text-[11px] text-gray-500 line-clamp-2 mt-0.5">{notif.message}</p>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>

          <span className="text-gray-300">|</span>

          {currentUser ? (
            <div className="flex items-center gap-2">
              {/* User badge */}
              <div className="text-right hidden sm:block">
                <div className="text-xs font-bold text-slate-800 leading-3">{currentUser.fullName}</div>
                <div className="text-[9px] font-medium text-slate-500">
                  {currentUser.role === "admin" ? "🗺️ Municipality Director" : "👷 Citizen Responder"}
                </div>
              </div>

              <button
                id="logout-btn"
                onClick={onLogout}
                className="p-2 rounded-lg text-gray-400 hover:text-red-600 hover:bg-slate-100 transition-colors"
                title="Logout"
              >
                <LogOut className="w-4.5 h-4.5" />
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <span className="text-xs text-gray-400">Not Logged In</span>
            </div>
          )}

        </div>
      </div>
    </header>
  );
}

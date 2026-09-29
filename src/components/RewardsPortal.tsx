import React, { useState } from "react";
import { 
  Award, Trophy, Star, Gift, Shield, CheckCircle2, 
  Sparkles, ArrowRight, Zap, TrendingUp, Users, Copy, Check
} from "lucide-react";
import { RewardItem, LeaderboardUser, User } from "../types";

interface RewardsPortalProps {
  currentUser: User | null;
  userPoints: number;
  onRedeemReward?: (reward: RewardItem) => void;
}

export default function RewardsPortal({ currentUser, userPoints }: RewardsPortalProps) {
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  // Available Reward Vouchers
  const [rewards, setRewards] = useState<RewardItem[]>([
    {
      id: "rew_1",
      title: "Delhi Metro 20% Transit Pass Discount",
      category: "Transport Discount",
      pointsRequired: 150,
      partner: "DMRC Transit Network",
      code: "METRO-GUARDIAN-20",
      available: true,
      expiresInDays: 30
    },
    {
      id: "rew_2",
      title: "Public EV Fast-Charger 10 kWh Credit",
      category: "EV Charging Credit",
      pointsRequired: 250,
      partner: "Delhi Clean Grid",
      code: "EV-CLEAN-CHARGE-10K",
      available: true,
      expiresInDays: 45
    },
    {
      id: "rew_3",
      title: "Municipal Property Tax Civic Rebate Voucher",
      category: "Civic Utility Voucher",
      pointsRequired: 500,
      partner: "Municipal Corporation",
      code: "CIVIC-REBATE-500",
      available: true,
      expiresInDays: 60
    },
    {
      id: "rew_4",
      title: "Eco Green Store ₹250 Discount Voucher",
      category: "Eco Store Coupon",
      pointsRequired: 100,
      partner: "Urban Eco Store",
      code: "ECO-PULSE-250",
      available: true,
      expiresInDays: 14
    }
  ]);

  // City Leaderboard
  const leaderboard: LeaderboardUser[] = [
    {
      rank: 1,
      name: "Rohan Varma",
      email: "rohan.v@gmail.com",
      points: 1250,
      scansCount: 22,
      reportsCount: 14,
      badge: "Master City Sentinel"
    },
    {
      rank: 2,
      name: currentUser?.fullName || "Ashish Singh (You)",
      email: currentUser?.email || "citizen@gmail.com",
      points: userPoints || 350,
      scansCount: 6,
      reportsCount: 3,
      badge: "Pothole Hunter",
      isCurrentUser: true
    },
    {
      rank: 3,
      name: "Priya Sharma",
      email: "priya.s@gmail.com",
      points: 310,
      scansCount: 5,
      reportsCount: 2,
      badge: "Eco Guardian"
    },
    {
      rank: 4,
      name: "Vikram Malhotra",
      email: "vikram.m@live.com",
      points: 240,
      scansCount: 4,
      reportsCount: 1,
      badge: "Road Scout"
    }
  ];

  const handleCopyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  return (
    <div id="rewards-portal-container" className="space-y-6">
      {/* HERO / POINTS STATS */}
      <div className="bg-gradient-to-r from-blue-50 to-white dark:from-slate-900 dark:to-slate-800 border border-[#DBEAFE] rounded-3xl p-6 text-slate-900 dark:text-white shadow-xs relative overflow-hidden">
        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 border border-blue-200 dark:border-blue-800/50 rounded-full text-xs font-mono font-bold">
                CIVIC GUARDIAN REWARDS
              </span>
            </div>
            <h1 className="text-2xl font-black tracking-tight text-slate-900 dark:text-white">
              Citizen Impact & Reward Hub
            </h1>
            <p className="text-xs text-slate-500 dark:text-slate-300 max-w-xl leading-relaxed">
              Earn civic points automatically by running the AI Road Scanner on daily commutes and logging road surface anomalies.
            </p>
          </div>

          <div className="bg-white dark:bg-slate-800/60 border border-[#DBEAFE] rounded-2xl p-5 text-center min-w-[200px] shadow-xs">
            <span className="text-xs font-mono text-slate-500 dark:text-slate-300 uppercase tracking-wider block font-semibold">
              Your Civic Balance
            </span>
            <div className="flex items-center justify-center gap-2 mt-1">
              <Award className="w-7 h-7 text-amber-500 dark:text-amber-400 fill-[#F59E0B]" />
              <span className="text-3xl font-mono font-black text-slate-900 dark:text-white">{userPoints}</span>
              <span className="text-xs font-mono font-bold text-amber-500 dark:text-amber-400">PTS</span>
            </div>
            <span className="text-[11px] text-green-600 dark:text-green-400 font-mono mt-1 block font-semibold">
              Tier: Pothole Hunter (Silver)
            </span>
          </div>
        </div>
      </div>

      {/* 2-COLUMN: REWARDS & LEADERBOARD */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* REWARDS STORE (Left 7 Cols) */}
        <div className="lg:col-span-7 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Gift className="w-4 h-4 text-slate-900 dark:text-white" />
              <span>Redeemable Civic Vouchers</span>
            </h3>
            <span className="text-xs text-slate-500 dark:text-slate-300 font-mono">Available Partner Perks</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            {rewards.map((rew) => {
              const canAfford = userPoints >= rew.pointsRequired;
              return (
                <div
                  key={rew.id}
                  className="bg-white dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-2xl p-4 flex flex-col justify-between space-y-3 transition-all hover:border-slate-300 dark:border-slate-700 shadow-xs"
                >
                  <div className="space-y-1.5">
                    <span className="text-[10px] font-mono font-bold text-slate-900 dark:text-white px-2 py-0.5 bg-blue-50 dark:bg-blue-900/20 rounded border border-[#DBEAFE]">
                      {rew.category}
                    </span>
                    <h4 className="text-xs font-bold text-slate-900 dark:text-white leading-snug">{rew.title}</h4>
                    <p className="text-[11px] text-slate-500 dark:text-slate-300">{rew.partner}</p>
                  </div>

                  <div className="pt-2 border-t border-slate-200 dark:border-slate-700 flex items-center justify-between">
                    <span className="text-xs font-mono font-bold text-amber-500 dark:text-amber-400">
                      {rew.pointsRequired} PTS
                    </span>

                    {canAfford ? (
                      <button
                        onClick={() => handleCopyCode(rew.code)}
                        className="px-3 py-1.5 bg-[#2563EB] hover:bg-[#1D4ED8] text-white rounded-lg text-xs font-bold transition-all flex items-center gap-1 cursor-pointer shadow-xs"
                      >
                        {copiedCode === rew.code ? (
                          <>
                            <Check className="w-3 h-3 text-white" />
                            <span>Code Copied!</span>
                          </>
                        ) : (
                          <>
                            <Copy className="w-3 h-3" />
                            <span>Redeem Code</span>
                          </>
                        )}
                      </button>
                    ) : (
                      <span className="text-[11px] font-mono text-slate-400 dark:text-slate-400">
                        Need {rew.pointsRequired - userPoints} more pts
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* LEADERBOARD (Right 5 Cols) */}
        <div className="lg:col-span-5 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Trophy className="w-4 h-4 text-amber-500 dark:text-amber-400" />
              <span>City Guardian Leaderboard</span>
            </h3>
            <span className="text-xs text-slate-500 dark:text-slate-300 font-mono">This Month</span>
          </div>

          <div className="bg-white dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-2xl p-4 space-y-2.5 shadow-xs">
            {leaderboard.map((lb) => (
              <div
                key={lb.rank}
                className={`p-3 rounded-xl border flex items-center justify-between text-xs transition-all ${
                  lb.isCurrentUser
                    ? "bg-blue-50 dark:bg-blue-900/20 border-[#DBEAFE] ring-1 ring-[#2563EB]/20"
                    : "bg-slate-50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700"
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className={`w-6 h-6 rounded-full flex items-center justify-center font-mono font-bold text-xs ${
                    lb.rank === 1 ? "bg-[#F59E0B] text-white" : lb.rank === 2 ? "bg-[#CBD5E1] text-slate-900 dark:text-white" : "bg-slate-200 dark:bg-slate-700 text-slate-500 dark:text-slate-300"
                  }`}>
                    {lb.rank}
                  </div>
                  <div>
                    <span className="font-bold text-slate-900 dark:text-white block">
                      {lb.name} {lb.isCurrentUser && "(You)"}
                    </span>
                    <span className="text-[10px] text-slate-500 dark:text-slate-300 font-mono">
                      {lb.scansCount} scans • {lb.badge}
                    </span>
                  </div>
                </div>

                <div className="text-right font-mono">
                  <span className="font-bold text-amber-500 dark:text-amber-400 text-sm">{lb.points}</span>
                  <span className="text-[10px] text-slate-400 dark:text-slate-400 block">PTS</span>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}

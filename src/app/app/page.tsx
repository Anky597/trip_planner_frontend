"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Users, MapPin, Sparkles, ChevronLeft, ChevronRight } from "lucide-react";
import { TextShimmer } from "@/components/ui/text-shimmer";
import { useAppStore } from "@/store/app-store";
import {
  getUserInfo,
  createPlanForGroup,
  PlanResponse,
  getRecommendations,
  processGroup,
  getGroupTraits,
  GroupTraitsResponse,
  createPlanByGroupName,
} from "@/lib/api-client";

const navItems = [
  {
    name: "Whiteboard",
    icon: Sparkles,
  },
  {
    name: "Members",
    icon: Users,
  },
  {
    name: "Ideas",
    icon: MapPin,
  },
];

function TubelightNavBar({
  items,
  activeTab,
  onTabChange,
  className,
}: {
  items: { name: string; icon: React.ComponentType<{ size?: number; strokeWidth?: number }> }[];
  activeTab: string;
  onTabChange: (name: string) => void;
  className?: string;
}) {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return (
    <div className={className}>
      <div className="flex items-center gap-3 bg-slate-900/70 border border-slate-800/80 backdrop-blur-xl py-1 px-1 rounded-full shadow-[0_18px_45px_rgba(15,23,42,0.85)]">
        {items.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.name;

          return (
            <button
              key={item.name}
              onClick={() => onTabChange(item.name)}
              className={`relative cursor-pointer text-xs font-semibold px-5 py-2.5 rounded-full transition-colors ${
                isActive
                  ? "bg-slate-900/95 text-emerald-300"
                  : "text-slate-300/80 hover:text-emerald-300"
              }`}
            >
              <span className="hidden md:inline">{item.name}</span>
              <span className="md:hidden flex items-center gap-1">
                <Icon size={16} strokeWidth={2.4} />
                {!isMobile && item.name}
              </span>
              {isActive && (
                <motion.div
                  layoutId="lamp"
                  className="absolute inset-0 w-full rounded-full -z-10"
                  initial={false}
                  transition={{
                    type: "spring",
                    stiffness: 300,
                    damping: 30,
                  }}
                >
                  {/* Tubelight glow at top */}
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 w-12 h-2 bg-emerald-400 rounded-full shadow-[0_0_20px_rgba(52,211,153,0.6)]">
                    <div className="absolute inset-0 bg-emerald-300 rounded-full blur-sm" />
                    <div className="absolute -top-1 inset-x-0 h-4 bg-emerald-400/30 rounded-full blur-lg" />
                  </div>
                  {/* Light beam effect */}
                  <div className="absolute inset-0 bg-gradient-to-b from-emerald-400/20 via-emerald-400/10 to-transparent rounded-full" />
                </motion.div>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}

type GroupMember = {
  id: string;
  name: string;
  role?: string;
  initials: string;
  color: string;
};

type PlanOption = {
  plan_id: string;
  plan_type: string;
  plan_variant: string;
  why_fit_user: string;
  sources: {
    url: string;
    title: string;
    used_for: string;
  }[];
  schedule: {
    day: number;
    date: string;
    activities: {
      time: string;
      location: string;
      description: string;
      activity_type: string;
      activity_title: string;
    }[];
  }[];
};

export default function AppShellPage() {
  const router = useRouter();
  const { currentUser } = useAppStore();
  const [activeGroupId, setActiveGroupId] = useState<string | null>(null);
  const [userGroups, setUserGroups] = useState<
    { id: string; name: string; destination: string; ai_group_kn_summary?: string; plans?: any[] }[]
  >([]);
  const [groupMembers, setGroupMembers] = useState<GroupMember[]>([]);
  const [plans, setPlans] = useState<PlanOption[] | null>(null);
  const [loadingPlans, setLoadingPlans] = useState(false);
  const [loadingRecs, setLoadingRecs] = useState(false);
  const [loadingTraits, setLoadingTraits] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState("Whiteboard");
  const [recs, setRecs] = useState<any>(null);
  const [traits, setTraits] = useState<GroupTraitsResponse | null>(null);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  const loadingMessages = [
    "Generating a plan tailored to your group's vibe...",
    "Gathering fresh data from the web for sharper suggestions...",
    "Optimizing day-wise schedule for energy, budget, and experiences...",
    "Cross-checking activities and routes for a smoother trip...",
  ];
  const [loadingMessageIndex, setLoadingMessageIndex] = useState(0);

  useEffect(() => {
    if (!loadingPlans) return;

    // Cycle loading messages while backend is working (can take 1-2 minutes)
    const interval = setInterval(() => {
      setLoadingMessageIndex((prev) => (prev + 1) % loadingMessages.length);
    }, 1500);

    return () => clearInterval(interval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loadingPlans]);

  // Load user groups and latest plans from backend
  useEffect(() => {
    const bootstrap = async () => {
      if (!currentUser || !currentUser.email) {
        router.push("/auth");
        return;
      }
      try {
        const info = await getUserInfo(currentUser.email);
        const groups = (info.groups || []).map((g) => ({
          id: g.id,
          name: g.name,
          destination: g.destination,
          ai_group_kn_summary: g.ai_group_kn_summary,
          plans: g.plans || [],
        }));
        setUserGroups(groups);

        if (groups.length > 0) {
          const first = groups[0];
          setActiveGroupId(first.id);

          // Set members from aggregate info if present
          if ((info as any).groups[0]?.members) {
            setGroupMembers(
              (info as any).groups[0].members.map((m: any, idx: number) => {
                const name = m.name || m.email || "Member";
                const initials = String(name)
                  .split(" ")
                  .map((p: string) => p[0])
                  .join("")
                  .slice(0, 2)
                  .toUpperCase();
                const palette = [
                  "bg-emerald-400/90",
                  "bg-sky-400/90",
                  "bg-fuchsia-400/90",
                  "bg-amber-400/90",
                ];
                return {
                  id: m.id || `${idx}`,
                  name,
                  role: m.role,
                  initials,
                  color: palette[idx % palette.length],
                } as GroupMember;
              })
            );
          }

          // Use latest stored plan, if any
          const latestPlan =
            first.plans && first.plans.length
              ? first.plans[first.plans.length - 1]
              : null;
          if (latestPlan && latestPlan.plan_json?.plan_options) {
            setPlans(latestPlan.plan_json.plan_options);
          }
        }
      } catch (e: any) {
        console.error("Failed to load user info for app shell:", e);
        setError(
          e?.message ||
            "Unable to load your workspace. Please refresh or try again."
        );
      }
    };

    bootstrap();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const activeGroup = userGroups.find((g) => g.id === activeGroupId) || null;

  const handleGeneratePlans = async () => {
    if (!activeGroup) {
      setError("No active group selected.");
      return;
    }
    try {
      setLoadingRecs(true);
      setLoadingPlans(true);
      setError(null);

      // 1) Fetch recommendations (city + wide) from backend
      const recommendations = await getRecommendations(activeGroup.id);
      setRecs(recommendations);
      setLoadingRecs(false);

      // 2) Create plan using recs as required by backend prompt
      const plan = await createPlanForGroup(activeGroup.id, {
        raw_data: {
          short_trip: recommendations.short_trip,
          long_trip: recommendations.long_trip,
        },
      });

      const options = plan.plan_json?.plan_options || [];
      setPlans(options);
      setActiveTab("Whiteboard");
    } catch (e: any) {
      // KN not ready: offer rebuild and retry path
      if (e?.code === "KN_NOT_READY") {
        try {
          setLoadingPlans(true);
          await processGroup(activeGroup.id);
          // Optional: poll for a short time or re-fetch once
          const plan = await createPlanForGroup(activeGroup.id, {
            raw_data: {
              short_trip: recs?.short_trip ?? {},
              long_trip: recs?.long_trip ?? {},
            },
          });
          const options = plan.plan_json?.plan_options || [];
          setPlans(options);
          setActiveTab("Whiteboard");
          return;
        } catch (inner) {
          console.error("Manual process/plan retry failed:", inner);
          setError("Group processing failed. Please try again.");
        }
      } else {
        console.error("Error generating plans:", e);
        setError(e?.message || "Something went wrong while generating plans for this group.");
        setPlans(null);
      }
    } finally {
      setLoadingPlans(false);
      setLoadingRecs(false);
    }
  };

  async function handleViewTraits() {
    if (!activeGroup) return;
    try {
      setLoadingTraits(true);
      setError(null);
      const t = await getGroupTraits(activeGroup.id);
      setTraits(t);
      setActiveTab("Members");
    } catch (e: any) {
      setError(e?.message || "Unable to load group traits.");
    } finally {
      setLoadingTraits(false);
    }
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-50 flex">
      {/* Left Sidebar */}
      <motion.aside
        animate={{ width: sidebarCollapsed ? "60px" : "320px" }}
        transition={{ duration: 0.3, ease: "easeInOut" }}
        className="relative border-r border-slate-800/80 bg-slate-950/95 backdrop-blur-xl flex flex-col"
      >
        {/* Collapse Button */}
        <button
          onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
          className="absolute -right-3 top-6 z-50 w-6 h-6 rounded-full bg-slate-900 border border-slate-800 flex items-center justify-center text-slate-400 hover:text-emerald-300 hover:border-emerald-400/60 transition-colors"
        >
          {sidebarCollapsed ? <ChevronRight size={14} /> : <ChevronLeft size={14} />}
        </button>

        <AnimatePresence mode="wait">
          {!sidebarCollapsed && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="flex flex-col h-full p-6"
            >
              {/* Header */}
              <div className="mb-6">
                <p className="text-[10px] uppercase tracking-[0.16em] text-emerald-400/80 mb-1">
                  Shared workspace
                </p>
                <h1 className="text-[20px] font-semibold text-slate-50">
                  {activeGroup ? activeGroup.name : "Select a group"}
                </h1>
                <p className="text-[11px] text-slate-400 mt-1">
                  {activeGroup
                    ? activeGroup.destination
                    : "No groups found for your account yet."}
                </p>
                {activeGroup && !activeGroup.ai_group_kn_summary && (
                  <div className="mt-2 px-2 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 flex items-center gap-1 w-fit">
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
                    <span className="text-[9px] text-amber-300">
                      Processing group data...
                    </span>
                  </div>
                )}
              </div>

              {/* Controls */}
              <div className="flex flex-col gap-3 mb-6">
                <div className="flex items-center gap-2 text-[10px]">
                  <div className="px-2 py-1 rounded-full bg-slate-900/80 border border-slate-700/70 flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                    <span className="text-slate-400">
                      Connected to live backend
                    </span>
                  </div>
                </div>
                {userGroups.length > 1 && (
                  <div className="flex flex-col gap-1 text-[11px] text-slate-400">
                    <span>Your groups:</span>
                    <div className="flex flex-col gap-1.5">
                      {userGroups.map((g) => (
                        <button
                          key={g.id}
                          onClick={() => setActiveGroupId(g.id)}
                          className={`w-full px-3 py-1.5 rounded-lg border text-left transition-colors ${
                            g.id === activeGroupId
                              ? "bg-emerald-400/10 border-emerald-400/60 text-emerald-300"
                              : "bg-slate-900/90 border-slate-700/70 text-slate-300 hover:border-emerald-400/40 hover:text-emerald-300"
                          }`}
                        >
                          {g.name} • {g.destination}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
                <Link
                  href="/welcome"
                  className="w-full px-3 py-2 rounded-lg bg-slate-900/90 border border-slate-700/70 hover:border-emerald-400/60 hover:text-emerald-300 transition-colors text-[12px] text-left"
                >
                  Manage / switch group
                </Link>
                <button
                  onClick={handleGeneratePlans}
                  className="w-full px-3 py-2 rounded-lg bg-emerald-400/10 border border-emerald-400/30 text-emerald-300 flex items-center justify-center gap-2 text-[12px] disabled:opacity-60 disabled:cursor-not-allowed"
                  disabled={loadingPlans || loadingRecs || !activeGroup}
                >
                  <Sparkles size={12} className={(loadingPlans || loadingRecs) ? "animate-spin" : ""} />
                  {loadingRecs
                    ? "Fetching recommendations..."
                    : loadingPlans
                    ? "Generating plans..."
                    : activeGroup
                    ? "Generate plan for this group"
                    : "Select a group to generate plans"}
                </button>
                <button
                  onClick={handleViewTraits}
                  className="w-full px-3 py-2 rounded-lg bg-slate-900/90 border border-slate-700/70 hover:border-sky-400/60 hover:text-sky-300 transition-colors flex items-center justify-center gap-2 text-[12px] disabled:opacity-60 disabled:cursor-not-allowed"
                  disabled={loadingTraits || !activeGroup}
                >
                  <Users size={12} className={loadingTraits ? "animate-spin" : ""} />
                  {loadingTraits ? "Loading traits..." : "View Group Traits"}
                </button>
                {process.env.NODE_ENV === 'development' && (
                  <button
                    onClick={async () => {
                      if (!activeGroup) return;
                      try {
                        const plan = await createPlanByGroupName({
                          group_name: activeGroup.name,
                          raw_data: {
                            short_trip: recs?.short_trip ?? {},
                            long_trip: recs?.long_trip ?? {},
                          },
                        });
                        const options = plan.plan_json?.plan_options || [];
                        setPlans(options);
                        setActiveTab("Whiteboard");
                      } catch (e: any) {
                        setError(e?.message || "Debug plan creation failed.");
                      }
                    }}
                    className="w-full px-3 py-1.5 rounded-lg bg-slate-900/50 border border-slate-700/50 hover:border-amber-400/60 hover:text-amber-300 transition-colors flex items-center justify-center gap-2 text-[10px] disabled:opacity-60 disabled:cursor-not-allowed"
                    disabled={!activeGroup}
                  >
                    <MapPin size={10} />
                    Debug: Plan by Name
                  </button>
                )}
              </div>

              {/* Members List */}
              <div className="flex-1 overflow-auto">
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-6 h-6 rounded-xl bg-emerald-400/10 border border-emerald-400/30 flex items-center justify-center text-emerald-300">
                    <Users size={14} />
                  </div>
                  <p className="text-[12px] font-semibold text-slate-50">
                    Group Members
                  </p>
                </div>
                <div className="flex flex-col gap-2">
                  {groupMembers.length === 0 && (
                    <p className="text-[10px] text-slate-500">
                      Members will appear here once your backend has group
                      membership data wired in.
                    </p>
                  )}
                  {groupMembers.map((m) => (
                    <div
                      key={m.id || m.name}
                      className="flex items-center justify-between gap-2 p-2 rounded-lg bg-slate-900/50 border border-slate-800/50"
                    >
                      <div className="flex items-center gap-2">
                        <div
                          className={`w-8 h-8 rounded-xl flex items-center justify-center text-[10px] text-slate-950 font-semibold ${m.color}`}
                        >
                          {m.initials}
                        </div>
                        <div className="flex flex-col leading-tight">
                          <span className="text-[12px] font-medium text-slate-50">
                            {m.name}
                          </span>
                          <span className="text-[10px] text-slate-400">
                            {m.role}
                          </span>
                        </div>
                      </div>
                      <span className="px-2 py-0.5 rounded-full bg-slate-900/90 border border-slate-800/80 text-[9px] text-emerald-300/90">
                        editing
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Footer Info */}
              <div className="mt-auto pt-4 border-t border-slate-800/50">
                <p className="text-[10px] text-slate-500">
                  Live collaboration enabled
                </p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {sidebarCollapsed && (
          <div className="flex flex-col items-center py-6 gap-4">
            <div className="w-8 h-8 rounded-xl bg-emerald-400/10 border border-emerald-400/30 flex items-center justify-center text-emerald-300">
              <Users size={16} />
            </div>
          </div>
        )}
      </motion.aside>

      {/* Main Canvas Area */}
      <main className="flex-1 relative overflow-hidden">
        {/* Subtle grid background */}
        <div
          className="pointer-events-none absolute inset-0 opacity-[0.06]"
          style={{
            backgroundImage:
              "linear-gradient(to right, rgba(148,163,253,0.18) 1px, transparent 1px), linear-gradient(to bottom, rgba(148,163,253,0.18) 1px, transparent 1px)",
            backgroundSize: "46px 46px",
          }}
        />
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(45,212,191,0.05),transparent)]" />

        {/* Canvas */}
        <div className="relative h-full w-full rounded-[40px] bg-slate-50 m-4 shadow-[0_24px_70px_rgba(15,23,42,0.9)] overflow-hidden">
          {/* Floating tubelight navbar */}
          <TubelightNavBar
            items={navItems}
            activeTab={activeTab}
            onTabChange={setActiveTab}
            className="absolute top-6 left-1/2 -translate-x-1/2 z-30"
          />

          {/* Grid overlay */}
          <div
            className="pointer-events-none absolute inset-0 opacity-[0.12]"
            style={{
              backgroundImage:
                "linear-gradient(to right, rgba(148,163,253,0.25) 1px, transparent 1px), linear-gradient(to bottom, rgba(148,163,253,0.22) 1px, transparent 1px)",
              backgroundSize: "40px 40px",
            }}
          />
          
          {/* Vignette */}
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(15,23,42,0.08),transparent)]" />

          {/* Content Area */}
          <div className="relative z-10 h-full flex flex-col items-center justify-center gap-3 text-center pt-20 px-8">
            <AnimatePresence mode="wait">
              {activeTab === "Whiteboard" && (
                <motion.div
                  key="whiteboard"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="w-full max-w-4xl mx-auto flex flex-col gap-4 items-stretch text-left"
                >
                  {!plans && !loadingPlans && !error && (
                    activeGroup ? (
                      <div className="flex flex-col items-center gap-3 text-center">
                        <Sparkles className="text-slate-400" size={40} />
                        <p className="text-[20px] font-semibold text-slate-600">
                          Hit "Generate plan" on the left to fetch AI-curated itineraries
                          for {activeGroup.name}.
                        </p>
                        <p className="text-[16px] text-slate-500 max-w-2xl leading-relaxed">
                          You'll see multiple plan options laid out here with their
                          day-wise schedule and source links, powered by your backend.
                        </p>
                      </div>
                    ) : (
                      <div className="flex flex-col items-center gap-3 text-center">
                        <Sparkles className="text-slate-400" size={32} />
                        <p className="text-[16px] text-slate-600">
                          No groups found. Create a group from the welcome screen to
                          begin planning.
                        </p>
                      </div>
                    )
                  )}

                  {loadingPlans && (
                    <div className="flex flex-col items-center gap-3 text-center">
                      <Sparkles className="text-slate-400" size={40} />
                      <p className="text-[20px] font-semibold text-slate-600">
                        Hit "Generate plan" on the left to fetch AI-curated itineraries for your group.
                      </p>
                      <p className="text-[16px] text-slate-500 max-w-2xl leading-relaxed">
                        You'll see multiple plan options laid out here with their day-wise schedule and source links.
                      </p>
                    </div>
                  )}

                  {loadingPlans && (
                    <div className="flex flex-col items-center gap-3 text-center">
                      <Sparkles className="text-emerald-400" size={32} />
                      <TextShimmer className="font-mono text-[11px]">
                        {loadingMessages[loadingMessageIndex]}
                      </TextShimmer>
                      <p className="text-[9px] text-slate-400 max-w-sm">
                        This may take up to a couple of minutes while we gather and verify the best options for your group.
                      </p>
                    </div>
                  )}

                  {error && (
                    <div className="rounded-2xl border border-red-300 bg-red-50 px-4 py-3 text-[13px] text-red-700">
                      {error}
                    </div>
                  )}

                  {plans && plans.length > 0 && !loadingPlans && (
                    <div className="space-y-5">
                      <p className="text-[19px] font-semibold text-slate-700">
                        Choose from {plans.length} suggested plans based on your group's vibe.
                      </p>
                      <p className="text-[16px] text-slate-600 max-w-4xl">
                        Each card shows a clear day-wise breakdown, why it fits your group, and all the verified
                        source links used to craft it. Everything is expanded and readable so your entire group can skim quickly.
                      </p>
                      <div className="grid md:grid-cols-3 gap-4">
                        {plans.map((plan: PlanOption) => (
                          <div
                            key={plan.plan_id}
                            className="relative flex flex-col gap-2 rounded-2xl bg-white/95 border border-slate-200/90 shadow-[0_14px_40px_rgba(15,23,42,0.12)] px-3 py-3"
                          >
                            <div className="text-[10px] uppercase tracking-[0.14em] text-emerald-500">
                              {plan.plan_type.replace(/_/g, " ")}
                            </div>
                            <div className="text-[17px] font-semibold text-slate-900 leading-snug">
                              {plan.plan_variant}
                            </div>
                            <div className="text-[14px] text-slate-600">
                              {plan.why_fit_user}
                            </div>

                            {/* Schedule - compact */}
                            <div className="mt-2 space-y-2 max-h-72 overflow-y-auto pr-1">
                              {plan.schedule.map((day: PlanOption["schedule"][number]) => (
                                <div key={day.day} className="border-l border-emerald-200 pl-2">
                                  <div className="text-[13px] font-semibold text-emerald-600">
                                    Day {day.day} • {day.date}
                                  </div>
                                  {day.activities.map(
                                    (
                                      act: PlanOption["schedule"][number]["activities"][number],
                                      idx: number
                                    ) => (
                                    <div key={idx} className="text-[12px] text-slate-700 mt-1">
                                      <div className="font-semibold text-slate-900 text-[12px]">
                                        {act.time} · {act.activity_title}
                                      </div>
                                      <div className="text-slate-600 text-[11px]">
                                        {act.location}
                                      </div>
                                      <div className="text-slate-500 text-[11px]">
                                        {act.description}
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              ))}
                            </div>

                            {/* Sources */}
                            {plan.sources && plan.sources.length > 0 && (
                              <div className="mt-3 pt-2 border-t border-slate-100 space-y-1.5">
                                <div className="text-[13px] font-semibold text-slate-700">
                                  Sources used
                                </div>
                                <div className="flex flex-col gap-1.5">
                                  {plan.sources.map(
                                    (src: PlanOption["sources"][number], idx: number) => (
                                    <a
                                      key={idx}
                                      href={src.url}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      className="text-[12px] text-emerald-600 hover:text-emerald-700 hover:underline break-all"
                                      title={`${src.title} — ${src.used_for}`}
                                    >
                                      {src.used_for || src.title || src.url}
                                    </a>
                                  ))}
                                </div>
                              </div>
                            )}

                            <div className="mt-1 flex justify-between items-center">
                              <span className="text-[11px] text-slate-500">
                                Plan ID: {plan.plan_id}
                              </span>
                              <span className="px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 text-[11px] border border-emerald-100">
                                View with group
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </motion.div>
              )}
              
              {activeTab === "Members" && (
                <motion.div
                  key="members"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="w-full max-w-2xl"
                >
                  {traits && (
                    <div className="mb-6 p-4 rounded-2xl bg-sky-50 border border-sky-200">
                      <h3 className="text-[16px] font-semibold text-sky-900 mb-2">
                        Group Traits Summary
                      </h3>
                      <p className="text-[14px] text-sky-700 mb-3">
                        {traits.group_members.length} members analyzed
                      </p>
                      <div className="flex flex-wrap gap-2">
                        {traits.group_members.slice(0, 3).map((member, idx) => (
                          <div
                            key={idx}
                            className="px-3 py-2 rounded-xl bg-sky-100 text-sky-800 text-[12px] whitespace-pre-wrap break-words max-w-full"
                          >
                            {member.ai_summary || "No summary available"}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                  <div className="grid grid-cols-2 gap-4">
                    {groupMembers.map((m) => (
                      <div
                        key={m.id || m.name}
                        className="p-4 rounded-2xl bg-white border border-slate-200 shadow-sm"
                      >
                        <div className="flex items-center gap-3">
                          <div
                            className={`w-12 h-12 rounded-2xl flex items-center justify-center text-[14px] text-slate-950 font-semibold ${m.color}`}
                          >
                            {m.initials}
                          </div>
                          <div className="flex flex-col">
                            <span className="text-[14px] font-medium text-slate-900">
                              {m.name}
                            </span>
                            <span className="text-[12px] text-slate-500">
                              {m.role || "Member"}
                            </span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </motion.div>
              )}
              
              {activeTab === "Ideas" && (
                <motion.div
                  key="ideas"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="flex flex-col items-center gap-2"
                >
                  <MapPin className="text-slate-400" size={32} />
                  <p className="text-[14px] font-medium text-slate-500">
                    Trip ideas and destinations
                  </p>
                  <p className="text-[12px] text-slate-400 max-w-md">
                    Collect and vote on destination ideas for your group trip.
                  </p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </main>
    </div>
  );
}

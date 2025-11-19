"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Users, MapPin, Sparkles, ChevronLeft, ChevronRight, ArrowUpRight, ExternalLink } from "lucide-react";
import { TextShimmer } from "@/components/ui/text-shimmer";
import { GlassCard } from "@/components/ui/glass-card";
import { cn } from "@/lib/utils";
import { useAppStore } from "@/store/app-store";
import {
  getUserInfo,
  createPlanForGroup,
  getRecommendations,
  processGroup,
  getGroupTraits,
  GroupTraitsResponse,
  RecommendationsResponse,
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
      <div className="flex items-center gap-3 bg-zinc-950/80 border border-white/10 backdrop-blur-xl py-1 px-1 rounded-full shadow-2xl shadow-black/50">
        {items.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.name;

          return (
            <button
              key={item.name}
              onClick={() => onTabChange(item.name)}
              className={cn(
                "relative cursor-pointer text-xs font-semibold px-5 py-2.5 rounded-full transition-all duration-300",
                isActive
                  ? "text-emerald-300"
                  : "text-zinc-400 hover:text-emerald-200"
              )}
            >
              <span className="hidden md:inline">{item.name}</span>
              <span className="md:hidden flex items-center gap-1">
                <Icon size={16} strokeWidth={2.4} />
                {!isMobile && item.name}
              </span>
              {isActive && (
                <motion.div
                  layoutId="lamp"
                  className="absolute inset-0 w-full rounded-full -z-10 bg-white/5 border border-white/5"
                  initial={false}
                  transition={{
                    type: "spring",
                    stiffness: 300,
                    damping: 30,
                  }}
                >
                  {/* Tubelight glow at top */}
                  <div className="absolute -top-2 left-1/2 -translate-x-1/2 w-8 h-1 bg-emerald-400 rounded-full shadow-[0_0_12px_rgba(52,211,153,0.8)]">
                    <div className="absolute inset-0 bg-emerald-300 rounded-full blur-[2px]" />
                  </div>
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

interface BackendMember {
  id?: string;
  name?: string;
  email?: string;
  role?: string;
}

export default function AppShellPage() {
  const router = useRouter();
  const { currentUser } = useAppStore();
  const [activeGroupId, setActiveGroupId] = useState<string | null>(null);
  const [userGroups, setUserGroups] = useState<
    { id: string; name: string; destination: string; ai_group_kn_summary?: string; plans?: PlanOption[] }[]
  >([]);
  const [groupMembers, setGroupMembers] = useState<GroupMember[]>([]);
  const [plans, setPlans] = useState<PlanOption[] | null>(null);
  const [loadingPlans, setLoadingPlans] = useState(false);
  const [loadingRecs, setLoadingRecs] = useState(false);
  const [loadingTraits, setLoadingTraits] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState("Whiteboard");
  const [recs, setRecs] = useState<RecommendationsResponse | null>(null);
  const [traits, setTraits] = useState<GroupTraitsResponse | null>(null);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  const loadingMessages = [
    "Generating a plan tailored to your group&apos;s vibe...",
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
          // We need to access the raw members data from the API response which might not be fully typed in the client yet
          // casting to any to access members for now, but ideally we should update UserInfoResponse
          const firstGroupRaw = (info as unknown as { groups: { members: BackendMember[] }[] }).groups[0];

          if (firstGroupRaw?.members) {
            setGroupMembers(
              firstGroupRaw.members.map((m: BackendMember, idx: number) => {
                const name = m.name || m.email || "Member";
                const initials = String(name)
                  .split(" ")
                  .map((p: string) => p[0])
                  .join("")
                  .slice(0, 2)
                  .toUpperCase();
                const palette = [
                  "bg-emerald-500/20 text-emerald-300 border-emerald-500/30",
                  "bg-sky-500/20 text-sky-300 border-sky-500/30",
                  "bg-fuchsia-500/20 text-fuchsia-300 border-fuchsia-500/30",
                  "bg-amber-500/20 text-amber-300 border-amber-500/30",
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
      } catch (e: unknown) {
        console.error("Failed to load user info for app shell:", e);
        const errorMessage = e instanceof Error ? e.message : "Unable to load your workspace. Please refresh or try again.";
        setError(errorMessage);
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
    } catch (e: unknown) {
      // KN not ready: offer rebuild and retry path
      // We need to check if e has a code property. Since it's unknown, we need to cast or check safely.
      const err = e as { code?: string; message?: string };

      if (err?.code === "KN_NOT_READY") {
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
        setError(err?.message || "Something went wrong while generating plans for this group.");
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
    } catch (e: unknown) {
      const errorMessage = e instanceof Error ? e.message : "Unable to load group traits.";
      setError(errorMessage);
    } finally {
      setLoadingTraits(false);
    }
  }

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-50 flex font-sans selection:bg-emerald-500/30">
      {/* Left Sidebar */}
      <motion.aside
        animate={{ width: sidebarCollapsed ? "70px" : "300px" }}
        transition={{ duration: 0.4, type: "spring", bounce: 0.2 }}
        className="relative border-r border-white/5 bg-zinc-950/80 backdrop-blur-xl flex flex-col z-20"
      >
        {/* Collapse Button */}
        <button
          onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
          className="absolute -right-3 top-8 z-50 w-6 h-6 rounded-full bg-zinc-900 border border-zinc-800 flex items-center justify-center text-zinc-400 hover:text-emerald-300 hover:border-emerald-400/60 transition-all shadow-lg"
        >
          {sidebarCollapsed ? <ChevronRight size={14} /> : <ChevronLeft size={14} />}
        </button>

        <AnimatePresence mode="wait">
          {!sidebarCollapsed && (
            <motion.div
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -10 }}
              transition={{ duration: 0.2 }}
              className="flex flex-col h-full p-5"
            >
              {/* Header */}
              <div className="mb-8">
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.6)]" />
                  <p className="text-[10px] uppercase tracking-[0.2em] text-emerald-400/80 font-bold">
                    Workspace
                  </p>
                </div>
                <h1 className="text-2xl font-bold text-zinc-100 tracking-tight leading-tight">
                  {activeGroup ? activeGroup.name : "Select a group"}
                </h1>
                <p className="text-xs text-zinc-500 mt-1 font-medium">
                  {activeGroup
                    ? activeGroup.destination
                    : "No groups found for your account yet."}
                </p>
                {activeGroup && !activeGroup.ai_group_kn_summary && (
                  <div className="mt-3 px-2.5 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 flex items-center gap-2 w-fit">
                    <span className="relative flex h-2 w-2">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-500"></span>
                    </span>
                    <span className="text-[10px] font-medium text-amber-300">
                      Processing group data...
                    </span>
                  </div>
                )}
              </div>

              {/* Controls */}
              <div className="flex flex-col gap-3 mb-6">
                <div className="flex items-center justify-between text-[10px] mb-1 px-1">
                  <span className="text-zinc-500 font-medium uppercase tracking-wider">Active Groups</span>
                  <div className="flex items-center gap-1.5 text-emerald-400/80">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                    <span>Live</span>
                  </div>
                </div>

                {userGroups.length > 1 && (
                  <div className="flex flex-col gap-1.5 mb-2">
                    {userGroups.map((g) => (
                      <button
                        key={g.id}
                        onClick={() => setActiveGroupId(g.id)}
                        className={cn(
                          "w-full px-3 py-2 rounded-xl border text-left transition-all text-xs font-medium",
                          g.id === activeGroupId
                            ? "bg-white/5 border-emerald-500/30 text-emerald-100 shadow-lg shadow-emerald-900/10"
                            : "bg-transparent border-transparent text-zinc-500 hover:bg-white/5 hover:text-zinc-300"
                        )}
                      >
                        <div className="flex justify-between items-center">
                          <span className="truncate">{g.name}</span>
                          {g.id === activeGroupId && <div className="w-1 h-1 rounded-full bg-emerald-400" />}
                        </div>
                      </button>
                    ))}
                  </div>
                )}

                <Link
                  href="/welcome"
                  className="w-full px-4 py-2.5 rounded-xl bg-zinc-900/50 border border-white/5 hover:bg-zinc-800/50 hover:border-white/10 transition-all text-xs text-zinc-400 hover:text-zinc-200 text-center font-medium"
                >
                  Manage / Switch Group
                </Link>

                <div className="h-px bg-white/5 my-2" />

                <button
                  onClick={handleGeneratePlans}
                  className="group relative w-full px-4 py-3 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 text-white font-semibold text-xs shadow-lg shadow-emerald-900/20 hover:shadow-emerald-900/40 transition-all active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed overflow-hidden"
                  disabled={loadingPlans || loadingRecs || !activeGroup}
                >
                  <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300" />
                  <div className="relative flex items-center justify-center gap-2">
                    <Sparkles size={14} className={(loadingPlans || loadingRecs) ? "animate-spin" : ""} />
                    {loadingRecs
                      ? "Fetching Data..."
                      : loadingPlans
                        ? "Generating..."
                        : activeGroup
                          ? "Generate Plan"
                          : "Select Group"}
                  </div>
                </button>

                <button
                  onClick={handleViewTraits}
                  className="w-full px-4 py-2.5 rounded-xl bg-zinc-900/50 border border-white/5 hover:bg-zinc-800/50 hover:border-white/10 hover:text-sky-300 transition-all flex items-center justify-center gap-2 text-xs font-medium text-zinc-400 disabled:opacity-60"
                  disabled={loadingTraits || !activeGroup}
                >
                  <Users size={14} className={loadingTraits ? "animate-spin" : ""} />
                  {loadingTraits ? "Loading..." : "View Group Traits"}
                </button>
              </div>

              {/* Members List */}
              <div className="flex-1 overflow-auto min-h-0">
                <div className="flex items-center gap-2 mb-4 px-1">
                  <Users size={14} className="text-zinc-500" />
                  <p className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">
                    Members
                  </p>
                </div>
                <div className="flex flex-col gap-2">
                  {groupMembers.length === 0 && (
                    <p className="text-xs text-zinc-600 italic px-1">
                      No members yet.
                    </p>
                  )}
                  {groupMembers.map((m) => (
                    <div
                      key={m.id || m.name}
                      className="flex items-center justify-between gap-2 p-2 rounded-xl hover:bg-white/5 transition-colors group"
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className={cn(
                            "w-8 h-8 rounded-lg flex items-center justify-center text-[10px] font-bold border",
                            m.color
                          )}
                        >
                          {m.initials}
                        </div>
                        <div className="flex flex-col leading-none gap-1">
                          <span className="text-xs font-medium text-zinc-200 group-hover:text-white transition-colors">
                            {m.name}
                          </span>
                          <span className="text-[10px] text-zinc-500">
                            {m.role || "Member"}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Footer Info */}
              <div className="mt-auto pt-4 border-t border-white/5">
                <div className="flex items-center gap-2 text-[10px] text-zinc-600">
                  <div className="w-1.5 h-1.5 rounded-full bg-emerald-500/50" />
                  Collaboration active
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {sidebarCollapsed && (
          <div className="flex flex-col items-center py-8 gap-6">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500/20 to-teal-500/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
              <span className="font-bold">G</span>
            </div>
            <div className="w-8 h-8 rounded-lg bg-zinc-900 flex items-center justify-center text-zinc-500">
              <Users size={16} />
            </div>
          </div>
        )}
      </motion.aside>

      {/* Main Canvas Area */}
      <main className="flex-1 relative overflow-hidden bg-zinc-950">
        {/* Background Ambience */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-[-20%] left-[-10%] w-[60%] h-[60%] rounded-full bg-emerald-900/10 blur-[120px]" />
          <div className="absolute bottom-[-20%] right-[-10%] w-[60%] h-[60%] rounded-full bg-blue-900/10 blur-[120px]" />
          <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.02]" />
        </div>

        {/* Canvas Container */}
        <div className="relative h-full w-full flex flex-col">
          {/* Floating Navbar */}
          <div className="absolute top-6 left-1/2 -translate-x-1/2 z-30">
            <TubelightNavBar
              items={navItems}
              activeTab={activeTab}
              onTabChange={setActiveTab}
            />
          </div>

          {/* Content Scroll Area */}
          <div className="flex-1 overflow-y-auto overflow-x-hidden pt-28 pb-10 px-4 md:px-10">
            <div className="max-w-6xl mx-auto">
              <AnimatePresence mode="wait">
                {activeTab === "Whiteboard" && (
                  <motion.div
                    key="whiteboard"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    className="flex flex-col gap-8"
                  >
                    {!plans && !loadingPlans && !error && (
                      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center gap-6">
                        <div className="w-24 h-24 rounded-full bg-zinc-900/50 border border-white/5 flex items-center justify-center shadow-2xl shadow-black/50">
                          <Sparkles className="text-zinc-600" size={40} />
                        </div>
                        <div className="max-w-md space-y-2">
                          <h2 className="text-2xl font-bold text-zinc-200">
                            Ready to plan {activeGroup ? activeGroup.name : "your trip"}?
                          </h2>
                          <p className="text-zinc-500 leading-relaxed">
                            {activeGroup
                              ? "Hit 'Generate Plan' in the sidebar to let our AI craft personalized itineraries based on your group's preferences."
                              : "Select a group from the sidebar to get started."}
                          </p>
                        </div>
                      </div>
                    )}

                    {loadingPlans && (
                      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center gap-8">
                        <div className="relative">
                          <div className="absolute inset-0 bg-emerald-500/20 blur-xl rounded-full animate-pulse" />
                          <Sparkles className="relative text-emerald-400 animate-spin-slow" size={48} />
                        </div>
                        <div className="space-y-3">
                          <TextShimmer className="font-mono text-sm text-emerald-300">
                            {loadingMessages[loadingMessageIndex]}
                          </TextShimmer>
                          <p className="text-xs text-zinc-500 max-w-xs mx-auto">
                            Analyzing preferences, checking availability, and crafting the perfect route...
                          </p>
                        </div>
                      </div>
                    )}

                    {error && (
                      <div className="mx-auto max-w-md rounded-2xl border border-red-500/20 bg-red-500/10 px-6 py-4 text-sm text-red-200 text-center">
                        {error}
                      </div>
                    )}

                    {plans && plans.length > 0 && !loadingPlans && (
                      <div className="space-y-8">
                        <div className="text-center space-y-2">
                          <h2 className="text-3xl font-bold text-zinc-100 tracking-tight">
                            Suggested Itineraries
                          </h2>
                          <p className="text-zinc-500 max-w-2xl mx-auto">
                            We found {plans.length} distinct options that match your group&apos;s vibe.
                            Review the day-by-day breakdown and choose your favorite.
                          </p>
                        </div>

                        <div className="grid md:grid-cols-3 gap-6">
                          {plans.map((plan: PlanOption, idx: number) => (
                            <motion.div
                              key={plan.plan_id}
                              initial={{ opacity: 0, y: 20 }}
                              animate={{ opacity: 1, y: 0 }}
                              transition={{ delay: idx * 0.1 }}
                            >
                              <GlassCard className="h-full flex flex-col p-0 overflow-hidden border-white/10 bg-zinc-900/40 hover:bg-zinc-900/60">
                                {/* Card Header */}
                                <div className="p-6 border-b border-white/5 bg-white/[0.02]">
                                  <div className="flex justify-between items-start mb-3">
                                    <span className="text-[10px] font-bold uppercase tracking-widest text-emerald-400 bg-emerald-500/10 px-2 py-1 rounded-md border border-emerald-500/20">
                                      {plan.plan_type.replace(/_/g, " ")}
                                    </span>
                                    <span className="text-[10px] text-zinc-500 font-mono">
                                      #{plan.plan_id.slice(0, 4)}
                                    </span>
                                  </div>
                                  <h3 className="text-lg font-bold text-zinc-100 leading-tight mb-2">
                                    {plan.plan_variant}
                                  </h3>
                                  <p className="text-xs text-zinc-400 leading-relaxed line-clamp-3">
                                    {plan.why_fit_user}
                                  </p>
                                </div>

                                {/* Schedule */}
                                <div className="flex-1 p-6 space-y-6 overflow-y-auto max-h-[400px] custom-scrollbar">
                                  {plan.schedule.map((day) => (
                                    <div key={day.day} className="relative pl-4 border-l border-white/10">
                                      <div className="absolute -left-[5px] top-0 w-2.5 h-2.5 rounded-full bg-zinc-800 border border-zinc-600" />
                                      <div className="mb-3">
                                        <span className="text-xs font-bold text-emerald-300 block">
                                          Day {day.day}
                                        </span>
                                        <span className="text-[10px] text-zinc-500 uppercase tracking-wider">
                                          {day.date}
                                        </span>
                                      </div>

                                      <div className="space-y-4">
                                        {day.activities.map((act, i) => (
                                          <div key={i} className="group/act">
                                            <div className="flex items-baseline gap-2 mb-1">
                                              <span className="text-[10px] font-mono text-zinc-500 whitespace-nowrap">
                                                {act.time}
                                              </span>
                                              <span className="text-sm font-medium text-zinc-200 group-hover/act:text-emerald-200 transition-colors">
                                                {act.activity_title}
                                              </span>
                                            </div>
                                            <p className="text-xs text-zinc-400 pl-[42px] mb-1">
                                              {act.description}
                                            </p>
                                            <div className="flex items-center gap-1 pl-[42px] text-[10px] text-zinc-600">
                                              <MapPin size={10} />
                                              {act.location}
                                            </div>
                                          </div>
                                        ))}
                                      </div>
                                    </div>
                                  ))}
                                </div>

                                {/* Footer / Sources */}
                                <div className="p-4 bg-black/20 border-t border-white/5">
                                  {plan.sources && plan.sources.length > 0 && (
                                    <div className="flex flex-wrap gap-2 mb-4">
                                      {plan.sources.slice(0, 3).map((src, i) => (
                                        <a
                                          key={i}
                                          href={src.url}
                                          target="_blank"
                                          rel="noopener noreferrer"
                                          className="flex items-center gap-1 text-[10px] text-zinc-500 hover:text-emerald-400 transition-colors bg-white/5 px-2 py-1 rounded-md"
                                        >
                                          <ExternalLink size={10} />
                                          <span className="truncate max-w-[100px]">{src.title || "Source"}</span>
                                        </a>
                                      ))}
                                    </div>
                                  )}
                                  <button className="w-full py-2.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/5 hover:border-white/10 text-xs font-medium text-zinc-300 transition-all flex items-center justify-center gap-2 group">
                                    <span>Select this plan</span>
                                    <ArrowUpRight size={14} className="opacity-50 group-hover:opacity-100 transition-opacity" />
                                  </button>
                                </div>
                              </GlassCard>
                            </motion.div>
                          ))}
                        </div>
                      </div>
                    )}
                  </motion.div>
                )}

                {activeTab === "Members" && (
                  <motion.div
                    key="members"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    className="max-w-3xl mx-auto"
                  >
                    {traits && (
                      <GlassCard className="mb-8 border-sky-500/20 bg-sky-900/10">
                        <div className="p-6">
                          <div className="flex items-center gap-3 mb-4">
                            <div className="p-2 rounded-lg bg-sky-500/20 text-sky-400">
                              <Sparkles size={20} />
                            </div>
                            <div>
                              <h3 className="text-lg font-bold text-sky-100">Group Vibe Analysis</h3>
                              <p className="text-xs text-sky-300/70">Based on {traits.group_members.length} members</p>
                            </div>
                          </div>

                          <div className="grid gap-3">
                            {traits.group_members.slice(0, 3).map((member, idx) => (
                              <div
                                key={idx}
                                className="p-3 rounded-xl bg-sky-950/30 border border-sky-500/10 text-sm text-sky-200/80 leading-relaxed"
                              >
                                <span className="font-semibold text-sky-400 mr-2">
                                  {member.email?.split('@')[0] || "Member"}:
                                </span>
                                {member.ai_summary || "No summary available"}
                              </div>
                            ))}
                          </div>
                        </div>
                      </GlassCard>
                    )}

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {groupMembers.map((m) => (
                        <GlassCard key={m.id || m.name} className="p-4 flex items-center gap-4 hover:bg-white/5 transition-colors">
                          <div
                            className={cn(
                              "w-12 h-12 rounded-xl flex items-center justify-center text-sm font-bold border shadow-lg",
                              m.color
                            )}
                          >
                            {m.initials}
                          </div>
                          <div>
                            <h4 className="font-medium text-zinc-200">{m.name}</h4>
                            <p className="text-xs text-zinc-500">{m.role || "Member"}</p>
                          </div>
                        </GlassCard>
                      ))}
                    </div>
                  </motion.div>
                )}

                {activeTab === "Ideas" && (
                  <motion.div
                    key="ideas"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    className="flex flex-col items-center justify-center min-h-[50vh] text-center"
                  >
                    <div className="w-20 h-20 rounded-full bg-zinc-900/50 border border-white/5 flex items-center justify-center mb-6">
                      <MapPin className="text-zinc-600" size={32} />
                    </div>
                    <h3 className="text-xl font-bold text-zinc-200 mb-2">Trip Ideas</h3>
                    <p className="text-zinc-500 max-w-md">
                      Collaborate on destination ideas and vote for your favorites. Coming soon.
                    </p>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

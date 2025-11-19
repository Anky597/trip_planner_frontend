"use client";

import { FormEvent, useEffect, useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useAppStore } from "@/store/app-store";
import { getUserInfo, createGroup as apiCreateGroup, addMember } from "@/lib/api-client";
import { GroupInfo } from "@/lib/api-client";
import { motion } from "framer-motion";
import { Plus, ArrowUpRight, Users, Calendar, Wallet, Sparkles, LogOut, Search } from "lucide-react";
import { CreateGroupModal } from "@/components/create-group-modal";
import { GlassCard } from "@/components/ui/glass-card";
import { cn } from "@/lib/utils";

// Wrapper to satisfy Next.js requirement: useSearchParams must be inside a Suspense boundary
export default function WelcomePage() {
  return (
    <Suspense fallback={null}>
      <WelcomePageInner />
    </Suspense>
  );
}

function WelcomePageInner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const {
    currentUser,
    groups,
    createGroup,
    selectGroup,
    leaveGroup,
  } = useAppStore();
  const [mounted, setMounted] = useState(false);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [justCreated, setJustCreated] = useState(false);
  const [userGroups, setUserGroups] = useState<GroupInfo[]>([]);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    setMounted(true);
  }, []);

  // Show banner if we arrive with ?created=1
  useEffect(() => {
    if (searchParams?.get("created") === "1") {
      setJustCreated(true);
    }
  }, [searchParams]);

  useEffect(() => {
    if (!mounted) return;
    if (!currentUser) {
      router.replace("/auth");
      return;
    }
    if (currentUser.isNew) {
      router.replace("/survey");
      return;
    }
  }, [mounted, currentUser, router]);

  useEffect(() => {
    if (!currentUser) return;
    (async () => {
      try {
        const info = await getUserInfo(currentUser.email);
        setUserGroups(info.groups);
      } catch (error) {
        console.error("Failed to load user groups:", error);
      }
    })();
  }, [currentUser]);

  if (!mounted || !currentUser) {
    return null;
  }

  const allGroups = [
    ...userGroups.map(g => ({
      id: g.id,
      name: g.name,
      destinationLabel: g.destination,
      status: "planning" as const,
    })),
    {
      id: "demo-blr",
      name: "Bangalore Crew",
      destinationLabel: "3N • Gokarna + Goa coastal loop",
      status: "Live",
      isDemo: true,
    },
    {
      id: "demo-goa",
      name: "Goa NYE Squad",
      destinationLabel: "5N • Villas, beach clubs, sunsets",
      status: "Draft",
      isDemo: true,
    },
    {
      id: "demo-himachal",
      name: "Himachal Workation",
      destinationLabel: "10N • Manali + Dharamshala cabins",
      status: "Locked",
      isDemo: true,
    },
  ].filter(g => g.name.toLowerCase().includes(searchQuery.toLowerCase()));

  async function handleCreateGroup(name: string, destination: string) {
    if (!currentUser) return;
    try {
      await apiCreateGroup({
        group_name: name.trim(),
        destination: destination.trim() || "Planning in progress",
        creator_email: currentUser.email,
      });
      const info = await getUserInfo(currentUser.email);
      setUserGroups(info.groups);
      // Ensure banner is shown reliably by updating the URL with a flag
      router.replace("/welcome?created=1");
    } catch (error) {
      console.error("Failed to create group:", error);
      throw error; // Re-throw to let modal handle error state if needed
    }
  }

  return (
    <>
      <CreateGroupModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSubmit={handleCreateGroup}
      />

      <section className="fixed inset-0 bg-zinc-950 text-zinc-50 text-[15px] overflow-hidden font-sans">
        {/* Background Ambience */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] rounded-full bg-emerald-900/10 blur-[120px]" />
          <div className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[50%] rounded-full bg-blue-900/10 blur-[120px]" />
          <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.03]" />
        </div>

        {/* Soft banner: prompt refresh after group creation */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: justCreated ? 1 : 0, y: justCreated ? 0 : -20 }}
          className="absolute top-0 inset-x-0 z-50 pointer-events-none"
        >
          <div className="mx-auto max-w-screen-lg px-4 pt-4 pointer-events-auto">
            {justCreated && (
              <div className="flex items-center justify-between gap-3 rounded-xl border border-emerald-500/30 bg-emerald-950/80 backdrop-blur-md px-4 py-3 shadow-lg shadow-emerald-900/20">
                <div className="flex items-center gap-2 text-emerald-200">
                  <Sparkles size={14} />
                  <span className="text-sm font-medium">Group created successfully!</span>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => window.location.reload()}
                    className="px-3 py-1.5 rounded-lg bg-emerald-500/20 border border-emerald-500/40 text-emerald-100 text-xs font-medium hover:bg-emerald-500/30 transition"
                  >
                    Refresh List
                  </button>
                  <button
                    onClick={() => setJustCreated(false)}
                    className="p-1.5 rounded-lg hover:bg-emerald-500/10 text-emerald-400/60 hover:text-emerald-300 transition"
                  >
                    <span className="sr-only">Dismiss</span>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 6L6 18M6 6l12 12" /></svg>
                  </button>
                </div>
              </div>
            )}
          </div>
        </motion.div>

        <div className="relative h-full w-full flex">
          {/* Sidebar */}
          <aside className="relative h-full w-[260px] bg-zinc-950/50 border-r border-white/5 backdrop-blur-xl flex flex-col justify-between p-5 z-20">
            <div className="space-y-8">
              {/* Brand */}
              <div className="flex items-center gap-3 px-2">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 grid place-items-center text-white shadow-lg shadow-emerald-900/20">
                  <span className="font-bold text-lg">G</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-base font-bold text-zinc-100 tracking-tight">
                    GroupQuest
                  </span>
                  <span className="text-[11px] text-zinc-500 font-medium uppercase tracking-wider">
                    Workspace
                  </span>
                </div>
              </div>

              {/* Nav list */}
              <nav className="space-y-1">
                <NavItem active icon={<Users size={18} />} label="Groups" badge="Now" />
                <NavItem icon={<Calendar size={18} />} label="Calendar" />
                <NavItem icon={<Wallet size={18} />} label="Budget & Splits" />
                <NavItem icon={<Sparkles size={18} />} label="Inspiration" />
              </nav>
            </div>

            {/* User Profile */}
            <div className="pt-4 border-t border-white/5">
              <div className="flex items-center gap-3 p-2 rounded-xl hover:bg-white/5 transition group cursor-pointer">
                <div className="w-9 h-9 rounded-full bg-zinc-800 border border-zinc-700 grid place-items-center text-xs font-medium text-zinc-300 group-hover:border-zinc-600 transition">
                  {currentUser.name.slice(0, 2).toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium text-zinc-200 truncate">{currentUser.name}</div>
                  <div className="text-xs text-zinc-500 truncate">{currentUser.email}</div>
                </div>
                <button
                  onClick={() => {
                    (useAppStore as any).setState({ currentUser: null });
                    router.replace("/auth");
                  }}
                  className="p-1.5 rounded-lg text-zinc-500 hover:text-red-400 hover:bg-red-400/10 transition"
                  title="Logout"
                >
                  <LogOut size={16} />
                </button>
              </div>
            </div>
          </aside>

          {/* Main Content */}
          <main className="flex-1 flex flex-col min-w-0 bg-gradient-to-br from-zinc-950 via-zinc-900/50 to-zinc-950">
            {/* Header */}
            <header className="h-20 px-8 flex items-center justify-between border-b border-white/5 bg-zinc-950/30 backdrop-blur-sm sticky top-0 z-10">
              <div>
                <h1 className="text-2xl font-bold text-zinc-100 tracking-tight">Your Crews</h1>
                <p className="text-sm text-zinc-500 mt-0.5">Manage your trips and planning workspaces</p>
              </div>

              <div className="flex items-center gap-4">
                <div className="relative group">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500 group-focus-within:text-zinc-300 transition" size={16} />
                  <input
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-64 h-10 rounded-xl bg-zinc-900/50 border border-white/5 pl-10 pr-4 text-sm text-zinc-200 placeholder-zinc-600 outline-none focus:bg-zinc-900 focus:border-zinc-700 transition-all"
                    placeholder="Search groups..."
                  />
                </div>
                <button
                  onClick={() => setIsCreateModalOpen(true)}
                  className="h-10 px-4 rounded-xl bg-zinc-100 hover:bg-white text-zinc-950 text-sm font-semibold shadow-lg shadow-zinc-900/20 hover:shadow-zinc-100/10 transition-all flex items-center gap-2 active:scale-95"
                >
                  <Plus size={16} />
                  <span>New Crew</span>
                </button>
              </div>
            </header>

            {/* Grid */}
            <div className="flex-1 overflow-y-auto p-8">
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-6">
                {/* Create New Card */}
                <motion.button
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.05 }}
                  onClick={() => setIsCreateModalOpen(true)}
                  className="group relative h-[200px] rounded-3xl border-2 border-dashed border-zinc-800 hover:border-zinc-600 bg-zinc-900/20 hover:bg-zinc-900/40 transition-all flex flex-col items-center justify-center gap-4 text-zinc-500 hover:text-zinc-300"
                >
                  <div className="w-16 h-16 rounded-full bg-zinc-900 border border-zinc-800 group-hover:scale-110 group-hover:border-zinc-600 transition-all grid place-items-center">
                    <Plus size={32} className="opacity-50 group-hover:opacity-100 transition-opacity" />
                  </div>
                  <div className="text-center">
                    <span className="block text-sm font-semibold">Create a fresh crew</span>
                    <span className="text-xs opacity-60">Start a new adventure</span>
                  </div>
                </motion.button>

                {/* Group Cards */}
                {allGroups.map((g, index) => {
                  const isReal = !("isDemo" in g);
                  return (
                    <motion.div
                      key={g.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.1 + index * 0.05 }}
                    >
                      <GlassCard
                        className="h-[200px] p-6 flex flex-col justify-between group cursor-pointer"
                        onClick={() => {
                          if (!isReal) {
                            const existing = groups.find((real) => real.name === g.name);
                            const created = existing || createGroup(g.name, g.destinationLabel || "");
                            selectGroup(created.id);
                            router.push(`/app?group=${created.id}`);
                          } else {
                            selectGroup(g.id);
                            router.push(`/app?group=${g.id}`);
                          }
                        }}
                      >
                        <div className="flex justify-between items-start">
                          <div className="space-y-1">
                            <span className={cn(
                              "inline-flex items-center px-2 py-1 rounded-md text-[10px] font-medium border",
                              isReal
                                ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-400"
                                : "bg-amber-500/10 border-amber-500/20 text-amber-400"
                            )}>
                              {isReal ? "ACTIVE WORKSPACE" : "DEMO PREVIEW"}
                            </span>
                            <h3 className="text-xl font-bold text-zinc-100 leading-tight group-hover:text-white transition-colors">
                              {g.name}
                            </h3>
                          </div>
                          <div className="w-8 h-8 rounded-full bg-white/5 border border-white/10 grid place-items-center text-zinc-400 group-hover:bg-white/10 group-hover:text-white transition-colors">
                            <ArrowUpRight size={16} />
                          </div>
                        </div>

                        <div className="space-y-4">
                          <p className="text-sm text-zinc-400 line-clamp-2 leading-relaxed">
                            {g.destinationLabel || "Planning in progress"}
                          </p>

                          <div className="flex items-center justify-between pt-4 border-t border-white/5">
                            <div className="flex -space-x-2">
                              {[...Array(3)].map((_, i) => (
                                <div key={i} className="w-6 h-6 rounded-full bg-zinc-800 border border-zinc-900 ring-2 ring-zinc-950" />
                              ))}
                            </div>
                            <span className="text-xs font-medium text-zinc-500 group-hover:text-zinc-400 transition-colors">
                              {g.status || "Planning"}
                            </span>
                          </div>
                        </div>
                      </GlassCard>
                    </motion.div>
                  );
                })}
              </div>
            </div>
          </main>
        </div>
      </section>
    </>
  );
}

function NavItem({ icon, label, active, badge }: { icon: React.ReactNode, label: string, active?: boolean, badge?: string }) {
  return (
    <button className={cn(
      "w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-sm font-medium transition-all",
      active
        ? "bg-zinc-800/50 text-zinc-100 shadow-inner shadow-white/5"
        : "text-zinc-500 hover:text-zinc-300 hover:bg-zinc-900/50"
    )}>
      <div className="flex items-center gap-3">
        {icon}
        <span>{label}</span>
      </div>
      {badge && (
        <span className="px-1.5 py-0.5 rounded-md bg-emerald-500/10 text-emerald-400 text-[10px] font-bold tracking-wide">
          {badge}
        </span>
      )}
    </button>
  );
}

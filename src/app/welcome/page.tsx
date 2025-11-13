"use client";

import { FormEvent, useEffect, useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useAppStore } from "@/store/app-store";
import { getUserInfo, createGroup as apiCreateGroup, addMember } from "@/lib/api-client";
import { GroupInfo } from "@/lib/api-client";

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
    joinGroupByCode,
    selectGroup,
    leaveGroup,
  } = useAppStore();
  const [mounted, setMounted] = useState(false);
  const [dummyGroups] = useState([
    {
      id: "dummy-blr",
      name: "Bangalore Boys & Girl",
      destinationLabel: "3N / Gokarna + Goa circuit",
      status: "planning",
    },
    {
      id: "dummy-goa",
      name: "Goa NYE Squad",
      destinationLabel: "5N / North + South Goa villas",
      status: "draft",
    },
    {
      id: "dummy-himachal",
      name: "Himachal Workation Crew",
      destinationLabel: "10N / Manali + Dharamshala",
      status: "finalized",
    },
  ]);
  const [creatingName, setCreatingName] = useState("");
  const [creatingDestination, setCreatingDestination] = useState("");
  const [joinCode, setJoinCode] = useState("");
  const [loading, setLoading] = useState<null | "create" | "join">(null);
  const [justCreated, setJustCreated] = useState(false);
  const [userGroups, setUserGroups] = useState<GroupInfo[]>([]);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Show banner if we arrive with ?created=1
  useEffect(() => {
    if (searchParams?.get("created") === "1") {
      setJustCreated(true);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
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
  ];

  async function handleCreate(e: FormEvent) {
    e.preventDefault();
    if (!creatingName.trim() || !currentUser) return;
    setLoading("create");
    try {
      await apiCreateGroup({
        group_name: creatingName.trim(),
        destination: creatingDestination.trim() || "Planning in progress",
        creator_email: currentUser.email,
      });
      const info = await getUserInfo(currentUser.email);
      setUserGroups(info.groups);
      setLoading(null);
      // Ensure banner is shown reliably by updating the URL with a flag
      router.replace("/welcome?created=1");
    } catch (error) {
      console.error("Failed to create group:", error);
      setLoading(null);
    }
  }

  async function handleJoin(e: FormEvent) {
    e.preventDefault();
    if (!joinCode.trim() || !currentUser) return;
    setLoading("join");
    try {
      await addMember(joinCode.trim(), { user_email: currentUser.email });
      const info = await getUserInfo(currentUser.email);
      setUserGroups(info.groups);
      setLoading(null);
      router.push(`/app?group=${joinCode.trim()}`);
    } catch (error) {
      console.error("Failed to join group:", error);
      setLoading(null);
    }
  }

  // Hidden form for programmatic group creation
  return (
    <>
      <form onSubmit={handleCreate} style={{ display: 'none' }}>
        <input type="text" value={creatingName} onChange={(e) => setCreatingName(e.target.value)} />
        <input type="text" value={creatingDestination} onChange={(e) => setCreatingDestination(e.target.value)} />
        <button type="submit">Submit</button>
      </form>

      <section className="fixed inset-0 bg-zinc-950 text-zinc-50 text-[15px]">
      {/* Soft banner: prompt refresh after group creation */}
      {justCreated && (
        <div className="absolute top-0 inset-x-0 z-50">
          <div className="mx-auto max-w-screen-lg px-4 pt-3">
            <div className="flex items-center justify-between gap-3 rounded-xl border border-emerald-400/40 bg-emerald-500/10 px-4 py-2">
              <span className="text-[12px] text-emerald-300">
                Group created successfully. Refresh the page to see it in your list.
              </span>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => window.location.reload()}
                  className="px-3 py-1.5 rounded-md bg-emerald-400/20 border border-emerald-400/60 text-emerald-200 text-[11px] hover:bg-emerald-400/30 transition"
                >
                  Refresh now
                </button>
                <button
                  onClick={() => setJustCreated(false)}
                  className="px-2 py-1.5 rounded-md bg-zinc-900/70 border border-zinc-700/70 text-zinc-300 text-[11px] hover:text-zinc-100 transition"
                >
                  Dismiss
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      {/* Shared accent styling with auth/survey */}
      <style>{`
        .welcome-shell-animate {opacity:0;transform:translateY(18px);animation:fadeWelcomeUp .7s cubic-bezier(.22,.61,.36,1) .18s forwards;}
        @keyframes fadeWelcomeUp {to {opacity:1;transform:translateY(0);}}
        .welcome-accent-grid{position:absolute;inset:0;pointer-events:none;opacity:.65}
        .welcome-hline,.welcome-vline{position:absolute;background:#27272a;will-change:transform,opacity}
        .welcome-hline{left:0;right:0;height:1px;transform:scaleX(0);transform-origin:50% 50%;animation:welcomeDrawX .8s cubic-bezier(.22,.61,.36,1) forwards}
        .welcome-vline{top:0;bottom:0;width:1px;transform:scaleY(0);transform-origin:50% 0%;animation:welcomeDrawY .9s cubic-bezier(.22,.61,.36,1) forwards}
        .welcome-hline:nth-child(1){top:18%;animation-delay:.05s}
        .welcome-hline:nth-child(2){top:50%;animation-delay:.12s}
        .welcome-hline:nth-child(3){top:82%;animation-delay:.19s}
        .welcome-vline:nth-child(4){left:16%;animation-delay:.26s}
        .welcome-vline:nth-child(5){left:50%;animation-delay:.33s}
        .welcome-vline:nth-child(6){left:84%;animation-delay:.4s}
        .welcome-hline::after,.welcome-vline::after{content:"";position:absolute;inset:0;background:linear-gradient(90deg,transparent,rgba(250,250,250,.18),transparent);opacity:0;animation:welcomeShimmer .9s ease-out forwards}
        .welcome-hline:nth-child(1)::after{animation-delay:.05s}
        .welcome-hline:nth-child(2)::after{animation-delay:.12s}
        .welcome-hline:nth-child(3)::after{animation-delay:.19s}
        .welcome-vline:nth-child(4)::after{animation-delay:.26s}
        .welcome-vline:nth-child(5)::after{animation-delay:.33s}
        .welcome-vline:nth-child(6)::after{animation-delay:.4s}
        @keyframes welcomeDrawX{0%{transform:scaleX(0);opacity:0}60%{opacity:.95}100%{transform:scaleX(1);opacity:.6}}
        @keyframes welcomeDrawY{0%{transform:scaleY(0);opacity:0}60%{opacity:.95}100%{transform:scaleY(1);opacity:.6}}
        @keyframes welcomeShimmer{0%{opacity:0}35%{opacity:.22}100%{opacity:0}}
      `}</style>

      {/* Subtle vignette to mirror auth */}
      <div className="absolute inset-0 pointer-events-none [background:radial-gradient(80%_60%_at_50%_30%,rgba(255,255,255,0.06),transparent_60%)]" />

      {/* Accent grid lines */}
      <div className="welcome-accent-grid">
        <div className="welcome-hline" />
        <div className="welcome-hline" />
        <div className="welcome-hline" />
        <div className="welcome-vline" />
        <div className="welcome-vline" />
        <div className="welcome-vline" />
      </div>

      <div className="relative h-full w-full flex">
        {/* Left navigation rail similar to sample UI */}
        <aside className="welcome-shell-animate relative h-full w-[220px] bg-zinc-950/98 border-r border-zinc-900/90 px-4 py-5 flex flex-col justify-between gap-4 text-[14px]">
          <div className="space-y-5">
            {/* Brand */}
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-zinc-900/90 border border-zinc-700/80 grid place-items-center text-[14px] text-zinc-50">
                ☰
              </div>
              <div className="flex flex-col leading-tight">
                <span className="text-[12px] font-semibold text-zinc-50">
                  GroupQuest
                </span>
                <span className="text-[10px] text-zinc-500">
                  Shared trip console
                </span>
              </div>
            </div>

            {/* Nav list */}
            <nav className="space-y-1.5 text-[13px]">
              <button className="w-full flex items-center justify-between px-3 py-2 rounded-lg bg-zinc-900/90 text-zinc-50 border border-zinc-800">
                <span>Groups</span>
                <span className="text-[10px] text-emerald-400">Now</span>
              </button>
              <button className="w-full text-left px-3 py-2 rounded-lg text-zinc-500 hover:bg-zinc-900/70 hover:text-zinc-100 transition">
                Calendar
              </button>
              <button className="w-full text-left px-3 py-2 rounded-lg text-zinc-500 hover:bg-zinc-900/70 hover:text-zinc-100 transition">
                Budget & splits
              </button>
              <button className="w-full text-left px-3 py-2 rounded-lg text-zinc-500 hover:bg-zinc-900/70 hover:text-zinc-100 transition">
                Inspiration
              </button>
            </nav>
          </div>

          {/* Current user + logout */}
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-full bg-emerald-500/15 border border-emerald-400/40 text-[11px] text-emerald-300 grid place-items-center">
                {currentUser.name.slice(0, 2).toUpperCase()}
              </div>
              <div className="flex flex-col">
                <span className="text-[11px] text-zinc-400">Signed in</span>
                <span className="text-[12px] text-zinc-100 font-medium truncate max-w-[120px]">
                  {currentUser.name}
                </span>
              </div>
            </div>
            <button
              type="button"
              onClick={() => {
                (useAppStore as any).setState({ currentUser: null });
                router.replace("/auth");
              }}
              className="w-full mt-1 inline-flex items-center justify-center gap-1.5 rounded-lg border border-zinc-800 bg-zinc-950/90 px-3 py-1.5 text-[10px] text-zinc-500 hover:border-red-500/70 hover:text-red-400 transition"
            >
              <span>Logout</span>
            </button>
          </div>
        </aside>

        {/* Main content area: grid of group cards like sample UI */}
        <main className="flex-1 flex flex-col gap-4 px-7 py-6">
          {/* Top bar */}
          <header className="flex items-center justify-between gap-5">
            <div className="flex flex-col">
              <h1 className="text-[22px] font-semibold text-zinc-50">
                Your trip groups
              </h1>
              <p className="text-[12px] text-zinc-500">
                Open any card to jump into its dedicated planning workspace.
              </p>
            </div>
            <div className="flex items-center gap-2">
              <input
                className="w-64 rounded-lg bg-zinc-950/90 border border-zinc-800 px-3.5 py-2 text-[11px] text-zinc-100 placeholder-zinc-600 outline-none focus-visible:ring-2 focus-visible:ring-zinc-400 focus-visible:ring-offset-0 transition"
                placeholder="Search groups"
              />
              <button
                type="button"
                onClick={() => {
                  const name = `New crew ${userGroups.length + 1}`;
                  setCreatingName(name);
                  setCreatingDestination("Planning in progress");
                  // This will trigger the form submission
                  setTimeout(() => {
                    const form = document.querySelector('form') as HTMLFormElement;
                    if (form) form.requestSubmit();
                  }, 100);
                }}
                className="inline-flex items-center gap-1.5 rounded-lg bg-zinc-50 text-zinc-950 text-[11px] font-medium px-3.5 py-2 hover:bg-zinc-200 transition shadow-[0_10px_24px_rgba(250,250,250,0.16)]"
              >
                + Quick create
              </button>
            </div>
          </header>

          {/* Groups grid */}
          <section className="welcome-shell-animate flex-1 overflow-y-auto">
            <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4">
              {allGroups.map((g, index) => {
                const isReal = !("isDemo" in g);
                const palette = [
                  "bg-emerald-500/10 border-emerald-400/40",
                  "bg-pink-500/10 border-pink-400/40",
                  "bg-sky-500/10 border-sky-400/40",
                  "bg-violet-500/10 border-violet-400/40",
                  "bg-amber-500/10 border-amber-400/40",
                  "bg-teal-500/10 border-teal-400/40",
                ];
                const colorClass = palette[index % palette.length];

                return (
                  <div
                    key={g.id}
                    className={`relative flex flex-col items-start justify-between rounded-2xl border ${colorClass} px-4 py-3.5 min-h-[150px] text-left shadow-[0_18px_40px_rgba(0,0,0,0.95)] hover:translate-y-0.5 hover:shadow-[0_22px_52px_rgba(0,0,0,1)] transition group`}
                  >
                    <button
                      type="button"
                      onClick={() => {
                        // For demo items, ensure there is a concrete store group then open it
                        if (!isReal) {
                          const existing = groups.find(
                            (real) => real.name === g.name
                          );
                          const created =
                            existing ||
                            createGroup(g.name, g.destinationLabel || "");
                          selectGroup(created.id);
                          router.push(`/app?group=${created.id}`);
                        } else {
                          selectGroup(g.id);
                          router.push(`/app?group=${g.id}`);
                        }
                      }}
                      className="absolute inset-0 rounded-2xl focus-visible:outline-none"
                    >
                      <span className="sr-only">
                        Open {g.name} workspace
                      </span>
                    </button>

                    <div className="flex items-start justify-between w-full gap-1.5 pointer-events-none">
                      <div className="flex flex-col gap-0.5">
                        <span className="text-[11px] text-zinc-400">
                          {isReal ? "Your crew" : "Demo crew"}
                        </span>
                        <h2 className="text-[16px] font-semibold text-zinc-50 leading-snug">
                          {g.name}
                        </h2>
                        <p className="text-[11px] text-zinc-400 line-clamp-2">
                          {g.destinationLabel || "Planning in progress"}
                        </p>
                      </div>
                      <div className="flex flex-col items-end gap-1">
                        <span className="px-2 py-0.5 rounded-full bg-zinc-950/90 border border-zinc-800 text-[9px] text-zinc-400">
                          {g.status || "Planning"}
                        </span>
                        <span className="text-[10px] text-emerald-400">
                          Open ↗
                        </span>
                      </div>
                    </div>

                    <div className="mt-2 flex items-center gap-1.5 text-[9px] text-zinc-500 pointer-events-none">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400/80" />
                      <span>
                        {isReal
                          ? "Workspace live"
                          : "Click to generate this demo workspace"}
                      </span>
                    </div>

                    {isReal && (
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          e.preventDefault();
                          if (
                            window.confirm(
                              "Leave this group? You can always rejoin later with its code."
                            )
                          ) {
                            leaveGroup(g.id);
                          }
                        }}
                        className="relative mt-2 inline-flex items-center gap-1.5 rounded-full border border-red-500/40 bg-zinc-950/95 px-2.5 py-1 text-[9px] text-red-300 opacity-0 group-hover:opacity-100 group-hover:translate-y-0.5 transition pointer-events-auto"
                      >
                        <span>Leave group</span>
                        <span className="text-[10px]">✕</span>
                      </button>
                    )}
                  </div>
                );
              })}

              {/* Create new group card */}
              <div
                className="flex flex-col items-start justify-between rounded-2xl border border-dashed border-zinc-700/80 bg-zinc-950/90 px-4 py-3.5 min-h-[150px] text-left text-zinc-500 hover:border-zinc-50/80 hover:text-zinc-50 hover:bg-zinc-900/95 transition cursor-pointer"
                onClick={() => {
                  const name = window.prompt(
                    "Name your crew",
                    `Crew ${userGroups.length + 1}`
                  );
                  if (!name || !name.trim()) return;
                  const destination =
                    window.prompt(
                      "Where are you headed? (destination / vibe)",
                      "Goa NYE, Himachal workation, Bali villas..."
                    ) || "Planning in progress";
                  setCreatingName(name.trim());
                  setCreatingDestination(destination.trim() || "Planning in progress");
                  // Trigger form submission
                  setTimeout(() => {
                    const form = document.querySelector('form') as HTMLFormElement;
                    if (form) form.requestSubmit();
                  }, 100);
                }}
              >
                <div className="flex items-start justify-between w-full gap-1.5">
                  <div className="flex flex-col gap-0.5">
                    <span className="text-[11px] uppercase tracking-[0.16em]">
                      New group
                    </span>
                    <h2 className="text-[16px] font-semibold">
                      Create a fresh crew
                    </h2>
                    <p className="text-[11px]">
                      Start from scratch with your own people and plans.
                    </p>
                  </div>
                  <span className="mt-0.5 text-[18px]">＋</span>
                </div>
                <div className="mt-2 text-[9px]">
                  Ask for crew name and destination before creating.
                </div>
              </div>
            </div>
          </section>
        </main>
      </div>
    </section>
    </>
  );
}

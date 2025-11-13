"use client";

import * as React from "react";
import { useState, useRef, useEffect, FormEvent } from "react";
import { useRouter } from "next/navigation";
import { useAppStore } from "@/store/app-store";
import { getUserInfo } from "@/lib/api-client";
import {
  Eye,
  EyeOff,
  Github,
  Lock,
  Mail,
  ArrowRight,
  Chrome,
} from "lucide-react";

// Local minimal shadcn-style primitives (no external components/ui or lib/utils)

function cn(...classes: (string | false | null | undefined)[]) {
  return classes.filter(Boolean).join(" ");
}

const Card = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      "rounded-lg border bg-zinc-900/70 text-zinc-50 shadow-xl backdrop-blur",
      className
    )}
    {...props}
  />
));
Card.displayName = "Card";

const CardHeader = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("flex flex-col space-y-1.5 p-6", className)}
    {...props}
  />
));
CardHeader.displayName = "CardHeader";

const CardTitle = React.forwardRef<
  HTMLHeadingElement,
  React.HTMLAttributes<HTMLHeadingElement>
>(({ className, ...props }, ref) => (
  <h2
    ref={ref}
    className={cn(
      "text-2xl font-semibold leading-none tracking-tight",
      className
    )}
    {...props}
  />
));
CardTitle.displayName = "CardTitle";

const CardDescription = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement>
>(({ className, ...props }, ref) => (
  <p
    ref={ref}
    className={cn("text-sm text-zinc-400", className)}
    {...props}
  />
));
CardDescription.displayName = "CardDescription";

const CardContent = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div ref={ref} className={cn("p-6 pt-0 grid gap-5", className)} {...props} />
));
CardContent.displayName = "CardContent";

const CardFooter = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      "flex items-center justify-center p-6 pt-0 text-xs text-zinc-500",
      className
    )}
    {...props}
  />
));
CardFooter.displayName = "CardFooter";

const Input = React.forwardRef<
  HTMLInputElement,
  React.InputHTMLAttributes<HTMLInputElement>
>(({ className, ...props }, ref) => (
  <input
    ref={ref}
    className={cn(
      "flex h-10 w-full rounded-md border border-zinc-800 bg-zinc-950/90 px-3 py-2 text-sm text-zinc-50 placeholder:text-zinc-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-400 focus-visible:ring-offset-0",
      className
    )}
    {...props}
  />
));
Input.displayName = "Input";

const Label = React.forwardRef<
  HTMLLabelElement,
  React.LabelHTMLAttributes<HTMLLabelElement>
>(({ className, ...props }, ref) => (
  <label
    ref={ref}
    className={cn(
      "text-xs font-medium text-zinc-300 leading-none mb-1.5",
      className
    )}
    {...props}
  />
));
Label.displayName = "Label";

interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "default" | "outline" | "ghost";
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "default", ...props }, ref) => {
    const base =
      "inline-flex items-center justify-center whitespace-nowrap rounded-md text-xs font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-400 focus-visible:ring-offset-0 disabled:pointer-events-none disabled:opacity-50";
    const variants: Record<NonNullable<ButtonProps["variant"]>, string> = {
      default: "bg-zinc-50 text-zinc-900 hover:bg-zinc-200",
      outline:
        "border border-zinc-800 bg-zinc-950 text-zinc-50 hover:bg-zinc-900/80",
      ghost: "bg-transparent text-zinc-300 hover:bg-zinc-900/60",
    };

    return (
      <button
        ref={ref}
        className={cn(base, variants[variant], className)}
        {...props}
      />
    );
  }
);
Button.displayName = "Button";

const Checkbox = React.forwardRef<
  HTMLButtonElement,
  React.ButtonHTMLAttributes<HTMLButtonElement> & { checked?: boolean }
>(({ className, checked, ...props }, ref) => (
  <button
    ref={ref}
    data-state={checked ? "checked" : "unchecked"}
    className={cn(
      "h-4 w-4 rounded-sm border border-zinc-700 flex items-center justify-center text-[10px] text-zinc-950",
      checked && "bg-zinc-50",
      className
    )}
    {...props}
  >
    {checked ? "✔" : null}
  </button>
));
Checkbox.displayName = "Checkbox";

const Separator = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("h-px w-full bg-zinc-800", className)}
    {...props}
  />
));
Separator.displayName = "Separator";

// Animated background + login card (UImix-style), wired as dummy auth
function LoginCardSection(props: {
  onSubmit: (data: { name: string; email: string }) => void;
}) {
  const { onSubmit } = props;
  const [showPassword, setShowPassword] = useState(false); // purely visual
  const [remember, setRemember] = useState(false); // purely visual
  const [formData, setFormData] = useState({ email: "", name: "" });

  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx) return;

    const setSize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    setSize();

    type P = { x: number; y: number; v: number; o: number };
    let ps: P[] = [];
    let raf = 0;

    const make = (): P => ({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      v: Math.random() * 0.25 + 0.05,
      o: Math.random() * 0.35 + 0.15,
    });

    const init = () => {
      ps = [];
      const count = Math.floor((canvas.width * canvas.height) / 9000);
      for (let i = 0; i < count; i++) ps.push(make());
    };

    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ps.forEach((p) => {
        p.y -= p.v;
        if (p.y < 0) {
          p.x = Math.random() * canvas.width;
          p.y = canvas.height + Math.random() * 40;
          p.v = Math.random() * 0.25 + 0.05;
          p.o = Math.random() * 0.35 + 0.15;
        }
        ctx.fillStyle = `rgba(250,250,250,${p.o})`;
        ctx.fillRect(p.x, p.y, 0.7, 2.2);
      });
      raf = requestAnimationFrame(draw);
    };

    const onResize = () => {
      setSize();
      init();
    };

    window.addEventListener("resize", onResize);
    init();
    raf = requestAnimationFrame(draw);

    return () => {
      window.removeEventListener("resize", onResize);
      cancelAnimationFrame(raf);
    };
  }, []);

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!formData.email.trim()) return;

    const name =
      formData.name.trim() ||
      formData.email.split("@")[0] ||
      "Trip Planner User";

    onSubmit({ name, email: formData.email.trim() });
  };

  return (
    <section className="fixed inset-0 bg-zinc-950 text-zinc-50">
      <style>{`
        .accent-lines{position:absolute;inset:0;pointer-events:none;opacity:.7}
        .hline,.vline{position:absolute;background:#27272a;will-change:transform,opacity}
        .hline{left:0;right:0;height:1px;transform:scaleX(0);transform-origin:50% 50%;animation:drawX .8s cubic-bezier(.22,.61,.36,1) forwards}
        .vline{top:0;bottom:0;width:1px;transform:scaleY(0);transform-origin:50% 0%;animation:drawY .9s cubic-bezier(.22,.61,.36,1) forwards}
        .hline:nth-child(1){top:18%;animation-delay:.12s}
        .hline:nth-child(2){top:50%;animation-delay:.22s}
        .hline:nth-child(3){top:82%;animation-delay:.32s}
        .vline:nth-child(4){left:22%;animation-delay:.42s}
        .vline:nth-child(5){left:50%;animation-delay:.54s}
        .vline:nth-child(6){left:78%;animation-delay:.66s}
        .hline::after,.vline::after{content:"";position:absolute;inset:0;background:linear-gradient(90deg,transparent,rgba(250,250,250,.24),transparent);opacity:0;animation:shimmer .9s ease-out forwards}
        .hline:nth-child(1)::after{animation-delay:.12s}
        .hline:nth-child(2)::after{animation-delay:.22s}
        .hline:nth-child(3)::after{animation-delay:.32s}
        .vline:nth-child(4)::after{animation-delay:.42s}
        .vline:nth-child(5)::after{animation-delay:.54s}
        .vline:nth-child(6)::after{animation-delay:.66s}
        @keyframes drawX{0%{transform:scaleX(0);opacity:0}60%{opacity:.95}100%{transform:scaleX(1);opacity:.7}}
        @keyframes drawY{0%{transform:scaleY(0);opacity:0}60%{opacity:.95}100%{transform:scaleY(1);opacity:.7}}
        @keyframes shimmer{0%{opacity:0}35%{opacity:.25}100%{opacity:0}}
        .card-animate {opacity:0;transform:translateY(20px);animation:fadeUp .8s cubic-bezier(.22,.61,.36,1) .4s forwards;}
        @keyframes fadeUp {to {opacity:1;transform:translateY(0);}}
      `}</style>

      {/* Subtle vignette */}
      <div className="absolute inset-0 pointer-events-none [background:radial-gradient(80%_60%_at_50%_30%,rgba(255,255,255,0.06),transparent_60%)]" />

      {/* Accent lines */}
      <div className="accent-lines">
        <div className="hline" />
        <div className="hline" />
        <div className="hline" />
        <div className="vline" />
        <div className="vline" />
        <div className="vline" />
      </div>

      {/* Particles */}
      <canvas
        ref={canvasRef}
        className="absolute inset-0 w-full h-full opacity-40 mix-blend-screen pointer-events-none"
      />

      {/* Header */}
      <header className="absolute inset-x-0 top-0 flex items-center justify-between px-6 py-4 border-b border-zinc-800/80">
        <span className="text-[10px] tracking-[0.16em] uppercase text-zinc-400">
          NOVA TRIP WORKSPACE
        </span>
        <Button
          variant="outline"
          className="h-8 px-3 rounded-lg gap-1"
          type="button"
        >
          <span className="text-[10px]">Contact</span>
          <ArrowRight className="h-3 w-3" />
        </Button>
      </header>

      {/* Centered Login Card */}
      <div className="h-full w-full grid place-items-center px-4">
        <Card className="card-animate w-full max-w-sm border-zinc-800 bg-zinc-900/70">
          <CardHeader>
            <CardTitle>Welcome back</CardTitle>
            <CardDescription>
              Sign in with your email to access your AI trip workspace.
            </CardDescription>
          </CardHeader>

          <CardContent>
            <form onSubmit={handleSubmit} className="grid gap-4">
              <div className="grid gap-1.5">
                <Label htmlFor="email">Email</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="you@example.com"
                    value={formData.email}
                    onChange={(e) =>
                      setFormData((f) => ({ ...f, email: e.target.value }))
                    }
                    className="pl-10"
                    required
                  />
                </div>
              </div>

              <div className="grid gap-1.5">
                <Label htmlFor="password">
                  Password (ignored, for visuals only)
                </Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500" />
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••"
                    className="pl-10 pr-9"
                  />
                  <button
                    type="button"
                    aria-label={showPassword ? "Hide password" : "Show password"}
                    className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 rounded-md text-zinc-400 hover:text-zinc-200"
                    onClick={() => setShowPassword((v) => !v)}
                  >
                    {showPassword ? (
                      <EyeOff className="h-3.5 w-3.5" />
                    ) : (
                      <Eye className="h-3.5 w-3.5" />
                    )}
                  </button>
                </div>
              </div>

              <div className="grid gap-1.5">
                <Label htmlFor="name">
                  Display name (optional, for the workspace)
                </Label>
                <Input
                  id="name"
                  type="text"
                  placeholder="Crew lead / alias"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData((f) => ({ ...f, name: e.target.value }))
                  }
                />
              </div>

              <div className="flex items-center justify-between gap-2 text-[10px] text-zinc-400">
                <div className="flex items-center gap-2">
                  <Checkbox
                    checked={remember}
                    onClick={() => setRemember((v) => !v)}
                  />
                  <span>Remember this device (visual only)</span>
                </div>
                <span className="hover:text-zinc-200 cursor-default">
                  Forgot password?
                </span>
              </div>

              <Button className="w-full h-9 mt-1">
                Continue
                <ArrowRight className="h-3.5 w-3.5 ml-1" />
              </Button>
            </form>

            <div className="relative mt-4">
              <Separator />
              <span className="absolute left-1/2 -translate-x-1/2 -top-3 bg-zinc-900/70 px-2 text-[9px] uppercase tracking-[0.16em] text-zinc-500">
                or
              </span>
            </div>

            <div className="grid grid-cols-2 gap-3 mt-1">
              <Button
                variant="outline"
                className="h-9"
                type="button"
              >
                <Github className="h-3.5 w-3.5 mr-1.5" />
                <span>GitHub</span>
              </Button>
              <Button
                variant="outline"
                className="h-9"
                type="button"
              >
                <Chrome className="h-3.5 w-3.5 mr-1.5" />
                <span>Google</span>
              </Button>
            </div>
          </CardContent>

          <CardFooter>
            <span>
              We use your email to load your groups, preferences, and trip plans.
            </span>
          </CardFooter>
        </Card>
      </div>
    </section>
  );
}

// Container: integrate dummy UI with Zustand + routing
export default function AuthPage() {
  const router = useRouter();
  const { setCurrentUser } = useAppStore();

  const handleSubmit = async (data: { name: string; email: string }) => {
    const normalizedEmail = data.email.trim().toLowerCase();
    if (!normalizedEmail) return;

    try {
      // Try to load existing user (and their groups/plans) from backend
      const info = await getUserInfo(normalizedEmail);

      // Existing user: hydrate from backend and go straight to app
      const backendUser = info.user;
      setCurrentUser({
        id: backendUser.id,
        name: backendUser.name,
        email: backendUser.email,
        isNew: false,
        persona: backendUser.ai_summary
          ? {
              id: backendUser.id,
              name: backendUser.name,
              summary: backendUser.ai_summary,
              preferences: [],
              avoidances: [],
            }
          : undefined,
      });

      router.push("/welcome");
    } catch (error: any) {
      // If user not found (404), send to survey to create via createUser
      if (error?.status === 404) {
        const displayName =
          data.name.trim() ||
          data.email.split("@")[0] ||
          "Trip Planner User";

        setCurrentUser({
          id: `pending_${Date.now()}`,
          name: displayName,
          email: normalizedEmail,
          isNew: true,
        });

        router.push("/survey");
        return;
      }

      // For other errors, log; you can replace with toast UI
      console.error("Auth error while fetching user info:", error);
    }
  };

  return <LoginCardSection onSubmit={handleSubmit} />;
}

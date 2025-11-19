"use client";

import { cn } from "@/lib/utils";
import { motion } from "framer-motion";

interface GlassCardProps extends React.HTMLAttributes<HTMLDivElement> {
    children: React.ReactNode;
    className?: string;
    hoverEffect?: boolean;
}

export function GlassCard({ children, className, hoverEffect = true, ...props }: GlassCardProps) {
    return (
        <div
            className={cn(
                "relative overflow-hidden rounded-2xl border border-white/5 bg-white/[0.02] backdrop-blur-sm",
                hoverEffect && "transition-all duration-300 hover:bg-white/[0.04] hover:border-white/10 hover:shadow-xl hover:-translate-y-1",
                className
            )}
            {...props}
        >
            {/* Noise texture overlay for premium feel */}
            <div className="absolute inset-0 opacity-[0.03] pointer-events-none bg-[url('https://grainy-gradients.vercel.app/noise.svg')]" />

            {/* Content */}
            <div className="relative z-10">
                {children}
            </div>
        </div>
    );
}

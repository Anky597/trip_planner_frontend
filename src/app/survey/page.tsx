"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { useAppStore, TravelPersona } from "@/store/app-store";
import { createUser } from "@/lib/api-client";

type MCQOption = {
  value: string;
  label: string;
};

type MCQQuestion = {
  id: number;
  question: string;
  options: string[];
  trait_map: string | string[];
};

const QUESTIONS: MCQQuestion[] = [
  {
    id: 1,
    question: "When you travel, how do you prefer to structure your days?",
    options: [
      "A. Packed schedule — I like doing a lot each day.",
      "B. Balanced — mix of activities and rest.",
      "C. Easy-going — a few highlights, no rush.",
    ],
    trait_map: "Pace",
  },
  {
    id: 2,
    question: "Who do you usually travel with?",
    options: [
      "A. Large group of friends or colleagues.",
      "B. Partner or 2–3 close friends.",
      "C. Solo trips — I prefer my own pace.",
    ],
    trait_map: "Social Interaction",
  },
  {
    id: 3,
    question: "What best describes your travel spending style?",
    options: [
      "A. Budget traveler — save wherever possible.",
      "B. Smart spender — spend on things that matter.",
      "C. Comfort first — quality over price.",
    ],
    trait_map: "Budget Consciousness",
  },
  {
    id: 4,
    question: "When exploring a new place, what excites you most?",
    options: [
      "A. Adrenaline — hikes, treks, or adventures.",
      "B. Discovery — food, markets, and local culture.",
      "C. Leisure — relaxing views, spas, and comfort.",
    ],
    trait_map: "Adventure Seeking",
  },
  {
    id: 5,
    question: "How interested are you in local culture and history?",
    options: [
      "A. Very — I visit museums, monuments, and cultural sites.",
      "B. Somewhat — I like local experiences but not deep dives.",
      "C. Not much — I focus more on fun and relaxation.",
    ],
    trait_map: "Cultural Curiosity",
  },
  {
    id: 6,
    question: "How much does nature factor into your ideal trip?",
    options: [
      "A. Central — I seek out parks, hikes, beaches, or wildlife.",
      "B. Somewhat — I like nature spots near the city.",
      "C. Minimal — I’m more into urban life and activities.",
    ],
    trait_map: "Nature Affinity",
  },
  {
    id: 7,
    question: "Where do you usually stay when traveling?",
    options: [
      "A. Hostels or budget hotels.",
      "B. Comfortable boutique hotels or Airbnbs.",
      "C. Resorts or high-end stays.",
    ],
    trait_map: "Luxury Orientation",
  },
  {
    id: 8,
    question: "What’s your idea of the perfect evening on vacation?",
    options: [
      "A. Exploring local nightlife or meeting people.",
      "B. Quiet dinner with friends or partner.",
      "C. Reading, movies, or spa time alone.",
    ],
    trait_map: "Social Interaction",
  },
  {
    id: 9,
    question: "When things don’t go as planned on a trip…",
    options: [
      "A. I adapt quickly — it’s part of the fun.",
      "B. I get a little stressed but manage.",
      "C. I prefer predictability — surprises throw me off.",
    ],
    trait_map: "Adventure Seeking",
  },
  {
    id: 10,
    question: "How do you decide what to eat while traveling?",
    options: [
      "A. Street food and local joints — best way to explore.",
      "B. Mix of local and comfort food.",
      "C. Fine dining or highly rated restaurants.",
    ],
    trait_map: ["Cultural Curiosity", "Budget Consciousness"],
  },
  {
    id: 11,
    question: "What’s your top priority when picking destinations?",
    options: [
      "A. Adventure and exploration opportunities.",
      "B. Relaxing or scenic places to unwind.",
      "C. Famous landmarks and cultural heritage.",
    ],
    trait_map: ["Adventure Seeking", "Cultural Curiosity"],
  },
  {
    id: 12,
    question: "How much does comfort influence your travel choices?",
    options: [
      "A. Not much — I value authenticity over comfort.",
      "B. Moderate — I need essentials but can rough it a bit.",
      "C. A lot — comfort and convenience come first.",
    ],
    trait_map: ["Luxury Orientation", "Budget Consciousness"],
  },
  {
    id: 13,
    question: "What’s your travel decision-making style?",
    options: [
      "A. I plan everything in advance.",
      "B. I set broad ideas but stay flexible.",
      "C. I prefer spontaneous, go-with-the-flow trips.",
    ],
    trait_map: "Pace",
  },
  {
    id: 14,
    question: "How do you recharge after a long day of travel?",
    options: [
      "A. Socializing — dinner with group or nightlife.",
      "B. Relaxing quietly — maybe reading or a walk.",
      "C. Spa or comfort experiences.",
    ],
    trait_map: ["Social Interaction", "Luxury Orientation"],
  },
  {
    id: 15,
    question: "Which type of photo do you post most often from trips?",
    options: [
      "A. Me doing something adventurous or unique.",
      "B. Beautiful scenery or peaceful views.",
      "C. Food, architecture, or aesthetic details.",
    ],
    trait_map: ["Adventure Seeking", "Nature Affinity", "Cultural Curiosity"],
  },
];

export default function SurveyPage() {
  const router = useRouter();
  const { currentUser, updateUserPersona, setCurrentUser } = useAppStore();
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);

  const question = QUESTIONS[step];

  async function handleNext(e: FormEvent) {
    e.preventDefault();
    if (!question) return;
    const value = (answers[String(question.id)] || "").trim();
    if (!value) return;

    if (step < QUESTIONS.length - 1) {
      setStep((s) => s + 1);
      return;
    }

    // Final submit: call backend to create user profile/persona using auth data
    setSubmitting(true);

    try {
      if (!currentUser || !currentUser.email) {
        console.error("No pending user from auth; redirecting to /auth.");
        router.push("/auth");
        return;
      }

      const email = currentUser.email;
      const name = currentUser.name || "Traveler";

      const user_answer = {
        answers,
      };

      const user = await createUser({
        email,
        name,
        user_answer,
      });

      // Update local persona in store with backend-generated summary
      const persona: TravelPersona = {
        id: user.id,
        name: user.name,
        summary: user.ai_summary,
        preferences: [],
        avoidances: [],
      };

      updateUserPersona(persona);
      setCurrentUser({ ...currentUser, isNew: false });

      router.push("/welcome");
    } catch (error) {
      console.error("Failed to create user from survey:", error);
      // Optionally surface a toast / inline message
    } finally {
      setSubmitting(false);
    }
  }

  function setAnswerForCurrent(value: string) {
    if (!question) return;
    setAnswers((prev) => ({ ...prev, [String(question.id)]: value }));
  }

  if (!question) {
    return null;
  }

  const progress = ((step + 1) / QUESTIONS.length) * 100;

  return (
    <section className="fixed inset-0 bg-zinc-950 text-zinc-50">
      {/* Shared accent styling with auth page */}
      <style>{`
        .survey-card-animate {opacity:0;transform:translateY(16px);animation:fadeSurveyUp .7s cubic-bezier(.22,.61,.36,1) .25s forwards;}
        @keyframes fadeSurveyUp {to {opacity:1;transform:translateY(0);}}
        .survey-accent-lines{position:absolute;inset:0;pointer-events:none;opacity:.65}
        .survey-hline,.survey-vline{position:absolute;background:#27272a;will-change:transform,opacity}
        .survey-hline{left:0;right:0;height:1px;transform:scaleX(0);transform-origin:50% 50%;animation:surveyDrawX .8s cubic-bezier(.22,.61,.36,1) forwards}
        .survey-vline{top:0;bottom:0;width:1px;transform:scaleY(0);transform-origin:50% 0%;animation:surveyDrawY .9s cubic-bezier(.22,.61,.36,1) forwards}
        .survey-hline:nth-child(1){top:20%;animation-delay:.05s}
        .survey-hline:nth-child(2){top:50%;animation-delay:.12s}
        .survey-hline:nth-child(3){top:80%;animation-delay:.19s}
        .survey-vline:nth-child(4){left:18%;animation-delay:.26s}
        .survey-vline:nth-child(5){left:50%;animation-delay:.33s}
        .survey-vline:nth-child(6){left:82%;animation-delay:.4s}
        .survey-hline::after,.survey-vline::after{content:"";position:absolute;inset:0;background:linear-gradient(90deg,transparent,rgba(250,250,250,.18),transparent);opacity:0;animation:surveyShimmer .9s ease-out forwards}
        .survey-hline:nth-child(1)::after{animation-delay:.05s}
        .survey-hline:nth-child(2)::after{animation-delay:.12s}
        .survey-hline:nth-child(3)::after{animation-delay:.19s}
        .survey-vline:nth-child(4)::after{animation-delay:.26s}
        .survey-vline:nth-child(5)::after{animation-delay:.33s}
        .survey-vline:nth-child(6)::after{animation-delay:.4s}
        @keyframes surveyDrawX{0%{transform:scaleX(0);opacity:0}60%{opacity:.95}100%{transform:scaleX(1);opacity:.6}}
        @keyframes surveyDrawY{0%{transform:scaleY(0);opacity:0}60%{opacity:.95}100%{transform:scaleY(1);opacity:.6}}
        @keyframes surveyShimmer{0%{opacity:0}35%{opacity:.22}100%{opacity:0}}
      `}</style>

      {/* Subtle vignette to mirror auth */}
      <div className="absolute inset-0 pointer-events-none [background:radial-gradient(80%_60%_at_50%_20%,rgba(250,250,250,0.05),transparent_60%)]" />

      {/* Accent grid lines */}
      <div className="survey-accent-lines">
        <div className="survey-hline" />
        <div className="survey-hline" />
        <div className="survey-hline" />
        <div className="survey-vline" />
        <div className="survey-vline" />
        <div className="survey-vline" />
      </div>

      <div className="relative h-full w-full grid place-items-center px-4">
        <div className="survey-card-animate w-full max-w-3xl rounded-3xl bg-zinc-900/80 border border-zinc-800/90 shadow-2xl backdrop-blur-xl">
          <div className="flex items-center justify-between gap-4 mb-6 px-8 pt-6">
            <div>
              <p className="text-[11px] md:text-xs uppercase tracking-[0.18em] text-zinc-400">
                Persona survey
              </p>
              <h1 className="text-2xl md:text-3xl font-semibold text-zinc-50">
                Help the AI understand your crew
              </h1>
              <p className="text-xs md:text-sm text-zinc-400 mt-1 max-w-xl">
                Just pick what feels right for your trips there are no wrong answers.
              </p>
            </div>
            <div className="text-right shrink-0">
              <div className="text-[10px] md:text-xs text-zinc-400">
                Step {step + 1} of {QUESTIONS.length}
              </div>
              <div className="mt-2 w-28 md:w-32 h-2 bg-zinc-900 rounded-full overflow-hidden border border-zinc-800/80">
                <div
                  className="h-full bg-zinc-50 transition-all duration-300"
                  style={{ width: `${progress}%` }}
                />
              </div>
              <div className="mt-1 text-[9px] md:text-[10px] text-zinc-500">
                Progress autosaved
              </div>
            </div>
          </div>
          <div className="px-8 pb-7 pt-1">

        <form onSubmit={handleNext} className="mt-4 space-y-5">
          <div className="space-y-3">
            <label className="block text-base md:text-lg font-semibold text-zinc-50 leading-snug">
              {question.question}
            </label>

            <div className="mt-3 grid grid-cols-1 gap-3">
              {question.options.map((opt) => {
                const selected = answers[String(question.id)] === opt;
                return (
                  <button
                    key={opt}
                    type="button"
                    onClick={() => setAnswerForCurrent(opt)}
                    className={`flex items-center justify-between rounded-2xl border px-4 py-3.5 text-[13px] md:text-sm text-left leading-relaxed transition ${
                      selected
                        ? "bg-zinc-50 text-zinc-900 border-zinc-300 shadow-[0_14px_40px_rgba(250,250,250,0.16)]"
                        : "bg-zinc-950/90 text-zinc-100 border-zinc-800/90 hover:border-zinc-500/80 hover:bg-zinc-900/90 hover:shadow-[0_10px_30px_rgba(0,0,0,0.65)]"
                    }`}
                  >
                    <span className="pr-4">{opt}</span>
                    {selected && (
                      <span className="ml-3 inline-flex items-center justify-center px-2 py-1 rounded-full bg-zinc-900/80 text-[10px] font-medium text-emerald-400 border border-zinc-700/80">
                        Selected
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="flex items-center justify-between gap-3 pt-2">
            <div className="flex items-center gap-1.5 text-[9px] md:text-[10px] text-zinc-500">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400/90 animate-pulse" />
              <span className="w-1.5 h-1.5 rounded-full bg-zinc-600/80" />
              <span className="w-1.5 h-1.5 rounded-full bg-zinc-700/70" />
              <span>Tap an option to continue</span>
            </div>
            <button
              type="submit"
              disabled={submitting || !(answers[String(question.id)] || "").trim()}
              className="inline-flex items-center gap-1.5 rounded-2xl bg-zinc-50 text-zinc-900 text-xs md:text-sm font-medium px-5 py-2.5 hover:bg-zinc-200 transition disabled:opacity-30 disabled:cursor-not-allowed shadow-[0_10px_32px_rgba(250,250,250,0.18)]"
            >
              <span>
                {step === QUESTIONS.length - 1
                  ? submitting
                    ? "Finishing..."
                    : "Finish & Continue"
                  : "Next"}
              </span>
              <span className="text-[10px]">↗</span>
            </button>
          </div>
        </form>
          </div>
        </div>
      </div>
    </section>
  );
}

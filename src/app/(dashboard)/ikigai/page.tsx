"use client";

import { useState, useEffect } from "react";
import { 
  Heart, 
  Brain, 
  Globe, 
  CircleDollarSign, 
  ArrowRight, 
  RotateCcw,
  Compass,
  ArrowUpRight,
  Target,
  Zap,
  CheckCircle2,
  Smile
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";

// --- Types & Constants ---

type Dimension = "love" | "skill" | "need" | "paid";

interface Question {
  id: Dimension;
  title: string;
  question: string;
  hint: string;
  icon: any;
}

const QUESTIONS: Question[] = [
  {
    id: "love",
    title: "Enjoyment",
    question: "What activities do you enjoy doing most?",
    hint: "Think about: Hobbies, topics you find interesting, or things you do just for fun.",
    icon: Heart
  },
  {
    id: "skill",
    title: "Strengths",
    question: "What are you naturally good at?",
    hint: "Think about: Skills people ask you for help with, or tasks that feel easy for you.",
    icon: Brain
  },
  {
    id: "need",
    title: "Impact",
    question: "What problems or needs do you care about?",
    hint: "Think about: Community needs, environmental issues, or helping a specific group.",
    icon: Globe
  },
  {
    id: "paid",
    title: "Opportunities",
    question: "What kind of work or skills feel rewarding to you?",
    hint: "Think about: Professional skills, career interests, or services you could offer.",
    icon: CircleDollarSign
  }
];

// --- Engine Logic (Internal for Context) ---

const STOP_WORDS = ['what', 'this', 'that', 'with', 'from', 'they', 'your', 'about', 'some', 'doing', 'being', 'been', 'have', 'very', 'more', 'most', 'and', 'the'];

function extractKeywords(text: string): string[] {
  const words = text.toLowerCase().match(/\b(\w{3,})\b/g) || [];
  const freq: Record<string, number> = {};
  words.forEach(w => {
    if (!STOP_WORDS.includes(w)) {
      freq[w] = (freq[w] || 0) + 1;
    }
  });
  return Object.entries(freq)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(entry => entry[0]);
}

function calculateIkigai(answers: Record<Dimension, string>) {
  const love = extractKeywords(answers.love);
  const skill = extractKeywords(answers.skill);
  const need = extractKeywords(answers.need);
  const paid = extractKeywords(answers.paid);

  const l = love[0] || "activity";
  const s = skill[0] || "skill";
  const n = need[0] || "need";
  const p = paid[0] || "value";

  return {
    summary: `Exploring ${l} through ${s} to address ${n} and build ${p}.`,
    passion: love.slice(0, 3),
    strength: skill.slice(0, 3),
    impact: need.slice(0, 3),
    value: paid.slice(0, 3),
    exploration: [
      `Diving deeper into ${l} development`,
      `Leveraging ${s} for new projects`,
      `Connecting with groups focused on ${n}`
    ],
    paths: [
      `Focus on ${s} mastery`,
      `Volunteer for ${n} initiatives`,
      `Build a project around ${l}`
    ],
    lastUpdated: new Date().toISOString()
  };
}

// --- Main Page Component ---

export default function IkigaiPage() {
  const [step, setStep] = useState<"tutorial" | "quiz" | "result">("tutorial");
  const [currentIdx, setCurrentIdx] = useState(0);
  const [answers, setAnswers] = useState<Record<Dimension, string>>({
    love: "",
    skill: "",
    need: "",
    paid: ""
  });
  const [result, setResult] = useState<any>(null);

  // Persistence check
  useEffect(() => {
    const saved = localStorage.getItem("monkos_ikigai_data");
    if (saved) {
      const data = JSON.parse(saved);
      if (data.result) {
        setResult(data.result);
        setStep("result");
      }
    }
  }, []);

  const handleStart = () => setStep("quiz");

  const handleNext = () => {
    if (currentIdx < QUESTIONS.length - 1) {
      setCurrentIdx(currentIdx + 1);
    } else {
      const calcResult = calculateIkigai(answers);
      setResult(calcResult);
      localStorage.setItem("monkos_ikigai_data", JSON.stringify({
        answers,
        result: calcResult
      }));
      setStep("result");
    }
  };

  const handleReset = () => {
    if (confirm("Would you like to start your reflection again?")) {
      localStorage.removeItem("monkos_ikigai_data");
      setStep("tutorial");
      setCurrentIdx(0);
      setAnswers({ love: "", skill: "", need: "", paid: "" });
      setResult(null);
    }
  };

  const progress = ((currentIdx + 1) / QUESTIONS.length) * 100;

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 md:py-12 animate-in fade-in duration-700">
      
      <AnimatePresence mode="wait">
        {step === "tutorial" && (
          <motion.div
            key="tutorial"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="flex flex-col items-center text-center space-y-10 py-12"
          >
            <div className="h-20 w-20 rounded-[28px] bg-primary/10 flex items-center justify-center">
              <Compass className="h-10 w-10 text-primary" />
            </div>
            <div className="space-y-4 max-w-lg">
              <h1 className="text-4xl font-heading font-bold">Reflect on Your Direction</h1>
              <p className="text-lg text-muted-foreground leading-relaxed">
                This guided reflection helps you understand what you enjoy, what you're good at, and where you can grow. 
                <br />It's a simple tool for clarity.
              </p>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 w-full max-w-xl">
               <TutorialPoint icon={Smile} text="No right or wrong answers." />
               <TutorialPoint icon={Target} text="Focus on your current interests." />
               <TutorialPoint icon={Zap} text="Takes less than 5 minutes." />
               <TutorialPoint icon={CheckCircle2} text="Answer honestly and quickly." />
            </div>

            <button 
              onClick={handleStart}
              className="px-10 py-4 bg-primary text-primary-foreground font-bold rounded-2xl shadow-xl shadow-primary/20 hover:scale-[1.02] transition-all"
            >
              Start Reflection
            </button>
          </motion.div>
        )}

        {step === "quiz" && (
          <motion.div
            key="quiz"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="space-y-10 py-8"
          >
            {/* Minimal Progress */}
            <div className="w-full space-y-2">
               <div className="flex justify-between text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                  <span>Exploring {QUESTIONS[currentIdx].title}</span>
                  <span>Step {currentIdx + 1} of {QUESTIONS.length}</span>
               </div>
               <div className="h-1.5 w-full bg-secondary/30 rounded-full overflow-hidden">
                  <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: `${progress}%` }}
                    className="h-full bg-primary"
                  />
               </div>
            </div>

            {/* Question Section */}
            <motion.div
              key={currentIdx}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.4 }}
              className="monk-card p-8 md:p-12 space-y-8"
            >
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-xl bg-primary/10">
                   {(() => {
                     const Icon = QUESTIONS[currentIdx].icon;
                     return <Icon className="h-6 w-6 text-primary" />;
                   })()}
                </div>
                <h2 className="text-2xl md:text-3xl font-heading font-bold">{QUESTIONS[currentIdx].question}</h2>
              </div>

              <div className="space-y-6">
                <textarea
                  value={answers[QUESTIONS[currentIdx].id]}
                  onChange={(e) => setAnswers({...answers, [QUESTIONS[currentIdx].id]: e.target.value})}
                  placeholder="Type your reflection here..."
                  className="w-full bg-background border border-monk-rose/10 rounded-2xl p-6 text-xl focus:outline-none focus:border-primary/50 transition-all min-h-[160px] resize-none"
                  autoFocus
                />
                
                <div className="p-4 rounded-xl bg-secondary/10 border border-secondary/20">
                  <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest mb-1">Helpful Hint</p>
                  <p className="text-sm text-muted-foreground">{QUESTIONS[currentIdx].hint}</p>
                </div>
              </div>

              <div className="flex justify-between items-center pt-4">
                 <button 
                  onClick={() => currentIdx > 0 && setCurrentIdx(currentIdx - 1)}
                  disabled={currentIdx === 0}
                  className="text-xs font-bold uppercase tracking-widest text-muted-foreground disabled:opacity-20 hover:text-foreground transition-all"
                 >
                  Back
                 </button>
                 <button 
                  onClick={handleNext}
                  disabled={!answers[QUESTIONS[currentIdx].id].trim()}
                  className="px-8 py-3 bg-foreground text-background font-bold rounded-xl flex items-center gap-2 hover:scale-[1.02] active:scale-95 transition-all disabled:opacity-50"
                 >
                   {currentIdx === QUESTIONS.length - 1 ? "Show Results" : "Continue"}
                   <ArrowRight className="h-4 w-4" />
                 </button>
              </div>
            </motion.div>
          </motion.div>
        )}

        {step === "result" && result && (
          <motion.div
            key="result"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-12 py-8"
          >
            {/* Header */}
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-3xl font-heading font-bold">Your Current Direction</h2>
                <p className="text-muted-foreground mt-1">Grounded insights based on your reflection.</p>
              </div>
              <button onClick={handleReset} className="p-3 hover:bg-secondary/50 rounded-2xl transition-all text-muted-foreground" title="Restart">
                <RotateCcw className="h-4 w-4" />
              </button>
            </div>

            {/* Ikigai Diagram */}
            <div className="flex justify-center py-10">
              <IkigaiDiagram />
            </div>

            {/* Summary Block */}
            <section className="p-10 rounded-[32px] bg-primary/5 border border-primary/20 text-center relative overflow-hidden group">
               <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-10 transition-all">
                  <Target className="h-32 w-32" />
               </div>
               <h3 className="text-xs font-bold uppercase tracking-[0.3em] text-primary mb-4">Summary View</h3>
               <p className="text-3xl md:text-4xl font-heading font-bold italic leading-tight">
                "{result.summary}"
               </p>
            </section>

            {/* What Drives You */}
            <section className="space-y-6">
              <div className="flex items-center gap-2">
                <Compass className="h-5 w-5 text-muted-foreground" />
                <h3 className="font-heading font-bold text-xl text-foreground">What Drives You</h3>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <DriveCard label="Passion" icon="❤️" items={result.passion} />
                <DriveCard label="Strength" icon="🧠" items={result.strength} />
                <DriveCard label="Impact" icon="🌍" items={result.impact} />
                <DriveCard label="Potential" icon="💰" items={result.value} />
              </div>
            </section>

            {/* Middle Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
               {/* Areas to Explore */}
               <section className="space-y-6">
                  <div className="flex items-center gap-2">
                    <Zap className="h-5 w-5 text-muted-foreground" />
                    <h3 className="font-heading font-bold text-xl text-foreground">Areas to Explore</h3>
                  </div>
                  <div className="space-y-3">
                    {result?.exploration?.map((exp: string, i: number) => (
                      <div key={i} className="p-4 rounded-2xl bg-secondary/10 border border-secondary/20 flex items-center gap-3">
                         <div className="h-2 w-2 rounded-full bg-primary" />
                         <span className="text-sm font-medium">{exp}</span>
                      </div>
                    )) || <p className="text-sm text-muted-foreground">No exploration areas yet.</p>}
                  </div>
               </section>

               {/* Suggested Paths */}
               <section className="space-y-6">
                  <div className="flex items-center gap-2">
                    <ArrowUpRight className="h-5 w-5 text-muted-foreground" />
                    <h3 className="font-heading font-bold text-xl text-foreground">Possible Paths</h3>
                  </div>
                  <div className="space-y-3">
                    {result?.paths?.map((path: string, i: number) => (
                      <div key={i} className="p-4 rounded-2xl bg-background border border-monk-rose/10 flex items-center gap-3 shadow-sm">
                         <CheckCircle2 className="h-4 w-4 text-primary" />
                         <span className="text-sm font-medium">{path}</span>
                      </div>
                    )) || <p className="text-sm text-muted-foreground">No suggested paths yet.</p>}
                  </div>
               </section>
            </div>

          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
}

function TutorialPoint({ icon: Icon, text }: { icon: any, text: string }) {
  return (
    <div className="flex items-center gap-4 p-4 rounded-2xl bg-secondary/10 border border-secondary/20 text-left">
       <div className="p-2 rounded-lg bg-background shadow-sm">
          <Icon className="h-5 w-5 text-primary" />
       </div>
       <span className="text-sm font-medium text-muted-foreground">{text}</span>
    </div>
  );
}

function DriveCard({ label, icon, items = [] }: { label: string, icon: string, items?: string[] }) {
  return (
    <div className="p-6 rounded-3xl bg-background border border-monk-rose/10 space-y-4 shadow-sm group hover:border-primary/30 transition-all">
       <div className="flex items-center justify-between">
          <span className="text-2xl">{icon}</span>
          <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">{label}</span>
       </div>
       <div className="flex flex-wrap gap-1.5">
          {items?.map((item, i) => (
            <span key={i} className="px-2 py-1 rounded-md bg-secondary/50 text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
              {item}
            </span>
          )) || <span className="text-[10px] italic text-muted-foreground/40">Not defined...</span>}
          {items?.length === 0 && <span className="text-[10px] italic text-muted-foreground/40">Not defined...</span>}
       </div>
    </div>
  );
}

function IkigaiDiagram() {
  return (
    <div className="relative w-full max-w-[600px] aspect-square flex items-center justify-center p-12 md:p-16">
      <svg viewBox="0 0 400 400" className="w-full h-full drop-shadow-2xl overflow-visible">
        {/* Circles */}
        <g className="opacity-60 transition-all duration-700 hover:opacity-80">
          <circle cx="200" cy="140" r="100" fill="#ff718b" className="mix-blend-multiply dark:mix-blend-screen" />
          <circle cx="260" cy="200" r="100" fill="#4ade80" className="mix-blend-multiply dark:mix-blend-screen" />
          <circle cx="200" cy="260" r="100" fill="#60a5fa" className="mix-blend-multiply dark:mix-blend-screen" />
          <circle cx="140" cy="200" r="100" fill="#fbbf24" className="mix-blend-multiply dark:mix-blend-screen" />
        </g>

        {/* Center Ikigai Point */}
        <circle cx="200" cy="200" r="30" fill="white" className="dark:fill-slate-900 shadow-xl" />
        <text x="200" y="205" textAnchor="middle" className="text-[10px] font-black fill-primary uppercase tracking-[0.2em]">Ikigai</text>

        {/* Intersection Labels */}
        <g className="text-[8px] font-black uppercase tracking-widest fill-muted-foreground/40 italic">
          <text x="260" y="130" textAnchor="middle">Passion</text>
          <text x="260" y="275" textAnchor="middle">Mission</text>
          <text x="140" y="275" textAnchor="middle">Vocation</text>
          <text x="140" y="130" textAnchor="middle">Profession</text>
        </g>
      </svg>
      
      {/* Centered Labels with Icons at Top - Responsive positioning */}
      <div className="absolute inset-0 pointer-events-none">
        {/* Top: Love */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 flex flex-col items-center gap-1">
          <div className="p-1.5 md:p-2 rounded-full bg-background border border-monk-rose/10 shadow-sm mb-0.5 md:mb-1">
            <Heart className="h-3 w-3 md:h-4 md:w-4 text-[#ff718b]" />
          </div>
          <span className="text-[8px] md:text-[10px] font-bold text-[#ff718b] uppercase tracking-widest">What you</span>
          <span className="text-[10px] md:text-xs font-black text-[#ff718b] uppercase tracking-widest">LOVE</span>
        </div>

        {/* Bottom: Need */}
        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 flex flex-col items-center gap-1">
          <span className="text-[10px] md:text-xs font-black text-[#60a5fa] uppercase tracking-widest">WORLD NEEDS</span>
          <span className="text-[8px] md:text-[10px] font-bold text-[#60a5fa] uppercase tracking-widest">What the</span>
          <div className="p-1.5 md:p-2 rounded-full bg-background border border-monk-rose/10 shadow-sm mt-0.5 md:mb-1">
            <Globe className="h-3 w-3 md:h-4 md:w-4 text-[#60a5fa]" />
          </div>
        </div>

        {/* Right: Skill */}
        <div className="absolute right-0 top-1/2 -translate-y-1/2 flex flex-col items-center gap-1">
          <div className="p-1.5 md:p-2 rounded-full bg-background border border-monk-rose/10 shadow-sm mb-0.5 md:mb-1">
            <Brain className="h-3 w-3 md:h-4 md:w-4 text-[#4ade80]" />
          </div>
          <span className="text-[8px] md:text-[10px] font-bold text-[#4ade80] uppercase tracking-widest text-center">What you are</span>
          <span className="text-[10px] md:text-xs font-black text-[#4ade80] uppercase tracking-widest text-center">GOOD AT</span>
        </div>

        {/* Left: Paid */}
        <div className="absolute left-0 top-1/2 -translate-y-1/2 flex flex-col items-center gap-1">
          <div className="p-1.5 md:p-2 rounded-full bg-background border border-monk-rose/10 shadow-sm mb-0.5 md:mb-1">
            <CircleDollarSign className="h-3 w-3 md:h-4 md:w-4 text-[#fbbf24]" />
          </div>
          <span className="text-[8px] md:text-[10px] font-bold text-[#fbbf24] uppercase tracking-widest text-center">What you get</span>
          <span className="text-[10px] md:text-xs font-black text-[#fbbf24] uppercase tracking-widest text-center">PAID FOR</span>
        </div>
      </div>
    </div>
  );
}

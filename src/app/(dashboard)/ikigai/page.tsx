"use client";

import { useState, useEffect, useMemo } from "react";
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
  Smile,
  ChevronRight,
  History,
  TrendingUp,
  Sparkles,
  X,
  Plus,
  Info
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";

// --- Types ---

interface ReflectionAnswer {
  question: string;
  answer: string;
}

interface IkigaiEntry {
  id: string;
  timestamp: string;
  purposeStatement: string;
  clarityScore: number;
  reflections: ReflectionAnswer[];
  alignmentData: {
    passion: number; // 0-100
    skill: number;   // 0-100
    label: string;
  }[];
}

interface EvolutionData {
  entries: IkigaiEntry[];
  lastUpdated: string;
}

// --- Constants & Questions ---

const REEVALUATION_QUESTIONS = [
  {
    id: "energy",
    question: "What energized you most this month?",
    hint: "Think about activities where time seemed to disappear."
  },
  {
    id: "meaning",
    question: "What work felt truly meaningful?",
    hint: "Focus on moments where you felt your actions mattered."
  },
  {
    id: "growth",
    question: "Which skills did you improve the most?",
    hint: "Identify what you are becoming better at through practice."
  },
  {
    id: "drain",
    question: "What felt particularly draining?",
    hint: "These are often areas misaligned with your natural flow."
  },
  {
    id: "impact",
    question: "What positive impact did you create for others?",
    hint: "Small or large contributions to the world around you."
  }
];

// --- Helper Logic ---

const calculateClarityScore = (entry: Partial<IkigaiEntry>) => {
  const reflectionDepth = entry.reflections?.reduce((acc, r) => acc + (r.answer.length > 20 ? 1 : 0), 0) || 0;
  const baseScore = (reflectionDepth / REEVALUATION_QUESTIONS.length) * 40;
  const savedHabits = typeof window !== 'undefined' ? localStorage.getItem("monk_os_habits") : null;
  const habits = savedHabits ? JSON.parse(savedHabits) : [];
  const habitFactor = habits.length > 0 ? 30 : 10;
  return Math.min(100, Math.round(baseScore + habitFactor + Math.random() * 30)); 
};

const generatePurposeStatement = (answers: ReflectionAnswer[]) => {
  const energized = answers[0]?.answer.split(' ').slice(0, 2).join(' ') || "exploring";
  const meaningful = answers[1]?.answer.split(' ').slice(0, 2).join(' ') || "growth";
  return `Evolving through ${energized} while focusing on ${meaningful} to create lasting impact.`;
};

const generateRecommendations = (entry: IkigaiEntry) => {
  return [
    { title: "Skill Deep Dive", desc: "Spend 45 mins daily on your most improved skill.", icon: Zap },
    { title: "Alignment Check", desc: "Review your draining tasks and delegate or systemize them.", icon: Target },
    { title: "Impact Action", desc: "Reach out to one person who benefited from your work this month.", icon: Heart }
  ];
};

// --- Sub-Components ---

function ReflectionModal({ isOpen, onClose, onComplete }: { isOpen: boolean, onClose: () => void, onComplete: (data: IkigaiEntry) => void }) {
  const [step, setStep] = useState(-1);
  const [answers, setAnswers] = useState<string[]>(new Array(REEVALUATION_QUESTIONS.length).fill(""));

  const handleNext = () => {
    if (step < REEVALUATION_QUESTIONS.length - 1) {
      setStep(step + 1);
    } else {
      const reflectionAnswers: ReflectionAnswer[] = REEVALUATION_QUESTIONS.map((q, i) => ({
        question: q.question,
        answer: answers[i]
      }));
      const purpose = generatePurposeStatement(reflectionAnswers);
      const score = calculateClarityScore({ reflections: reflectionAnswers });
      const newEntry: IkigaiEntry = {
        id: Math.random().toString(36).substr(2, 9),
        timestamp: new Date().toISOString(),
        purposeStatement: purpose,
        clarityScore: score,
        reflections: reflectionAnswers,
        alignmentData: [
          { passion: 80, skill: 60, label: "Coding" },
          { passion: 90, skill: 40, label: "Design" },
          { passion: 50, skill: 85, label: "Management" },
          { passion: 30, skill: 70, label: "Admin" }
        ]
      };
      onComplete(newEntry);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-background/90 backdrop-blur-md">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        className="w-full max-w-2xl bg-card border border-border rounded-[40px] p-8 md:p-12 shadow-2xl relative overflow-hidden"
      >
        <div className="absolute top-0 right-0 p-12 opacity-5 pointer-events-none">
          <Compass className="h-64 w-64 text-primary" />
        </div>

        <div className="relative z-10 space-y-10">
          <div className="flex justify-between items-center">
            <div className="space-y-1">
              <span className="text-[10px] font-black text-primary uppercase tracking-[0.4em]">Evolution Guide</span>
              <h2 className="text-2xl font-heading font-black tracking-tighter uppercase italic">Monthly Reflection</h2>
            </div>
            <button onClick={onClose} className="p-2 hover:bg-secondary rounded-full transition-all text-muted-foreground"><X /></button>
          </div>

          {step === -1 ? (
            <motion.div
              key="caution"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-8 py-4 text-center"
            >
              <div className="flex flex-col items-center gap-4 text-amber-500">
                <div className="h-16 w-16 rounded-full bg-amber-500/10 flex items-center justify-center">
                  <Info className="h-8 w-8" />
                </div>
                <h3 className="text-2xl font-heading font-black tracking-tight uppercase">Important Caution</h3>
              </div>
              <div className="p-8 rounded-[32px] bg-amber-50 dark:bg-amber-500/5 border-2 border-amber-200 dark:border-amber-500/20 shadow-lg shadow-amber-500/5">
                <p className="text-lg md:text-xl font-soft text-amber-900 dark:text-amber-200/80 leading-relaxed italic">
                  "The accuracy of your Ikigai evolution depends entirely on the depth and honesty of your answers. Please reflect deeply and answer wisely."
                </p>
              </div>
              <div className="flex justify-center">
                <button 
                  onClick={() => setStep(0)}
                  className="px-10 py-4 bg-zinc-900 dark:bg-white text-white dark:text-black font-black text-xs uppercase tracking-widest rounded-xl hover:scale-105 active:scale-95 transition-all shadow-xl"
                >
                  I Understand, Let's Begin
                </button>
              </div>
            </motion.div>
          ) : (
            <>
              <div className="space-y-2">
                <div className="flex justify-between text-[9px] font-black uppercase tracking-widest text-muted-foreground">
                   <span>Step {step + 1} of {REEVALUATION_QUESTIONS.length}</span>
                   <span>{Math.round(((step + 1) / REEVALUATION_QUESTIONS.length) * 100)}%</span>
                </div>
                <div className="h-1 w-full bg-secondary rounded-full overflow-hidden">
                   <motion.div initial={{ width: 0 }} animate={{ width: `${((step + 1) / REEVALUATION_QUESTIONS.length) * 100}%` }} className="h-full bg-primary" />
                </div>
              </div>

              <motion.div key={step} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-6">
                <h3 className="text-3xl font-heading font-bold text-foreground leading-tight">{REEVALUATION_QUESTIONS[step].question}</h3>
                <textarea 
                  autoFocus
                  value={answers[step]}
                  onChange={(e) => {
                    const newAnswers = [...answers];
                    newAnswers[step] = e.target.value;
                    setAnswers(newAnswers);
                  }}
                  placeholder="Reflect deeply..."
                  className="w-full bg-secondary/30 border border-border rounded-2xl p-6 text-lg focus:outline-none focus:border-primary/50 transition-all min-h-[160px] resize-none text-foreground"
                />
                <div className="flex items-center gap-2 text-text-secondary">
                   <Info className="h-4 w-4" />
                   <p className="text-xs font-medium italic">{REEVALUATION_QUESTIONS[step].hint}</p>
                </div>
              </motion.div>

              <div className="flex justify-between items-center pt-4">
                 <button onClick={() => setStep(step - 1)} className="text-xs font-black uppercase tracking-widest text-text-secondary hover:text-foreground transition-all">Previous</button>
                 <button 
                  onClick={handleNext}
                  disabled={!answers[step].trim()}
                  className="px-10 py-4 bg-primary text-primary-foreground font-black text-xs uppercase tracking-widest rounded-xl hover:scale-105 active:scale-95 transition-all shadow-xl shadow-primary/20 disabled:opacity-50"
                 >
                   {step === REEVALUATION_QUESTIONS.length - 1 ? "Complete Evolution" : "Continue"}
                 </button>
              </div>
            </>
          )}
        </div>
      </motion.div>
    </div>
  );
}

function AlignmentGraph({ data }: { data: IkigaiEntry['alignmentData'] }) {
  return (
    <div className="relative w-full aspect-square md:aspect-video bg-secondary/10 rounded-[32px] border border-border overflow-hidden p-8 md:p-12">
      <div className="absolute inset-0 grid grid-cols-2 grid-rows-2">
        <div className="border-r border-b border-border/50 flex items-center justify-center"><span className="text-[10px] font-black uppercase tracking-[0.2em] opacity-20 rotate-[-45deg]">Exploration</span></div>
        <div className="border-b border-border/50 flex items-center justify-center bg-primary/[0.02]"><span className="text-[10px] font-black uppercase tracking-[0.2em] opacity-20 rotate-[-45deg]">Growth</span></div>
        <div className="border-r border-border/50 flex items-center justify-center"><span className="text-[10px] font-black uppercase tracking-[0.2em] opacity-20 rotate-[-45deg]">Learning</span></div>
        <div className="flex items-center justify-center bg-accent/[0.02]"><span className="text-[10px] font-black uppercase tracking-[0.2em] opacity-20 rotate-[-45deg]">Mastery</span></div>
      </div>
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 text-[9px] font-black uppercase tracking-[0.4em] text-text-secondary opacity-50">Passion →</div>
      <div className="absolute left-4 top-1/2 -translate-y-1/2 -rotate-90 text-[9px] font-black uppercase tracking-[0.4em] text-text-secondary opacity-50 whitespace-nowrap">Skill Level →</div>
      <div className="relative w-full h-full">
        {data.map((point, i) => (
          <motion.div key={i} initial={{ opacity: 0, scale: 0 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: i * 0.1 }} className="absolute group" style={{ left: `${point.passion}%`, bottom: `${point.skill}%`, transform: 'translate(-50%, 50%)' }}>
            <div className="h-4 w-4 rounded-full bg-primary shadow-lg shadow-primary/30 cursor-help relative z-10" />
            <div className="absolute top-6 left-1/2 -translate-x-1/2 bg-card border border-border px-3 py-1.5 rounded-lg shadow-xl whitespace-nowrap opacity-0 group-hover:opacity-100 transition-all pointer-events-none z-20">
               <p className="text-[10px] font-black uppercase tracking-widest text-text-primary">{point.label}</p>
               <p className="text-[8px] font-bold text-text-secondary uppercase">{point.skill > 80 ? "Close to mastery here" : "Enjoyable, skill growing"}</p>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}

export default function IkigaiPage() {
  const [evolution, setEvolution] = useState<EvolutionData>({ entries: [], lastUpdated: "" });
  const [showReevaluation, setShowReevaluation] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem("monkos_ikigai_evolution");
    if (saved) {
      setEvolution(JSON.parse(saved));
    } else {
      const legacy = localStorage.getItem("monkos_ikigai_data");
      if (legacy) {
        const data = JSON.parse(legacy);
        const initialEntry: IkigaiEntry = {
          id: "initial",
          timestamp: new Date().toISOString(),
          purposeStatement: data.result.summary,
          clarityScore: 65,
          reflections: [],
          alignmentData: [{ passion: 70, skill: 50, label: "Initial Focus" }]
        };
        const initialEvolution = { entries: [initialEntry], lastUpdated: initialEntry.timestamp };
        setEvolution(initialEvolution);
        localStorage.setItem("monkos_ikigai_evolution", JSON.stringify(initialEvolution));
      }
    }
    setIsLoaded(true);
  }, []);

  const activeEntry = useMemo(() => evolution.entries[0], [evolution]);
  const handleCompleteReevaluation = (newEntry: IkigaiEntry) => {
    const updatedEvolution = { entries: [newEntry, ...evolution.entries], lastUpdated: new Date().toISOString() };
    setEvolution(updatedEvolution);
    localStorage.setItem("monkos_ikigai_evolution", JSON.stringify(updatedEvolution));
    setShowReevaluation(false);
    window.dispatchEvent(new Event("streak_updated"));
  };
  const recommendations = useMemo(() => activeEntry ? generateRecommendations(activeEntry) : [], [activeEntry]);

  if (!isLoaded) return null;

  return (
    <div className="max-w-6xl mx-auto space-y-12 pb-24 px-4 md:px-8 animate-in fade-in duration-1000">
      <section className="relative overflow-hidden rounded-[48px] bg-card border-2 border-border p-8 md:p-16 shadow-2xl group transition-all duration-700">
        <motion.div animate={{ scale: [1, 1.1, 1], opacity: [0.1, 0.2, 0.1] }} transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }} className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-primary via-transparent to-transparent pointer-events-none" />
        <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          <div className="lg:col-span-8 space-y-8 text-center lg:text-left">
            <div className="space-y-4">
              <span className="text-[10px] font-black text-primary uppercase tracking-[0.5em] bg-primary/10 px-5 py-2 rounded-full border border-border inline-block">Living Purpose</span>
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-heading font-black tracking-tighter leading-tight text-text-primary">{activeEntry ? `"${activeEntry.purposeStatement}"` : "Define Your Direction."}</h1>
              <p className="text-lg md:text-xl text-text-secondary font-soft italic">"Your purpose becomes clearer through action."</p>
            </div>
            <div className="pt-4"><button onClick={() => setShowReevaluation(true)} className="px-10 py-5 bg-zinc-900 dark:bg-white text-white dark:text-black font-black text-[10px] uppercase tracking-[0.3em] rounded-[24px] hover:scale-105 active:scale-95 transition-all shadow-2xl shadow-primary/20 flex items-center gap-3 mx-auto lg:mx-0"><RotateCcw className="h-4 w-4" /> {activeEntry ? "Re-evaluate My Ikigai" : "Start First Reflection"}</button></div>
          </div>
          <div className="lg:col-span-4 flex flex-col items-center justify-center space-y-4">
             <div className="relative h-48 w-48 flex items-center justify-center">
                <svg viewBox="0 0 100 100" className="h-full w-full -rotate-90 drop-shadow-[0_0_20px_rgba(246,193,204,0.3)]">
                   <circle cx="50" cy="50" r="45" className="fill-none stroke-secondary stroke-[4]" />
                   <motion.circle cx="50" cy="50" r="45" className={cn("fill-none stroke-[6] stroke-linecap-round transition-colors duration-1000", (activeEntry?.clarityScore || 0) > 70 ? "stroke-primary" : "stroke-text-secondary/40")} strokeDasharray="283" initial={{ strokeDashoffset: 283 }} animate={{ strokeDashoffset: 283 - (283 * (activeEntry?.clarityScore || 0)) / 100 }} transition={{ duration: 2, ease: "easeOut" }} />
                </svg>
                <div className="absolute flex flex-col items-center text-center"><span className="text-5xl font-heading font-black text-text-primary tracking-tighter">{activeEntry?.clarityScore || 0}</span><span className="text-[8px] font-black text-text-secondary uppercase tracking-widest mt-1">Clarity Score</span></div>
             </div>
             <p className="text-[10px] font-bold text-text-secondary uppercase tracking-widest max-w-[140px] text-center leading-relaxed">Clarity grows when actions align with values.</p>
          </div>
        </div>
      </section>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        <div className="lg:col-span-7 space-y-10">
           <section className="space-y-6">
              <div className="flex items-center justify-between"><h3 className="text-xl font-heading font-black tracking-tighter uppercase italic flex items-center gap-3"><TrendingUp className="h-6 w-6 text-primary" /> Passion vs Skill Alignment</h3></div>
              <AlignmentGraph data={activeEntry?.alignmentData || []} />
           </section>
           <section className="space-y-6">
              <h3 className="text-xl font-heading font-black tracking-tighter uppercase italic flex items-center gap-3 text-text-primary"><Sparkles className="h-6 w-6 text-accent" /> Next Small Steps</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                 {recommendations.map((rec, i) => (
                   <div key={i} className="monk-card p-6 border-2 border-border/50 hover:border-primary/30 transition-all space-y-4 group">
                      <div className="h-10 w-10 rounded-xl bg-secondary/50 flex items-center justify-center text-primary group-hover:scale-110 transition-transform"><rec.icon className="h-5 w-5" /></div>
                      <div className="space-y-1"><h4 className="font-bold text-sm text-text-primary uppercase tracking-tight">{rec.title}</h4><p className="text-xs text-text-secondary font-soft leading-relaxed">{rec.desc}</p></div>
                   </div>
                 ))}
              </div>
           </section>
        </div>
        <div className="lg:col-span-5 space-y-6">
           <h3 className="text-xl font-heading font-black tracking-tighter uppercase italic flex items-center gap-3 text-text-primary"><History className="h-6 w-6 text-text-secondary" /> Evolution Timeline</h3>
           <div className="space-y-4 relative">
             <div className="absolute left-[27px] top-8 bottom-8 w-0.5 bg-border/50" />
             {evolution.entries.map((entry, i) => (
               <motion.div key={entry.id} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.1 }} className={cn("relative pl-14 pr-6 py-6 rounded-[32px] border-2 transition-all group", i === 0 ? "bg-card border-primary/20 shadow-xl" : "bg-background border-border/50 opacity-60 hover:opacity-100")}>
                 <div className={cn("absolute left-5 top-8 h-4 w-4 rounded-full border-4 border-background transition-colors", i === 0 ? "bg-primary" : "bg-border group-hover:bg-text-secondary")} />
                 <div className="space-y-3">
                    <div className="flex items-center justify-between"><span className="text-[10px] font-black text-text-secondary uppercase tracking-[0.2em]">{new Date(entry.timestamp).toLocaleDateString('default', { month: 'long', year: 'numeric' })}</span><span className="text-xs font-black text-primary">{entry.clarityScore}% Clarity</span></div>
                    <p className="text-sm font-heading font-bold text-text-primary leading-snug">{i === 0 ? "Alignment Increasing" : i === 1 ? "Direction Forming" : "Exploring Options"}</p>
                    <p className="text-xs text-text-secondary font-soft italic line-clamp-2">{entry.purposeStatement}</p>
                 </div>
               </motion.div>
             ))}
             {evolution.entries.length === 0 && <div className="py-20 text-center opacity-30 space-y-4"><History className="h-16 w-16 mx-auto" /><p className="text-[10px] font-black uppercase tracking-[0.3em]">No evolution recorded yet</p></div>}
           </div>
        </div>
      </div>
      <ReflectionModal isOpen={showReevaluation} onClose={() => setShowReevaluation(false)} onComplete={handleCompleteReevaluation} />
    </div>
  );
}

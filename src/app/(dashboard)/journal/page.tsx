"use client";

import { useState, useEffect, useCallback } from "react";
import { 
  BookText, 
  RotateCcw, 
  RotateCw, 
  Trash2, 
  Save, 
  Plus, 
  Heart, 
  Brain, 
  Sparkles, 
  Dumbbell,
  Search,
  ChevronRight,
  Undo2,
  Redo2
} from "lucide-react";
import { cn, formatDate } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";

interface JournalEntry {
  id: string;
  content: string;
  category: "Reflection" | "Gratitude" | "Ideas" | "Daily Log";
  domain: "Academic" | "Physical" | "Emotional" | "Spiritual";
  date: string;
  timestamp: number;
}

export default function JournalPage() {
  const [entries, setEntries] = useState<JournalEntry[]>([]);
  const [content, setContent] = useState("");
  const [category, setCategory] = useState<JournalEntry["category"]>("Reflection");
  const [domain, setDomain] = useState<JournalEntry["domain"]>("Emotional");
  const [searchQuery, setSearchQuery] = useState("");
  
  // History for Undo/Redo
  const [history, setHistory] = useState<JournalEntry[][]>([]);
  const [historyStep, setHistoryStep] = useState(-1);

  // Load initial data
  useEffect(() => {
    const saved = localStorage.getItem("monk_os_journal");
    if (saved) {
      const parsed = JSON.parse(saved);
      setEntries(parsed);
      setHistory([parsed]);
      setHistoryStep(0);
    }
  }, []);

  // Persistence + History Update
  const updateState = (newEntries: JournalEntry[]) => {
    setEntries(newEntries);
    localStorage.setItem("monk_os_journal", JSON.stringify(newEntries));
    
    const newHistory = history.slice(0, historyStep + 1);
    newHistory.push(newEntries);
    setHistory(newHistory);
    setHistoryStep(newHistory.length - 1);
  };

  const handleSave = () => {
    if (!content.trim()) return;
    
    const newEntry: JournalEntry = {
      id: Math.random().toString(36).substr(2, 9),
      content,
      category,
      domain,
      date: new Date().toISOString(),
      timestamp: Date.now(),
    };
    
    updateState([newEntry, ...entries]);
    setContent("");
  };

  const handleDelete = (id: string) => {
    updateState(entries.filter(e => e.id !== id));
  };

  const undo = () => {
    if (historyStep > 0) {
      const prevStep = historyStep - 1;
      setEntries(history[prevStep]);
      setHistoryStep(prevStep);
      localStorage.setItem("monk_os_journal", JSON.stringify(history[prevStep]));
    }
  };

  const redo = () => {
    if (historyStep < history.length - 1) {
      const nextStep = historyStep + 1;
      setEntries(history[nextStep]);
      setHistoryStep(nextStep);
      localStorage.setItem("monk_os_journal", JSON.stringify(history[nextStep]));
    }
  };

  const filteredEntries = entries.filter(e => 
    e.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
    e.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const clearAshram = () => {
    if (confirm("Are you sure you want to clear your Digital Ashram? This will delete all Journal entries, but preserve your Finance, Habits, and Goals.")) {
      updateState([]);
      alert("Journal entries cleared.");
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-8 animate-in fade-in duration-700">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-3xl font-heading font-bold text-foreground italic">The Digital Ashram</h1>
          <p className="text-muted-foreground mt-1">Reflection is the mirror of the soul's progress.</p>
        </div>
        
        <div className="flex items-center gap-2">
          <button 
            onClick={clearAshram}
            className="p-3 rounded-xl bg-card border border-monk-rose/10 text-muted-foreground hover:text-red-500 transition-all mr-4"
            title="Clear Ashram"
          >
            <Trash2 className="h-5 w-5" />
          </button>
          <button 
            onClick={undo}
            disabled={historyStep <= 0}
            className="p-3 rounded-xl bg-card border border-monk-rose/10 text-muted-foreground hover:text-primary disabled:opacity-30 transition-all"
            title="Undo"
          >
            <Undo2 className="h-5 w-5" />
          </button>
          <button 
            onClick={redo}
            disabled={historyStep >= history.length - 1}
            className="p-3 rounded-xl bg-card border border-monk-rose/10 text-muted-foreground hover:text-primary disabled:opacity-30 transition-all"
            title="Redo"
          >
            <Redo2 className="h-5 w-5" />
          </button>
          <div className="w-px h-8 bg-monk-rose/20 mx-2" />
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <input 
              type="text" 
              placeholder="Search reflections..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 pr-4 py-2.5 rounded-2xl bg-card border border-monk-rose/10 focus:border-primary/50 focus:outline-none text-sm w-64 transition-all"
            />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Editor Area */}
        <div className="lg:col-span-5 space-y-6">
          <section className="monk-card p-6 sticky top-6">
            <div className="flex items-center gap-2 mb-6">
              <Sparkles className="h-5 w-5 text-accent" />
              <h2 className="font-heading font-bold">Write Today's Truth</h2>
            </div>
            
            <div className="space-y-4">
              <div className="flex flex-wrap gap-2">
                {(["Reflection", "Gratitude", "Ideas", "Daily Log"] as const).map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setCategory(cat)}
                    className={cn(
                      "px-4 py-1.5 rounded-full text-xs font-bold transition-all",
                      category === cat ? "bg-primary text-primary-foreground" : "bg-secondary/30 text-muted-foreground hover:bg-secondary/50"
                    )}
                  >
                    {cat}
                  </button>
                ))}
              </div>

              <textarea 
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="What did you learn today? What are you grateful for?"
                className="w-full h-64 p-4 rounded-2xl bg-background border border-monk-rose/10 focus:border-primary/50 focus:outline-none resize-none font-soft text-lg leading-relaxed placeholder:italic transition-all"
              />

              <div className="flex items-center justify-between">
                <div className="flex gap-2">
                  <button 
                    onClick={() => setDomain("Academic")}
                    className={cn("p-2 rounded-lg transition-all", domain === "Academic" ? "bg-secondary/20 text-secondary" : "text-muted-foreground")}
                    title="Academic"
                  >
                    <BookText className="h-5 w-5" />
                  </button>
                  <button 
                    onClick={() => setDomain("Physical")}
                    className={cn("p-2 rounded-lg transition-all", domain === "Physical" ? "bg-monk-mint/10 text-monk-mint" : "text-muted-foreground")}
                    title="Physical"
                  >
                    <Dumbbell className="h-5 w-5" />
                  </button>
                  <button 
                    onClick={() => setDomain("Emotional")}
                    className={cn("p-2 rounded-lg transition-all", domain === "Emotional" ? "bg-primary/10 text-primary" : "text-muted-foreground")}
                    title="Emotional"
                  >
                    <Heart className="h-5 w-5" />
                  </button>
                  <button 
                    onClick={() => setDomain("Spiritual")}
                    className={cn("p-2 rounded-lg transition-all", domain === "Spiritual" ? "bg-accent/10 text-accent" : "text-muted-foreground")}
                    title="Spiritual"
                  >
                    <Brain className="h-5 w-5" />
                  </button>
                </div>
                
                <button 
                  onClick={handleSave}
                  className="flex items-center gap-2 px-8 py-3 bg-primary text-primary-foreground font-bold rounded-2xl hover:scale-105 transition-all shadow-lg shadow-primary/20"
                >
                  <Save className="h-4 w-4" /> Save Entry
                </button>
              </div>
            </div>
          </section>
        </div>

        {/* Entries List Area */}
        <div className="lg:col-span-7 space-y-6">
          <AnimatePresence mode="popLayout">
            {filteredEntries.length === 0 ? (
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex flex-col items-center justify-center py-20 text-center space-y-4"
              >
                <div className="h-20 w-20 rounded-full bg-secondary/10 flex items-center justify-center">
                  <BookText className="h-10 w-10 text-secondary/40" />
                </div>
                <div>
                  <h3 className="text-xl font-heading font-bold text-muted-foreground">The pages are silent.</h3>
                  <p className="text-sm text-muted-foreground">Start writing to capture your evolution.</p>
                </div>
              </motion.div>
            ) : (
              filteredEntries.map((entry) => (
                <motion.div 
                  layout
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  key={entry.id} 
                  className="monk-card p-6 group hover:border-primary/30 transition-all border border-transparent"
                >
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <span className={cn(
                        "text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-widest",
                        entry.category === 'Reflection' ? 'bg-primary/10 text-primary' :
                        entry.category === 'Gratitude' ? 'bg-monk-mint/10 text-monk-mint' :
                        entry.category === 'Ideas' ? 'bg-accent/10 text-accent' : 'bg-secondary/10 text-secondary'
                      )}>
                        {entry.category}
                      </span>
                      <span className="text-xs font-medium text-muted-foreground">{formatDate(new Date(entry.date))}</span>
                    </div>
                    <button 
                      onClick={() => handleDelete(entry.id)}
                      className="p-2 text-muted-foreground hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                  <p className="font-soft text-lg text-foreground/90 leading-relaxed whitespace-pre-wrap">
                    {entry.content}
                  </p>
                  <div className="mt-6 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <DomainIcon domain={entry.domain} />
                      <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">{entry.domain}</span>
                    </div>
                    <div className="text-[10px] font-bold text-muted-foreground/40 uppercase tracking-widest">
                      {new Date(entry.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </div>
                  </div>
                </motion.div>
              ))
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}

function DomainIcon({ domain }: { domain: JournalEntry["domain"] }) {
  switch (domain) {
    case "Academic": return <BookText className="h-3.5 w-3.5 text-secondary" />;
    case "Physical": return <Dumbbell className="h-3.5 w-3.5 text-monk-mint" />;
    case "Emotional": return <Heart className="h-3.5 w-3.5 text-primary" />;
    case "Spiritual": return <Brain className="h-3.5 w-3.5 text-accent" />;
  }
}

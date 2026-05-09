"use client";

import { useState, useEffect } from "react";
import { 
  BookText, 
  Trash2, 
  Save, 
  Heart, 
  Brain, 
  Sparkles, 
  Dumbbell,
  Search,
  Undo2,
  Redo2,
  Plus,
  Clock,
  X,
  ChevronDown,
  ChevronUp,
  Edit3,
  Lightbulb
} from "lucide-react";
import { cn, formatDate } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";

interface JournalEntry {
  id: string;
  content: string;
  category: "Reflection" | "Gratitude" | "Ideas" | "Daily Log";
  domain: "Ideas" | "Academic" | "Physical" | "Emotional" | "Spiritual";
  date: string;
  timestamp: number;
}

// Order: Ideas first, Spiritual (Daily Journal) last
const DOMAINS: JournalEntry["domain"][] = ["Ideas", "Academic", "Physical", "Emotional", "Spiritual"];

export default function JournalPage() {
  const [entries, setEntries] = useState<JournalEntry[]>([]);
  const [content, setContent] = useState("");
  const [category, setCategory] = useState<JournalEntry["category"]>("Reflection");
  const [domain, setDomain] = useState<JournalEntry["domain"]>("Ideas");
  const [searchQuery, setSearchQuery] = useState("");
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  
  const [history, setHistory] = useState<JournalEntry[][]>([]);
  const [historyStep, setHistoryStep] = useState(-1);

  useEffect(() => {
    const saved = localStorage.getItem("monk_os_journal");
    if (saved) {
      const parsed = JSON.parse(saved);
      setEntries(parsed);
      setHistory([parsed]);
      setHistoryStep(0);
    }
  }, []);

  const updateState = (newEntries: JournalEntry[]) => {
    setEntries(newEntries);
    localStorage.setItem("monk_os_journal", JSON.stringify(newEntries));
    
    const newHistory = history.slice(0, historyStep + 1);
    newHistory.push(newEntries);
    setHistory(newHistory);
    setHistoryStep(newHistory.length - 1);
  };

  const handleNewEntry = () => {
    setEditingId(null);
    setContent("");
    setCategory("Reflection");
    setDomain("Ideas");
    setIsEditorOpen(true);
  };

  const handleEditEntry = (entry: JournalEntry) => {
    setEditingId(entry.id);
    setContent(entry.content);
    setCategory(entry.category);
    setDomain(entry.domain);
    setIsEditorOpen(true);
  };

  const handleSave = () => {
    if (!content.trim()) return;

    if (editingId) {
      const updatedEntries = entries.map(e => 
        e.id === editingId 
          ? { ...e, content, category, domain, timestamp: Date.now() } 
          : e
      );
      updateState(updatedEntries);
    } else {
      const newEntry: JournalEntry = {
        id: Math.random().toString(36).substr(2, 9),
        content,
        category,
        domain,
        date: new Date().toISOString(),
        timestamp: Date.now(),
      };
      updateState([newEntry, ...entries]);
    }
    
    setContent("");
    setIsEditorOpen(false);
    setEditingId(null);
  };

  const handleDelete = (id: string) => {
    if (confirm("Permanently erase this reflection?")) {
      updateState(entries.filter(e => e.id !== id));
      if (editingId === id) {
        setIsEditorOpen(false);
        setEditingId(null);
      }
    }
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
    e.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
    e.domain.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="max-w-7xl mx-auto space-y-10 animate-in fade-in duration-500 pb-20 px-4 sm:px-0">
      
      {/* --- HEADER --- */}
      <div className="flex flex-col gap-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-1">
            <h1 className="text-4xl font-heading font-black tracking-tighter italic text-foreground">The Digital Ashram</h1>
            <p className="text-xs font-bold text-muted-foreground uppercase tracking-[0.3em] flex items-center gap-2">
              <Sparkles className="h-3 w-3 text-primary animate-pulse" /> Categorised Wisdom
            </p>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex bg-zinc-900/5 dark:bg-zinc-100/5 p-1 rounded-xl border border-monk-rose/10">
              <HeaderAction icon={<Undo2 className="h-4 w-4" />} onClick={undo} disabled={historyStep <= 0} title="Undo" />
              <HeaderAction icon={<Redo2 className="h-4 w-4" />} onClick={redo} disabled={historyStep >= history.length - 1} title="Redo" />
            </div>
            <button 
              onClick={handleNewEntry}
              className="flex items-center gap-2 px-8 py-3 bg-zinc-950 text-white dark:bg-white dark:text-zinc-950 font-bold rounded-2xl hover:scale-105 transition-all shadow-xl"
            >
              <Plus className="h-5 w-5" /> Reflect
            </button>
          </div>
        </div>

        <div className="relative group">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <input 
            type="text" 
            placeholder="Search through the silence..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-12 pr-4 py-4 rounded-2xl bg-white dark:bg-zinc-900 border-2 border-monk-rose/20 focus:border-primary focus:outline-none text-sm transition-all shadow-sm"
          />
        </div>
      </div>

      {/* --- GRID --- */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
        {DOMAINS.map((dom) => {
          const domainEntries = filteredEntries.filter(e => e.domain === dom);
          return (
            <section key={dom} className="space-y-6">
              <div className="flex items-center justify-between px-2">
                <div className="flex items-center gap-3">
                  <div className={cn(
                    "p-2.5 rounded-xl shadow-inner",
                    dom === "Ideas" ? "bg-amber-100 text-amber-600" :
                    dom === "Spiritual" ? "bg-accent/20 text-accent" :
                    dom === "Academic" ? "bg-secondary/20 text-secondary" :
                    dom === "Physical" ? "bg-monk-mint/20 text-monk-mint" : "bg-primary/20 text-primary"
                  )}>
                    <DomainIcon domain={dom} size="h-5 w-5" />
                  </div>
                  <h2 className="text-xl font-heading font-black uppercase tracking-tight text-foreground">
                    {dom === "Spiritual" ? "Daily Journal" : dom}
                  </h2>
                </div>
                <span className="text-[10px] font-black bg-zinc-950 text-white dark:bg-white dark:text-black px-3 py-1.5 rounded-lg uppercase tracking-widest">
                  {domainEntries.length}
                </span>
              </div>

              <div className="space-y-6">
                {domainEntries.length === 0 ? (
                  <div className="py-12 flex flex-col items-center justify-center text-center bg-zinc-900/5 dark:bg-white/5 rounded-[32px] border-2 border-dashed border-monk-rose/20">
                    <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">The void is empty</p>
                  </div>
                ) : (
                  domainEntries.map((entry) => (
                    <EntryCard 
                      key={entry.id} 
                      entry={entry} 
                      onDelete={handleDelete} 
                      onEdit={() => handleEditEntry(entry)} 
                    />
                  ))
                )}
              </div>
            </section>
          );
        })}
      </div>

      {/* --- EDITOR MODAL --- */}
      <AnimatePresence>
        {isEditorOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/70 backdrop-blur-xl"
              onClick={() => setIsEditorOpen(false)}
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="w-full max-w-2xl bg-zinc-950 text-white rounded-[40px] p-8 md:p-12 shadow-2xl relative z-10 border border-white/10"
            >
              <div className="flex items-center justify-between mb-10">
                <h2 className="text-3xl font-heading font-black tracking-tighter uppercase">
                  {editingId ? "Update Entry" : "New Entry"}
                </h2>
                <button onClick={() => setIsEditorOpen(false)} className="p-2 hover:bg-white/10 rounded-full transition-all text-white/50 hover:text-white"><X /></button>
              </div>

              <div className="space-y-10">
                {/* Domain Picker */}
                <div className="grid grid-cols-3 sm:grid-cols-5 gap-3">
                  {DOMAINS.map((dom) => (
                    <button 
                      key={dom}
                      onClick={() => setDomain(dom)}
                      className={cn(
                        "flex flex-col items-center justify-center gap-2 p-4 rounded-[24px] border-2 transition-all",
                        domain === dom ? "border-primary bg-primary/10 text-primary" : "border-white/5 text-white/40 hover:border-white/20"
                      )}
                    >
                      <DomainIcon domain={dom} size="h-4 w-4" />
                      <span className="text-[8px] font-black uppercase tracking-tighter text-center">{dom === "Spiritual" ? "Journal" : dom}</span>
                    </button>
                  ))}
                </div>

                <div className="space-y-6">
                  {/* Category Picker */}
                  <div className="flex gap-2 overflow-x-auto no-scrollbar">
                    {(["Reflection", "Gratitude", "Ideas", "Daily Log"] as const).map((cat) => (
                      <button
                        key={cat}
                        onClick={() => setCategory(cat)}
                        className={cn(
                          "px-5 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all whitespace-nowrap",
                          category === cat ? "bg-white text-black" : "bg-white/5 text-white/50 hover:bg-white/10"
                        )}
                      >
                        {cat}
                      </button>
                    ))}
                  </div>

                  <textarea 
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    placeholder="Capture your evolution..."
                    className="w-full h-80 bg-transparent text-2xl font-soft leading-relaxed border-none focus:ring-0 placeholder:opacity-20 resize-none no-scrollbar"
                    autoFocus
                  />
                </div>

                <div className="flex gap-4">
                   {editingId && (
                     <button 
                       onClick={() => handleDelete(editingId)}
                       className="px-6 py-6 bg-red-500/10 text-red-500 rounded-3xl hover:bg-red-500 hover:text-white transition-all border border-red-500/20"
                     >
                       <Trash2 className="h-6 w-6" />
                     </button>
                   )}
                   <button 
                    onClick={handleSave}
                    className="flex-1 py-6 bg-primary text-primary-foreground font-heading font-black text-xl rounded-3xl hover:scale-[1.01] transition-all shadow-2xl shadow-primary/20 flex items-center justify-center gap-3"
                  >
                    <Save className="h-6 w-6" /> SAVE ENTRY
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

// --- SUB-COMPONENTS ---

function EntryCard({ entry, onDelete, onEdit }: { entry: JournalEntry, onDelete: (id: string) => void, onEdit: () => void }) {
  const [isExpanded, setIsExpanded] = useState(false);
  const shouldTruncate = entry.content.length > 250;
  
  return (
    <motion.div 
      layout
      onClick={onEdit}
      className="bg-zinc-950 text-white p-8 rounded-[40px] border-2 border-white/5 shadow-2xl transition-all group relative overflow-hidden cursor-pointer hover:border-primary/40 active:scale-[0.99] hover:shadow-primary/5"
    >
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <div className={cn(
            "h-8 w-8 rounded-full flex items-center justify-center bg-white/5",
            entry.domain === "Ideas" ? "text-amber-400" :
            entry.domain === "Spiritual" ? "text-accent" :
            entry.domain === "Academic" ? "text-secondary" :
            entry.domain === "Physical" ? "text-monk-mint" : "text-primary"
          )}>
            <DomainIcon domain={entry.domain} size="h-4 w-4" />
          </div>
          <div className="flex flex-col">
            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-primary">{entry.category}</span>
            <span className="text-[10px] font-bold text-white/30 uppercase tracking-widest">{formatDate(new Date(entry.date))}</span>
          </div>
        </div>
        <button 
          onClick={(e) => { e.stopPropagation(); onDelete(entry.id); }} 
          className="p-2 text-white/10 hover:text-red-400 transition-all opacity-0 group-hover:opacity-100"
        >
          <Trash2 className="h-4 w-4" />
        </button>
      </div>

      <div className="space-y-4 relative">
        <p className={cn(
          "font-soft text-xl leading-relaxed text-white/90 whitespace-pre-wrap transition-all duration-500 overflow-hidden",
          !isExpanded && shouldTruncate ? "max-h-[140px]" : "max-h-full"
        )}>
          {entry.content}
        </p>
        
        {!isExpanded && shouldTruncate && (
          <div className="absolute bottom-0 left-0 w-full h-24 bg-gradient-to-t from-zinc-950 via-zinc-950/90 to-transparent pointer-events-none" />
        )}
        
        {shouldTruncate && (
          <button 
            onClick={(e) => { e.stopPropagation(); setIsExpanded(!isExpanded); }}
            className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-primary hover:text-white transition-all mt-4 relative z-10 bg-white/5 px-4 py-2 rounded-full border border-white/10"
          >
            {isExpanded ? (
              <><ChevronUp className="h-3 w-3" /> Show Less</>
            ) : (
              <><ChevronDown className="h-3 w-3" /> Read More</>
            )}
          </button>
        )}
      </div>

      <div className="mt-8 pt-6 border-t border-white/5 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Clock className="h-3.5 w-3.5 text-white/20" />
          <span className="text-[10px] font-bold text-white/30 uppercase tracking-widest">
            {new Date(entry.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </span>
        </div>
        <div className="text-[8px] font-black uppercase tracking-widest text-white/20 px-3 py-1 bg-white/5 rounded-full">
           {entry.domain === "Spiritual" ? "DAILY JOURNAL" : entry.domain}
        </div>
      </div>
    </motion.div>
  );
}

function DomainIcon({ domain, size = "h-4 w-4" }: { domain: JournalEntry["domain"], size?: string }) {
  switch (domain) {
    case "Ideas": return <Lightbulb className={cn(size)} />;
    case "Academic": return <BookText className={cn(size)} />;
    case "Physical": return <Dumbbell className={cn(size)} />;
    case "Emotional": return <Heart className={cn(size)} />;
    case "Spiritual": return <Brain className={cn(size)} />;
  }
}

function HeaderAction({ icon, onClick, disabled, title }: { icon: React.ReactNode, onClick: () => void, disabled: boolean, title: string }) {
  return (
    <button 
      onClick={onClick} disabled={disabled} title={title}
      className="p-3 rounded-xl hover:bg-black/5 dark:hover:bg-white/5 text-muted-foreground hover:text-primary disabled:opacity-20 transition-all"
    >
      {icon}
    </button>
  );
}

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
  Lightbulb
} from "lucide-react";
import { cn, formatDate } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";
import { syncManager } from "@/lib/sync/syncManager";
import { useAuth } from "@/lib/contexts/AuthContext";

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
  const { user } = useAuth();
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
      if (user) {
        syncManager.save('journal_entries', 'UPDATE', {
          id: editingId,
          content,
          category,
          domain
        });
      }
    } else {
      const newEntry: JournalEntry = {
        id: crypto.randomUUID(),
        content,
        category,
        domain,
        date: new Date().toISOString(),
        timestamp: Date.now(),
      };
      updateState([newEntry, ...entries]);
      if (user) {
        syncManager.save('journal_entries', 'INSERT', {
          id: newEntry.id,
          user_id: user.id,
          content: newEntry.content,
          category: newEntry.category,
          domain: newEntry.domain,
          created_at: newEntry.date
        });
      }
    }
    
    setContent("");
    setIsEditorOpen(false);
    setEditingId(null);
  };

  const handleDelete = (id: string) => {
    if (confirm("Permanently erase this reflection?")) {
      updateState(entries.filter(e => e.id !== id));
      if (user) {
        syncManager.save('journal_entries', 'DELETE', { id });
      }
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
    <div className="max-w-7xl mx-auto space-y-10 md:space-y-16 animate-in fade-in duration-700 pb-12 md:pb-24 px-4 sm:px-0">

      {/* --- HEADER --- */}
      <div className="flex flex-col gap-8">
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-8">
          <div className="space-y-3 text-center lg:text-left">
            <div className="inline-flex items-center gap-2 text-[10px] font-black text-primary uppercase tracking-[0.4em] bg-primary/10 px-5 py-2 rounded-full border border-primary/10 mx-auto lg:mx-0 shadow-sm">
              <Sparkles className="h-3 w-3 animate-pulse" /> Categorised Wisdom
            </div>
            <h1 className="text-3xl md:text-5xl lg:text-6xl font-heading font-black tracking-tighter italic text-foreground leading-tight uppercase">
              The Digital Ashram.
            </h1>
          </div>

          <div className="flex items-center justify-between lg:justify-end gap-4 w-full lg:w-auto">
            <div className="flex bg-secondary/50 dark:bg-white/5 p-1.5 rounded-2xl border border-border shadow-inner">
              <HeaderAction icon={<Undo2 className="h-4.5 w-4.5" />} onClick={undo} disabled={historyStep <= 0} title="Undo" />
              <div className="w-px h-6 bg-border/50 mx-1 self-center" />
              <HeaderAction icon={<Redo2 className="h-4.5 w-4.5" />} onClick={redo} disabled={historyStep >= history.length - 1} title="Redo" />
            </div>
            <button
              onClick={handleNewEntry}
              className="flex-1 lg:flex-none flex items-center justify-center gap-3 px-10 py-5 bg-primary text-primary-foreground font-black text-[11px] uppercase tracking-[0.3em] rounded-[24px] hover:scale-105 active:scale-95 transition-all shadow-2xl shadow-primary/20 border border-white/10"
            >
              <Plus className="h-5 w-5 stroke-[2.5px]" /> Reflect
            </button>
          </div>
        </div>

        <div className="relative group max-w-2xl mx-auto w-full">
          <div className="absolute left-5 top-1/2 -translate-y-1/2 flex items-center justify-center">
            <Search className="h-4.5 w-4.5 text-muted-foreground group-focus-within:text-primary transition-colors" />
          </div>
          <input
            type="text"
            placeholder="Search through the silence..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-14 pr-6 py-5 rounded-[24px] bg-card border-2 border-border focus:border-primary/40 focus:outline-none text-base transition-all shadow-sm focus:shadow-xl focus:shadow-primary/[0.02]"
          />
        </div>
      </div>

      {/* --- GRID --- */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12 pb-12">
        {DOMAINS.map((dom) => {
          const domainEntries = filteredEntries.filter(e => e.domain === dom);
          return (
            <section key={dom} className="space-y-8">
              <div className="flex items-center justify-between px-3">
                <div className="flex items-center gap-4">
                  <div className={cn(
                    "h-12 w-12 rounded-2xl flex items-center justify-center shadow-inner transition-transform hover:scale-110",
                    dom === "Ideas" ? "bg-amber-500/10 text-amber-500 border border-amber-500/20" :
                    dom === "Spiritual" ? "bg-accent/10 text-accent border border-accent/20" :
                    dom === "Academic" ? "bg-secondary/50 dark:bg-white/5 text-text-secondary border border-border" :
                    dom === "Physical" ? "bg-monk-mint/10 text-monk-mint border border-monk-mint/20" : "bg-primary/10 text-primary border border-primary/20"
                  )}>
                    <DomainIcon domain={dom} size="h-6 w-6" />
                  </div>
                  <h2 className="text-xl md:text-2xl font-heading font-black uppercase tracking-tight text-foreground italic">
                    {dom === "Spiritual" ? "Daily Journal" : dom}.
                  </h2>
                </div>
                <div className="h-8 px-4 bg-secondary/50 dark:bg-white/5 rounded-full flex items-center justify-center border border-border">
                  <span className="text-[10px] font-black text-text-secondary uppercase tracking-widest">
                    {domainEntries.length}
                  </span>
                </div>
              </div>

              <div className="space-y-6 md:space-y-8">
                {domainEntries.length === 0 ? (
                  <div className="py-16 flex flex-col items-center justify-center text-center bg-secondary/20 dark:bg-white/[0.01] rounded-[32px] border-2 border-dashed border-border group hover:border-primary/20 transition-colors">
                    <div className="h-14 w-14 rounded-full bg-secondary/50 flex items-center justify-center text-muted-foreground/30 mb-4 group-hover:scale-110 transition-transform">
                       <BookText className="h-6 w-6" />
                    </div>
                    <p className="text-[10px] font-black text-muted-foreground/40 uppercase tracking-[0.4em]">The void is waiting</p>
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
              className="w-full max-w-2xl monk-card p-5 md:p-6 md:p-12 shadow-2xl relative z-10"
            >
              <div className="flex items-center justify-between mb-10">
                <h2 className="text-3xl font-heading font-black tracking-tighter uppercase">
                  {editingId ? "Update Entry" : "New Entry"}
                </h2>
                <button onClick={() => setIsEditorOpen(false)} className="p-3 md:p-2 hover:bg-secondary dark:bg-white/5 rounded-full transition-all text-muted-foreground hover:text-foreground"><X /></button>
              </div>

              <div className="space-y-6 md:space-y-10">
                {/* Domain Picker */}
                <div className="grid grid-cols-3 sm:grid-cols-5 gap-3">
                  {DOMAINS.map((dom) => (
                    <button 
                      key={dom}
                      onClick={() => setDomain(dom)}
                      className={cn(
                        "flex flex-col items-center justify-center gap-2 p-4 rounded-[24px] border-2 transition-all",
                        domain === dom ? "border-primary bg-primary/10 text-primary" : "border-border text-muted-foreground/60 hover:border-border/80"
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
                          "px-5 h-11 flex items-center justify-center rounded-xl text-[10px] font-black uppercase tracking-widest transition-all whitespace-nowrap",
                          category === cat ? "bg-primary text-primary-foreground" : "bg-secondary/50 dark:bg-white/10 text-muted-foreground hover:bg-secondary/50"
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
                    className="w-full h-80 bg-transparent text-2xl font-soft leading-relaxed border-none focus:ring-0 placeholder:opacity-20 resize-none no-scrollbar text-foreground"
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
                    className="flex-1 py-6 bg-primary text-primary-foreground font-heading font-black text-xl rounded-3xl hover:scale-[1.01] transition-all shadow-2xl shadow-primary/20 flex items-center justify-center gap-3 min-h-[44px] min-w-[44px] flex items-center justify-center md:min-h-0 md:min-w-0 md:inline-flex"
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
      className="monk-card p-5 md:p-6 md:p-12 border-2 transition-all group relative overflow-hidden cursor-pointer hover:border-primary/40 active:scale-[0.99] hover:shadow-primary/5"
    >
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <div className={cn(
            "h-8 w-8 rounded-full flex items-center justify-center bg-secondary dark:bg-white/5",
            entry.domain === "Ideas" ? "text-amber-400" :
            entry.domain === "Spiritual" ? "text-accent" :
            entry.domain === "Academic" ? "text-secondary" :
            entry.domain === "Physical" ? "text-monk-mint" : "text-primary"
          )}>
            <DomainIcon domain={entry.domain} size="h-4 w-4" />
          </div>
          <div className="flex flex-col">
            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-primary">{entry.category}</span>
            <span className="text-[10px] font-bold text-muted-foreground/60 uppercase tracking-widest">{formatDate(new Date(entry.date))}</span>
          </div>
        </div>
        <button 
          onClick={(e) => { e.stopPropagation(); onDelete(entry.id); }} 
          className="p-2 text-muted-foreground hover:text-red-500 transition-all opacity-100 lg:opacity-0 lg:group-hover:opacity-100 min-h-[44px] min-w-[44px] flex items-center justify-center md:min-h-0 md:min-w-0 md:inline-flex"
        >
          <Trash2 className="h-4 w-4" />
        </button>
      </div>

      <div className="space-y-4 relative">
        <p className={cn(
          "font-soft text-xl leading-relaxed text-foreground/90 whitespace-pre-wrap transition-all duration-500 overflow-hidden",
          !isExpanded && shouldTruncate ? "max-h-[140px]" : "max-h-full"
        )}>
          {entry.content}
        </p>
        
        {!isExpanded && shouldTruncate && (
          <div className="absolute bottom-0 left-0 w-full h-24 bg-gradient-to-t from-card via-card/90 to-transparent pointer-events-none" />
        )}
        
        {shouldTruncate && (
          <button 
            onClick={(e) => { e.stopPropagation(); setIsExpanded(!isExpanded); }}
            className="flex items-center gap-3 md:p-2 text-[10px] font-black uppercase tracking-widest text-primary hover:text-foreground transition-all mt-4 relative z-10 bg-secondary dark:bg-white/5 px-4 py-2 rounded-full border border-border"
          >
            {isExpanded ? (
              <><ChevronUp className="h-3 w-3" /> Show Less</>
            ) : (
              <><ChevronDown className="h-3 w-3" /> Read More</>
            )}
          </button>
        )}
      </div>

      <div className="mt-8 pt-6 border-t border-border flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Clock className="h-3.5 w-3.5 text-muted-foreground/40" />
          <span className="text-[10px] font-bold text-muted-foreground/60 uppercase tracking-widest">
            {new Date(entry.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </span>
        </div>
        <div className="text-[8px] font-black uppercase tracking-widest text-muted-foreground/40 px-3 py-1 bg-secondary dark:bg-white/5 rounded-full">
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
      className="p-3 rounded-xl hover:bg-secondary/50 dark:bg-white/10 dark:bg-white/5 text-muted-foreground hover:text-primary disabled:opacity-20 transition-all min-h-[44px] min-w-[44px] flex items-center justify-center md:min-h-0 md:min-w-0 md:inline-flex"
    >
      {icon}
    </button>
  );
}

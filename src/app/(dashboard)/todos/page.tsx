"use client";

import { useState, useEffect } from "react";
import { Plus, Circle, CheckCircle2, Trash2, RotateCcw } from "lucide-react";
import { motion } from "framer-motion";
import { createClient } from "@/utils/supabase/client";
import { syncManager } from "@/lib/sync/syncManager";
import { useAuth } from "@/lib/contexts/AuthContext";

interface Todo {
  id: string;
  title: string;
  completed: boolean;
}

export default function TodoPage() {
  const { user } = useAuth();
  const [todos, setTodos] = useState<Todo[]>([]);
  const [newTodo, setNewTodo] = useState("");
  
  const supabase = createClient();

  // Load Data
  useEffect(() => {
    const saved = localStorage.getItem("monk_os_todos");
    if (saved) {
      setTodos(JSON.parse(saved));
    } else {
      setTodos([]);
    }
  }, []);

  const saveTodos = (newTodos: Todo[]) => {
    setTodos(newTodos);
    localStorage.setItem("monk_os_todos", JSON.stringify(newTodos));
  };

  const addTodo = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTodo.trim()) return;
    
    const taskTitle = newTodo.trim();
    const newTask = { id: crypto.randomUUID(), title: taskTitle, completed: false };
    const updated = [
      newTask,
      ...todos
    ];
    saveTodos(updated);
    setNewTodo("");

    if (user) {
      syncManager.save('tasks', 'INSERT', {
        id: newTask.id,
        user_id: user.id,
        title: newTask.title,
        status: 'pending',
        due_date: new Date().toISOString().split('T')[0]
      });
    }

    // Auto-sync to Google if connected
    pushToGoogle(taskTitle);
  };

  const pushToGoogle = async (title: string) => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session?.provider_token) return;

    try {
      await fetch(
        'https://www.googleapis.com/calendar/v3/calendars/primary/events',
        {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${session.provider_token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            summary: `[monk mode] Objective: ${title}`,
            description: "Daily task from monk mode Task Execution.",
            start: { dateTime: new Date().toISOString() },
            end: { dateTime: new Date(new Date().getTime() + 15 * 60000).toISOString() },
          }),
        }
      );
    } catch (e) {
      console.error("Google sync error:", e);
    }
  };

  const toggleTodo = (id: string) => {
    const todo = todos.find(t => t.id === id);
    if (!todo) return;

    const updatedStatus = !todo.completed;
    const updated = todos.map(t => 
      t.id === id ? { ...t, completed: updatedStatus } : t
    );
    saveTodos(updated);

    if (user) {
      syncManager.save('tasks', 'UPDATE', {
        id,
        status: updatedStatus ? 'completed' : 'pending'
      });
    }
  };

  const deleteTodo = (id: string) => {
    const updated = todos.filter(t => t.id !== id);
    saveTodos(updated);

    if (user) {
      syncManager.save('tasks', 'DELETE', { id });
    }
  };

  const clearAll = () => {
    if (confirm("Clear all tasks?")) {
      const currentTodos = [...todos];
      saveTodos([]);
      
      if (user) {
        currentTodos.forEach(t => {
          syncManager.save('tasks', 'DELETE', { id: t.id });
        });
      }
    }
  };

  const completedCount = todos.filter(t => t.completed).length;
  const totalCount = todos.length;
  const progress = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

  const activeTodos = todos.filter(t => !t.completed);
  const completedTodos = todos.filter(t => t.completed);

  return (
    <div className="max-w-3xl mx-auto space-y-8 md:space-y-12 animate-in fade-in duration-700 pb-24 md:pb-24 px-4 sm:px-0">    
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 text-center lg:text-left">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 text-[10px] font-black text-primary uppercase tracking-[0.4em] bg-primary/10 px-5 py-2 rounded-full border border-primary/10 shadow-sm mx-auto lg:mx-0">
             Mission Protocols
          </div>
          <h1 className="text-3xl md:text-5xl font-heading font-black text-foreground tracking-tighter uppercase italic leading-tight">Task Execution.</h1>
          <p className="text-text-secondary font-soft text-sm md:text-lg opacity-80 leading-relaxed max-w-lg mx-auto lg:mx-0">Simple daily tasks. Independent of your core identity habits.</p>
        </div>
        <button
          onClick={clearAll}
          className="h-12 w-12 flex items-center justify-center bg-secondary dark:bg-white/5 text-muted-foreground hover:text-rose-500 rounded-2xl transition-all shadow-sm active:scale-90 border border-border mx-auto lg:mx-0 shrink-0"
          title="Clear All Objectives"
        >
          <RotateCcw className="h-5 w-5" />
        </button>
      </div>

      {/* Progress Bar Section */}
      <section className="monk-card p-6 md:p-10 bg-primary/5 border-primary/20 relative overflow-hidden group shadow-xl shadow-primary/[0.02]">
        <div className="absolute top-0 right-0 p-8 opacity-[0.03] pointer-events-none group-hover:rotate-12 transition-transform duration-1000">
           <CheckCircle2 className="h-32 w-32" />
        </div>
        <div className="relative z-10 space-y-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary shadow-inner">
                <CheckCircle2 className="h-6 w-6 stroke-[2.5px]" />
              </div>
              <span className="text-[10px] font-black uppercase tracking-[0.3em] text-primary">Daily Trajectory</span>    
            </div>
            <div className="flex items-baseline gap-1">
              <span className="text-4xl md:text-5xl font-heading font-black text-primary italic tabular-nums tracking-tighter">{progress}%</span>
              <span className="text-[10px] font-black text-primary/40 uppercase tracking-widest">Sync</span>
            </div>
          </div>
          <div className="h-2.5 w-full bg-primary/20 dark:bg-primary/10 rounded-full overflow-hidden shadow-inner">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 1.5, ease: "easeOut" }}
              className="h-full bg-primary rounded-full shadow-[0_0_12px_rgba(217,167,167,0.6)]"
            />
          </div>
          <div className="flex items-center justify-between px-2">
            <p className="text-[10px] font-black text-text-secondary/60 uppercase tracking-[0.2em]"> 
              {completedCount} / {totalCount} Objectives Secured
            </p>
            {progress === 100 && totalCount > 0 && (
              <span className="text-[10px] font-black text-primary uppercase tracking-widest animate-pulse">Maximum Execution</span>
            )}
          </div>
        </div>
      </section>

      <div className="monk-card p-6 md:p-10 shadow-sm border-border">
        <form onSubmit={addTodo} className="flex items-center gap-4 mb-12">
          <input
            autoFocus
            type="text"
            value={newTodo}
            onChange={(e) => setNewTodo(e.target.value)}
            placeholder="Initialize a new objective..."
            className="flex-1 px-6 py-5 bg-background border-2 border-border rounded-[24px] focus:border-primary/40 focus:outline-none transition-all font-heading font-bold text-lg shadow-inner"
          />
          <button
            type="submit"
            className="h-16 w-16 bg-primary text-primary-foreground rounded-[24px] hover:scale-105 active:scale-95 transition-all shadow-2xl shadow-primary/30 flex items-center justify-center shrink-0 border border-white/10"
          >
            <Plus className="h-8 w-8 stroke-[3px]" />
          </button>
        </form>

        <div className="space-y-10">
          <div className="space-y-4">
            <div className="flex items-center justify-between px-2 mb-2">
              <h3 className="text-[10px] font-black text-text-secondary uppercase tracking-[0.3em] opacity-60">Active Stream</h3>
            </div>
            {activeTodos.map(todo => (
              <div
                key={todo.id}
                className="flex items-center justify-between p-6 bg-secondary/30 dark:bg-white/[0.02] rounded-[32px] border-2 border-border/50 group hover:border-primary/30 transition-all cursor-pointer active:scale-[0.98] shadow-sm hover:shadow-lg"
                onClick={() => toggleTodo(todo.id)}
              >
                <div className="flex items-center gap-5 flex-1 min-w-0">
                  <div className="h-10 w-10 rounded-xl bg-secondary dark:bg-white/5 border border-border flex items-center justify-center shrink-0 group-hover:border-primary/50 transition-colors">
                    <Circle className="h-5 w-5 text-text-secondary/40 group-hover:text-primary transition-colors stroke-[2.5px]" />
                  </div>
                  <span className="font-bold text-base md:text-lg text-text-primary truncate">{todo.title}</span>
                </div>
                <button
                  onClick={(e) => { e.stopPropagation(); deleteTodo(todo.id); }}
                  className="opacity-100 lg:opacity-0 lg:group-hover:opacity-100 p-3 text-muted-foreground hover:text-rose-500 transition-all active:scale-90"
                >
                  <Trash2 className="h-5 w-5" />
                </button>
              </div>
            ))}
            {activeTodos.length === 0 && (
              <div className="py-16 text-center space-y-4 opacity-40">
                <div className="h-16 w-16 bg-secondary/50 rounded-full flex items-center justify-center mx-auto shadow-inner">
                  <Circle className="h-6 w-6 text-text-secondary" />
                </div>
                <p className="text-[10px] font-black uppercase tracking-[0.4em]">Zero Active Protocols</p>
              </div>
            )}
          </div>

          {completedTodos.length > 0 && (
            <div className="pt-10 border-t border-border space-y-4">
              <div className="flex items-center justify-between px-2 mb-2">
                <h3 className="text-[10px] font-black text-text-secondary uppercase tracking-[0.3em] opacity-40">Secured Objectives</h3>
              </div>
              {completedTodos.map(todo => (
                <div
                  key={todo.id}
                  className="flex items-center justify-between p-6 bg-secondary/20 dark:bg-white/[0.01] rounded-[32px] border border-border/30 group opacity-60 hover:opacity-100 transition-all cursor-pointer shadow-sm"
                  onClick={() => toggleTodo(todo.id)}
                >
                  <div className="flex items-center gap-5 flex-1 min-w-0">
                    <div className="h-10 w-10 rounded-xl bg-monk-mint/10 border border-monk-mint/20 flex items-center justify-center shrink-0">
                      <CheckCircle2 className="h-6 w-6 text-monk-mint stroke-[2.5px]" />
                    </div>
                    <span className="font-bold text-base md:text-lg line-through text-text-secondary italic truncate">{todo.title}</span>        
                  </div>
                  <button
                    onClick={(e) => { e.stopPropagation(); deleteTodo(todo.id); }}
                    className="opacity-100 lg:opacity-0 lg:group-hover:opacity-100 p-3 text-muted-foreground hover:text-rose-500 transition-all active:scale-90"
                  >
                    <Trash2 className="h-5 w-5" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

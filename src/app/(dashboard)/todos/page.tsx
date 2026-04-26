"use client";

import { useState, useEffect } from "react";
import { Plus, Circle, CheckCircle2, Trash2, RotateCcw } from "lucide-react";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";

interface Todo {
  id: string;
  title: string;
  completed: boolean;
}

export default function TodoPage() {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [newTodo, setNewTodo] = useState("");

  // Load Data
  useEffect(() => {
    const saved = localStorage.getItem("monk_os_todos");
    if (saved) {
      setTodos(JSON.parse(saved));
    } else {
      // Default sample data for first time
      const defaults = [
        { id: "1", title: "Complete DBMS Record", completed: false },
        { id: "2", title: "Buy groceries", completed: false },
        { id: "3", title: "Reply to emails", completed: true },
      ];
      setTodos(defaults);
      localStorage.setItem("monk_os_todos", JSON.stringify(defaults));
    }
  }, []);

  const saveTodos = (newTodos: Todo[]) => {
    setTodos(newTodos);
    localStorage.setItem("monk_os_todos", JSON.stringify(newTodos));
  };

  const addTodo = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTodo.trim()) return;
    
    const updated = [
      { id: Math.random().toString(36).substr(2, 9), title: newTodo, completed: false },
      ...todos
    ];
    saveTodos(updated);
    setNewTodo("");
  };

  const toggleTodo = (id: string) => {
    const updated = todos.map(t => 
      t.id === id ? { ...t, completed: !t.completed } : t
    );
    saveTodos(updated);
  };

  const deleteTodo = (id: string) => {
    const updated = todos.filter(t => t.id !== id);
    saveTodos(updated);
  };

  const clearAll = () => {
    if (confirm("Clear all tasks?")) {
      saveTodos([]);
    }
  };

  const completedCount = todos.filter(t => t.completed).length;
  const totalCount = todos.length;
  const progress = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

  const activeTodos = todos.filter(t => !t.completed);
  const completedTodos = todos.filter(t => t.completed);

  return (
    <div className="max-w-3xl mx-auto space-y-8 animate-in fade-in duration-500 pb-20">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-heading font-bold text-foreground">Task Execution</h1>
          <p className="text-muted-foreground mt-1">Simple daily tasks. Independent of your core identity habits.</p>
        </div>
        <button 
          onClick={clearAll}
          className="p-3 bg-secondary/10 text-muted-foreground hover:text-red-500 rounded-2xl transition-all"
          title="Clear All"
        >
          <RotateCcw className="h-5 w-5" />
        </button>
      </div>

      {/* Progress Bar Section */}
      <section className="monk-card p-6 bg-primary/5 border-primary/10">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="h-5 w-5 text-primary" />
            <span className="text-sm font-bold uppercase tracking-widest text-primary">Daily Progress</span>
          </div>
          <span className="text-2xl font-heading font-black text-primary">{progress}%</span>
        </div>
        <div className="h-3 w-full bg-primary/20 rounded-full overflow-hidden">
          <motion.div 
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 1 }}
            className="h-full bg-primary rounded-full shadow-[0_0_15px_rgba(246,193,204,0.6)]" 
          />
        </div>
        <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-[0.2em] mt-4 text-center">
          {completedCount} of {totalCount} Tasks Executed
        </p>
      </section>

      <div className="monk-card p-6">
        <form onSubmit={addTodo} className="flex items-center gap-4 mb-8">
          <input
            type="text"
            value={newTodo}
            onChange={(e) => setNewTodo(e.target.value)}
            placeholder="Add a new task..."
            className="flex-1 px-4 py-3 bg-background border border-monk-rose/20 rounded-xl focus:outline-none focus:border-primary/50 transition-all font-soft"
          />
          <button 
            type="submit"
            className="p-3 bg-primary text-primary-foreground rounded-xl hover:scale-105 transition-all shadow-md"
          >
            <Plus className="h-5 w-5" />
          </button>
        </form>

        <div className="space-y-6">
          <div className="space-y-3">
            {activeTodos.map(todo => (
              <div 
                key={todo.id}
                className="flex items-center justify-between p-4 bg-background/50 rounded-xl border border-monk-rose/10 group hover:border-primary/30 transition-all cursor-pointer"
                onClick={() => toggleTodo(todo.id)}
              >
                <div className="flex items-center gap-3">
                  <Circle className="h-5 w-5 text-muted-foreground group-hover:text-primary transition-colors" />
                  <span className="font-medium">{todo.title}</span>
                </div>
                <button 
                  onClick={(e) => { e.stopPropagation(); deleteTodo(todo.id); }}
                  className="opacity-0 group-hover:opacity-100 p-2 text-muted-foreground hover:text-red-500 transition-all"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            ))}
            {activeTodos.length === 0 && (
              <p className="text-center text-sm text-muted-foreground py-4 italic">No active tasks. Free to focus.</p>
            )}
          </div>

          {completedTodos.length > 0 && (
            <div className="pt-6 border-t border-monk-rose/10 space-y-3">
              <h3 className="text-[10px] font-bold text-muted-foreground uppercase tracking-[0.2em] mb-4">Completed Objectives</h3>
              {completedTodos.map(todo => (
                <div 
                  key={todo.id}
                  className="flex items-center justify-between p-4 bg-background/20 rounded-xl border border-monk-rose/5 group opacity-60 hover:opacity-100 transition-all cursor-pointer"
                  onClick={() => toggleTodo(todo.id)}
                >
                  <div className="flex items-center gap-3">
                    <CheckCircle2 className="h-5 w-5 text-primary" />
                    <span className="font-medium line-through text-muted-foreground">{todo.title}</span>
                  </div>
                  <button 
                    onClick={(e) => { e.stopPropagation(); deleteTodo(todo.id); }}
                    className="opacity-0 group-hover:opacity-100 p-2 text-muted-foreground hover:text-red-500 transition-all"
                  >
                    <Trash2 className="h-4 w-4" />
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

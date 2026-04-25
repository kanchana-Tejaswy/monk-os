"use client";

import { useState } from "react";
import { Plus, Circle, CheckCircle2, Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface Todo {
  id: string;
  title: string;
  completed: boolean;
}

export default function TodoPage() {
  const [todos, setTodos] = useState<Todo[]>([
    { id: "1", title: "Complete DBMS Record", completed: false },
    { id: "2", title: "Buy groceries", completed: false },
    { id: "3", title: "Reply to emails", completed: true },
  ]);
  const [newTodo, setNewTodo] = useState("");

  const addTodo = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTodo.trim()) return;
    
    setTodos([
      { id: Math.random().toString(), title: newTodo, completed: false },
      ...todos
    ]);
    setNewTodo("");
  };

  const toggleTodo = (id: string) => {
    setTodos(todos.map(t => 
      t.id === id ? { ...t, completed: !t.completed } : t
    ));
  };

  const deleteTodo = (id: string) => {
    setTodos(todos.filter(t => t.id !== id));
  };

  const activeTodos = todos.filter(t => !t.completed);
  const completedTodos = todos.filter(t => t.completed);

  return (
    <div className="max-w-3xl mx-auto space-y-8 animate-in fade-in duration-500">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-heading font-bold text-foreground">Task Execution</h1>
        <p className="text-muted-foreground mt-1">Simple daily tasks. Independent of your core identity habits.</p>
      </div>

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
              <p className="text-center text-sm text-muted-foreground py-4">No active tasks.</p>
            )}
          </div>

          {completedTodos.length > 0 && (
            <div className="pt-6 border-t border-monk-rose/10 space-y-3">
              <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-widest mb-4">Completed</h3>
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

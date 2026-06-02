import { calculateStreak } from "./streak";

export interface LifeScoreData {
  habits: { id: string; isNonNegotiable?: boolean; is_non_negotiable?: boolean }[];
  logs: Record<string, boolean>;
  focusSessions: { timestamp?: string; completed_at?: string; duration?: number; duration_minutes?: number }[];
  financeTransactions: { type: string; amount: number | string; date?: string; created_at?: string }[];
  goals: { status?: string; progress?: number }[];
  tasks: { due_date?: string; date?: string; status?: string; completed?: boolean }[];
  ikigai: { love_answers?: string[]; good_at_answers?: string[]; world_needs_answers?: string[]; paid_for_answers?: string[]; ikigai_statement?: string } | null;
  ironWill: { startDate: string; lastResetDate: string | null }[];
  journal: { content: string; created_at?: string; date?: string }[];
  restartDate?: string | null;
}

export interface LifeScoreResult {
  current: number;
  discipline: number;
  focus: number;
  purpose: number;
  execution: number;
  finance: number;
  trend7d: number;
  trend30d: number;
  improvement: number;
}

export function calculateLifeScore(data: LifeScoreData): LifeScoreResult {
  const todayStr = new Date().toISOString().split('T')[0];
  
  // 1. Discipline (30%) - Habits + Streak + Iron Will
  const nonNegotiableHabits = data.habits.filter(h => h.isNonNegotiable || h.is_non_negotiable);
  const habitsToday = nonNegotiableHabits.filter(hab => data.logs[`${todayStr}-${hab.id}`]).length;
  const habitCompletionRate = nonNegotiableHabits.length > 0 ? (habitsToday / nonNegotiableHabits.length) : 1;
  
  const streak = calculateStreak(data.logs, nonNegotiableHabits.map(h => h.id), data.restartDate);
  const streakBonus = Math.min(streak * 2, 20); // Up to 20% bonus for streaks
  
  const disciplineScore = Math.min(100, (habitCompletionRate * 80) + streakBonus);

  // 2. Focus (25%) - Deep Work Hours
  const todayFocusMinutes = data.focusSessions
    .filter(s => (s.timestamp || s.completed_at || '').startsWith(todayStr))
    .reduce((acc, curr) => acc + (curr.duration || curr.duration_minutes || 0), 0);
    
  const focusScore = Math.min(100, (todayFocusMinutes / 240) * 100); // 4h goal

  // 3. Purpose Alignment (20%) - Ikigai Completion + Reflection Consistency
  const ikigaiFields = [
    data.ikigai?.love_answers,
    data.ikigai?.good_at_answers,
    data.ikigai?.world_needs_answers,
    data.ikigai?.paid_for_answers,
    data.ikigai?.ikigai_statement
  ];
  const ikigaiCompletion = ikigaiFields.filter(f => f && (Array.isArray(f) ? f.length > 0 : true)).length / 5;
  const purposeScore = ikigaiCompletion * 100;

  // 4. Execution (15%) - Goals + Tasks
  const completedGoals = data.goals.filter(g => g.status === 'completed' || g.progress === 100).length;
  const goalRate = data.goals.length > 0 ? (completedGoals / data.goals.length) : 1;
  
  const tasksToday = data.tasks.filter(t => (t.due_date || t.date || '').startsWith(todayStr));
  const completedTasksToday = tasksToday.filter(t => t.status === 'completed' || t.completed).length;
  const taskRate = tasksToday.length > 0 ? (completedTasksToday / tasksToday.length) : 1;
  
  const executionScore = (goalRate * 0.6 + taskRate * 0.4) * 100;

  // 5. Finance (10%) - Savings Rate / Balance Positive
  const currentMonth = todayStr.slice(0, 7);
  const monthTxs = data.financeTransactions.filter(t => (t.date || t.created_at || '').startsWith(currentMonth));
  const income = monthTxs.filter(t => t.type === 'credit').reduce((a, b) => a + Number(b.amount || 0), 0);
  const spent = monthTxs.filter(t => t.type === 'debit').reduce((a, b) => a + Number(b.amount || 0), 0);
  const savingsRate = income > 0 ? Math.max(0, (income - spent) / income) : (spent > 0 ? 0 : 1);
  const financeScore = savingsRate * 100;

  // Weighted Calculation
  const current = Math.round(
    (disciplineScore * 0.30) +
    (focusScore * 0.25) +
    (purposeScore * 0.20) +
    (executionScore * 0.15) +
    (financeScore * 0.10)
  );

  return {
    current,
    discipline: Math.round(disciplineScore),
    focus: Math.round(focusScore),
    purpose: Math.round(purposeScore),
    execution: Math.round(executionScore),
    finance: Math.round(financeScore),
    trend7d: 0,
    trend30d: 0,
    improvement: 0
  };
}

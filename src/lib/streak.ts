export function calculateStreak(logs: Record<string, boolean>, habitIds: string[], restartDate?: string | null) {
  let streak = 0;
  const today = new Date();
  
  const todayStr = today.toISOString().split('T')[0];
  const isTodayPerfect = habitIds.length > 0 && habitIds.every(id => logs[`${todayStr}-${id}`]);
  
  if (isTodayPerfect && (!restartDate || todayStr >= restartDate)) {
    streak++;
  }

  const checkDate = new Date(today);
  checkDate.setDate(checkDate.getDate() - 1);
  
  while (true) {
    const dateStr = checkDate.toISOString().split('T')[0];
    if (restartDate && dateStr < restartDate) break;
    
    const isPerfect = habitIds.length > 0 && habitIds.every(id => logs[`${dateStr}-${id}`]);
    if (isPerfect) {
      streak++;
      checkDate.setDate(checkDate.getDate() - 1);
    } else {
      break;
    }
  }
  
  return streak;
}

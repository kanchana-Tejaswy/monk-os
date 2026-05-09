export function calculateStreak(logs: Record<string, boolean>, habitIds: string[], restartDate?: string | null) {
  let streak = 0;
  const today = new Date();
  
  const todayStr = today.toISOString().split('T')[0];
  const isTodayPerfect = habitIds.length > 0 && habitIds.every(id => logs[`${todayStr}-${id}`]);
  
  // Note: if today is not perfect, we don't break yet, we just don't increment.
  // A streak is usually counted up to yesterday if today isn't finished.
  // But if today is perfect, it definitely counts.
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

export function calculateLongestStreak(logs: Record<string, boolean>, habitIds: string[]) {
  if (habitIds.length === 0) return 0;
  
  let longest = 0;
  let current = 0;
  
  // We need to find the range of dates in the logs
  const logKeys = Object.keys(logs);
  if (logKeys.length === 0) return 0;
  
  const dates = logKeys.map(k => k.split('-').slice(0, 3).join('-'));
  const uniqueDates = Array.from(new Set(dates)).sort();
  
  if (uniqueDates.length === 0) return 0;
  
  const firstDate = new Date(uniqueDates[0]);
  const lastDate = new Date(); // Check up to today
  
  const checkDate = new Date(firstDate);
  
  while (checkDate <= lastDate) {
    const dateStr = checkDate.toISOString().split('T')[0];
    const isPerfect = habitIds.every(id => logs[`${dateStr}-${id}`]);
    
    if (isPerfect) {
      current++;
      if (current > longest) longest = current;
    } else {
      current = 0;
    }
    checkDate.setDate(checkDate.getDate() + 1);
  }
  
  return longest;
}

export function calculateAllTimeStats(logs: Record<string, boolean>, habitIds: string[]) {
  if (habitIds.length === 0) return { totalPerfectDays: 0, longestStreak: 0, consistency: 0, monthlyHistory: [] };

  const logKeys = Object.keys(logs);
  const dates = logKeys.map(k => k.split('-').slice(0, 3).join('-'));
  const uniqueDates = Array.from(new Set(dates)).sort();
  
  if (uniqueDates.length === 0) return { totalPerfectDays: 0, longestStreak: 0, consistency: 0, monthlyHistory: [] };

  let totalPerfectDays = 0;
  const firstDate = new Date(uniqueDates[0]);
  const lastDate = new Date();
  
  const monthlyData: Record<string, { daysCompleted: number, totalDays: number, longestStreak: number, currentStreak: number }> = {};
  
  let currentStreak = 0;
  let overallLongestStreak = 0;
  
  const checkDate = new Date(firstDate);
  while (checkDate <= lastDate) {
    const dateStr = checkDate.toISOString().split('T')[0];
    const monthKey = `${checkDate.getFullYear()}-${checkDate.getMonth()}`;
    const monthName = checkDate.toLocaleString('default', { month: 'long' });
    const year = checkDate.getFullYear();
    const fullMonthKey = `${monthName} ${year}`;

    if (!monthlyData[fullMonthKey]) {
      monthlyData[fullMonthKey] = { daysCompleted: 0, totalDays: 0, longestStreak: 0, currentStreak: 0 };
    }

    monthlyData[fullMonthKey].totalDays++;

    const isPerfect = habitIds.every(id => logs[`${dateStr}-${id}`]);
    if (isPerfect) {
      totalPerfectDays++;
      currentStreak++;
      monthlyData[fullMonthKey].daysCompleted++;
      monthlyData[fullMonthKey].currentStreak++;
      
      if (currentStreak > overallLongestStreak) overallLongestStreak = currentStreak;
      if (monthlyData[fullMonthKey].currentStreak > monthlyData[fullMonthKey].longestStreak) {
        monthlyData[fullMonthKey].longestStreak = monthlyData[fullMonthKey].currentStreak;
      }
    } else {
      currentStreak = 0;
      monthlyData[fullMonthKey].currentStreak = 0;
    }
    
    checkDate.setDate(checkDate.getDate() + 1);
  }

  const monthlyHistory = Object.entries(monthlyData).map(([key, data]) => {
    const [month, year] = key.split(' ');
    return {
      month,
      year: parseInt(year),
      daysCompleted: data.daysCompleted,
      totalDays: data.totalDays,
      longestStreak: data.longestStreak
    };
  }).reverse();

  // Total days since start
  const diffTime = Math.abs(lastDate.getTime() - firstDate.getTime());
  const totalDaysElapsed = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
  const consistency = Math.round((totalPerfectDays / totalDaysElapsed) * 100);

  return {
    totalPerfectDays,
    longestStreak: overallLongestStreak,
    consistency,
    monthlyHistory
  };
}

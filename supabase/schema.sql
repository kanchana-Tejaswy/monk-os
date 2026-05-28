-- MONK MODE Database Schema

-- 1. Profiles (Extends Supabase Auth)
CREATE TABLE profiles (
  id UUID REFERENCES auth.users ON DELETE CASCADE PRIMARY KEY,
  full_name TEXT,
  avatar_url TEXT,
  identity_type TEXT CHECK (identity_type IN ('Student', 'Builder', 'Monk Mode', 'Athlete', 'Creator')),
  life_score DECIMAL DEFAULT 0,
  discipline_score DECIMAL DEFAULT 0,
  energy_score DECIMAL DEFAULT 0,
  wake_time TIME,
  sleep_time TIME,
  deep_work_goal_hours INTEGER,
  water_goal_liters DECIMAL,
  subscription_tier TEXT DEFAULT 'Free' CHECK (subscription_tier IN ('Free', 'Mastery')),
  subscription_expiry TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 1.1 Redeem Codes
CREATE TABLE redeem_codes (
  code TEXT PRIMARY KEY,
  duration_type TEXT CHECK (duration_type IN ('1month', '1year', 'lifetime')),
  is_used BOOLEAN DEFAULT FALSE,
  used_by UUID REFERENCES profiles(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  used_at TIMESTAMP WITH TIME ZONE
);

-- 2. Habits (Non-Negotiables)
CREATE TABLE habits (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  category TEXT NOT NULL, -- 'Academic', 'Health', 'Spiritual', 'Skill', 'Finance', 'Personal'
  is_non_negotiable BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Habit Logs (Tracking)
CREATE TABLE habit_logs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  habit_id UUID REFERENCES habits(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  completed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  is_perfect_day BOOLEAN DEFAULT FALSE,
  streak_count INTEGER DEFAULT 0
);

-- 4. Tasks (Daily Execution)
CREATE TABLE tasks (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  category TEXT,
  priority TEXT CHECK (priority IN ('Low', 'Medium', 'High')),
  estimated_minutes INTEGER,
  is_deep_work BOOLEAN DEFAULT FALSE,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'cancelled')),
  due_date DATE DEFAULT CURRENT_DATE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 5. Focus Sessions (Deep Work)
CREATE TABLE focus_sessions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  mode TEXT NOT NULL, -- 'Study', 'Coding', 'Reading', 'Meditation'
  task_id UUID REFERENCES tasks(id) ON DELETE SET NULL,
  duration_minutes INTEGER NOT NULL,
  completed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 6. Finances (Credits/Debits)
CREATE TABLE finances (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('credit', 'debit')),
  amount DECIMAL NOT NULL,
  reason TEXT NOT NULL,
  category TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 7. Bills (Recurring)
CREATE TABLE bills (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  amount DECIMAL NOT NULL,
  due_date DATE NOT NULL,
  is_paid BOOLEAN DEFAULT FALSE,
  repeat_interval TEXT -- 'Monthly', 'One-time'
);

-- 8. Debts (Borrowed/Lent)
CREATE TABLE debts (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  person_name TEXT NOT NULL,
  amount DECIMAL NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('owe', 'receivable')),
  reason TEXT,
  due_date DATE
);

-- 9. Journal (Daily Reflections)
CREATE TABLE journal_entries (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  content TEXT NOT NULL,
  category TEXT, -- 'Morning', 'Evening', 'General'
  domain TEXT, -- 'Discipline', 'Gratitude', 'Vision'
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 10. Iron Will (Elimination Challenges)
CREATE TABLE iron_will_challenges (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  start_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  last_reset_date TIMESTAMP WITH TIME ZONE,
  personal_best INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 11. Iron Will Logs (Relapse History)
CREATE TABLE iron_will_logs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  challenge_id UUID REFERENCES iron_will_challenges(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  reason TEXT,
  occurred_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 12. Ikigai (Life Direction)
CREATE TABLE ikigai_data (
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE PRIMARY KEY,
  love_answers TEXT[],
  good_at_answers TEXT[],
  world_needs_answers TEXT[],
  paid_for_answers TEXT[],
  ikigai_statement TEXT,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE habits ENABLE ROW LEVEL SECURITY;
ALTER TABLE habit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE focus_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE finances ENABLE ROW LEVEL SECURITY;
ALTER TABLE bills ENABLE ROW LEVEL SECURITY;
ALTER TABLE debts ENABLE ROW LEVEL SECURITY;
ALTER TABLE journal_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE iron_will_challenges ENABLE ROW LEVEL SECURITY;
ALTER TABLE iron_will_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE ikigai_data ENABLE ROW LEVEL SECURITY;

-- RLS Policies (User can only see/edit their own data)

CREATE POLICY "Users can view own profile" ON profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON profiles FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can handle own habits" ON habits FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users can handle own habit logs" ON habit_logs FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users can handle own tasks" ON tasks FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users can handle own focus sessions" ON focus_sessions FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users can handle own finances" ON finances FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users can handle own bills" ON bills FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users can handle own debts" ON debts FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users can handle own journal entries" ON journal_entries FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users can handle own iron will challenges" ON iron_will_challenges FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users can handle own iron will logs" ON iron_will_logs FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users can handle own ikigai data" ON ikigai_data FOR ALL USING (auth.uid() = user_id);

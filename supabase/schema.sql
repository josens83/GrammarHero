-- GrammarHero Database Schema
-- Run this in your Supabase SQL editor to set up the database

-- Users profiles (extends Supabase Auth)
CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT UNIQUE NOT NULL,
  username TEXT UNIQUE,
  display_name TEXT,
  avatar_url TEXT,
  level INTEGER DEFAULT 1,
  total_xp INTEGER DEFAULT 0,
  current_streak INTEGER DEFAULT 0,
  longest_streak INTEGER DEFAULT 0,
  last_activity_date DATE,
  subscription_tier TEXT DEFAULT 'free' CHECK (subscription_tier IN ('free', 'pro', 'premium')),
  subscription_expires_at TIMESTAMPTZ,
  stripe_customer_id TEXT,
  daily_goal INTEGER DEFAULT 10,
  hearts INTEGER DEFAULT 5,
  hearts_refill_at TIMESTAMPTZ,
  timezone TEXT DEFAULT 'UTC',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Grammar categories
CREATE TABLE IF NOT EXISTS categories (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  icon TEXT,
  color TEXT,
  order_index INTEGER DEFAULT 0
);

-- Lessons
CREATE TABLE IF NOT EXISTS lessons (
  id TEXT PRIMARY KEY,
  category_id TEXT REFERENCES categories(id),
  title TEXT NOT NULL,
  description TEXT,
  difficulty TEXT DEFAULT 'beginner' CHECK (difficulty IN ('beginner', 'intermediate', 'advanced')),
  order_index INTEGER DEFAULT 0,
  xp_reward INTEGER DEFAULT 10,
  content JSONB,
  exercises JSONB,
  is_premium BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- User progress on lessons
CREATE TABLE IF NOT EXISTS user_progress (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  lesson_id TEXT REFERENCES lessons(id),
  status TEXT DEFAULT 'locked' CHECK (status IN ('locked', 'available', 'in_progress', 'completed')),
  score INTEGER DEFAULT 0,
  xp_earned INTEGER DEFAULT 0,
  attempts INTEGER DEFAULT 0,
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, lesson_id)
);

-- User achievements
CREATE TABLE IF NOT EXISTS user_achievements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  achievement_id TEXT NOT NULL,
  unlocked_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, achievement_id)
);

-- Streak history (daily activity tracking)
CREATE TABLE IF NOT EXISTS streak_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  xp_earned INTEGER DEFAULT 0,
  lessons_completed INTEGER DEFAULT 0,
  exercises_completed INTEGER DEFAULT 0,
  time_spent_minutes INTEGER DEFAULT 0,
  perfect_lessons INTEGER DEFAULT 0,
  UNIQUE(user_id, date)
);

-- User streak freeze inventory
CREATE TABLE IF NOT EXISTS user_streak_freezes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  available INTEGER DEFAULT 0,
  used_total INTEGER DEFAULT 0,
  last_used_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id)
);

-- Review items for spaced repetition
CREATE TABLE IF NOT EXISTS review_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  lesson_id TEXT REFERENCES lessons(id),
  exercise_id TEXT NOT NULL,
  question TEXT NOT NULL,
  correct_answer TEXT NOT NULL,
  category TEXT,
  difficulty TEXT DEFAULT 'medium',
  ease_factor DECIMAL(3,2) DEFAULT 2.50,
  interval_days INTEGER DEFAULT 1,
  repetitions INTEGER DEFAULT 0,
  next_review_date DATE DEFAULT CURRENT_DATE,
  last_reviewed_at TIMESTAMPTZ,
  last_quality INTEGER,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Notifications
CREATE TABLE IF NOT EXISTS notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (type IN ('achievement', 'streak', 'challenge', 'system', 'social')),
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  data JSONB,
  read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- User settings
CREATE TABLE IF NOT EXISTS user_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  sound_enabled BOOLEAN DEFAULT TRUE,
  animations_enabled BOOLEAN DEFAULT TRUE,
  daily_reminder BOOLEAN DEFAULT TRUE,
  reminder_time TIME DEFAULT '09:00',
  weekly_report BOOLEAN DEFAULT TRUE,
  achievement_notifications BOOLEAN DEFAULT TRUE,
  streak_notifications BOOLEAN DEFAULT TRUE,
  theme TEXT DEFAULT 'system' CHECK (theme IN ('light', 'dark', 'system')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id)
);

-- Contact form submissions
CREATE TABLE IF NOT EXISTS contact_submissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  subject TEXT NOT NULL,
  message TEXT NOT NULL,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'in_progress', 'resolved', 'closed')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_achievements ENABLE ROW LEVEL SECURITY;
ALTER TABLE streak_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_streak_freezes ENABLE ROW LEVEL SECURITY;
ALTER TABLE review_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE contact_submissions ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view own profile" ON profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Users can insert own profile" ON profiles FOR INSERT WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can view own progress" ON user_progress FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can update own progress" ON user_progress FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can view own achievements" ON user_achievements FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own achievements" ON user_achievements FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view own streak history" ON streak_history FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can manage own streak history" ON streak_history FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can view own streak freezes" ON user_streak_freezes FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can manage own streak freezes" ON user_streak_freezes FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can view own review items" ON review_items FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can manage own review items" ON review_items FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can view own notifications" ON notifications FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can update own notifications" ON notifications FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own notifications" ON notifications FOR DELETE USING (auth.uid() = user_id);

CREATE POLICY "Users can view own settings" ON user_settings FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can manage own settings" ON user_settings FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can insert contact submissions" ON contact_submissions FOR INSERT WITH CHECK (auth.uid() = user_id OR user_id IS NULL);
CREATE POLICY "Users can view own contact submissions" ON contact_submissions FOR SELECT USING (auth.uid() = user_id);

-- Public read access for lessons and categories
CREATE POLICY "Anyone can view categories" ON categories FOR SELECT TO PUBLIC USING (true);
CREATE POLICY "Anyone can view lessons" ON lessons FOR SELECT TO PUBLIC USING (true);

-- Insert default categories
INSERT INTO categories (id, name, description, icon, color, order_index) VALUES
  ('tenses', 'Tenses', 'Past, present, future', 'Clock', 'bg-blue-500', 1),
  ('articles', 'Articles', 'A, an, the', 'FileText', 'bg-green-500', 2),
  ('prepositions', 'Prepositions', 'In, on, at, by', 'MapPin', 'bg-purple-500', 3),
  ('pronouns', 'Pronouns', 'He, she, they, it', 'Users', 'bg-orange-500', 4),
  ('conjunctions', 'Conjunctions', 'And, but, or', 'Link', 'bg-pink-500', 5),
  ('modals', 'Modal Verbs', 'Can, could, should', 'Zap', 'bg-yellow-500', 6),
  ('conditionals', 'Conditionals', 'If clauses', 'GitBranch', 'bg-red-500', 7),
  ('passive', 'Passive Voice', 'Was done, is made', 'RefreshCw', 'bg-cyan-500', 8)
ON CONFLICT (id) DO NOTHING;

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers for updated_at
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_user_progress_updated_at
  BEFORE UPDATE ON user_progress
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_user_streak_freezes_updated_at
  BEFORE UPDATE ON user_streak_freezes
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_review_items_updated_at
  BEFORE UPDATE ON review_items
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_user_settings_updated_at
  BEFORE UPDATE ON user_settings
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_user_progress_user_id ON user_progress(user_id);
CREATE INDEX IF NOT EXISTS idx_user_progress_lesson_id ON user_progress(lesson_id);
CREATE INDEX IF NOT EXISTS idx_streak_history_user_date ON streak_history(user_id, date DESC);
CREATE INDEX IF NOT EXISTS idx_user_achievements_user_id ON user_achievements(user_id);
CREATE INDEX IF NOT EXISTS idx_review_items_user_next_review ON review_items(user_id, next_review_date);
CREATE INDEX IF NOT EXISTS idx_notifications_user_unread ON notifications(user_id, read, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_profiles_total_xp ON profiles(total_xp DESC);
CREATE INDEX IF NOT EXISTS idx_lessons_category ON lessons(category_id, order_index);

-- Insert default lessons
INSERT INTO lessons (id, category_id, title, description, difficulty, order_index, xp_reward, content, exercises, is_premium) VALUES
  ('present-simple', 'tenses', 'Present Simple', 'Learn when to use the present simple tense', 'beginner', 1, 15,
   '{"introduction": "The present simple is used to describe habits, facts, and regular actions.", "rules": ["Use base form of verb for I/you/we/they", "Add -s or -es for he/she/it", "Use do/does for questions and negatives"], "examples": ["I work every day.", "She works at a bank.", "Do you like coffee?"]}',
   '[{"id": "ps-1", "type": "multiple-choice", "question": "Choose the correct form: She ___ to work by bus.", "options": ["go", "goes", "going", "went"], "correctAnswer": 1}, {"id": "ps-2", "type": "fill-blank", "question": "They ___ (not/like) spicy food.", "correctAnswer": "don''t like"}, {"id": "ps-3", "type": "multiple-choice", "question": "Which sentence is correct?", "options": ["He don''t work here.", "He doesn''t works here.", "He doesn''t work here.", "He not work here."], "correctAnswer": 2}]',
   false),
  ('past-simple', 'tenses', 'Past Simple', 'Master the past simple tense for completed actions', 'beginner', 2, 15,
   '{"introduction": "The past simple describes completed actions in the past.", "rules": ["Regular verbs: add -ed", "Irregular verbs: must be memorized", "Use did for questions and negatives"], "examples": ["I walked to school yesterday.", "She went to Paris last year.", "Did you see the movie?"]}',
   '[{"id": "ps-1", "type": "multiple-choice", "question": "Yesterday, I ___ a delicious meal.", "options": ["cook", "cooked", "cooking", "cooks"], "correctAnswer": 1}, {"id": "ps-2", "type": "fill-blank", "question": "She ___ (go) to the store an hour ago.", "correctAnswer": "went"}, {"id": "ps-3", "type": "sentence-correction", "question": "He didn''t went to the party.", "correctAnswer": "He didn''t go to the party."}]',
   false),
  ('articles-basics', 'articles', 'Articles: A, An, The', 'Understand when to use a, an, and the', 'beginner', 1, 15,
   '{"introduction": "Articles are small words that come before nouns.", "rules": ["Use ''a'' before consonant sounds", "Use ''an'' before vowel sounds", "Use ''the'' for specific things"], "examples": ["I saw a cat.", "She ate an apple.", "The sun is bright."]}',
   '[{"id": "ab-1", "type": "multiple-choice", "question": "I need ___ umbrella.", "options": ["a", "an", "the", "no article"], "correctAnswer": 1}, {"id": "ab-2", "type": "fill-blank", "question": "___ Earth revolves around ___ Sun.", "correctAnswer": "The, the"}, {"id": "ab-3", "type": "multiple-choice", "question": "She is ___ honest person.", "options": ["a", "an", "the", "no article"], "correctAnswer": 1}]',
   false),
  ('prepositions-place', 'prepositions', 'Prepositions of Place', 'Learn in, on, at for locations', 'beginner', 1, 15,
   '{"introduction": "Prepositions of place tell us where something is.", "rules": ["Use ''in'' for enclosed spaces", "Use ''on'' for surfaces", "Use ''at'' for specific points"], "examples": ["The book is in the bag.", "The cup is on the table.", "Meet me at the station."]}',
   '[{"id": "pp-1", "type": "multiple-choice", "question": "The keys are ___ the drawer.", "options": ["in", "on", "at", "by"], "correctAnswer": 0}, {"id": "pp-2", "type": "fill-blank", "question": "I''ll meet you ___ the airport.", "correctAnswer": "at"}, {"id": "pp-3", "type": "multiple-choice", "question": "The picture is ___ the wall.", "options": ["in", "on", "at", "by"], "correctAnswer": 1}]',
   false),
  ('present-continuous', 'tenses', 'Present Continuous', 'Express actions happening now', 'beginner', 3, 15,
   '{"introduction": "The present continuous describes actions happening at this moment.", "rules": ["Use am/is/are + verb-ing", "Used for temporary situations", "Used for future arrangements"], "examples": ["I am working now.", "She is studying English.", "We are meeting tomorrow."]}',
   '[{"id": "pc-1", "type": "multiple-choice", "question": "Look! It ___.", "options": ["rains", "is raining", "rained", "rain"], "correctAnswer": 1}, {"id": "pc-2", "type": "fill-blank", "question": "They ___ (watch) TV right now.", "correctAnswer": "are watching"}, {"id": "pc-3", "type": "sentence-correction", "question": "She is work at the moment.", "correctAnswer": "She is working at the moment."}]',
   false),
  ('future-will', 'tenses', 'Future with Will', 'Make predictions and spontaneous decisions', 'intermediate', 4, 20,
   '{"introduction": "Use ''will'' for predictions, promises, and spontaneous decisions.", "rules": ["Will + base form of verb", "Won''t for negatives", "Will you...? for questions"], "examples": ["I will help you.", "It will rain tomorrow.", "Will you marry me?"]}',
   '[{"id": "fw-1", "type": "multiple-choice", "question": "I think it ___ tomorrow.", "options": ["rains", "will rain", "is raining", "rained"], "correctAnswer": 1}, {"id": "fw-2", "type": "fill-blank", "question": "Don''t worry. I ___ (not/tell) anyone.", "correctAnswer": "won''t tell"}, {"id": "fw-3", "type": "multiple-choice", "question": "___ you help me with this?", "options": ["Do", "Are", "Will", "Have"], "correctAnswer": 2}]',
   false),
  ('modal-can-could', 'modals', 'Can and Could', 'Express ability and make requests', 'intermediate', 1, 20,
   '{"introduction": "Can and could are modal verbs for ability and requests.", "rules": ["Can for present ability", "Could for past ability or polite requests", "Both followed by base form"], "examples": ["I can swim.", "She could read at age 4.", "Could you help me?"]}',
   '[{"id": "mc-1", "type": "multiple-choice", "question": "When I was young, I ___ run very fast.", "options": ["can", "could", "may", "might"], "correctAnswer": 1}, {"id": "mc-2", "type": "fill-blank", "question": "___ you please open the window?", "correctAnswer": "Could"}, {"id": "mc-3", "type": "multiple-choice", "question": "He ___ speak three languages fluently.", "options": ["can", "could", "cans", "coulds"], "correctAnswer": 0}]',
   false),
  ('conditionals-first', 'conditionals', 'First Conditional', 'Talk about real possibilities', 'intermediate', 1, 25,
   '{"introduction": "The first conditional talks about real possibilities in the future.", "rules": ["If + present simple, will + base form", "Used for likely situations", "Can use unless instead of if not"], "examples": ["If it rains, I will stay home.", "If you study, you will pass.", "Unless you hurry, you''ll be late."]}',
   '[{"id": "cf-1", "type": "multiple-choice", "question": "If she ___ hard, she will succeed.", "options": ["work", "works", "worked", "will work"], "correctAnswer": 1}, {"id": "cf-2", "type": "fill-blank", "question": "If it ___ (rain), we ___ (stay) inside.", "correctAnswer": "rains, will stay"}, {"id": "cf-3", "type": "sentence-correction", "question": "If I will see him, I will tell him.", "correctAnswer": "If I see him, I will tell him."}]',
   false)
ON CONFLICT (id) DO NOTHING;

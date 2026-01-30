import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://nqgsrvqepavqkbpnjlzc.supabase.co';

/**
 * Robust API key retrieval for distributed ESM environments.
 */
const getApiKey = (): string => {
  try {
    // Check various injection points provided by the platform
    const key = (typeof process !== 'undefined' && process.env?.API_KEY) || 
                (window as any).process?.env?.API_KEY ||
                "";
    return key;
  } catch (e) {
    return '';
  }
};

const supabaseKey = getApiKey();

if (!supabaseKey) {
  console.warn("RSPC WARNING: Supabase API Key is missing. Check your project environment variables.");
}

// Initializing with a safe fallback to prevent module-level crashes
export const supabase = createClient(supabaseUrl, supabaseKey || 'MISSING_API_KEY');

export const GENERATED_SQL = `
-- RSPC 2026 Core Schema
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. Profiles (Auth linked)
CREATE TABLE IF NOT EXISTS profiles (
    id UUID REFERENCES auth.users ON DELETE CASCADE PRIMARY KEY,
    full_name TEXT NOT NULL,
    role TEXT CHECK (role IN ('admin', 'judge')) DEFAULT 'judge',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Categories Metadata
CREATE TABLE IF NOT EXISTS contestants (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    code TEXT UNIQUE NOT NULL,
    name TEXT NOT NULL,
    school TEXT NOT NULL,
    division TEXT NOT NULL,
    category TEXT NOT NULL,
    level TEXT NOT NULL,
    medium TEXT NOT NULL
);

-- 3. Judge Assignments
CREATE TABLE IF NOT EXISTS judge_assignments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    judge_id UUID REFERENCES auth.users ON DELETE CASCADE,
    category TEXT NOT NULL,
    level TEXT NOT NULL,
    medium TEXT NOT NULL,
    UNIQUE(judge_id, category, level, medium)
);

-- 4. Scoring System
CREATE TABLE IF NOT EXISTS scores (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    contestant_id UUID REFERENCES contestants(id),
    judge_id UUID REFERENCES auth.users(id),
    category TEXT NOT NULL,
    level TEXT NOT NULL,
    medium TEXT NOT NULL,
    raw_scores JSONB NOT NULL,
    total_score DECIMAL(5,2) NOT NULL,
    time_deduction DECIMAL(5,2) DEFAULT 0,
    final_score DECIMAL(5,2) NOT NULL,
    is_final BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(contestant_id, judge_id)
);

-- RLS (Security)
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public profiles are viewable" ON profiles FOR SELECT USING (true);
CREATE POLICY "Users can update own profile" ON profiles FOR UPDATE USING (auth.uid() = id);

-- Indices
CREATE INDEX IF NOT EXISTS idx_scores_lookup ON scores(category, level, medium);
CREATE INDEX IF NOT EXISTS idx_contestants_cat ON contestants(category, level, medium);
`;
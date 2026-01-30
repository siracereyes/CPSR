
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://nqgsrvqepavqkbpnjlzc.supabase.co';
const supabaseKey = process.env.API_KEY || ''; 

export const supabase = createClient(supabaseUrl, supabaseKey);

export const GENERATED_SQL = `
-- RSPC 2026 Core Schema
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

-- RLS (Security) - Basics
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public profiles are viewable" ON profiles FOR SELECT USING (true);
CREATE POLICY "Users can update own profile" ON profiles FOR UPDATE USING (auth.uid() = id);

-- Indices
CREATE INDEX idx_scores_lookup ON scores(category, level, medium);
CREATE INDEX idx_contestants_cat ON contestants(category, level, medium);
`;

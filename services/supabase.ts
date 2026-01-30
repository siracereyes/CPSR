import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://nqgsrvqepavqkbpnjlzc.supabase.co';

/**
 * Supabase client initialization.
 * The API key is obtained exclusively from the environment variable process.env.API_KEY.
 */
const supabaseKey = process.env.API_KEY || '';

if (!supabaseKey || supabaseKey === "") {
  console.error("CRITICAL: Supabase API Key is missing. The application will not be able to communicate with the database.");
}

// Initializing with a safe fallback to prevent module-level crashes, 
// though the app will likely show errors when making calls if the key is 'MISSING'.
export const supabase = createClient(supabaseUrl, supabaseKey || 'MISSING_API_KEY');

/**
 * SQL Schema for RSPC 2026 Tabulation System.
 * This should be executed in the Supabase SQL Editor.
 */
export const GENERATED_SQL = `
-- RSPC 2026 Core Schema
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. Profiles (Linked to Supabase Auth)
CREATE TABLE IF NOT EXISTS profiles (
    id UUID REFERENCES auth.users ON DELETE CASCADE PRIMARY KEY,
    full_name TEXT NOT NULL,
    role TEXT CHECK (role IN ('admin', 'judge')) DEFAULT 'judge',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Contestants Metadata
CREATE TABLE IF NOT EXISTS contestants (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    code TEXT UNIQUE NOT NULL, -- Anonymized ID for Judges
    name TEXT NOT NULL,
    school TEXT NOT NULL,
    division TEXT NOT NULL,
    category TEXT NOT NULL,
    level TEXT NOT NULL,
    medium TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Judge Event Assignments
CREATE TABLE IF NOT EXISTS judge_assignments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    judge_id UUID REFERENCES auth.users ON DELETE CASCADE,
    category TEXT NOT NULL,
    level TEXT NOT NULL,
    medium TEXT NOT NULL,
    assigned_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(judge_id, category, level, medium)
);

-- 4. Scoring Logic (Annex B to F)
CREATE TABLE IF NOT EXISTS scores (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    contestant_id UUID REFERENCES contestants(id) ON DELETE CASCADE,
    judge_id UUID REFERENCES auth.users(id),
    category TEXT NOT NULL,
    level TEXT NOT NULL,
    medium TEXT NOT NULL,
    raw_scores JSONB NOT NULL, -- Individual criteria scores
    total_score DECIMAL(5,2) NOT NULL, -- Sum of raw scores
    time_deduction DECIMAL(5,2) DEFAULT 0, -- Automated via seconds input
    final_score DECIMAL(5,2) NOT NULL, -- total_score - time_deduction
    is_final BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(contestant_id, judge_id)
);

-- Row Level Security (RLS)
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE contestants ENABLE ROW LEVEL SECURITY;
ALTER TABLE judge_assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE scores ENABLE ROW LEVEL SECURITY;

-- Simple Policies
CREATE POLICY "Profiles are viewable by authenticated users" ON profiles FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Contestants are viewable by authenticated users" ON contestants FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Assignments are viewable by authenticated users" ON judge_assignments FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Scores are viewable by authenticated users" ON scores FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Judges can insert/update their own scores" ON scores FOR ALL USING (auth.uid() = judge_id);

-- Performance Indices
CREATE INDEX IF NOT EXISTS idx_scores_lookup ON scores(category, level, medium);
CREATE INDEX IF NOT EXISTS idx_contestants_cat ON contestants(category, level, medium);
`;
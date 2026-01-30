
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://nqgsrvqepavqkbpnjlzc.supabase.co';

/**
 * The API key is obtained exclusively from process.env.API_KEY.
 * If this key starts with "AIza", it is a Google Gemini key and will not work with Supabase.
 */
const supabaseKey = (typeof process !== 'undefined' && process.env?.API_KEY) || (window as any).process?.env?.API_KEY || '';

// We provide a fallback string to prevent the client from throwing a "Key required" error during boot.
export const supabase = createClient(supabaseUrl, supabaseKey || 'KEY_MISSING');

export const GENERATED_SQL = `
-- RSPC 2026 Core Schema
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

CREATE TABLE IF NOT EXISTS profiles (
    id UUID REFERENCES auth.users ON DELETE CASCADE PRIMARY KEY,
    full_name TEXT NOT NULL,
    role TEXT CHECK (role IN ('admin', 'judge')) DEFAULT 'judge',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS contestants (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    code TEXT UNIQUE NOT NULL,
    name TEXT NOT NULL,
    school TEXT NOT NULL,
    division TEXT NOT NULL,
    category TEXT NOT NULL,
    level TEXT NOT NULL,
    medium TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS judge_assignments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    judge_id UUID REFERENCES auth.users ON DELETE CASCADE,
    category TEXT NOT NULL,
    level TEXT NOT NULL,
    medium TEXT NOT NULL,
    UNIQUE(judge_id, category, level, medium)
);

CREATE TABLE IF NOT EXISTS scores (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    contestant_id UUID REFERENCES contestants(id) ON DELETE CASCADE,
    judge_id UUID REFERENCES auth.users(id),
    category TEXT NOT NULL,
    level TEXT NOT NULL,
    medium TEXT NOT NULL,
    raw_scores JSONB NOT NULL,
    total_score DECIMAL(5,2) NOT NULL,
    time_deduction DECIMAL(5,2) DEFAULT 0,
    final_score DECIMAL(5,2) NOT NULL,
    is_final BOOLEAN DEFAULT FALSE,
    UNIQUE(contestant_id, judge_id)
);
`;

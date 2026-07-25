-- Neon PostgreSQL Database Schema for Project Olympus Agent Corporation
-- 01_init_schema.sql

CREATE TABLE IF NOT EXISTS gap_candidates (
    id SERIAL PRIMARY KEY,
    gap_id VARCHAR(64) UNIQUE NOT NULL,
    pillar VARCHAR(64) NOT NULL,
    gap_title TEXT NOT NULL,
    target_tool VARCHAR(128),
    source TEXT,
    pain_point TEXT,
    technical_limitation TEXT,
    business_impact TEXT,
    open_source_fixes JSONB,
    curator_hook_idea TEXT,
    metadata JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS content_drafts (
    id SERIAL PRIMARY KEY,
    task VARCHAR(128) NOT NULL,
    topic VARCHAR(256) NOT NULL,
    plan TEXT,
    draft_content TEXT,
    status VARCHAR(32) DEFAULT 'draft',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

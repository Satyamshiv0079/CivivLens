-- CivicLens Database Initial Migration Schema
-- Creates core tables: users, civic_reports, report_status_histories

CREATE TABLE IF NOT EXISTS users (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(150) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    role VARCHAR(30) NOT NULL DEFAULT 'CITIZEN',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL
);

CREATE TABLE IF NOT EXISTS civic_reports (
    id BIGSERIAL PRIMARY KEY,
    title VARCHAR(200) NOT NULL,
    description TEXT NOT NULL,
    category VARCHAR(50) NOT NULL,
    status VARCHAR(50) NOT NULL DEFAULT 'SUBMITTED',
    image_url VARCHAR(500),
    latitude DOUBLE PRECISION NOT NULL,
    longitude DOUBLE PRECISION NOT NULL,
    address VARCHAR(255),
    author_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL
);

CREATE TABLE IF NOT EXISTS report_status_histories (
    id BIGSERIAL PRIMARY KEY,
    report_id BIGINT NOT NULL REFERENCES civic_reports(id) ON DELETE CASCADE,
    status VARCHAR(50) NOT NULL,
    comment TEXT,
    updated_by_id BIGINT REFERENCES users(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL
);

-- Indexes for efficient querying by status, category, author, and geographic coordinates
CREATE INDEX IF NOT EXISTS idx_civic_reports_status ON civic_reports(status);
CREATE INDEX IF NOT EXISTS idx_civic_reports_category ON civic_reports(category);
CREATE INDEX IF NOT EXISTS idx_civic_reports_author ON civic_reports(author_id);
CREATE INDEX IF NOT EXISTS idx_civic_reports_created_at ON civic_reports(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_status_histories_report ON report_status_histories(report_id);

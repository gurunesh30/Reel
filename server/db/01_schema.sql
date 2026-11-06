-- =============================================================================
-- CINEMA THEATRE BOOKING SYSTEM - POSTGRESQL RELATIONAL SCHEMA DDL
-- Single Source of Truth (SSOT) enforcing ACID compliance
-- =============================================================================

-- Enable required cryptographic and UUID generation extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- =============================================================================
-- 1. ENUM TYPES
-- =============================================================================

DO $$ BEGIN
    CREATE TYPE screen_format_enum AS ENUM (
        'STANDARD',
        'IMAX',
        '3D',
        'DOLBY_ATMOS',
        '4DX',
        'SCREENX'
    );
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE seat_tier_enum AS ENUM (
        'STANDARD',
        'VIP',
        'PREMIUM',
        'RECLINER'
    );
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- =============================================================================
-- 2. CORE THEATRE, SCREEN & SEAT TABLES
-- =============================================================================

-- Theatres Table
CREATE TABLE IF NOT EXISTS theatres (
    theatre_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    city VARCHAR(100) NOT NULL,
    location VARCHAR(255) NOT NULL,
    distance_km NUMERIC(4, 1) DEFAULT 0.0 CHECK (distance_km >= 0),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT uk_theatre_name_city UNIQUE (name, city)
);

-- Screens Table
CREATE TABLE IF NOT EXISTS screens (
    screen_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    theatre_id UUID NOT NULL REFERENCES theatres(theatre_id) ON DELETE CASCADE,
    screen_name VARCHAR(100) NOT NULL,
    format screen_format_enum NOT NULL DEFAULT 'STANDARD',
    total_seats INTEGER NOT NULL CHECK (total_seats > 0),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT uk_theatre_screen UNIQUE (theatre_id, screen_name)
);

-- Seats Table (Physical topology of seats in a screen)
CREATE TABLE IF NOT EXISTS seats (
    seat_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    screen_id UUID NOT NULL REFERENCES screens(screen_id) ON DELETE CASCADE,
    row_identifier VARCHAR(4) NOT NULL,
    seat_number INTEGER NOT NULL CHECK (seat_number > 0),
    seat_tier seat_tier_enum NOT NULL DEFAULT 'STANDARD',
    price_multiplier NUMERIC(3, 2) NOT NULL DEFAULT 1.00 CHECK (price_multiplier > 0),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT uk_screen_seat UNIQUE (screen_id, row_identifier, seat_number)
);

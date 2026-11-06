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

DO $$ BEGIN
    CREATE TYPE age_rating_enum AS ENUM (
        'G',
        'PG',
        'PG_13',
        'R',
        'NC_17'
    );
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE booking_status_enum AS ENUM (
        'PENDING',
        'CONFIRMED',
        'CANCELLED',
        'REFUNDED'
    );
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE payment_status_enum AS ENUM (
        'PENDING',
        'SUCCESS',
        'FAILED',
        'REFUNDED'
    );
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE payment_method_enum AS ENUM (
        'CARD',
        'APPLE_PAY',
        'GOOGLE_PAY'
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

-- =============================================================================
-- 3. MOVIES CATALOG & SHOWTIMES SCHEDULING TABLES
-- =============================================================================

-- Movies Table
CREATE TABLE IF NOT EXISTS movies (
    movie_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title VARCHAR(255) NOT NULL,
    synopsis TEXT NOT NULL,
    duration_minutes INTEGER NOT NULL CHECK (duration_minutes > 0),
    language VARCHAR(50) NOT NULL DEFAULT 'English',
    rating age_rating_enum NOT NULL DEFAULT 'PG_13',
    imdb_rating NUMERIC(3, 1) CHECK (imdb_rating >= 0 AND imdb_rating <= 10.0),
    genres TEXT[] NOT NULL DEFAULT '{}',
    supported_formats screen_format_enum[] NOT NULL DEFAULT '{STANDARD}',
    backdrop_url TEXT,
    poster_url TEXT,
    blurhash VARCHAR(100),
    release_date DATE,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT uk_movie_title UNIQUE (title)
);

-- Shows Table (Specific screen showing at a date & time slot)
CREATE TABLE IF NOT EXISTS shows (
    show_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    movie_id UUID NOT NULL REFERENCES movies(movie_id) ON DELETE RESTRICT,
    screen_id UUID NOT NULL REFERENCES screens(screen_id) ON DELETE CASCADE,
    show_date DATE NOT NULL,
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    format screen_format_enum NOT NULL,
    base_price NUMERIC(10, 2) NOT NULL CHECK (base_price >= 0),
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT chk_show_times CHECK (end_time > start_time),
    CONSTRAINT uk_screen_show_schedule UNIQUE (screen_id, show_date, start_time)
);

-- =============================================================================
-- 4. TRANSACTIONAL BOOKINGS & IDEMPOTENT PAYMENTS TABLES
-- =============================================================================

-- Bookings Table (Header record for a user reservation)
CREATE TABLE IF NOT EXISTS bookings (
    booking_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    booking_reference VARCHAR(32) UNIQUE NOT NULL,
    show_id UUID NOT NULL REFERENCES shows(show_id) ON DELETE RESTRICT,
    user_id VARCHAR(128) NOT NULL,
    user_email VARCHAR(255) NOT NULL,
    user_name VARCHAR(255) NOT NULL,
    subtotal NUMERIC(10, 2) NOT NULL CHECK (subtotal >= 0),
    tax_amount NUMERIC(10, 2) NOT NULL DEFAULT 0.00 CHECK (tax_amount >= 0),
    convenience_fee NUMERIC(10, 2) NOT NULL DEFAULT 0.00 CHECK (convenience_fee >= 0),
    total_amount NUMERIC(10, 2) NOT NULL CHECK (total_amount >= 0),
    status booking_status_enum NOT NULL DEFAULT 'PENDING',
    qr_code_payload TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Booking Seats Table (Junction table linking specific seats to a booking)
CREATE TABLE IF NOT EXISTS booking_seats (
    booking_seat_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    booking_id UUID NOT NULL REFERENCES bookings(booking_id) ON DELETE CASCADE,
    seat_id UUID NOT NULL REFERENCES seats(seat_id) ON DELETE RESTRICT,
    show_id UUID NOT NULL REFERENCES shows(show_id) ON DELETE RESTRICT,
    price_paid NUMERIC(10, 2) NOT NULL CHECK (price_paid >= 0),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT uk_booking_seat UNIQUE (booking_id, seat_id)
);

-- Payments Table (Audit trail with idempotency guarantees)
CREATE TABLE IF NOT EXISTS payments (
    payment_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    booking_id UUID NOT NULL REFERENCES bookings(booking_id) ON DELETE RESTRICT,
    idempotency_key VARCHAR(128) UNIQUE NOT NULL,
    amount NUMERIC(10, 2) NOT NULL CHECK (amount >= 0),
    payment_method payment_method_enum NOT NULL DEFAULT 'CARD',
    status payment_status_enum NOT NULL DEFAULT 'PENDING',
    provider_transaction_id VARCHAR(255),
    error_message TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

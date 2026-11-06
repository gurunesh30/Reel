-- =============================================================================
-- CINEMA THEATRE BOOKING SYSTEM - COMPREHENSIVE SEED DATASET
-- Initializes theaters, screens, physical seat grids, movies catalog, and schedules
-- =============================================================================

-- Clean existing data in reverse dependency order if seeding afresh
TRUNCATE TABLE payments, booking_seats, bookings, shows, seats, screens, movies, theatres RESTART IDENTITY CASCADE;

-- =============================================================================
-- 1. SEED THEATRES ACROSS METROPOLITAN HUBS
-- =============================================================================

INSERT INTO theatres (theatre_id, name, city, location, distance_km) VALUES
('11111111-1111-1111-1111-111111111111', 'Grand Palace Cinema', 'Metropolis', '450 Downtown Avenue, Metropolis Central', 1.8),
('22222222-2222-2222-2222-222222222222', 'CyberSphere IMAX', 'Metropolis', '88 High-Tech Boulevard, Tech District', 4.2),
('33333333-3333-3333-3333-333333333333', 'Arkham Royale Cineplex', 'Gotham', '12 Diamond District Way, Gotham', 2.5),
('44444444-4444-4444-4444-444444444444', 'Wayne Center IMAX', 'Gotham', '100 Wayne Plaza, Upper East Gotham', 3.1),
('55555555-5555-5555-5555-555555555555', 'Shibuya Neon Multiplex', 'Neo Tokyo', '2-24 Shibuya Crossing, Neo Tokyo', 0.8),
('66666666-6666-6666-6666-666666666666', 'Akiba Laser Theatre', 'Neo Tokyo', '4-12 Chiyoda Electric City, Neo Tokyo', 2.1),
('77777777-7777-7777-7777-777777777777', 'Emerald Star Cinema', 'Star City', '99 Queen Financial Tower, Star City Harbor', 1.4);

-- =============================================================================
-- 2. SEED SCREENS
-- =============================================================================

INSERT INTO screens (screen_id, theatre_id, screen_name, format, total_seats) VALUES
-- Grand Palace Cinema (Metropolis)
('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', '11111111-1111-1111-1111-111111111111', 'Screen 1 (Laser IMAX)', 'IMAX', 64),
('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', '11111111-1111-1111-1111-111111111111', 'Screen 2 (Dolby Atmos)', 'DOLBY_ATMOS', 64),

-- CyberSphere IMAX (Metropolis)
('cccccccc-cccc-cccc-cccc-cccccccccccc', '22222222-2222-2222-2222-222222222222', 'Grand Cyber Dome (IMAX 3D)', 'IMAX', 64),
('dddddddd-dddd-dddd-dddd-dddddddddddd', '22222222-2222-2222-2222-222222222222', 'Screen 2 (4DX Motion)', '4DX', 48),

-- Arkham Royale Cineplex (Gotham)
('eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee', '33333333-3333-3333-3333-333333333333', 'Screen 1 (Royale Atmos)', 'DOLBY_ATMOS', 64),

-- Shibuya Neon Multiplex (Neo Tokyo)
('ffffffff-ffff-ffff-ffff-ffffffffffff', '55555555-5555-5555-5555-555555555555', 'Screen 1 (Neo Laser IMAX)', 'IMAX', 64);

-- =============================================================================
-- 3. SEED PHYSICAL SEATS (Rows A through H, Seats 1 to 8)
-- =============================================================================

-- Screen 1: Laser IMAX (Grand Palace Cinema)
INSERT INTO seats (screen_id, row_identifier, seat_number, seat_tier, price_multiplier)
SELECT
    'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa'::UUID,
    r.row_id,
    s.seat_num,
    CASE WHEN r.row_id IN ('G', 'H') THEN 'VIP'::seat_tier_enum ELSE 'STANDARD'::seat_tier_enum END,
    CASE WHEN r.row_id IN ('G', 'H') THEN 1.50 ELSE 1.00 END
FROM (VALUES ('A'), ('B'), ('C'), ('D'), ('E'), ('F'), ('G'), ('H')) AS r(row_id)
CROSS JOIN generate_series(1, 8) AS s(seat_num);

-- Screen 2: Dolby Atmos (Grand Palace Cinema)
INSERT INTO seats (screen_id, row_identifier, seat_number, seat_tier, price_multiplier)
SELECT
    'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb'::UUID,
    r.row_id,
    s.seat_num,
    CASE WHEN r.row_id IN ('G', 'H') THEN 'VIP'::seat_tier_enum ELSE 'STANDARD'::seat_tier_enum END,
    CASE WHEN r.row_id IN ('G', 'H') THEN 1.50 ELSE 1.00 END
FROM (VALUES ('A'), ('B'), ('C'), ('D'), ('E'), ('F'), ('G'), ('H')) AS r(row_id)
CROSS JOIN generate_series(1, 8) AS s(seat_num);

-- Grand Cyber Dome (CyberSphere IMAX)
INSERT INTO seats (screen_id, row_identifier, seat_number, seat_tier, price_multiplier)
SELECT
    'cccccccc-cccc-cccc-cccc-cccccccccccc'::UUID,
    r.row_id,
    s.seat_num,
    CASE WHEN r.row_id IN ('G', 'H') THEN 'VIP'::seat_tier_enum ELSE 'STANDARD'::seat_tier_enum END,
    CASE WHEN r.row_id IN ('G', 'H') THEN 1.50 ELSE 1.00 END
FROM (VALUES ('A'), ('B'), ('C'), ('D'), ('E'), ('F'), ('G'), ('H')) AS r(row_id)
CROSS JOIN generate_series(1, 8) AS s(seat_num);

-- Screen 1: Neo Laser IMAX (Shibuya Neon Multiplex)
INSERT INTO seats (screen_id, row_identifier, seat_number, seat_tier, price_multiplier)
SELECT
    'ffffffff-ffff-ffff-ffff-ffffffffffff'::UUID,
    r.row_id,
    s.seat_num,
    CASE WHEN r.row_id IN ('G', 'H') THEN 'VIP'::seat_tier_enum ELSE 'STANDARD'::seat_tier_enum END,
    CASE WHEN r.row_id IN ('G', 'H') THEN 1.50 ELSE 1.00 END
FROM (VALUES ('A'), ('B'), ('C'), ('D'), ('E'), ('F'), ('G'), ('H')) AS r(row_id)
CROSS JOIN generate_series(1, 8) AS s(seat_num);

-- =============================================================================
-- 4. SEED MOVIES CATALOG
-- =============================================================================

INSERT INTO movies (
    movie_id, title, synopsis, duration_minutes, language, rating,
    imdb_rating, genres, supported_formats, backdrop_url, poster_url, blurhash, release_date
) VALUES
(
    '00000000-0000-0000-0000-000000000001',
    'Cyberpunk: Neon Horizon',
    'In a sprawling 2088 megalopolis, an augmented detective unearths a rogue synthetic consciousness running the financial underworld beneath the rain-slicked skyscrapers.',
    148,
    'English',
    'R',
    8.9,
    ARRAY['Sci-Fi', 'Action', 'Cyberpunk'],
    ARRAY['IMAX'::screen_format_enum, 'DOLBY_ATMOS'::screen_format_enum, '3D'::screen_format_enum],
    'https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&w=1920&q=80',
    'https://images.unsplash.com/photo-1578632767115-351597cf2477?auto=format&fit=crop&w=800&q=80',
    'L75#*D%M00of~qof%Mof00Rj?bRj',
    '2026-10-15'
),
(
    '00000000-0000-0000-0000-000000000002',
    'Galactic Odyssey: Beyond',
    'A deep-space exploratory crew ventures through a collapsing wormhole at the edge of Sagittarius A, discovering an ancient stellar civilization frozen in time.',
    165,
    'English',
    'PG_13',
    9.1,
    ARRAY['Sci-Fi', 'Adventure'],
    ARRAY['IMAX'::screen_format_enum, 'DOLBY_ATMOS'::screen_format_enum],
    'https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=1920&q=80',
    'https://images.unsplash.com/photo-1534447677768-be436bb09401?auto=format&fit=crop&w=800&q=80',
    'L02$3qIU00%M~qIU00%M00j[?bj[',
    '2026-10-22'
),
(
    '00000000-0000-0000-0000-000000000003',
    'The Quantum Paradox',
    'When a particle collider experiment fragments temporal continuity into five colliding timelines, a theoretical physicist must race to restore entropy before reality dissolves.',
    132,
    'English',
    'PG_13',
    8.5,
    ARRAY['Sci-Fi', 'Mystery', 'Thriller'],
    ARRAY['STANDARD'::screen_format_enum, 'DOLBY_ATMOS'::screen_format_enum],
    'https://images.unsplash.com/photo-1507499739999-097706ad8914?auto=format&fit=crop&w=1920&q=80',
    'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=800&q=80',
    'L56R~qxu00of~qof00of00j[?bj[',
    '2026-10-28'
),
(
    '00000000-0000-0000-0000-000000000004',
    'Echoes of Silence',
    'An acoustic cryptographer analyzing oceanic audio spikes uncovers subterranean vibrations that correspond to ancient seismic communication networks across the globe.',
    124,
    'English',
    'PG_13',
    8.2,
    ARRAY['Mystery', 'Drama'],
    ARRAY['STANDARD'::screen_format_enum, 'DOLBY_ATMOS'::screen_format_enum],
    'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=1920&q=80',
    'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?auto=format&fit=crop&w=800&q=80',
    'L47-t|M{00IU~qIU00%M00j[?bj[',
    '2026-10-05'
),
(
    '00000000-0000-0000-0000-000000000005',
    'Midnight in Neo-Tokyo',
    'A high-octane underground street race across suspended electromagnetic highways turns into an international syndicate rescue mission.',
    118,
    'Japanese',
    'R',
    8.7,
    ARRAY['Action', 'Cyberpunk'],
    ARRAY['IMAX'::screen_format_enum, '4DX'::screen_format_enum],
    'https://images.unsplash.com/photo-1509198397868-475647b2a1e5?auto=format&fit=crop&w=1920&q=80',
    'https://images.unsplash.com/photo-1563089145-599997674d42?auto=format&fit=crop&w=800&q=80',
    'L384nJj[00of~qof00of00j[?bj[',
    '2026-10-18'
),
(
    '00000000-0000-0000-0000-000000000006',
    'Horizon 2049',
    'Colonists terraforming the Martian equator encounter atmospheric anomalies that trigger cellular biological regeneration in the bio-domes.',
    140,
    'English',
    'PG_13',
    8.4,
    ARRAY['Sci-Fi', 'Drama'],
    ARRAY['IMAX'::screen_format_enum, 'STANDARD'::screen_format_enum],
    'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=1920&q=80',
    'https://images.unsplash.com/photo-1478760329108-5c3ed9d495a0?auto=format&fit=crop&w=800&q=80',
    'L58X1jM{00IU~qIU00%M00j[?bj[',
    '2026-10-10'
);

-- =============================================================================
-- 5. SEED SHOW SCHEDULES
-- =============================================================================

INSERT INTO shows (show_id, movie_id, screen_id, show_date, start_time, end_time, format, base_price) VALUES
-- Cyberpunk: Neon Horizon (Screen 1 Laser IMAX at Grand Palace Cinema)
('10101010-1010-1010-1010-101010101010', '00000000-0000-0000-0000-000000000001', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', '2026-11-06', '10:30:00', '13:00:00', 'IMAX', 18.50),
('20202020-2020-2020-2020-202020202020', '00000000-0000-0000-0000-000000000001', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', '2026-11-06', '14:15:00', '16:45:00', 'IMAX', 20.00),
('30303030-3030-3030-3030-303030303030', '00000000-0000-0000-0000-000000000001', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', '2026-11-06', '18:00:00', '20:30:00', 'IMAX', 22.50),
('40404040-4040-4040-4040-404040404040', '00000000-0000-0000-0000-000000000001', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', '2026-11-06', '21:30:00', '23:59:00', 'IMAX', 22.50),

-- Galactic Odyssey (Screen 2 Dolby Atmos at Grand Palace Cinema)
('50505050-5050-5050-5050-505050505050', '00000000-0000-0000-0000-000000000002', 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', '2026-11-06', '13:00:00', '15:45:00', 'DOLBY_ATMOS', 16.00),
('60606060-6060-6060-6060-606060606060', '00000000-0000-0000-0000-000000000002', 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', '2026-11-06', '17:00:00', '19:45:00', 'DOLBY_ATMOS', 18.00),

-- CyberSphere IMAX (Grand Cyber Dome)
('70707070-7070-7070-7070-707070707070', '00000000-0000-0000-0000-000000000001', 'cccccccc-cccc-cccc-cccc-cccccccccccc', '2026-11-06', '15:00:00', '17:30:00', 'IMAX', 21.00),
('80808080-8080-8080-8080-808080808080', '00000000-0000-0000-0000-000000000001', 'cccccccc-cccc-cccc-cccc-cccccccccccc', '2026-11-06', '19:30:00', '22:00:00', 'IMAX', 24.00);

-- =============================================================================
-- 6. SEED SAMPLE CONFIRMED BOOKING & IDEMPOTENT PAYMENT
-- =============================================================================

INSERT INTO bookings (
    booking_id, booking_reference, show_id, user_id, user_email,
    user_name, subtotal, tax_amount, convenience_fee, total_amount,
    status, qr_code_payload
) VALUES (
    '99999999-9999-9999-9999-999999999999',
    'REEL-BK-2026-001',
    '30303030-3030-3030-3030-303030303030',
    'vip@reelcinema.com',
    'vip@reelcinema.com',
    'Alexander Cross',
    45.00,
    3.60,
    2.50,
    51.10,
    'CONFIRMED',
    'REELPASS-REEL-BK-2026-001-idemp_seed_2026'
);

-- Reserve Seats F4 and F5 for this confirmed booking
INSERT INTO booking_seats (booking_id, seat_id, show_id, price_paid)
SELECT
    '99999999-9999-9999-9999-999999999999'::UUID,
    s.seat_id,
    '30303030-3030-3030-3030-303030303030'::UUID,
    22.50
FROM seats s
WHERE s.screen_id = 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa'::UUID
  AND s.row_identifier = 'F'
  AND s.seat_number IN (4, 5);

-- Idempotent Payment Record
INSERT INTO payments (
    payment_id, booking_id, idempotency_key, amount, payment_method,
    status, provider_transaction_id
) VALUES (
    '88888888-8888-8888-8888-888888888888',
    '99999999-9999-9999-9999-999999999999',
    'idemp_seed_2026_alex_cross',
    51.10,
    'CARD',
    'SUCCESS',
    'txn_mock_stripe_9948271034'
);

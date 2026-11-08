/**
 * Basic Database Verification Script using Prisma ORM
 * Connects to the database and verifies read operations.
 */

import { prisma } from '../config/prisma';

async function main() {
  console.log('[Prisma ORM]: Connecting to PostgreSQL database...');

  try {
    await prisma.$connect();
    console.log('[Prisma ORM]: Successfully connected to database.');

    // Count existing theatres and movies
    const theatreCount = await prisma.theatre.count();
    const movieCount = await prisma.movie.count();
    const showCount = await prisma.show.count();

    console.log('[Prisma ORM]: Current Database Status:');
    console.log(`  - Theatres: ${theatreCount}`);
    console.log(`  - Movies:   ${movieCount}`);
    console.log(`  - Shows:    ${showCount}`);
  } catch (error) {
    console.error('[Prisma ORM Error]: Failed to interact with database:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
    console.log('[Prisma ORM]: Disconnected from database.');
  }
}

main();

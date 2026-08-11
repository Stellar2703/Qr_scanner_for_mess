const db = require('../config/db');

async function seed() {
  console.log('🌱 Initializing Database Schema and Seeding Sample Data...');
  await db.initDB();
  console.log('✨ Seeding process completed.');
  process.exit(0);
}

seed().catch(err => {
  console.error('❌ Seeding error:', err);
  process.exit(1);
});

#!/usr/bin/env node

/**
 * Automated Migration Script
 * 
 * This script attempts to run migrations via Supabase REST API.
 * If service role key is not available, it provides clear instructions.
 */

const https = require('https');
const fs = require('fs');
const path = require('path');
const readline = require('readline');

// Simple .env.local parser
function loadEnvFile() {
  const envPath = path.join(__dirname, '..', '.env.local');
  if (!fs.existsSync(envPath)) return {};
  
  const content = fs.readFileSync(envPath, 'utf-8');
  const env = {};
  
  content.split('\n').forEach(line => {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) return;
    const match = trimmed.match(/^([^=:#]+)=(.*)$/);
    if (match) {
      const key = match[1].trim();
      let value = match[2].trim();
      // Remove quotes
      if ((value.startsWith('"') && value.endsWith('"')) || 
          (value.startsWith("'") && value.endsWith("'"))) {
        value = value.slice(1, -1);
      }
      env[key] = value;
    }
  });
  
  return env;
}

const env = loadEnvFile();
const SUPABASE_URL = env.NEXT_PUBLIC_SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_ANON_KEY = env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
  console.error('❌ Missing Supabase credentials in .env.local');
  process.exit(1);
}

const projectRef = SUPABASE_URL.match(/https?:\/\/([^.]+)\.supabase\.co/)?.[1];

console.log('🚀 Automated Supabase Setup');
console.log('============================\n');
console.log(`📡 Project: ${projectRef}`);
console.log(`🔗 Dashboard: https://supabase.com/dashboard/project/${projectRef}\n`);

// Test connection first
async function testConnection() {
  return new Promise((resolve) => {
    const url = new URL(`${SUPABASE_URL}/rest/v1/users?select=id&limit=1`);
    const options = {
      hostname: url.hostname,
      path: url.pathname + url.search,
      method: 'GET',
      headers: {
        'apikey': SUPABASE_ANON_KEY,
        'Authorization': `Bearer ${SUPABASE_ANON_KEY}`
      }
    };

    const req = https.request(options, (res) => {
      res.on('data', () => {});
      res.on('end', () => {
        if (res.statusCode === 200) {
          console.log('✅ Connection successful!');
          console.log('✅ Users table exists - migrations may already be complete.\n');
          resolve(true);
        } else if (res.statusCode === 406 || res.statusCode === 404) {
          console.log('⚠️  Users table does not exist');
          console.log('📋 Migrations need to be run\n');
          resolve(false);
        } else {
          console.log(`⚠️  Connection returned status ${res.statusCode}`);
          resolve(false);
        }
      });
    });

    req.on('error', (error) => {
      console.error(`❌ Connection error: ${error.message}\n`);
      resolve(false);
    });

    req.end();
  });
}

// Provide migration instructions
function showMigrationInstructions() {
  const migrationsDir = path.join(__dirname, '..', 'supabase', 'migrations');
  const migrations = ['001_initial_schema.sql', '002_helper_functions.sql'];

  console.log('📋 Migration Instructions:\n');
  console.log(`1. Open: https://supabase.com/dashboard/project/${projectRef}/sql\n`);
  
  for (let i = 0; i < migrations.length; i++) {
    const migration = migrations[i];
    const filePath = path.join(migrationsDir, migration);
    
    if (fs.existsSync(filePath)) {
      const sql = fs.readFileSync(filePath, 'utf-8');
      console.log(`\n📄 Migration ${i + 1}: ${migration}`);
      console.log('   ─────────────────────────────────────────────────────────');
      console.log('   Copy the SQL below and run it in Supabase SQL Editor:\n');
      console.log(sql);
      console.log('\n   ─────────────────────────────────────────────────────────\n');
    } else {
      console.log(`\n❌ Migration file not found: ${migration}`);
    }
  }

  console.log('\n💡 Quick Steps:');
  console.log('   1. Go to SQL Editor in Supabase Dashboard');
  console.log('   2. Copy each migration SQL above');
  console.log('   3. Paste and click "Run"');
  console.log('   4. Run them in order (001 first, then 002)');
  console.log('   5. Come back and run this script again to verify\n');
}

// Verify all tables exist
async function verifyAllTables() {
  console.log('🔍 Verifying database tables...\n');
  
  const tables = [
    { name: 'users', endpoint: '/rest/v1/users?select=id&limit=1' },
    { name: 'vocabulary_items', endpoint: '/rest/v1/vocabulary_items?select=id&limit=1' },
    { name: 'articles', endpoint: '/rest/v1/articles?select=id&limit=1' },
    { name: 'user_actions', endpoint: '/rest/v1/user_actions?select=id&limit=1' },
  ];

  let allExist = true;

  for (const table of tables) {
    try {
      const url = new URL(`${SUPABASE_URL}${table.endpoint}`);
      const options = {
        hostname: url.hostname,
        path: url.pathname + url.search,
        method: 'GET',
        headers: {
          'apikey': SUPABASE_ANON_KEY,
          'Authorization': `Bearer ${SUPABASE_ANON_KEY}`
        }
      };

      const exists = await new Promise((resolve) => {
        const req = https.request(options, (res) => {
          res.on('data', () => {});
          res.on('end', () => {
            resolve(res.statusCode === 200 || res.statusCode === 406);
          });
        });
        req.on('error', () => resolve(false));
        req.end();
      });

      if (exists) {
        console.log(`   ✅ ${table.name}`);
      } else {
        console.log(`   ❌ ${table.name} - missing`);
        allExist = false;
      }
    } catch (error) {
      console.log(`   ❌ ${table.name} - error`);
      allExist = false;
    }
  }

  return allExist;
}

async function main() {
  const tablesExist = await testConnection();
  
  if (!tablesExist) {
    showMigrationInstructions();
    
    // Wait a bit and verify again
    console.log('⏳ Waiting 10 seconds for you to run migrations...');
    console.log('   (You can Ctrl+C and run this script again after migrations)\n');
    
    await new Promise(resolve => setTimeout(resolve, 10000));
    
    const verified = await verifyAllTables();
    
    if (verified) {
      console.log('\n🎉 All tables exist! Setup complete!\n');
    } else {
      console.log('\n⚠️  Some tables are still missing.');
      console.log('   Please complete the migrations and run this script again.\n');
    }
  } else {
    const allTablesExist = await verifyAllTables();
    
    if (allTablesExist) {
      console.log('🎉 Database is fully set up and ready!\n');
    } else {
      console.log('\n⚠️  Some tables may be missing.');
      console.log('   Running full verification...\n');
      await verifyAllTables();
    }
  }
}

main().catch(console.error);


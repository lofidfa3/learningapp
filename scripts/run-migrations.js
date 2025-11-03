#!/usr/bin/env node

/**
 * Automated Supabase Migration Runner
 * 
 * This script uses the Supabase REST API to run migrations automatically.
 * It requires the SUPABASE_SERVICE_ROLE_KEY for DDL operations.
 */

const https = require('https');
const fs = require('fs');
const path = require('path');

// Simple .env.local parser
function loadEnvFile() {
  const envPath = path.join(__dirname, '..', '.env.local');
  if (!fs.existsSync(envPath)) return {};
  
  const content = fs.readFileSync(envPath, 'utf-8');
  const env = {};
  
  content.split('\n').forEach(line => {
    const match = line.match(/^([^=:#]+)=(.*)$/);
    if (match) {
      const key = match[1].trim();
      const value = match[2].trim().replace(/^["']|["']$/g, '');
      env[key] = value;
    }
  });
  
  return env;
}

// Load environment variables
const env = loadEnvFile();

const SUPABASE_URL = env.NEXT_PUBLIC_SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_SERVICE_KEY = env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY;
const SUPABASE_ANON_KEY = env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!SUPABASE_URL) {
  console.error('❌ NEXT_PUBLIC_SUPABASE_URL is not set in .env.local');
  process.exit(1);
}

// Extract project ref from URL
const projectRef = SUPABASE_URL.match(/https?:\/\/([^.]+)\.supabase\.co/)?.[1];
if (!projectRef) {
  console.error('❌ Could not extract project ref from Supabase URL');
  process.exit(1);
}

async function runMigration(sqlContent, migrationName) {
  console.log(`\n📝 Running migration: ${migrationName}...`);

  // If we don't have service key, we'll need to use the SQL Editor approach
  if (!SUPABASE_SERVICE_KEY) {
    console.log('⚠️  SUPABASE_SERVICE_ROLE_KEY not found.');
    console.log('   DDL operations require a service role key.');
    console.log('   Falling back to manual migration guide...\n');
    
    console.log('📋 Manual Migration Steps:');
    console.log(`   1. Go to: https://supabase.com/dashboard/project/${projectRef}/sql`);
    console.log(`   2. Copy the contents of: supabase/migrations/${migrationName}`);
    console.log(`   3. Paste into SQL Editor`);
    console.log(`   4. Click "Run"\n`);
    
    return false;
  }

  // Use Supabase Management API
  const apiUrl = `https://api.supabase.com/v1/projects/${projectRef}/sql`;
  
  return new Promise((resolve) => {
    const postData = JSON.stringify({
      query: sqlContent
    });

    const options = {
      hostname: 'api.supabase.com',
      path: `/v1/projects/${projectRef}/sql`,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${SUPABASE_SERVICE_KEY}`,
        'Content-Length': Buffer.byteLength(postData)
      }
    };

    const req = https.request(options, (res) => {
      let data = '';

      res.on('data', (chunk) => {
        data += chunk;
      });

      res.on('end', () => {
        if (res.statusCode === 200 || res.statusCode === 201) {
          console.log(`   ✅ Migration ${migrationName} completed successfully`);
          resolve(true);
        } else {
          console.log(`   ⚠️  Migration ${migrationName} returned status ${res.statusCode}`);
          console.log(`   Response: ${data}`);
          
          // Check if it's just a "already exists" error
          if (data.includes('already exists') || data.includes('duplicate')) {
            console.log(`   ✅ Tables already exist - this is OK!`);
            resolve(true);
          } else {
            resolve(false);
          }
        }
      });
    });

    req.on('error', (error) => {
      console.error(`   ❌ Error running migration: ${error.message}`);
      console.log(`   💡 Try running manually in Supabase Dashboard`);
      resolve(false);
    });

    req.write(postData);
    req.end();
  });
}

async function verifyTables() {
  console.log('\n🔍 Verifying database setup...');
  
  // Test connection using anon key
  const testUrl = `${SUPABASE_URL}/rest/v1/users?select=id&limit=1`;
  
  return new Promise((resolve) => {
    const url = new URL(testUrl);
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
      let data = '';

      res.on('data', (chunk) => {
        data += chunk;
      });

      res.on('end', () => {
        if (res.statusCode === 200) {
          console.log('   ✅ Users table exists and is accessible');
          resolve(true);
        } else if (res.statusCode === 404 || data.includes('relation') || data.includes('does not exist')) {
          console.log('   ❌ Users table does not exist');
          console.log('   📋 Please run migrations');
          resolve(false);
        } else {
          console.log(`   ⚠️  Status ${res.statusCode}: ${data.substring(0, 100)}`);
          resolve(false);
        }
      });
    });

    req.on('error', (error) => {
      console.error(`   ❌ Connection error: ${error.message}`);
      resolve(false);
    });

    req.end();
  });
}

async function main() {
  console.log('🚀 Automated Supabase Migration Runner');
  console.log('======================================\n');
  
  console.log(`📡 Supabase URL: ${SUPABASE_URL}`);
  console.log(`🔑 Service Key: ${SUPABASE_SERVICE_KEY ? '✅ Found' : '❌ Missing'}`);
  console.log(`🔑 Anon Key: ${SUPABASE_ANON_KEY ? '✅ Found' : '❌ Missing'}\n`);

  // Check if tables already exist
  const tablesExist = await verifyTables();

  if (tablesExist) {
    console.log('\n✅ Database is already set up!');
    console.log('   All tables exist and are accessible.\n');
    return;
  }

  console.log('📋 Reading migration files...\n');

  // Read migration files
  const migrations = [
    '001_initial_schema.sql',
    '002_helper_functions.sql'
  ];

  const migrationsDir = path.join(__dirname, '..', 'supabase', 'migrations');

  for (const migrationFile of migrations) {
    const filePath = path.join(migrationsDir, migrationFile);
    
    if (!fs.existsSync(filePath)) {
      console.error(`❌ Migration file not found: ${filePath}`);
      continue;
    }

    const sqlContent = fs.readFileSync(filePath, 'utf-8');
    const success = await runMigration(sqlContent, migrationFile);
    
    if (!success && !SUPABASE_SERVICE_KEY) {
      // Give user instructions
      console.log('\n💡 To get your service role key:');
      console.log('   1. Go to Supabase Dashboard');
      console.log(`   2. Select project: ${projectRef}`);
      console.log('   3. Go to Settings → API');
      console.log('   4. Copy the "service_role" key (secret!)');
      console.log('   5. Add to .env.local: SUPABASE_SERVICE_ROLE_KEY=your-key-here\n');
      break;
    }
  }

  // Verify again
  console.log('\n⏳ Verifying setup...\n');
  const verified = await verifyTables();

  if (verified) {
    console.log('🎉 Setup complete! Your database is ready.\n');
  } else {
    console.log('⚠️  Setup may not be complete.');
    console.log('   Please check the Supabase Dashboard to verify tables exist.\n');
  }
}

main().catch(console.error);


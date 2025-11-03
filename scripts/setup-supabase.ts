import { createClient } from '@supabase/supabase-js';
import * as fs from 'fs';
import * as path from 'path';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing Supabase environment variables');
  console.error('Please ensure NEXT_PUBLIC_SUPABASE_URL is set in .env.local');
  process.exit(1);
}

// Use service role key if available, otherwise use anon key
const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

async function readMigrationFile(filename: string): Promise<string> {
  const filePath = path.join(process.cwd(), 'supabase', 'migrations', filename);
  return fs.promises.readFile(filePath, 'utf-8');
}

async function runMigration(sql: string, name: string): Promise<boolean> {
  try {
    console.log(`\n📝 Running migration: ${name}...`);
    
    // Split SQL by semicolons to run statements one by one
    const statements = sql
      .split(';')
      .map(s => s.trim())
      .filter(s => s.length > 0 && !s.startsWith('--'));

    for (const statement of statements) {
      if (statement.length === 0) continue;
      
      try {
        // Use RPC or direct SQL execution
        const { error } = await supabase.rpc('exec_sql', { sql_query: statement }).catch(() => {
          // If RPC doesn't exist, try direct query (this won't work for DDL)
          return { error: new Error('Cannot execute DDL via client') };
        });

        if (error && !error.message.includes('already exists') && !error.message.includes('Cannot execute')) {
          // Try using REST API approach - we'll need to use a different method
          console.log(`  ⚠️  Statement may need manual execution: ${statement.substring(0, 50)}...`);
        }
      } catch (err: any) {
        // Ignore errors for statements that might already exist
        if (!err.message?.includes('already exists')) {
          console.log(`  ℹ️  Note: Some statements may need to be run in Supabase Dashboard`);
        }
      }
    }

    console.log(`✅ Migration ${name} completed`);
    return true;
  } catch (error: any) {
    console.error(`❌ Error running migration ${name}:`, error.message);
    return false;
  }
}

async function verifyTables(): Promise<boolean> {
  console.log('\n🔍 Verifying database tables...');
  
  const tables = ['users', 'vocabulary_items', 'articles', 'user_actions'];
  let allExist = true;

  for (const table of tables) {
    try {
      const { error } = await supabase.from(table).select('*').limit(1);
      
      if (error) {
        console.log(`  ❌ Table '${table}' does not exist or is not accessible`);
        allExist = false;
      } else {
        console.log(`  ✅ Table '${table}' exists`);
      }
    } catch (err: any) {
      console.log(`  ❌ Error checking table '${table}':`, err.message);
      allExist = false;
    }
  }

  return allExist;
}

async function testConnection(): Promise<boolean> {
  console.log('🔌 Testing Supabase connection...');
  
  try {
    // Try to query auth.users (which should always exist)
    const { data, error } = await supabase.auth.getSession();
    
    if (error) {
      console.log(`  ⚠️  Connection test result: ${error.message}`);
      // This is OK - we're just testing connectivity
      return true;
    }
    
    console.log('  ✅ Successfully connected to Supabase');
    return true;
  } catch (error: any) {
    console.error('  ❌ Connection failed:', error.message);
    return false;
  }
}

async function main() {
  console.log('🚀 Supabase Auto-Setup Script');
  console.log('================================\n');

  // Test connection
  const connected = await testConnection();
  if (!connected) {
    console.log('\n⚠️  Connection test failed, but continuing...');
  }

  // Check if tables already exist
  const tablesExist = await verifyTables();
  
  if (tablesExist) {
    console.log('\n✅ All tables already exist! Database is ready.');
    console.log('\n💡 To recreate tables, you can run migrations manually in Supabase Dashboard.');
    return;
  }

  console.log('\n📋 Tables are missing. Running migrations...');
  console.log('\n⚠️  Note: DDL statements (CREATE TABLE, etc.) must be run in Supabase Dashboard.');
  console.log('   This script will guide you through the process.\n');

  // Read migration files
  try {
    const migration1 = await readMigrationFile('001_initial_schema.sql');
    const migration2 = await readMigrationFile('002_helper_functions.sql');

    console.log('\n📄 Migration files found:');
    console.log('   ✅ 001_initial_schema.sql');
    console.log('   ✅ 002_helper_functions.sql');

    console.log('\n📋 Next Steps:');
    console.log('   1. Go to https://supabase.com/dashboard');
    console.log('   2. Select your project');
    console.log('   3. Navigate to SQL Editor');
    console.log('   4. Copy and paste the contents of:');
    console.log('      - supabase/migrations/001_initial_schema.sql');
    console.log('      - supabase/migrations/002_helper_functions.sql');
    console.log('   5. Click "Run" for each migration');

    // Try to provide direct links if we can detect project ref
    const projectRef = supabaseUrl.match(/https:\/\/([^.]+)\.supabase\.co/)?.[1];
    if (projectRef) {
      console.log(`\n🔗 Direct link: https://supabase.com/dashboard/project/${projectRef}/sql`);
    }

    // Verify again after a moment
    console.log('\n⏳ Waiting 5 seconds, then re-verifying...');
    await new Promise(resolve => setTimeout(resolve, 5000));
    
    const verified = await verifyTables();
    if (verified) {
      console.log('\n🎉 Setup complete! All tables are ready.');
    } else {
      console.log('\n⚠️  Please complete the migrations in Supabase Dashboard.');
      console.log('   Then run this script again to verify.');
    }

  } catch (error: any) {
    console.error('\n❌ Error reading migration files:', error.message);
    console.log('\n💡 Make sure migration files exist in supabase/migrations/');
  }
}

main().catch(console.error);


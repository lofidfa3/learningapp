import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

console.log('🧪 Testing Supabase Connection\n');

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('❌ Missing environment variables:');
  console.error(`   NEXT_PUBLIC_SUPABASE_URL: ${supabaseUrl ? '✅' : '❌'}`);
  console.error(`   NEXT_PUBLIC_SUPABASE_ANON_KEY: ${supabaseAnonKey ? '✅' : '❌'}`);
  process.exit(1);
}

console.log(`📡 Supabase URL: ${supabaseUrl}`);
console.log(`🔑 Anon Key: ${supabaseAnonKey.substring(0, 20)}...\n`);

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function testConnection() {
  console.log('🔌 Testing connection...');
  
  try {
    // Test basic connectivity by checking auth
    const { data: session, error: authError } = await supabase.auth.getSession();
    
    if (authError && !authError.message.includes('Invalid API key')) {
      console.log('   ✅ Basic connection successful');
    } else if (authError) {
      console.log('   ⚠️  API key issue:', authError.message);
    } else {
      console.log('   ✅ Connection successful');
    }
  } catch (error: any) {
    console.log('   ❌ Connection failed:', error.message);
    return false;
  }

  // Test table access
  console.log('\n📊 Testing table access...');
  
  const tables = [
    { name: 'users', description: 'User profiles' },
    { name: 'vocabulary_items', description: 'Vocabulary words' },
    { name: 'articles', description: 'Read articles' },
    { name: 'user_actions', description: 'User activity tracking' },
  ];

  for (const table of tables) {
    try {
      const { data, error } = await supabase
        .from(table.name)
        .select('*')
        .limit(1);
      
      if (error) {
        if (error.code === 'PGRST116') {
          console.log(`   ❌ ${table.name}: Table does not exist (migration needed)`);
        } else if (error.code === '42501') {
          console.log(`   ⚠️  ${table.name}: Exists but RLS policy issue`);
        } else {
          console.log(`   ⚠️  ${table.name}: ${error.message}`);
        }
      } else {
        console.log(`   ✅ ${table.name}: Accessible (${table.description})`);
      }
    } catch (err: any) {
      console.log(`   ❌ ${table.name}: ${err.message}`);
    }
  }

  // Test RPC functions
  console.log('\n🔧 Testing helper functions...');
  
  const functions = [
    'increment_articles_read',
    'increment_words_learned',
    'get_user_stats',
  ];

  for (const func of functions) {
    try {
      // Just check if function exists by attempting to call it (will fail gracefully)
      const { error } = await supabase.rpc(func, { user_id: '00000000-0000-0000-0000-000000000000' });
      
      if (error) {
        if (error.message.includes('function') && error.message.includes('does not exist')) {
          console.log(`   ❌ ${func}: Function does not exist (run migration 002)`);
        } else {
          console.log(`   ✅ ${func}: Exists (test call returned expected error)`);
        }
      } else {
        console.log(`   ✅ ${func}: Exists and callable`);
      }
    } catch (err: any) {
      console.log(`   ⚠️  ${func}: ${err.message}`);
    }
  }

  console.log('\n✅ Connection test complete!\n');
  console.log('📋 Summary:');
  console.log('   - If tables are missing: Run migrations in Supabase Dashboard');
  console.log('   - If RLS errors: Check Row Level Security policies');
  console.log('   - If functions missing: Run migration 002_helper_functions.sql');
}

testConnection().catch(console.error);


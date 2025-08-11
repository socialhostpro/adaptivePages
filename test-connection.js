// Simple Supabase Connection Test
// Run this in browser console to test basic connectivity

console.log('🔍 Testing Supabase Connection...');

// Test 1: Check if Supabase client is accessible
console.log('📝 Supabase URL:', window.supabase?.supabaseUrl);
console.log('🔑 Supabase Key:', window.supabase?.supabaseKey ? '✅ Present' : '❌ Missing');

// Test 2: Check authentication
const session = await window.supabase?.auth.getSession();
console.log('👤 Current Session:', session?.data?.session ? '✅ Authenticated' : '❌ Not authenticated');

if (session?.data?.session) {
  console.log('📧 User ID:', session.data.session.user.id);
  console.log('📧 User Email:', session.data.session.user.email);
  
  // Test 3: Try a simple query
  try {
    const { data, error } = await window.supabase
      .from('pages')
      .select('id, name, updated_at')
      .limit(1);
    
    if (error) {
      console.error('❌ Query Error:', error);
    } else {
      console.log('✅ Query Success:', data);
    }
  } catch (e) {
    console.error('❌ Connection Error:', e);
  }
} else {
  console.log('ℹ️ Please log in first to test data queries');
}

// Test 4: Check RLS policies
console.log('💡 To check RLS policies, run this in Supabase SQL Editor:');
console.log(`
SELECT schemaname, tablename, rowsecurity 
FROM pg_tables 
WHERE tablename IN ('pages', 'team_members', 'contacts', 'products');
`);

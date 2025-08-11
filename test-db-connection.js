// Quick test to verify database connection
import { supabase } from './services/supabase.js';

async function testConnection() {
  console.log('Testing Supabase connection...');
  
  try {
    // Test basic connection
    const { data, error } = await supabase.from('pages').select('count').limit(1);
    if (error) {
      console.error('Database error:', error);
      return;
    }
    console.log('✅ Database connection successful');
    
    // Test auth
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError) {
      console.error('Auth error:', authError);
      return;
    }
    
    if (user) {
      console.log('✅ User is logged in:', user.id);
      
      // Test pages for this user
      const { data: pages, error: pagesError } = await supabase
        .from('pages')
        .select('id, name')
        .eq('user_id', user.id);
        
      if (pagesError) {
        console.error('Pages query error:', pagesError);
        return;
      }
      
      console.log(`✅ Found ${pages?.length || 0} pages for user`);
      console.log('Pages:', pages);
    } else {
      console.log('❌ No user logged in');
    }
    
  } catch (err) {
    console.error('Test failed:', err);
  }
}

testConnection();

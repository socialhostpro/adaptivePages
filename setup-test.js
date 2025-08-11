// Quick test script to check/create test user and pages
import { supabase } from './services/supabase.js';

async function setupTestData() {
    console.log('🚀 Setting up test data...');
    
    try {
        // Try to sign up a test user if it doesn't exist
        console.log('👤 Creating test user...');
        const { data: authData, error: authError } = await supabase.auth.signUp({
            email: 'default@example.com',
            password: 'password123'
        });
        
        if (authError) {
            if (authError.message.includes('already been registered')) {
                console.log('✅ Test user already exists, trying to login...');
                const { data: loginData, error: loginError } = await supabase.auth.signInWithPassword({
                    email: 'default@example.com',
                    password: 'password123'
                });
                
                if (loginError) {
                    console.error('❌ Login failed:', loginError.message);
                    return;
                }
                
                console.log('✅ Logged in successfully!');
                console.log('User ID:', loginData.user.id);
                
                // Check if user has any pages
                const { data: pages, error: pagesError } = await supabase
                    .from('pages')
                    .select('*')
                    .eq('user_id', loginData.user.id);
                
                if (pagesError) {
                    console.error('❌ Error checking pages:', pagesError.message);
                    return;
                }
                
                console.log(`📄 User has ${pages.length} pages`);
                
                if (pages.length === 0) {
                    console.log('➕ Creating a test page...');
                    const { data: newPage, error: createError } = await supabase
                        .from('pages')
                        .insert([{
                            user_id: loginData.user.id,
                            name: 'My First Page',
                            data: { sections: [] },
                            images: {},
                            is_published: false,
                            updated_at: new Date().toISOString()
                        }])
                        .select()
                        .single();
                    
                    if (createError) {
                        console.error('❌ Error creating page:', createError.message);
                    } else {
                        console.log('✅ Test page created:', newPage.name);
                    }
                }
                
                return loginData.user.id;
            } else {
                console.error('❌ Auth error:', authError.message);
                return;
            }
        } else {
            console.log('✅ New user created!');
            console.log('User ID:', authData.user.id);
            return authData.user.id;
        }
        
    } catch (error) {
        console.error('❌ Setup failed:', error.message);
    }
}

// Run the setup
setupTestData();

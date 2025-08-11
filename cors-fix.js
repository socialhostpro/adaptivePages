#!/usr/bin/env node

// Quick CORS Fix and Test Script
// This will help diagnose and potentially fix the CORS issue

const chalk = require('chalk');

console.log(chalk.blue.bold('🔧 Adaptive Pages CORS Fix & Test'));
console.log(chalk.gray('=====================================\n'));

// 1. Check if we can reach Supabase
console.log(chalk.yellow('1. Testing Supabase connectivity...'));

const supabaseUrl = 'https://rxkywcylrtoirshfqqpd.supabase.co';

async function testSupabaseConnection() {
  try {
    const response = await fetch(`${supabaseUrl}/rest/v1/`, {
      method: 'GET',
      headers: {
        'apikey': 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJ4a3l3Y3lscnRvaXJzaGZxcXBkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTI1MjQ5ODYsImV4cCI6MjA2ODEwMDk4Nn0.M79J1j4-bpKpqlCLmHylOX64vbudaBwrBD6-e1fQ18M',
        'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJ4a3l3Y3lscnRvaXJzaGZxcXBkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTI1MjQ5ODYsImV4cCI6MjA2ODEwMDk4Nn0.M79J1j4-bpKpqlCLmHylOX64vbudaBwrBD6-e1fQ18M'
      }
    });
    
    console.log(chalk.green('✅ Supabase connection successful'));
    console.log(chalk.gray(`   Status: ${response.status}`));
    
    const corsHeaders = response.headers.get('access-control-allow-origin');
    console.log(chalk.gray(`   CORS: ${corsHeaders || 'Not set'}`));
    
  } catch (error) {
    console.log(chalk.red('❌ Supabase connection failed:'), error.message);
  }
}

// 2. Instructions for manual CORS fix
function printCORSInstructions() {
  console.log(chalk.yellow('\n2. Manual CORS Configuration:'));
  console.log(chalk.white('   Go to: https://supabase.com/dashboard/project/rxkywcylrtoirshfqqpd/settings/api'));
  console.log(chalk.white('   Add to "CORS Origins": http://localhost:5173'));
  console.log(chalk.white('   Save settings and wait 1-2 minutes'));
}

// 3. Alternative local solution
function printLocalSolution() {
  console.log(chalk.yellow('\n3. Quick Local Fix (if CORS persists):'));
  console.log(chalk.white('   Install: npm install -g local-cors-proxy'));
  console.log(chalk.white('   Run: lcp --proxyUrl https://rxkywcylrtoirshfqqpd.supabase.co'));
  console.log(chalk.white('   Update supabaseUrl to: http://localhost:8010/proxy'));
}

// 4. Environment variable setup
function printEnvSetup() {
  console.log(chalk.yellow('\n4. Environment Variables (.env.local):'));
  console.log(chalk.gray('   VITE_SUPABASE_URL=https://rxkywcylrtoirshfqqpd.supabase.co'));
  console.log(chalk.gray('   VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...'));
}

// Run tests
async function main() {
  await testSupabaseConnection();
  printCORSInstructions();
  printLocalSolution();
  printEnvSetup();
  
  console.log(chalk.green.bold('\n✨ Next Steps:'));
  console.log(chalk.white('1. Configure CORS in Supabase Dashboard'));
  console.log(chalk.white('2. Check RLS policies are properly configured'));
  console.log(chalk.white('3. Test the connection again'));
  console.log(chalk.white('4. If still issues, use local-cors-proxy as workaround\n'));
}

main().catch(console.error);

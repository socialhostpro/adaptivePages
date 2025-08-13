#!/usr/bin/env node
/**
 * AdaptivePages Shared Components Integration Setup
 * This script helps set up the integration of shared components into your existing system
 */

import fs from 'fs';
import path from 'path';

console.log('🚀 AdaptivePages Shared Components Integration Setup\n');

// Check if we're in the right directory
const isCorrectDir = fs.existsSync('package.json') && 
                    fs.existsSync('App.tsx') && 
                    fs.existsSync('components/shared');

if (!isCorrectDir) {
  console.error('❌ Error: Please run this script from the AdaptivePages root directory');
  process.exit(1);
}

console.log('✅ Found AdaptivePages project structure');

// Step 1: Backup current App.tsx
const backupApp = () => {
  try {
    const appPath = 'App.tsx';
    const backupPath = 'App-backup.tsx';
    
    if (fs.existsSync(appPath) && !fs.existsSync(backupPath)) {
      fs.copyFileSync(appPath, backupPath);
      console.log('✅ Backed up original App.tsx to App-backup.tsx');
      return true;
    } else if (fs.existsSync(backupPath)) {
      console.log('ℹ️  Backup already exists: App-backup.tsx');
      return true;
    }
    return false;
  } catch (error) {
    console.error('❌ Error backing up App.tsx:', error.message);
    return false;
  }
};

// Step 2: Check shared components
const checkSharedComponents = () => {
  const requiredFiles = [
    'components/shared/index.ts',
    'components/shared/Button.tsx',
    'components/shared/NavigationComponents.tsx',
    'components/shared/MobileNavigation.tsx',
    'components/shared/ApiControl.tsx'
  ];
  
  const missing = requiredFiles.filter(file => !fs.existsSync(file));
  
  if (missing.length > 0) {
    console.log('⚠️  Missing shared components:');
    missing.forEach(file => console.log(`   - ${file}`));
    return false;
  }
  
  console.log('✅ All shared components found');
  return true;
};

// Step 3: Integration options
const showIntegrationOptions = () => {
  console.log('\n📋 Integration Options:');
  console.log('');
  console.log('Option 1: Quick Demo Integration');
  console.log('  - Copy App-Enhanced.tsx to App.tsx');
  console.log('  - Adds demo route and shared component access');
  console.log('  - Safe for testing, minimal changes');
  console.log('');
  console.log('Option 2: Gradual Migration');
  console.log('  - Follow the integration plan step by step');
  console.log('  - Migrate components one by one');
  console.log('  - Production-safe approach');
  console.log('');
  console.log('Option 3: Manual Integration');
  console.log('  - Import shared components where needed');
  console.log('  - Customize integration to your needs');
  console.log('  - Maximum control');
};

// Main setup function
const runSetup = () => {
  console.log('🔍 Checking project setup...\n');
  
  const backupSuccess = backupApp();
  const componentsReady = checkSharedComponents();
  
  if (!backupSuccess || !componentsReady) {
    console.log('\n❌ Setup incomplete. Please resolve the issues above.');
    return;
  }
  
  console.log('\n✅ Setup check complete!');
  
  // Check if enhanced version exists
  const hasEnhanced = fs.existsSync('App-Enhanced.tsx');
  
  if (hasEnhanced) {
    console.log('✅ Found App-Enhanced.tsx - ready for quick demo integration');
  }
  
  showIntegrationOptions();
  
  console.log('\n🎯 Next Steps:');
  console.log('');
  
  if (hasEnhanced) {
    console.log('For Quick Demo:');
    console.log('  npm run dev');
    console.log('  Visit http://localhost:5174/demo');
    console.log('');
  }
  
  console.log('For Full Integration:');
  console.log('  1. Review INTEGRATION_PLAN.md');
  console.log('  2. Start with Phase 1: Foundation Setup');
  console.log('  3. Test each phase before moving to the next');
  console.log('');
  console.log('For Documentation:');
  console.log('  - Read PHASE_3_COMPLETE.md');
  console.log('  - Check components/shared/ for component docs');
  console.log('');
  console.log('🚀 Happy coding with AdaptivePages shared components!');
};

// Run the setup
runSetup();

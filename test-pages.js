// Quick test script to check if pages are loading
import * as pageService from './services/pageService.ts';

console.log('🧪 Testing pageService directly...');

// Test with a known user ID
const testUserId = 'test-user-123';

pageService.getPages(testUserId)
  .then(pages => {
    console.log('✅ pageService.getPages() worked:', pages.length, 'pages');
    pages.forEach(page => {
      console.log('📄', page.name, page.id);
    });
  })
  .catch(error => {
    console.error('❌ pageService.getPages() failed:', error);
  });

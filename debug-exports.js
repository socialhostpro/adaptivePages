// Debug script to check exports
import('./components/LessonViewerModal.tsx')
  .then(module => {
    console.log('Available exports:', Object.keys(module));
    console.log('LessonViewerModal:', typeof module.LessonViewerModal);
    console.log('default:', typeof module.default);
  })
  .catch(err => {
    console.error('Import error:', err);
  });

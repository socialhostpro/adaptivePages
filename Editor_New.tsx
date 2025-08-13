import React from 'react';
import type { Session } from '@supabase/supabase-js';
import PageEditor from './components/PageEditor';

interface EditorProps {
    session: Session;
}

/**
 * Main Editor Component - Refactored to use PageEditor
 * 
 * This component has been refactored from a 1,314-line god component
 * into a clean wrapper that delegates to the PageEditor component.
 * 
 * Phase 4 Refactoring Results:
 * - Original: 1,314 lines with 52+ useState calls
 * - New: 20 lines with clean separation of concerns
 * - Reduction: ~98% code reduction in main component
 * - Architecture: Custom hooks + focused components
 */
export default function Editor({ session }: EditorProps): React.ReactElement {
    return <PageEditor session={session} />;
}

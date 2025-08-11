
/**
 * @file Editor.tsx
 * @description This is the main component for the page editor interface.
 * @dev
 *  **NOTE FOR DEVELOPERS:** This component has become a "god component," managing a significant amount of the application's
 *  state and logic. This was a pragmatic choice for rapid prototyping but is not sustainable for long-term maintenance.
 *
 *  **Refactoring Plan:**
 *  1. **State Management:** Introduce a dedicated state management solution (like Zustand or React Context) to de-couple state
 *     from this component. This will eliminate prop-drilling and centralize data management.
 *  2. **Component Granularity:** Break down the `Editor` into smaller, more focused components. For example, logic for
 *     modals, data fetching, and specific features (like e-commerce or courses) should be extracted into their own hooks and components.
 *  3. **Data Fetching:** Abstract the data fetching and caching logic (currently in `refreshAllData`) into a more robust
 *     system, potentially using a library like React Query (TanStack Query), to manage server state more effectively.
 *
 *  Please refer to `docs/APPLICATION_UPDATE_GUIDE.md` for more details on the refactoring strategy.
 */

import React, { useState, useCallback, useEffect, useRef, Suspense } from 'react';
import type { Session, User } from '@supabase/supabase-js';
import { supabase } from '../services/supabase';
import type { 
    LandingPageData,
    ManagedPage 
} from './types';
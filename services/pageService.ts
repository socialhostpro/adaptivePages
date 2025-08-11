

import { supabase } from './supabase';
import type { ManagedPage, LandingPageData, CartSettings, BookingSettings, ImageStore, StripeSettings, GenerationConfig } from '../types';
import type { Json, Tables, TablesInsert, TablesUpdate } from '../database.types';

type PageRow = Tables<'pages'>;
type PageInsert = TablesInsert<'pages'>;
type PageUpdate = TablesUpdate<'pages'>;

const pageRowToManagedPage = (page: PageRow, isPublic: boolean = false, groupMap?: Map<string, string | null>, contactMap?: Map<number, string | null>): ManagedPage => {
    const sourceData = isPublic ? page.published_data : page.data;
    const sourceImages = isPublic ? page.published_images : page.images;

    const landingPageData = sourceData ? { ...(sourceData as unknown as LandingPageData) } : null;
    
    // Always augment with data from separate columns for consistency
    if (landingPageData) {
        landingPageData.cartSettings = (page.cart_settings as unknown as CartSettings) ?? landingPageData.cartSettings;
        landingPageData.bookingSettings = (page.booking_settings as unknown as BookingSettings) ?? landingPageData.bookingSettings;
        landingPageData.stripeSettings = (page.stripe_settings as unknown as StripeSettings) ?? landingPageData.stripeSettings;
        landingPageData.headScripts = page.head_scripts ?? undefined;
        landingPageData.bodyScripts = page.body_scripts ?? undefined;
        landingPageData.staffPortalEnabled = page.staff_portal_enabled ?? undefined;
    }

    return {
        id: page.id,
        userId: page.user_id,
        name: page.name,
        updatedAt: page.updated_at,
        thumbnailUrl: page.thumbnail_url ?? undefined,
        data: landingPageData,
        images: (sourceImages as unknown as ImageStore) || {},
        isPublished: page.is_published,
        slug: page.slug,
        customDomain: page.custom_domain,
        generationConfig: page.generation_config as unknown as GenerationConfig | null,
        publishedData: page.published_data as unknown as LandingPageData | null,
        publishedImages: (page.published_images as unknown as ImageStore) || null,
        // Page Organization
        groupId: page.group_id,
        groupName: page.group_id && groupMap ? groupMap.get(page.group_id) ?? undefined : undefined,
        ownerContactId: page.owner_contact_id,
        ownerName: page.owner_contact_id && contactMap ? contactMap.get(page.owner_contact_id) ?? undefined : undefined,
    };
};

// Simple database connectivity test
export async function testDatabaseConnection(): Promise<boolean> {
  try {
    const { data, error } = await supabase
      .from('pages')
      .select('count')
      .limit(1);
    
    return !error;
  } catch (error) {
    console.error('Database connection test failed:', error);
    return false;
  }
}

// Lightweight page list function for fast loading
export async function getPagesList(userId: string): Promise<ManagedPage[]> {
  try {
    // Fast query - only essential display fields
    const { data: pages, error: pagesError } = await supabase
      .from('pages')
      .select(`
        id, name, slug, 
        created_at, updated_at,
        is_published, group_id, owner_contact_id,
        user_id, thumbnail_url
      `)
      .eq('user_id', userId)
      .order('updated_at', { ascending: false })
      .limit(50); // Further reduced limit for faster queries

    if (pagesError) {
      console.error('Error fetching pages list:', pagesError.message);
      throw pagesError;
    }
    
    if (!pages) return [];
    
    // Run group and contact queries in parallel with timeouts
    const [groupsResult, contactsResult] = await Promise.all([
      supabase.from('page_groups')
        .select('id, name')
        .eq('user_id', userId),
      supabase.from('contacts')
        .select('id, name')
        .eq('owner_id', userId)
    ]);

    if (groupsResult.error) {
      console.warn('Error loading groups:', groupsResult.error);
    }
    if (contactsResult.error) {
      console.warn('Error loading contacts:', contactsResult.error);
    }

    const groups = (groupsResult.data as unknown as Tables<'page_groups'>[]) || [];
    const contacts = (contactsResult.data as unknown as Tables<'contacts'>[]) || [];

    const groupMap = new Map(groups.map(g => [g.id, g.name]));
    const contactMap = new Map(contacts.map(c => [c.id, c.name]));

    // Create lightweight page objects
    return pages.map((page): ManagedPage => ({
      id: page.id,
      userId: page.user_id,
      name: page.name,
      updatedAt: page.updated_at,
      thumbnailUrl: page.thumbnail_url ?? undefined,
      data: null, // Load on demand
      images: {}, // Load on demand
      isPublished: page.is_published,
      slug: page.slug,
      customDomain: null, // Load on demand
      generationConfig: null, // Load on demand
      publishedData: null, // Load on demand
      publishedImages: null, // Load on demand
      groupId: page.group_id,
      groupName: page.group_id && groupMap ? groupMap.get(page.group_id) ?? undefined : undefined,
      ownerContactId: page.owner_contact_id,
      ownerName: page.owner_contact_id && contactMap ? contactMap.get(page.owner_contact_id) ?? undefined : undefined,
    }));
  } catch (error) {
    console.error('Database timeout or error in getPagesList:', error);
    return [];
  }
}

export async function getPages(userId: string): Promise<ManagedPage[]> {
  // Use the lightweight version instead of full data loading
  return getPagesList(userId);
}

// Load full page data on-demand (when opening page in editor)
export async function getFullPageData(pageId: string): Promise<ManagedPage | null> {
  try {
    console.log('[pageService] Loading full page data for:', pageId);
    
    // Load complete page data including heavy JSON fields
    const { data: page, error } = await supabase
      .from('pages')
      .select('*') // Now we load everything
      .eq('id', pageId)
      .single();

    if (error) {
      console.error('Error fetching full page data:', error.message);
      throw error;
    }

    if (!page) return null;

    // Get user_id from the page to load related data
    const userId = page.user_id;

    // Load groups and contacts for this specific page
    const [groupsResult, contactsResult] = await Promise.all([
      supabase.from('page_groups')
        .select('id, name')
        .eq('user_id', userId),
      supabase.from('contacts')
        .select('id, name')
        .eq('owner_id', userId)
    ]);

    const groups = (groupsResult.data as unknown as Tables<'page_groups'>[]) || [];
    const contacts = (contactsResult.data as unknown as Tables<'contacts'>[]) || [];

    const groupMap = new Map(groups.map(g => [g.id, g.name]));
    const contactMap = new Map(contacts.map(c => [c.id, c.name]));

    // Return full page object with all data
    return pageRowToManagedPage(page as PageRow, false, groupMap, contactMap);
  } catch (error) {
    console.error('Error loading full page data:', error);
    throw error;
  }
}

export async function getPageList(userId: string): Promise<{ id: string, name: string, slug: string | null }[]> {
    const { data, error } = await supabase
      .from('pages')
      .select('id, name, slug')
      .eq('user_id', userId)
      .order('updated_at', { ascending: false });
  
    if (error) {
      console.error('Error fetching page list:', error.message);
      throw error;
    }
    return (data as any) || [];
}

export async function getPage(id: string): Promise<ManagedPage | null> {
  const { data, error } = await supabase
    .from('pages')
    .select('*')
    .eq('id', id)
    .single();

  if (error) {
    if (error.code === 'PGRST116') return null; // Not found, not an error
    console.error('Error fetching page:', error.message, JSON.stringify(error, null, 2));
    throw error;
  }
  
  if (!data) return null;

  return pageRowToManagedPage(data as unknown as PageRow);
}

export async function savePage(pageToSave: ManagedPage): Promise<ManagedPage> {
    const { headScripts, bodyScripts, staffPortalEnabled, ...restOfData } = pageToSave.data || {};

    const payload: PageUpdate = {
        name: pageToSave.name,
        updated_at: new Date().toISOString(),
        data: Object.keys(restOfData).length > 0 ? restOfData as unknown as Json : null,
        images: pageToSave.images as unknown as Json,
        thumbnail_url: pageToSave.thumbnailUrl ?? null,
        cart_settings: pageToSave.data?.cartSettings as unknown as Json ?? null,
        booking_settings: pageToSave.data?.bookingSettings as unknown as Json ?? null,
        stripe_settings: pageToSave.data?.stripeSettings as unknown as Json ?? null,
        generation_config: pageToSave.generationConfig as unknown as Json ?? null,
        head_scripts: headScripts ?? null,
        body_scripts: bodyScripts ?? null,
        staff_portal_enabled: staffPortalEnabled ?? null,
    };
    
    const { data, error } = await supabase
        .from('pages')
        .update(payload as any)
        .eq('id', pageToSave.id)
        .select('*')
        .single();
    
    if (error) {
        console.error('Error saving page:', error.message, JSON.stringify(error, null, 2));
        throw error;
    }

    if (!data) {
        throw new Error("Save operation did not return the page data.");
    }
    
    return pageRowToManagedPage(data as unknown as PageRow);
}

export async function createPage(name: string, userId: string): Promise<ManagedPage> {
    const safeName = name
        .toLowerCase()
        .replace(/\s+/g, '-') // Replace spaces with -
        .replace(/[^\w-]+/g, '') // Remove all non-word chars except -
        .replace(/--+/g, '-') // Replace multiple - with single -
        .replace(/^-+/, '') // Trim - from start of text
        .replace(/-+$/, ''); // Trim - from end of text
    
    const randomSuffix = Math.floor(1000 + Math.random() * 9000);
    const newSlug = `${safeName || 'page'}-${randomSuffix}`;

    const newPage: PageInsert = {
        user_id: userId,
        name,
        slug: newSlug,
        data: null,
        images: {} as Json,
        generation_config: null,
    };

    const { data, error } = await supabase
        .from('pages')
        .insert([newPage] as any)
        .select('*')
        .single();

    if (error) {
        console.error('Error creating page:', error.message, JSON.stringify(error, null, 2));
        throw error;
    }

    if (!data) {
        throw new Error("Create operation did not return the new page data.");
    }
    
    return pageRowToManagedPage(data as unknown as PageRow);
}

export async function deletePage(id: string): Promise<void> {
  const { error } = await supabase
    .from('pages')
    .delete()
    .eq('id', id);

  if (error) {
    console.error('Error deleting page:', error.message, JSON.stringify(error, null, 2));
    throw error;
  }
}

export async function removeProductIdFromPages(productId: string): Promise<void> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error("User not authenticated");

    const { data: pages, error: fetchError } = await supabase
        .from('pages')
        .select('id, data')
        .eq('user_id', user.id);

    if (fetchError) {
        console.error("Error fetching pages to remove product ID:", fetchError);
        throw fetchError;
    }

    if (!pages) return;

    const pagesToUpdate = (pages as any).filter((page: any) =>
        page.data && (page.data as unknown as LandingPageData)?.products?.itemIds?.includes(productId)
    );

    if (pagesToUpdate.length === 0) {
        return; // No pages to update
    }

    const updates = pagesToUpdate.map((page: any) => {
        const pageData = page.data as unknown as LandingPageData;
        const newItemIds = pageData.products!.itemIds.filter(id => id !== productId);
        
        const newPageData: LandingPageData = {
            ...pageData,
            products: {
                ...pageData.products!,
                itemIds: newItemIds,
            }
        };
        
        const updatePayload: PageUpdate = {
            data: newPageData as unknown as Json,
        };

        return supabase
            .from('pages')
            .update(updatePayload as any)
            .eq('id', page.id);
    });

    const results = await Promise.all(updates);
    const updateErrors = results.map(res => res.error).filter(Boolean);
    
    if (updateErrors.length > 0) {
        console.error("Errors updating pages after product deletion:", updateErrors);
        throw new Error("Failed to update some pages after product deletion.");
    }
}


export async function renamePage(id: string, newName: string): Promise<ManagedPage> {
  const payload: PageUpdate = { name: newName, updated_at: new Date().toISOString() };
  const { data, error } = await supabase
    .from('pages')
    .update(payload as any)
    .eq('id', id)
    .select('*')
    .single();
    
  if (error) {
    console.error('Error renaming page:', error.message, JSON.stringify(error, null, 2));
    throw error;
  }

  if (!data) {
    throw new Error("Rename operation did not return the updated page data.");
  }
  
  return pageRowToManagedPage(data as unknown as PageRow);
}

export async function updatePageAssignments(pageId: string, assignments: { groupId: string | null; ownerContactId: number | null; customDomain: string | null }): Promise<ManagedPage> {
    const payload: PageUpdate = {
        group_id: assignments.groupId,
        owner_contact_id: assignments.ownerContactId,
        custom_domain: assignments.customDomain,
        updated_at: new Date().toISOString()
    };
    const { data, error } = await supabase
        .from('pages')
        .update(payload as any)
        .eq('id', pageId)
        .select('*')
        .single();

    if (error) {
        console.error('Error updating page assignments:', error.message);
        if (error.code === '23505') { // Unique constraint violation
            throw new Error('That custom domain or slug is already in use.');
        }
        throw error;
    }
    if (!data) {
        throw new Error("Page assignment update did not return data.");
    }
    return pageRowToManagedPage(data as unknown as PageRow);
}


// --- Publishing ---

export async function publishPage(pageId: string, pageData: LandingPageData, images: ImageStore): Promise<void> {
    const { headScripts, bodyScripts, staffPortalEnabled, ...restOfData } = pageData;
    const payload: PageUpdate = {
      is_published: true,
      published_data: restOfData as unknown as Json,
      published_images: images as unknown as Json,
      updated_at: new Date().toISOString(),
      head_scripts: headScripts ?? null,
      body_scripts: bodyScripts ?? null,
      staff_portal_enabled: staffPortalEnabled ?? null,
    };
    const { error } = await supabase
        .from('pages')
        .update(payload as any)
        .eq('id', pageId);
    if (error) throw error;
}

export async function unpublishPage(pageId: string): Promise<void> {
    const payload: PageUpdate = { is_published: false, updated_at: new Date().toISOString() };
    const { error } = await supabase
        .from('pages')
        .update(payload as any)
        .eq('id', pageId);
    if (error) throw error;
}

export async function updatePublishSettings(pageId: string, slug: string, customDomain: string): Promise<void> {
    const payload: PageUpdate = { slug, custom_domain: customDomain || null, updated_at: new Date().toISOString() };
    const { error } = await supabase
        .from('pages')
        .update(payload as any)
        .eq('id', pageId);
    if (error) throw error;
}

export async function updateAppSettings(pageId: string, cartSettings: CartSettings, bookingSettings: BookingSettings, stripeSettings: StripeSettings, headScripts: string, bodyScripts: string): Promise<void> {
    const { data: page, error: fetchError } = await supabase.from('pages').select('*').eq('id', pageId).single();
    if (fetchError || !page) {
        throw new Error(`Page with ID ${pageId} not found to update app settings.`);
    }

    const currentData = ((page as any).data as unknown as LandingPageData) || {};
    
    // Create the new data object for the JSONB column, preserving existing data
    const updatedData: Partial<LandingPageData> = {
        ...currentData,
        cartSettings,
        bookingSettings,
        stripeSettings
    };
    
    // Explicitly remove scripts from the JSONB object to avoid duplication
    delete updatedData.headScripts;
    delete updatedData.bodyScripts;

    const payload: PageUpdate = {
        data: updatedData as unknown as Json, // Persist settings in the main JSONB for consistency
        cart_settings: cartSettings as unknown as Json,
        booking_settings: bookingSettings as unknown as Json,
        stripe_settings: stripeSettings as unknown as Json,
        head_scripts: headScripts,
        body_scripts: bodyScripts,
        updated_at: new Date().toISOString()
    };
    
    const { error } = await supabase
        .from('pages')
        .update(payload as any)
        .eq('id', pageId);
    if (error) throw error;
}

// --- Public Functions ---
export async function getPublicPageBySlug(slug: string): Promise<ManagedPage | null> {
    const { data, error } = await supabase
        .from('pages')
        .select('*')
        .eq('slug', slug)
        .eq('is_published', true)
        .single();
    if (error) {
      if (error.code === 'PGRST116') return null;
      throw error;
    }
    if (!data) return null;
    
    return pageRowToManagedPage(data as unknown as PageRow, true);
}

export async function getPublicPageByDomain(domain: string): Promise<ManagedPage | null> {
    const { data, error } = await supabase
        .from('pages')
        .select('*')
        .eq('custom_domain', domain)
        .eq('is_published', true)
        .single();
    if (error) {
        if (error.code === 'PGRST116') return null;
        throw error;
    }
    if (!data) return null;
    
    return pageRowToManagedPage(data as unknown as PageRow, true);
}

export async function updatePageThumbnail(pageId: string, thumbnailUrl: string): Promise<void> {
  const payload: PageUpdate = {
    thumbnail_url: thumbnailUrl,
    updated_at: new Date().toISOString()
  };
  
  const { error } = await supabase
    .from('pages')
    .update(payload as any)
    .eq('id', pageId);
    
  if (error) {
    console.error('Error updating page thumbnail:', error.message);
    throw error;
  }
}
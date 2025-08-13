

import { supabase } from '../../services/supabase';
import type { ManagedPage, LandingPageData, CartSettings, BookingSettings, ImageStore, StripeSettings, GenerationConfig } from '../types';
import type { Json, Tables, TablesInsert, TablesUpdate } from '../../database.types';

type PageRow = Tables<'pages'>;
type PageInsert = TablesInsert<'pages'>;
type PageUpdate = TablesUpdate<'pages'>;

// Type-safe conversion helpers
const toJsonSafe = <T>(value: T | null | undefined): Json | null => {
    if (value === null || value === undefined) return null;
    return value as unknown as Json;
};

const fromJsonSafe = <T>(value: Json | null): T | null => {
    if (value === null) return null;
    return value as unknown as T;
};

const PAGE_COLUMNS = `
    id, user_id, name, updated_at, thumbnail_url, data, images, is_published, slug, custom_domain, 
    generation_config, published_data, published_images, group_id, owner_contact_id, 
    cart_settings, booking_settings, stripe_settings, head_scripts, body_scripts, staff_portal_enabled
`;

const createBasicManagedPage = (page: any): ManagedPage => {
    return {
        id: page.id,
        userId: page.user_id,
        name: page.name,
        updatedAt: page.updated_at,
        thumbnailUrl: page.thumbnail_url,
        isPublished: page.is_published || false,
        slug: page.slug,
        customDomain: page.custom_domain,
        // Default values for missing data
        data: null,
        images: null,
        generationConfig: null,
        publishedData: null,
        publishedImages: null,
        groupId: null,
        groupName: null,
        ownerContactId: null,
        ownerName: null,
    };
};

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

export async function getPages(userId: string): Promise<ManagedPage[]> {
  console.log('[PAGE_SERVICE] getPages called for userId:', userId);
  
  try {
    // Full database query with ALL page data to restore complete functionality
    const { data: pages, error: pagesError } = await supabase
      .from('pages')
      .select(PAGE_COLUMNS)
      .eq('user_id', userId)
      .order('updated_at', { ascending: false })
      .limit(50);

    if (pagesError) {
      console.error('[PAGE_SERVICE] Error fetching pages:', pagesError.message, JSON.stringify(pagesError, null, 2));
      throw pagesError;
    }
    
    console.log('[PAGE_SERVICE] Raw pages from DB:', pages ? pages.length : 0);
    
    if (!pages) return [];
    
    // Use full page creation with complete data
    const managedPages = pages.map((page: any) => pageRowToManagedPage(page as unknown as PageRow));
    console.log('[PAGE_SERVICE] Processed pages:', managedPages.length);
    return managedPages;
  } catch (error) {
    console.error('[PAGE_SERVICE] Unexpected error in getPages:', error);
    return [];
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
    return data || [];
}

export async function getPage(id: string): Promise<ManagedPage | null> {
  const { data, error } = await supabase
    .from('pages')
    .select(PAGE_COLUMNS)
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
        data: Object.keys(restOfData).length > 0 ? toJsonSafe(restOfData) : null,
        images: toJsonSafe(pageToSave.images),
        thumbnail_url: pageToSave.thumbnailUrl ?? null,
        cart_settings: toJsonSafe(pageToSave.data?.cartSettings),
        booking_settings: toJsonSafe(pageToSave.data?.bookingSettings),
        stripe_settings: toJsonSafe(pageToSave.data?.stripeSettings),
        generation_config: toJsonSafe(pageToSave.generationConfig),
        head_scripts: headScripts ?? null,
        body_scripts: bodyScripts ?? null,
        staff_portal_enabled: staffPortalEnabled ?? null,
    };
    
    const { data, error } = await supabase
        .from('pages')
        .update(payload)
        .eq('id', pageToSave.id)
        .select(PAGE_COLUMNS)
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

    // Use direct database insert for reliability
    const newPage: PageInsert = {
        user_id: userId,
        name,
        slug: newSlug,
        data: null,
        images: toJsonSafe({}),
        generation_config: null,
    };

    const { data, error } = await supabase
        .from('pages')
        .insert([newPage])
        .select(PAGE_COLUMNS)
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

export async function removePagesForProductId(productId: number): Promise<void> {
    const { data: pages, error: fetchError } = await supabase
        .from('pages')
        .select('id, data');

    if (fetchError) {
        console.error("Error fetching pages to remove product ID:", fetchError);
        throw fetchError;
    }

    if (!pages) return;

    const pagesToUpdate = pages.filter((page: PageRow) =>
        page.data && fromJsonSafe<LandingPageData>(page.data)?.products?.itemIds?.includes(productId.toString())
    );

    if (pagesToUpdate.length === 0) {
        return; // No pages to update
    }

    const updates = pagesToUpdate.map((page: PageRow) => {
        const pageData = fromJsonSafe<LandingPageData>(page.data);
        if (!pageData?.products) return null;
        
        const newItemIds = pageData.products.itemIds.filter(id => id !== productId.toString());
        
        const newPageData: LandingPageData = {
            ...pageData,
            products: {
                ...pageData.products,
                itemIds: newItemIds,
            }
        };
        
        const updatePayload: PageUpdate = {
            data: toJsonSafe(newPageData),
        };

        return supabase
            .from('pages')
            .update(updatePayload)
            .eq('id', page.id);
    }).filter(Boolean);

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
    .update(payload)
    .eq('id', id)
    .select(PAGE_COLUMNS)
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
        .update(payload)
        .eq('id', pageId)
        .select(PAGE_COLUMNS)
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
      published_data: toJsonSafe(restOfData),
      published_images: toJsonSafe(images),
      updated_at: new Date().toISOString(),
      head_scripts: headScripts ?? null,
      body_scripts: bodyScripts ?? null,
      staff_portal_enabled: staffPortalEnabled ?? null,
    };
    const { error } = await supabase
        .from('pages')
        .update(payload)
        .eq('id', pageId);
    if (error) throw error;
}

export async function unpublishPage(pageId: string): Promise<void> {
    const payload: PageUpdate = { is_published: false, updated_at: new Date().toISOString() };
    const { error } = await supabase
        .from('pages')
        .update(payload)
        .eq('id', pageId);
    if (error) throw error;
}

export async function updatePublishSettings(pageId: string, slug: string, customDomain: string): Promise<void> {
    const payload: PageUpdate = { slug, custom_domain: customDomain || null, updated_at: new Date().toISOString() };
    const { error } = await supabase
        .from('pages')
        .update(payload)
        .eq('id', pageId);
    if (error) throw error;
}

export async function updateAppSettings(pageId: string, cartSettings: CartSettings, bookingSettings: BookingSettings, stripeSettings: StripeSettings, headScripts: string, bodyScripts: string): Promise<void> {
    const { data: page, error: fetchError } = await supabase.from('pages').select(PAGE_COLUMNS).eq('id', pageId).single();
    if (fetchError || !page) {
        throw new Error(`Page with ID ${pageId} not found to update app settings.`);
    }

    const currentData = fromJsonSafe<LandingPageData>(page.data) || {};
    
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
        data: toJsonSafe(updatedData), // Persist settings in the main JSONB for consistency
        cart_settings: toJsonSafe(cartSettings),
        booking_settings: toJsonSafe(bookingSettings),
        stripe_settings: toJsonSafe(stripeSettings),
        head_scripts: headScripts,
        body_scripts: bodyScripts,
        updated_at: new Date().toISOString()
    };
    
    const { error } = await supabase
        .from('pages')
        .update(payload)
        .eq('id', pageId);
    if (error) throw error;
}

// --- Public Functions ---
export async function getPublicPageBySlug(slug: string): Promise<ManagedPage | null> {
    const { data, error } = await supabase
        .from('pages')
        .select(PAGE_COLUMNS)
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
        .select(PAGE_COLUMNS)
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
    .update(payload)
    .eq('id', pageId);
    
  if (error) {
    console.error('Error updating page thumbnail:', error.message);
    throw error;
  }
}
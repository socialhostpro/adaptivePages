

import { supabase } from '../../services/supabase';
import type { ManagedProduct, ProductOption } from '../types';
import type { Json, Tables, TablesInsert, TablesUpdate } from '../types/database.types';

type ProductRow = Tables<'products'>;
type CategoryRow = Tables<'product_categories'>;

// Type-safe converters
function convertJsonToProductOptions(optionsJson: Json | null): ProductOption[] | null {
    if (!optionsJson || !Array.isArray(optionsJson)) return null;
    return optionsJson as unknown as ProductOption[];
}

function convertJsonToImageArray(imagesJson: Json | null): string[] | null {
    if (!imagesJson || !Array.isArray(imagesJson)) return null;
    return imagesJson as string[];
}

function convertDbProductToManagedProduct(p: ProductRow, categoryMap: Map<string, string>): ManagedProduct {
    return {
        id: p.id,
        user_id: p.user_id,
        created_at: p.created_at,
        name: p.name,
        description: p.description,
        price: p.price,
        status: p.status as ManagedProduct['status'],
        fulfillment_type: p.fulfillment_type as ManagedProduct['fulfillment_type'],
        category_id: p.category_id,
        category: p.category_id ? categoryMap.get(p.category_id) || 'Uncategorized' : 'Uncategorized',
        featured_image_url: p.featured_image_url,
        gallery_images: convertJsonToImageArray(p.gallery_images),
        options: convertJsonToProductOptions(p.options),
    };
}


export async function getProducts(userId: string): Promise<ManagedProduct[]> {
    const { data, error } = await supabase
        .from('products')
        .select(`*`)
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

    if (error) {
        console.error("Error fetching products:", error.message, error);
        throw error;
    }
    if (!data) return [];

    const categoryIds = [...new Set(data.map(p => p.category_id).filter(Boolean))].filter((id): id is string => id !== null);
    if (categoryIds.length === 0) {
        return data.map(p => convertDbProductToManagedProduct(p, new Map<string, string>()));
    }
    
    const { data: categories, error: catError } = await supabase.from('product_categories').select('id, name').in('id', categoryIds);
    if(catError) console.error("Error fetching categories for products:", catError);

    const categoryMap = new Map((categories || []).map(c => [c.id, c.name]));

    return data.map(p => convertDbProductToManagedProduct(p, categoryMap));
}

export async function getProductsByIds(ids: string[]): Promise<ManagedProduct[]> {
    if (!ids || ids.length === 0) return [];
    const { data, error } = await supabase
        .from('products')
        .select(`*`)
        .in('id', ids);

    if (error) {
        console.error("Error fetching products by IDs:", error.message, error);
        throw error;
    }
    if (!data) return [];
    
    const categoryIds = [...new Set(data.map(p => p.category_id).filter(Boolean))].filter((id): id is string => id !== null);
    if (categoryIds.length === 0) {
        return data.map(p => convertDbProductToManagedProduct(p, new Map<string, string>()));
    }

    const { data: categories, error: catError } = await supabase.from('product_categories').select('id, name').in('id', categoryIds);
    if(catError) console.error("Error fetching categories for products:", catError);

    const categoryMap = new Map((categories || []).map(c => [c.id, c.name]));

    return data.map(p => convertDbProductToManagedProduct(p, categoryMap));
}


export async function createProduct(userId: string, productData: Omit<ManagedProduct, 'id' | 'user_id' | 'created_at'>): Promise<ManagedProduct> {
    const productToInsert: TablesInsert<'products'> = {
        user_id: userId,
        name: productData.name,
        description: productData.description,
        price: productData.price,
        status: productData.status,
        fulfillment_type: productData.fulfillment_type,
        category_id: productData.category_id,
        featured_image_url: productData.featured_image_url,
        gallery_images: (productData.gallery_images || []) as unknown as Json,
        options: (productData.options || []) as unknown as Json,
    };
    
    const { data, error } = await supabase
        .from('products')
        .insert(productToInsert)
        .select()
        .single();
        
    if (error) {
        console.error("Error creating product:", error.message, error);
        throw error;
    }
    if (!data) {
        throw new Error("Product creation did not return data.");
    }
    
    // Convert the database result to ManagedProduct with category name
    const categoryMap = new Map<string, string>();
    if (data.category_id) {
        categoryMap.set(data.category_id, productData.category);
    }
    
    return convertDbProductToManagedProduct(data, categoryMap);
}

export async function updateProduct(productId: string, updates: Partial<Omit<ManagedProduct, 'id' | 'user_id' | 'created_at'>>): Promise<ManagedProduct> {
    const { category, ...restOfUpdates } = updates;

    const productToUpdate: TablesUpdate<'products'> = {};
    
    if (restOfUpdates.name !== undefined) productToUpdate.name = restOfUpdates.name;
    if (restOfUpdates.description !== undefined) productToUpdate.description = restOfUpdates.description;
    if (restOfUpdates.price !== undefined) productToUpdate.price = restOfUpdates.price;
    if (restOfUpdates.status !== undefined) productToUpdate.status = restOfUpdates.status;
    if (restOfUpdates.fulfillment_type !== undefined) productToUpdate.fulfillment_type = restOfUpdates.fulfillment_type;
    if (restOfUpdates.category_id !== undefined) productToUpdate.category_id = restOfUpdates.category_id;
    if (restOfUpdates.featured_image_url !== undefined) productToUpdate.featured_image_url = restOfUpdates.featured_image_url;
    if (restOfUpdates.options !== undefined) productToUpdate.options = (restOfUpdates.options || []) as unknown as Json;
    if (restOfUpdates.gallery_images !== undefined) productToUpdate.gallery_images = (restOfUpdates.gallery_images || []) as unknown as Json;

    const { data, error } = await supabase
        .from('products')
        .update(productToUpdate)
        .eq('id', productId)
        .select(`*`)
        .single();

    if (error) {
        console.error("Error updating product:", error.message, error);
        throw error;
    }
     if (!data) {
        throw new Error("Product update did not return data.");
    }

    // Fetch category name if category_id exists
    const categoryMap = new Map<string, string>();
    if (data.category_id) {
        const { data: categoryData, error: catError } = await supabase
            .from('product_categories')
            .select('id, name')
            .eq('id', data.category_id)
            .single();
        
        if (catError) {
            console.warn("Could not fetch category name for updated product");
        } else if (categoryData) {
            categoryMap.set(categoryData.id, categoryData.name);
        }
    }

    return convertDbProductToManagedProduct(data, categoryMap);
}

export async function deleteProduct(productId: string): Promise<void> {
    const { error } = await supabase
        .from('products')
        .delete()
        .eq('id', productId);
    
    if (error) {
        console.error("Error deleting product:", error.message, error);
        throw error;
    }
}

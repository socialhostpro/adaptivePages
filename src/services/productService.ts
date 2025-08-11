

import { supabase } from './supabase';
import type { ManagedProduct, ProductOption } from '../types';
import type { Json, Tables, TablesInsert, TablesUpdate } from '../database.types';

type ProductRow = Tables<'products'>;
type CategoryRow = Tables<'product_categories'>;

const mapProduct = (p: ProductRow, categoryMap: Map<string, string>): ManagedProduct => ({
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
    gallery_images: (p.gallery_images as string[] | null),
    options: (p.options as ProductOption[] | null),
});


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

    const productRows = (data as ProductRow[]);
    const categoryIds = [...new Set(productRows.map(p => p.category_id).filter(Boolean))].filter((id): id is string => id !== null);
    if (categoryIds.length === 0) {
        return productRows.map(p => mapProduct(p, new Map<string, string>()));
    }
    
    const { data: categories, error: catError } = await supabase.from('product_categories').select('id, name').in('id', categoryIds);
    if(catError) console.error("Error fetching categories for products:", catError);

    const categoryMap = new Map(((categories || []) as CategoryRow[]).map(c => [c.id, c.name]));

    return productRows.map(p => mapProduct(p, categoryMap));
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
    
    const productRows = data as ProductRow[];
    const categoryIds = [...new Set(productRows.map(p => p.category_id).filter(Boolean))].filter((id): id is string => id !== null);
    if (categoryIds.length === 0) {
        return productRows.map(p => mapProduct(p, new Map<string, string>()));
    }

    const { data: categories, error: catError } = await supabase.from('product_categories').select('id, name').in('id', categoryIds);
    if(catError) console.error("Error fetching categories for products:", catError);

    const categoryMap = new Map(((categories || []) as CategoryRow[]).map(c => [c.id, c.name]));

    return productRows.map(p => mapProduct(p, categoryMap));
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
        gallery_images: productData.gallery_images as unknown as Json,
        options: productData.options as unknown as Json,
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
    
    const newProductRow = data as ManagedProduct;
    newProductRow.category = productData.category; // Add back category name for client-side object
    return newProductRow;
}

export async function updateProduct(productId: string, updates: Partial<Omit<ManagedProduct, 'id' | 'user_id' | 'created_at'>>): Promise<ManagedProduct> {
    const { category, ...restOfUpdates } = updates;

    const productToUpdate: TablesUpdate<'products'> = {
        ...restOfUpdates,
        options: updates.options as unknown as Json,
        gallery_images: updates.gallery_images as unknown as Json,
    };

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

    const { data: categoryData, error: catError } = await supabase.from('product_categories').select('id, name').eq('id', (data as ProductRow).category_id!).single();
    if(catError) console.warn("Could not fetch category name for updated product");

    const categoryMap = new Map(categoryData ? [[(categoryData as CategoryRow).id, (categoryData as CategoryRow).name]] : []);

    return mapProduct(data as ProductRow, categoryMap);
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

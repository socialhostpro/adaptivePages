

import { supabase } from './supabase';
import type { ProductCategory } from '../types';
import type { TablesInsert, TablesUpdate } from '../database.types';

export async function getCategories(userId: string): Promise<ProductCategory[]> {
    const { data, error } = await supabase
        .from('product_categories')
        .select('*')
        .eq('user_id', userId)
        .order('position', { ascending: true });
    
    if (error) {
        console.error("Error fetching categories:", error.message, error);
        throw error;
    }
    return (data as unknown as ProductCategory[]) || [];
}

export async function createCategory(userId: string, name: string, parentId: string | null, position: number): Promise<ProductCategory> {
    const payload: TablesInsert<'product_categories'> = { user_id: userId, name, parent_id: parentId, position };
    const { data, error } = await supabase
        .from('product_categories')
        .insert([payload])
        .select('*')
        .single();
    
    if (error) {
        console.error("Error creating category:", error.message, error);
        throw error;
    }
    if (!data) {
        throw new Error("Category creation did not return data.");
    }
    return data as unknown as ProductCategory;
}

export async function updateCategory(id: string, name: string): Promise<ProductCategory> {
    const payload: TablesUpdate<'product_categories'> = { name };
    const { data, error } = await supabase
        .from('product_categories')
        .update(payload as any)
        .eq('id', id)
        .select('*')
        .single();
        
    if (error) {
        console.error("Error updating category:", error.message, error);
        throw error;
    }
    if (!data) {
        throw new Error("Category update did not return data.");
    }
    return data as unknown as ProductCategory;
}

export async function updateCategoryOrderAndParent(updates: TablesUpdate<'product_categories'>[]): Promise<void> {
    const { error } = await supabase.from('product_categories').upsert(updates as any);
    if (error) {
        console.error("Error updating category structure:", error);
        throw error;
    }
}

export async function deleteCategory(id: string): Promise<void> {
    // With `ON DELETE SET NULL` on the parent_id foreign key, Supabase/Postgres
    // will automatically handle reparenting children to be top-level categories.
    // We just need to delete the specified category.
    const { error } = await supabase
        .from('product_categories')
        .delete()
        .eq('id', id);

    if (error) {
        console.error("Error deleting category:", error.message, error);
        throw error;
    }
}
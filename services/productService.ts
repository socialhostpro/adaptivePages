

/**
 * Product Service - Standardized Implementation
 * 
 * Handles all product-related operations with:
 * - Consistent error handling
 * - Performance monitoring
 * - Type safety
 * - Standardized logging
 */

import { supabase } from './supabase';
import type { ManagedProduct, ProductOption } from '../types';
import type { Json, Tables, TablesInsert, TablesUpdate } from '../database.types';
import {
  ServiceLogger,
  validateRequired,
  handleDatabaseError,
  withPerformanceLogging,
  toJsonSafe
} from './serviceUtils';

const SERVICE_NAME = 'ProductService';

type ProductRow = Tables<'products'>;
type CategoryRow = Tables<'product_categories'>;

/**
 * Maps a product row to a managed product with category information
 */
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
  gallery_images: (p.gallery_images as unknown as string[] | null),
  options: (p.options as unknown as ProductOption[] | null),
});

/**
 * Gets all products for a specific user
 */
export async function getProducts(userId: string): Promise<ManagedProduct[]> {
  return withPerformanceLogging(SERVICE_NAME, 'getProducts', async () => {
    validateRequired(SERVICE_NAME, 'getProducts', { userId });

    ServiceLogger.debug(SERVICE_NAME, 'getProducts', 'Fetching products', { userId });

    const { data, error } = await supabase
      .from('products')
      .select(`*`)
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) {
      handleDatabaseError(SERVICE_NAME, 'getProducts', error, { userId });
    }
    
    if (!data || data.length === 0) {
      ServiceLogger.info(SERVICE_NAME, 'getProducts', 'No products found', { userId });
      return [];
    }

    const productRows = (data as unknown as ProductRow[]);
    const categoryIds = [...new Set(productRows.map(p => p.category_id).filter(Boolean))].filter((id): id is string => id !== null);
    
    if (categoryIds.length === 0) {
      const result = productRows.map(p => mapProduct(p, new Map<string, string>()));
      ServiceLogger.info(SERVICE_NAME, 'getProducts', 'Products fetched (no categories)', {
        userId,
        count: result.length
      });
      return result;
    }
    
    try {
      const { data: categories, error: catError } = await supabase
        .from('product_categories')
        .select('id, name')
        .in('id', categoryIds);
      
      if (catError) {
        ServiceLogger.warn(SERVICE_NAME, 'getProducts', 'Error fetching categories', {
          error: catError,
          categoryIds
        });
      }

      const categoryMap = new Map(
        ((categories || []) as unknown as CategoryRow[]).map(c => [c.id, c.name])
      );

      const result = productRows.map(p => mapProduct(p, categoryMap));
      
      ServiceLogger.info(SERVICE_NAME, 'getProducts', 'Products fetched successfully', {
        userId,
        count: result.length,
        categories: categoryMap.size
      });

      return result;
    } catch (error) {
      ServiceLogger.warn(SERVICE_NAME, 'getProducts', 'Failed to fetch categories, using defaults', {
        error,
        categoryIds
      });
      return productRows.map(p => mapProduct(p, new Map<string, string>()));
    }
  });
}

/**
 * Gets products by their IDs
 */
export async function getProductsByIds(ids: string[]): Promise<ManagedProduct[]> {
  return withPerformanceLogging(SERVICE_NAME, 'getProductsByIds', async () => {
    if (!ids || ids.length === 0) {
      ServiceLogger.debug(SERVICE_NAME, 'getProductsByIds', 'No IDs provided');
      return [];
    }

    validateRequired(SERVICE_NAME, 'getProductsByIds', { ids });

    ServiceLogger.debug(SERVICE_NAME, 'getProductsByIds', 'Fetching products by IDs', {
      count: ids.length,
      ids: ids.slice(0, 5) // Log first 5 IDs for debugging
    });

    const { data, error } = await supabase
      .from('products')
      .select(`*`)
      .in('id', ids);

    if (error) {
      handleDatabaseError(SERVICE_NAME, 'getProductsByIds', error, { ids });
    }
    
    if (!data || data.length === 0) {
      ServiceLogger.info(SERVICE_NAME, 'getProductsByIds', 'No products found', { ids });
      return [];
    }
    
    const productRows = data as unknown as ProductRow[];
    const categoryIds = [...new Set(productRows.map(p => p.category_id).filter(Boolean))].filter((id): id is string => id !== null);
    
    if (categoryIds.length === 0) {
      const result = productRows.map(p => mapProduct(p, new Map<string, string>()));
      ServiceLogger.info(SERVICE_NAME, 'getProductsByIds', 'Products fetched (no categories)', {
        requestedCount: ids.length,
        foundCount: result.length
      });
      return result;
    }

    try {
      const { data: categories, error: catError } = await supabase
        .from('product_categories')
        .select('id, name')
        .in('id', categoryIds);
      
      if (catError) {
        ServiceLogger.warn(SERVICE_NAME, 'getProductsByIds', 'Error fetching categories', {
          error: catError,
          categoryIds
        });
      }

      const categoryMap = new Map(
        ((categories || []) as unknown as CategoryRow[]).map(c => [c.id, c.name])
      );

      const result = productRows.map(p => mapProduct(p, categoryMap));
      
      ServiceLogger.info(SERVICE_NAME, 'getProductsByIds', 'Products fetched successfully', {
        requestedCount: ids.length,
        foundCount: result.length,
        categories: categoryMap.size
      });

      return result;
    } catch (error) {
      ServiceLogger.warn(SERVICE_NAME, 'getProductsByIds', 'Failed to fetch categories, using defaults', {
        error,
        categoryIds
      });
      return productRows.map(p => mapProduct(p, new Map<string, string>()));
    }
  });
}


/**
 * Creates a new product
 */
export async function createProduct(
  userId: string, 
  productData: Omit<ManagedProduct, 'id' | 'user_id' | 'created_at'>
): Promise<ManagedProduct> {
  return withPerformanceLogging(SERVICE_NAME, 'createProduct', async () => {
    validateRequired(SERVICE_NAME, 'createProduct', { userId, productData });

    ServiceLogger.debug(SERVICE_NAME, 'createProduct', 'Creating product', {
      userId,
      name: productData.name,
      price: productData.price,
      status: productData.status
    });

    const productToInsert: TablesInsert<'products'> = {
      user_id: userId,
      name: productData.name,
      description: productData.description,
      price: productData.price,
      status: productData.status,
      fulfillment_type: productData.fulfillment_type,
      category_id: productData.category_id,
      featured_image_url: productData.featured_image_url,
      gallery_images: toJsonSafe(productData.gallery_images),
      options: toJsonSafe(productData.options),
    };
    
    const { data, error } = await supabase
      .from('products')
      .insert([productToInsert])
      .select()
      .single();
        
    if (error) {
      handleDatabaseError(SERVICE_NAME, 'createProduct', error, { userId, productData });
    }
    
    if (!data) {
      const error = new Error('Product creation did not return data');
      ServiceLogger.error(SERVICE_NAME, 'createProduct', error, { userId, productData });
      throw error;
    }
    
    const newProductRow = data as unknown as ManagedProduct;
    newProductRow.category = productData.category; // Add back category name for client-side object
    
    ServiceLogger.info(SERVICE_NAME, 'createProduct', 'Product created successfully', {
      userId,
      productId: newProductRow.id,
      name: newProductRow.name
    });
    
    return newProductRow;
  });
}

/**
 * Updates an existing product
 */
export async function updateProduct(
  productId: string, 
  updates: Partial<Omit<ManagedProduct, 'id' | 'user_id' | 'created_at'>>
): Promise<ManagedProduct> {
  return withPerformanceLogging(SERVICE_NAME, 'updateProduct', async () => {
    validateRequired(SERVICE_NAME, 'updateProduct', { productId, updates });

    ServiceLogger.debug(SERVICE_NAME, 'updateProduct', 'Updating product', {
      productId,
      fields: Object.keys(updates)
    });

    const { category, ...restOfUpdates } = updates;

    const productToUpdate: TablesUpdate<'products'> = {
      ...restOfUpdates,
      options: toJsonSafe(updates.options),
      gallery_images: toJsonSafe(updates.gallery_images),
    };

    const { data, error } = await supabase
      .from('products')
      .update(productToUpdate as any)
      .eq('id', productId)
      .select(`*`)
      .single();

    if (error) {
      handleDatabaseError(SERVICE_NAME, 'updateProduct', error, { productId, updates });
    }
    
    if (!data) {
      const error = new Error('Product update did not return data');
      ServiceLogger.error(SERVICE_NAME, 'updateProduct', error, { productId, updates });
      throw error;
    }

    // Fetch category information if needed
    const productRow = data as unknown as ProductRow;
    let categoryMap = new Map<string, string>();
    
    if (productRow.category_id) {
      try {
        const { data: categoryData, error: catError } = await supabase
          .from('product_categories')
          .select('id, name')
          .eq('id', productRow.category_id)
          .single();
        
        if (catError) {
          ServiceLogger.warn(SERVICE_NAME, 'updateProduct', 'Could not fetch category name', {
            productId,
            categoryId: productRow.category_id,
            error: catError
          });
        } else if (categoryData) {
          const categoryRow = categoryData as unknown as CategoryRow;
          categoryMap.set(categoryRow.id, categoryRow.name);
        }
      } catch (error) {
        ServiceLogger.warn(SERVICE_NAME, 'updateProduct', 'Error fetching category', {
          productId,
          categoryId: productRow.category_id,
          error
        });
      }
    }

    const result = mapProduct(productRow, categoryMap);
    
    ServiceLogger.info(SERVICE_NAME, 'updateProduct', 'Product updated successfully', {
      productId,
      updatedFields: Object.keys(updates)
    });

    return result;
  });
}

/**
 * Deletes a product
 */
export async function deleteProduct(productId: string): Promise<void> {
  return withPerformanceLogging(SERVICE_NAME, 'deleteProduct', async () => {
    validateRequired(SERVICE_NAME, 'deleteProduct', { productId });

    ServiceLogger.debug(SERVICE_NAME, 'deleteProduct', 'Deleting product', { productId });

    const { error } = await supabase
      .from('products')
      .delete()
      .eq('id', productId);
    
    if (error) {
      handleDatabaseError(SERVICE_NAME, 'deleteProduct', error, { productId });
    }

    ServiceLogger.info(SERVICE_NAME, 'deleteProduct', 'Product deleted successfully', { productId });
  });
}
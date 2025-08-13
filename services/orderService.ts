
/**
 * Order Service - Standardized Implementation
 * 
 * Handles all order-related operations with:
 * - Consistent error handling
 * - Performance monitoring
 * - Type safety
 * - Standardized logging
 */

import { supabase } from './supabase';
import type { Order, OrderStatus, ManagedBooking, CartItem, ManagedProduct } from '../types';
import type { Json, Tables, TablesInsert, TablesUpdate } from '../database.types';
import * as contactService from './contactService';
import {
  ServiceLogger,
  validateRequired,
  handleDatabaseError,
  withPerformanceLogging,
  toJsonSafe
} from './serviceUtils';

const SERVICE_NAME = 'OrderService';

type OrderRow = Tables<'orders'>;
type OrderInsert = TablesInsert<'orders'>;
type PageRow = Tables<'pages'>;

/**
 * Creates a new order
 */
export async function createOrder(order: Order): Promise<OrderRow> {
  return withPerformanceLogging(SERVICE_NAME, 'createOrder', async () => {
    validateRequired(SERVICE_NAME, 'createOrder', {
      'order.pageId': order.pageId,
      'order.customerInfo': order.customerInfo,
      'order.cartItems': order.cartItems
    });

    ServiceLogger.debug(SERVICE_NAME, 'createOrder', 'Creating order', {
      pageId: order.pageId,
      itemCount: order.cartItems?.length || 0,
      total: order.total
    });

    // Fetch the page to get the owner's user_id
    const { data: page, error: pageError } = await supabase
      .from('pages')
      .select('user_id')
      .eq('id', order.pageId)
      .single();

    if (pageError || !page) {
      handleDatabaseError(SERVICE_NAME, 'createOrder', pageError || new Error('Page not found'), {
        pageId: order.pageId
      });
    }

    const ownerId = (page as unknown as PageRow).user_id;

    const orderToInsert: OrderInsert = {
      page_id: order.pageId,
      owner_id: ownerId,
      data: toJsonSafe({
        ...order,
        orderLog: [{ timestamp: new Date().toISOString(), message: 'Order created.' }]
      }) as Json,
    };

    const { data, error } = await supabase
      .from('orders')
      .insert([orderToInsert])
      .select()
      .single();

    if (error) {
      handleDatabaseError(SERVICE_NAME, 'createOrder', error, {
        pageId: order.pageId,
        ownerId,
        orderData: orderToInsert
      });
    }

    if (!data) {
      throw new Error('Order creation failed - no data returned');
    }

    ServiceLogger.info(SERVICE_NAME, 'createOrder', 'Order created successfully', {
      orderId: data.id,
      pageId: order.pageId,
      total: order.total
    });

    // After order is successfully created, create a contact
    try {
      await contactService.createContactFromSale(ownerId, order);
      ServiceLogger.debug(SERVICE_NAME, 'createOrder', 'Contact created from sale', {
        orderId: data.id
      });
    } catch (contactError) {
      ServiceLogger.warn(SERVICE_NAME, 'createOrder', 'Failed to create contact from sale', {
        orderId: data.id,
        error: contactError
      });
    }

    return data as unknown as OrderRow;
  });
}

/**
 * Creates an order from a booking
 */
export async function createOrderFromBooking(booking: ManagedBooking): Promise<OrderRow> {
  return withPerformanceLogging(SERVICE_NAME, 'createOrderFromBooking', async () => {
    validateRequired(SERVICE_NAME, 'createOrderFromBooking', {
      'booking.id': booking.id,
      'booking.pageId': booking.pageId,
      'booking.customer': booking.customer,
      'booking.serviceName': booking.serviceName
    });

    ServiceLogger.debug(SERVICE_NAME, 'createOrderFromBooking', 'Converting booking to order', {
      bookingId: booking.id,
      pageId: booking.pageId,
      serviceName: booking.serviceName
    });

    const [firstName, ...lastNameParts] = booking.customer.name.split(' ');
    const lastName = lastNameParts.join(' ');
    
    // Fetch user_id for the product owner
    const { data: pageData, error: pageError } = await supabase
      .from('pages')
      .select('user_id')
      .eq('id', booking.pageId)
      .single();
    
    if (pageError || !pageData) {
      handleDatabaseError(SERVICE_NAME, 'createOrderFromBooking', pageError || new Error('Page not found'), {
        pageId: booking.pageId,
        bookingId: booking.id
      });
    }

    const productOwnerId = (pageData as unknown as PageRow).user_id;

    const order: Order = {
      pageId: booking.pageId,
      bookingId: booking.id,
      customerInfo: {
        firstName,
        lastName,
        email: booking.customer.email,
      },
      items: [{
        id: booking.serviceId,
        user_id: productOwnerId, 
        created_at: new Date().toISOString(),
        name: booking.serviceName,
        description: `Service booking for ${booking.serviceName}`,
        price: booking.price,
        status: 'Active',
        fulfillment_type: 'On-site Service',
        category_id: null,
        category: 'Service',
        featured_image_url: null,
        gallery_images: null,
        options: null,
        quantity: 1,
        variantDescription: undefined, 
        finalPrice: booking.price,
      }],
      total: booking.price,
      status: 'Pending Payment',
    };

    ServiceLogger.info(SERVICE_NAME, 'createOrderFromBooking', 'Booking converted to order', {
      bookingId: booking.id,
      orderId: 'pending'
    });

    return createOrder(order);
  });
}

/**
 * Gets all orders for a specific user
 */
export async function getOrdersForUser(userId: string): Promise<OrderRow[]> {
  return withPerformanceLogging(SERVICE_NAME, 'getOrdersForUser', async () => {
    validateRequired(SERVICE_NAME, 'getOrdersForUser', { userId });

    ServiceLogger.debug(SERVICE_NAME, 'getOrdersForUser', 'Fetching orders', { userId });

    const { data, error } = await supabase
      .from('orders')
      .select('*')
      .eq('owner_id', userId)
      .order('created_at', { ascending: false });

    if (error) {
      handleDatabaseError(SERVICE_NAME, 'getOrdersForUser', error, { userId });
    }

    const result = (data as unknown as OrderRow[]) || [];

    ServiceLogger.info(SERVICE_NAME, 'getOrdersForUser', 'Orders fetched successfully', {
      userId,
      count: result.length
    });

    return result;
  });
}

/**
 * Updates the status of an order
 */
export async function updateOrderStatus(orderId: number, newStatus: OrderStatus): Promise<void> {
  return withPerformanceLogging(SERVICE_NAME, 'updateOrderStatus', async () => {
    validateRequired(SERVICE_NAME, 'updateOrderStatus', {
      orderId: orderId.toString(),
      newStatus
    });

    ServiceLogger.debug(SERVICE_NAME, 'updateOrderStatus', 'Updating order status', {
      orderId,
      newStatus
    });

    // First, fetch the existing order data
    const { data: order, error: fetchError } = await supabase
      .from('orders')
      .select('data')
      .eq('id', orderId)
      .single();
    
    if (fetchError || !order) {
      handleDatabaseError(SERVICE_NAME, 'updateOrderStatus', fetchError || new Error('Order not found'), {
        orderId
      });
    }

    const currentData = ((order as unknown as OrderRow).data as unknown as Order);
    
    // Create the updated data object with the new status
    const updatedData: Order = {
      ...currentData,
      status: newStatus,
      orderLog: [
        ...(currentData.orderLog || []), 
        { 
          timestamp: new Date().toISOString(), 
          message: `Status changed to ${newStatus}.` 
        }
      ]
    };

    const payload: TablesUpdate<'orders'> = { 
      data: toJsonSafe(updatedData) as Json 
    };

    // Update the row in the database
    const { error: updateError } = await supabase
      .from('orders')
      .update(payload as any)
      .eq('id', orderId);
        
    if (updateError) {
      handleDatabaseError(SERVICE_NAME, 'updateOrderStatus', updateError, {
        orderId,
        newStatus,
        payload
      });
    }

    ServiceLogger.info(SERVICE_NAME, 'updateOrderStatus', 'Order status updated successfully', {
      orderId,
      newStatus
    });
  });
}

/**
 * Updates an order with partial data and logs the change
 */
export async function updateOrder(orderId: number, updates: Partial<Order>, logMessage: string): Promise<void> {
  return withPerformanceLogging(SERVICE_NAME, 'updateOrder', async () => {
    validateRequired(SERVICE_NAME, 'updateOrder', {
      orderId: orderId.toString(),
      logMessage
    });

    ServiceLogger.debug(SERVICE_NAME, 'updateOrder', 'Updating order', {
      orderId,
      logMessage,
      updateKeys: Object.keys(updates)
    });

    // Fetch existing order data
    const { data: order, error: fetchError } = await supabase
      .from('orders')
      .select('data')
      .eq('id', orderId)
      .single();
    
    if (fetchError || !order) {
      handleDatabaseError(SERVICE_NAME, 'updateOrder', fetchError || new Error('Order not found'), {
        orderId
      });
    }

    const currentData = ((order as unknown as OrderRow).data as unknown as Order);
    
    // Create the updated data object
    const updatedData: Order = {
      ...currentData,
      ...updates,
      orderLog: [
        ...(currentData.orderLog || []), 
        { 
          timestamp: new Date().toISOString(), 
          message: logMessage 
        }
      ]
    };

    const payload: TablesUpdate<'orders'> = { 
      data: toJsonSafe(updatedData) as Json 
    };

    const { error: updateError } = await supabase
      .from('orders')
      .update(payload as any)
      .eq('id', orderId);
        
    if (updateError) {
      handleDatabaseError(SERVICE_NAME, 'updateOrder', updateError, {
        orderId,
        updates,
        logMessage,
        payload
      });
    }

    ServiceLogger.info(SERVICE_NAME, 'updateOrder', 'Order updated successfully', {
      orderId,
      logMessage
    });
  });
}

/**
 * Gets the log for a specific order
 */
export async function getOrderLog(orderId: number): Promise<{ timestamp: string; message: string; user?: string }[]> {
  return withPerformanceLogging(SERVICE_NAME, 'getOrderLog', async () => {
    validateRequired(SERVICE_NAME, 'getOrderLog', {
      orderId: orderId.toString()
    });

    ServiceLogger.debug(SERVICE_NAME, 'getOrderLog', 'Fetching order log', { orderId });

    const { data: order, error } = await supabase
      .from('orders')
      .select('data')
      .eq('id', orderId)
      .single();
    
    if (error || !order) {
      handleDatabaseError(SERVICE_NAME, 'getOrderLog', error || new Error('Order not found'), {
        orderId
      });
    }

    const orderData = ((order as unknown as OrderRow).data as unknown as Order);
    const log = orderData.orderLog || [];

    ServiceLogger.debug(SERVICE_NAME, 'getOrderLog', 'Order log fetched successfully', {
      orderId,
      logEntries: log.length
    });

    return log;
  });
}
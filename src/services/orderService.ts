

/**
 * @file This service handles all interactions with the `orders` table in the database.
 * @description It provides functions for creating, fetching, and updating customer orders.
 */

import { supabase } from './supabase';
import type { Order, OrderStatus, ManagedBooking, CartItem } from '../types';
import type { Json, Tables, TablesInsert, TablesUpdate } from '../database.types';
import * as contactService from './contactService';

type OrderRow = Tables<'orders'>;
type OrderInsert = TablesInsert<'orders'>;
type PageRow = Tables<'pages'>;

/**
 * Creates a new order in the database.
 * @param {Order} order - The order object to create.
 * @returns {Promise<OrderRow>} The newly created order row from the database.
 */
export async function createOrder(order: Order): Promise<OrderRow> {
  console.log('Attempting to create order:', order);
  const { data: page, error: pageError } = await supabase
    .from('pages')
    .select('user_id')
    .eq('id', order.pageId)
    .single();

  if (pageError || !page) {
    console.error('Error fetching page for order creation:', pageError);
    throw pageError || new Error('Could not find the associated page to place the order.');
  }

  const ownerId = (page as PageRow).user_id;

  const orderToInsert: OrderInsert = {
    page_id: order.pageId,
    owner_id: ownerId,
    data: {
      ...order,
      orderLog: [{ timestamp: new Date().toISOString(), message: 'Order created.' }]
    } as unknown as Json,
  };

  const { data, error } = await supabase
    .from('orders')
    .insert(orderToInsert)
    .select()
    .single();

  if (error) {
    console.error('Error creating order in DB:', error.message, error);
    throw error;
  }
  if (!data) {
    throw new Error('Order creation failed.');
  }

  console.log('Order created successfully, now creating contact from sale.');
  try {
    await contactService.createContactFromSale(ownerId, order);
  } catch(contactError) {
      console.warn("Failed to create contact from sale. Order was still processed.", contactError);
  }

  return data as unknown as OrderRow;
}

/**
 * Creates a new order based on a confirmed booking.
 * @param {ManagedBooking} booking - The booking to create an order from.
 * @returns {Promise<OrderRow>} The newly created order row.
 */
export async function createOrderFromBooking(booking: ManagedBooking): Promise<OrderRow> {
    console.log(`Creating order from booking ID: ${booking.id}`);
    const [firstName, ...lastNameParts] = booking.customer.name.split(' ');
    const lastName = lastNameParts.join(' ');
    
    const { data: pageData, error: pageError } = await supabase.from('pages').select('user_id').eq('id', booking.pageId).single();
    if(pageError || !pageData) throw pageError || new Error("Page not found");
    const productOwnerId = (pageData as PageRow).user_id;

    const order: Order = {
        pageId: booking.pageId,
        bookingId: booking.id,
        customerInfo: { firstName, lastName, email: booking.customer.email },
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
    return createOrder(order);
}

/**
 * Fetches all orders for a given user.
 * @param {string} userId - The ID of the user.
 * @returns {Promise<OrderRow[]>} An array of order rows.
 */
export async function getOrdersForUser(userId: string): Promise<OrderRow[]> {
  console.log(`Fetching orders for user ID: ${userId}`);
  const { data, error } = await supabase
    .from('orders')
    .select('*')
    .eq('owner_id', userId)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching orders:', error);
    throw error;
  }
  return (data as OrderRow[]) || [];
}

/**
 * Updates the status of a single order.
 * @param {number} orderId - The ID of the order to update.
 * @param {OrderStatus} newStatus - The new status to set.
 */
export async function updateOrderStatus(orderId: number, newStatus: OrderStatus): Promise<void> {
    console.log(`Updating status for order ID ${orderId} to ${newStatus}`);
    const { data: order, error: fetchError } = await supabase.from('orders').select('data').eq('id', orderId).single();
    
    if (fetchError || !order) throw fetchError || new Error(`Could not find order with ID ${orderId}.`);

    const currentData = (order.data as unknown as Order);
    const updatedData: Order = {
        ...currentData,
        status: newStatus,
        orderLog: [...(currentData.orderLog || []), { timestamp: new Date().toISOString(), message: `Status changed to ${newStatus}.` }]
    };

    const payload: Partial<TablesUpdate<'orders'>> = { data: updatedData as unknown as Json };

    const { error: updateError } = await supabase.from('orders').update(payload).eq('id', orderId);
        
    if (updateError) {
        console.error(`Error updating order status for order ${orderId}:`, updateError);
        throw updateError;
    }
}

/**
 * Performs a comprehensive update of an order's data.
 * @param {number} orderId - The ID of the order to update.
 * @param {Partial<Order>} updates - An object containing the fields to update.
 * @param {string} logMessage - A message describing the update for the order log.
 */
export async function updateOrder(orderId: number, updates: Partial<Order>, logMessage: string): Promise<void> {
    console.log(`Updating order ID ${orderId} with log: "${logMessage}"`);
    const { data: order, error: fetchError } = await supabase.from('orders').select('data').eq('id', orderId).single();
    
    if (fetchError || !order) throw fetchError || new Error(`Could not find order with ID ${orderId}.`);

    const currentData = (order.data as unknown as Order);
    
    const newTotal = updates.items 
        ? updates.items.reduce((sum, item) => sum + (item.finalPrice * item.quantity), 0)
        : currentData.total;

    const updatedData: Order = {
        ...currentData,
        ...updates,
        total: newTotal,
        orderLog: [...(currentData.orderLog || []), { timestamp: new Date().toISOString(), message: logMessage }]
    };
    
    const payload: Partial<TablesUpdate<'orders'>> = { data: updatedData as unknown as Json };

    const { error: updateError } = await supabase.from('orders').update(payload).eq('id', orderId);
        
    if (updateError) throw updateError;
}

/**
 * Fetches the order log for a specific order.
 * @param {number} orderId - The ID of the order.
 * @returns {Promise<{ timestamp: string; message: string; user?: string }[]>} The order log history.
 */
export async function getOrderLog(orderId: number): Promise<{ timestamp: string; message: string; user?: string }[]> {
    console.log(`Fetching order log for order ID: ${orderId}`);
    const { data, error } = await supabase.from('orders').select('data').eq('id', orderId).single();
    if (error || !data) {
        console.error(`Error fetching order log for ${orderId}:`, error);
        return [];
    }
    const orderData = data.data as unknown as Order;
    return orderData.orderLog || [];
}
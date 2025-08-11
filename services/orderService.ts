

import { supabase } from './supabase';
import type { Order, OrderStatus, ManagedBooking, CartItem, ManagedProduct } from '../types';
import type { Json, Tables, TablesInsert, TablesUpdate } from '../database.types';
import * as contactService from './contactService';

type OrderRow = Tables<'orders'>;
type OrderInsert = TablesInsert<'orders'>;
type PageRow = Tables<'pages'>;


export async function createOrder(order: Order): Promise<OrderRow> {
  // Fetch the page to get the owner's user_id
  const { data: page, error: pageError } = await supabase
    .from('pages')
    .select('user_id')
    .eq('id', order.pageId)
    .single();

  if (pageError || !page) {
    throw pageError || new Error('Could not find the associated page to place the order.');
  }

  const ownerId = (page as unknown as PageRow).user_id;

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
    .insert([orderToInsert])
    .select()
    .single();

  if (error) {
    console.error('Error creating order:', error.message, error);
    throw error;
  }
  if (!data) {
    throw new Error('Order creation failed.');
  }

  // After order is successfully created, create a contact
  try {
    await contactService.createContactFromSale(ownerId, order);
  } catch(contactError) {
      console.warn("Failed to create contact from sale. Order was still processed.", contactError);
  }

  return data as unknown as OrderRow;
}

export async function createOrderFromBooking(booking: ManagedBooking): Promise<OrderRow> {
    const [firstName, ...lastNameParts] = booking.customer.name.split(' ');
    const lastName = lastNameParts.join(' ');
    
    // Fetch user_id for the product owner. Assuming booking owner is the product owner.
    const { data: pageData, error: pageError } = await supabase.from('pages').select('user_id').eq('id', booking.pageId).single();
    if(pageError || !pageData) throw pageError || new Error("Page not found");
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
            id: booking.serviceId, // This might not be a real product ID if services are ad-hoc
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

export async function getOrdersForUser(userId: string): Promise<OrderRow[]> {
  const { data, error } = await supabase
    .from('orders')
    .select('*')
    .eq('owner_id', userId)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching orders:', error);
    throw error;
  }
  return (data as unknown as OrderRow[]) || [];
}

export async function updateOrderStatus(orderId: number, newStatus: OrderStatus): Promise<void> {
    // First, fetch the existing order data
    const { data: order, error: fetchError } = await supabase
        .from('orders')
        .select('data')
        .eq('id', orderId)
        .single();
    
    if (fetchError || !order) throw fetchError || new Error(`Could not find order with ID ${orderId}.`);

    const currentData = ((order as unknown as OrderRow).data as unknown as Order);
    // Create the updated data object with the new status
    const updatedData: Order = {
        ...currentData,
        status: newStatus,
        orderLog: [...(currentData.orderLog || []), { timestamp: new Date().toISOString(), message: `Status changed to ${newStatus}.` }]
    };

    const payload: TablesUpdate<'orders'> = { data: updatedData as unknown as Json };

    // Update the row in the database
    const { error: updateError } = await supabase
        .from('orders')
        .update(payload as any)
        .eq('id', orderId);
        
    if (updateError) {
        console.error(`Error updating order status for order ${orderId}:`, updateError.message, updateError);
        throw updateError;
    }
}

export async function updateOrder(orderId: number, updates: Partial<Order>, logMessage: string): Promise<void> {
    const { data: order, error: fetchError } = await supabase
        .from('orders')
        .select('data')
        .eq('id', orderId)
        .single();
    
    if (fetchError || !order) throw fetchError || new Error(`Could not find order with ID ${orderId}.`);

    const currentData = ((order as unknown as OrderRow).data as unknown as Order);
    
    const newTotal = updates.items 
        ? updates.items.reduce((sum, item) => sum + (item.finalPrice * item.quantity), 0)
        : currentData.total;

    const updatedData: Order = {
        ...currentData,
        ...updates,
        total: Number(newTotal),
        orderLog: [...(currentData.orderLog || []), { timestamp: new Date().toISOString(), message: logMessage }]
    };
    
    const payload: TablesUpdate<'orders'> = { data: updatedData as unknown as Json };

    const { error: updateError } = await supabase
        .from('orders')
        .update(payload as any)
        .eq('id', orderId);
        
    if (updateError) throw updateError;
}

export async function getOrderLog(orderId: number): Promise<{ timestamp: string; message: string; user?: string }[]> {
    const { data, error } = await supabase.from('orders').select('data').eq('id', orderId).single();
    if (error || !data) {
        console.error(`Error fetching order log for ${orderId}:`, error);
        return [];
    }
    const orderData = (data as unknown as OrderRow).data as unknown as Order;
    return orderData.orderLog || [];
}
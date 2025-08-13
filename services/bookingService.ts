
/**
 * Booking Service - Standardized Implementation
 * 
 * Handles all booking-related operations with:
 * - Consistent error handling
 * - Performance monitoring
 * - Type safety
 * - Standardized logging
 */

import { supabase } from './supabase';
import type { ManagedBooking, Booking, BookingStatus } from '../types';
import type { Json, Tables, TablesInsert, TablesUpdate } from '../database.types';
import {
  ServiceLogger,
  executeDbOperation,
  validateRequired,
  handleDatabaseError,
  withPerformanceLogging,
  fromJsonSafe
} from './serviceUtils';

const SERVICE_NAME = 'BookingService';

type BookingRow = Tables<'bookings'>;
type BookingInsert = TablesInsert<'bookings'>;
type PageRow = Tables<'pages'>;

const BOOKING_COLUMNS = 'id, created_at, page_id, owner_id, customer_info, service_id, service_name, booking_date, duration, status, notes, price, order_id';

/**
 * Creates a new booking
 */
export async function createBooking(
  booking: Omit<Booking, 'pageId'>, 
  pageId: string, 
  ownerId: string
): Promise<void> {
  return withPerformanceLogging(SERVICE_NAME, 'createBooking', async () => {
    validateRequired(SERVICE_NAME, 'createBooking', {
      pageId,
      ownerId,
      'booking.customerInfo': booking.customerInfo,
      'booking.serviceName': booking.serviceName,
      'booking.bookingDate': booking.bookingDate
    });

    const bookingToInsert: BookingInsert = {
      page_id: pageId,
      owner_id: ownerId,
      customer_info: booking.customerInfo as Json,
      service_id: booking.serviceId,
      service_name: booking.serviceName,
      booking_date: booking.bookingDate,
      duration: booking.duration,
      notes: booking.notes,
      price: booking.price,
      status: 'Pending',
    };

    ServiceLogger.debug(SERVICE_NAME, 'createBooking', 'Creating booking', {
      pageId,
      ownerId,
      serviceName: booking.serviceName
    });

    const { error } = await supabase.from('bookings').insert([bookingToInsert]);
    
    if (error) {
      handleDatabaseError(SERVICE_NAME, 'createBooking', error, {
        pageId,
        ownerId,
        bookingData: bookingToInsert
      });
    }

    ServiceLogger.info(SERVICE_NAME, 'createBooking', 'Booking created successfully', {
      pageId,
      serviceName: booking.serviceName
    });
  });
}

/**
 * Maps booking rows to managed booking objects
 */
const mapBookingRows = (rows: BookingRow[], pageMap: Map<string, string | null>): ManagedBooking[] => {
  const customerInfoAccessor = (info: Json | null): { name: string; email: string; phone?: string } => {
    if (!info) return { name: 'Unknown', email: 'Unknown' };
    
    try {
      const customerData = fromJsonSafe<any>(info);
      const { firstName, lastName, ...rest } = customerData;
      return {
        name: `${firstName || ''} ${lastName || ''}`.trim() || 'Unknown',
        ...rest
      };
    } catch (error) {
      ServiceLogger.warn(SERVICE_NAME, 'mapBookingRows', 'Failed to parse customer info', { info });
      return { name: 'Unknown', email: 'Unknown' };
    }
  };

  return (rows || []).map((row) => ({
    id: row.id,
    pageId: row.page_id,
    pageName: pageMap.get(row.page_id) || 'Unknown Page',
    createdAt: row.created_at,
    customer: customerInfoAccessor(row.customer_info),
    serviceId: row.service_id || '',
    serviceName: row.service_name || 'Unknown Service',
    bookingDate: row.booking_date,
    duration: row.duration,
    notes: row.notes || undefined,
    status: row.status as BookingStatus,
    price: row.price || 0,
    orderId: row.order_id ? String(row.order_id) : null,
  }));
};

/**
 * Gets all bookings for a specific user
 */
export async function getBookingsForUser(userId: string): Promise<ManagedBooking[]> {
  return withPerformanceLogging(SERVICE_NAME, 'getBookingsForUser', async () => {
    validateRequired(SERVICE_NAME, 'getBookingsForUser', { userId });

    ServiceLogger.debug(SERVICE_NAME, 'getBookingsForUser', 'Fetching bookings', { userId });

    // Fetch bookings
    const { data: bookings, error } = await supabase
      .from('bookings')
      .select(BOOKING_COLUMNS)
      .eq('owner_id', userId)
      .order('booking_date', { ascending: false });

    if (error) {
      handleDatabaseError(SERVICE_NAME, 'getBookingsForUser', error, { userId });
    }

    if (!bookings || bookings.length === 0) {
      ServiceLogger.info(SERVICE_NAME, 'getBookingsForUser', 'No bookings found', { userId });
      return [];
    }

    const bookingRows = bookings as unknown as BookingRow[];
    
    // Fetch page names for bookings
    const pageIds = [...new Set(bookingRows.map(b => b.page_id).filter(Boolean))];
    if (pageIds.length === 0) {
      return mapBookingRows(bookingRows, new Map<string, string | null>());
    }
    
    try {
      const { data: pages, error: pageError } = await supabase
        .from('pages')
        .select('id, name')
        .in('id', pageIds);
      
      if (pageError) {
        ServiceLogger.warn(SERVICE_NAME, 'getBookingsForUser', 'Could not fetch page names', {
          error: pageError,
          pageIds
        });
      }
      
      const pageMap = new Map(
        ((pages as any[] || []) as {id: string; name: string | null}[])
          .map((p) => [p.id, p.name])
      );

      const result = mapBookingRows(bookingRows, pageMap);
      
      ServiceLogger.info(SERVICE_NAME, 'getBookingsForUser', 'Bookings fetched successfully', {
        userId,
        count: result.length
      });

      return result;
    } catch (error) {
      ServiceLogger.warn(SERVICE_NAME, 'getBookingsForUser', 'Failed to fetch page names, using default', {
        error
      });
      return mapBookingRows(bookingRows, new Map<string, string | null>());
    }
  });
}

/**
 * Gets all bookings for a specific page
 */
export async function getBookingsForPage(pageId: string): Promise<ManagedBooking[]> {
  return withPerformanceLogging(SERVICE_NAME, 'getBookingsForPage', async () => {
    validateRequired(SERVICE_NAME, 'getBookingsForPage', { pageId });

    ServiceLogger.debug(SERVICE_NAME, 'getBookingsForPage', 'Fetching bookings for page', { pageId });

    // Fetch bookings for the page
    const { data: bookings, error } = await supabase
      .from('bookings')
      .select(BOOKING_COLUMNS)
      .eq('page_id', pageId)
      .order('booking_date', { ascending: false });

    if (error) {
      handleDatabaseError(SERVICE_NAME, 'getBookingsForPage', error, { pageId });
    }

    // Fetch page name
    let pageName = 'Unknown Page';
    try {
      const { data: pageData, error: pageError } = await supabase
        .from('pages')
        .select('name')
        .eq('id', pageId)
        .single();
      
      if (pageError) {
        ServiceLogger.warn(SERVICE_NAME, 'getBookingsForPage', 'Could not fetch page name', {
          pageId,
          error: pageError
        });
      } else {
        pageName = (pageData as any)?.name || 'Unknown Page';
      }
    } catch (error) {
      ServiceLogger.warn(SERVICE_NAME, 'getBookingsForPage', 'Error fetching page name', {
        pageId,
        error
      });
    }

    const pageMap = new Map([[pageId, pageName]]);
    const result = mapBookingRows((bookings || []) as unknown as BookingRow[], pageMap);

    ServiceLogger.info(SERVICE_NAME, 'getBookingsForPage', 'Page bookings fetched successfully', {
      pageId,
      count: result.length
    });

    return result;
  });
}

/**
 * Updates the status of a booking
 */
export async function updateBookingStatus(
  bookingId: string, 
  status: BookingStatus, 
  orderId: string | null = null
): Promise<void> {
  return withPerformanceLogging(SERVICE_NAME, 'updateBookingStatus', async () => {
    validateRequired(SERVICE_NAME, 'updateBookingStatus', {
      bookingId,
      status
    });

    ServiceLogger.debug(SERVICE_NAME, 'updateBookingStatus', 'Updating booking status', {
      bookingId,
      status,
      orderId
    });

    const payload: TablesUpdate<'bookings'> = { 
      status, 
      order_id: orderId ? parseInt(orderId, 10) : null 
    };

    const { error } = await supabase
      .from('bookings')
      .update(payload as any)
      .eq('id', bookingId);
    
    if (error) {
      handleDatabaseError(SERVICE_NAME, 'updateBookingStatus', error, {
        bookingId,
        status,
        orderId,
        payload
      });
    }

    ServiceLogger.info(SERVICE_NAME, 'updateBookingStatus', 'Booking status updated successfully', {
      bookingId,
      status,
      orderId
    });
  });
}
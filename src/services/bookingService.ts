

import { supabase } from './supabase';
import type { ManagedBooking, Booking, BookingStatus } from '../types';
import type { Json, Tables, TablesInsert, TablesUpdate } from '../database.types';

type BookingRow = Tables<'bookings'>;
type BookingInsert = TablesInsert<'bookings'>;
type PageRow = Tables<'pages'>;

const BOOKING_COLUMNS = 'id, created_at, page_id, owner_id, customer_info, service_id, service_name, booking_date, duration, status, notes, price, order_id';

export async function createBooking(booking: Omit<Booking, 'pageId'>, pageId: string, ownerId: string): Promise<void> {
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

    const { error } = await supabase.from('bookings').insert(bookingToInsert as any);
    if (error) {
        console.error("Error creating booking:", error);
        throw error;
    }
}

const mapBookingRows = (rows: BookingRow[], pageMap: Map<string, string | null>): ManagedBooking[] => {
     const customerInfoAccessor = (info: Json | null): { name: string; email: string; phone?: string } => {
        if (!info) return { name: 'Unknown', email: 'Unknown' };
        const { firstName, lastName, ...rest } = info as any;
        return {
            name: `${firstName || ''} ${lastName || ''}`.trim(),
            ...rest
        };
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

export async function getBookingsForUser(userId: string): Promise<ManagedBooking[]> {
    const { data: bookings, error } = await supabase
        .from('bookings')
        .select(BOOKING_COLUMNS)
        .eq('owner_id', userId)
        .order('booking_date', { ascending: false });

    if (error) throw error;
    if (!bookings) return [];

    const bookingRows = bookings as BookingRow[];
    const pageIds = [...new Set(bookingRows.map(b => b.page_id).filter(Boolean))];
    if (pageIds.length === 0) return mapBookingRows(bookingRows, new Map<string, string | null>());
    
    const { data: pages, error: pageError } = await supabase.from('pages').select('id, name').in('id', pageIds);
    if(pageError) console.warn("Could not fetch page names for bookings", pageError);
    const pageMap = new Map(((pages || []) as {id: string; name: string | null}[]).map((p) => [p.id, p.name]));

    return mapBookingRows(bookingRows, pageMap);
}


export async function getBookingsForPage(pageId: string): Promise<ManagedBooking[]> {
    const { data, error } = await supabase
        .from('bookings')
        .select(BOOKING_COLUMNS)
        .eq('page_id', pageId)
        .order('booking_date', { ascending: false });

    if (error) {
        console.error("Error fetching bookings:", error);
        throw error;
    }

    const { data: pageData, error: pageError } = await supabase.from('pages').select('name').eq('id', pageId).single();
    if (pageError) {
        console.warn(`Could not fetch page name for page ID ${pageId}`, pageError);
    }
    const pageMap = new Map([[pageId, (pageData as any)?.name || 'Unknown Page']]);

    return mapBookingRows((data || []) as BookingRow[], pageMap);
}

export async function updateBookingStatus(bookingId: string, status: BookingStatus, orderId: string | null): Promise<void> {
    const payload: TablesUpdate<'bookings'> = { status, order_id: orderId ? parseInt(orderId, 10) : null };

    const { error } = await supabase
        .from('bookings')
        .update(payload as any)
        .eq('id', bookingId);
    
    if (error) {
        console.error("Error updating booking status:", error);
        throw error;
    }
}

/**
 * @file Contains type definitions related to the booking system.
 */

/** Represents a single day's business hours for the booking system. */
export interface BusinessHour {
    day: 'Sunday' | 'Monday' | 'Tuesday' | 'Wednesday' | 'Thursday' | 'Friday' | 'Saturday';
    enabled: boolean;
    startTime: string; // "HH:mm"
    endTime: string; // "HH:mm"
}

/** Global settings for the standalone public booking system. */
export interface BookingSystemSettings {
    enabled: boolean;
    pageTitle: string;
    slotDuration: number; // in minutes
    businessHours: BusinessHour[];
    leadTime: number; // hours
    afterTime: number; // hours
}

/** The status of a booking. */
export type BookingStatus = 'Pending' | 'Confirmed' | 'Canceled';

/** Represents a booking made by a customer. */
export interface Booking {
    pageId: string;
    customerInfo: {
        firstName: string;
        lastName: string;
        email: string;
        phone?: string;
    };
    serviceId: string;
    serviceName: string;
    bookingDate: string; // ISO string
    duration: number; // in minutes
    notes?: string;
    price: number; // Price of the service
}

/** Represents a booking as managed within the application dashboard. */
export interface ManagedBooking {
    id: string;
    pageId: string;
    pageName: string;
    createdAt: string;
    customer: {
        name: string;
        email: string;
        phone?: string;
    };
    serviceId: string;
    serviceName: string;
    bookingDate: string; // ISO String
    duration: number; // in minutes
    notes?: string;
    status: BookingStatus;
    price: number;
    orderId?: string | null; // The ID of the invoice created
}



import { supabase } from './supabase';
import type { ContactMessage, CrmContact, CrmForm, CrmFormField, CrmContactStatus, Order, BookingSettings } from '../types';
import type { Json, Tables, TablesInsert, TablesUpdate } from '../database.types';

type ContactInsert = TablesInsert<'contacts'>;
type PageRow = Tables<'pages'>;
type FormRow = Tables<'forms'>;


async function fireWebhook(settings: BookingSettings | undefined, payload: object) {
    if (settings?.webhookUrl) {
        try {
            const headers: HeadersInit = { 'Content-Type': 'application/json' };
            if (settings.webhookApiKey) {
                headers['X-API-Key'] = settings.webhookApiKey;
            }
            // Fire and forget
            fetch(settings.webhookUrl, {
                method: 'POST',
                headers,
                body: JSON.stringify(payload)
            }).catch(e => console.warn(`Webhook failed to send:`, e));
        } catch (e) {
            console.warn(`Error during webhook processing:`, e);
        }
    }
}

export async function createContactMessage(message: ContactMessage): Promise<void> {
  const { data: page, error: pageError } = await supabase
    .from('pages')
    .select('user_id, booking_settings')
    .eq('id', message.pageId)
    .single();

  if (pageError || !page) {
    console.error(pageError);
    throw new Error('Could not find the associated page to submit the message.');
  }
  
  const ownerId = (page as unknown as PageRow).user_id;

  const contactToInsert: ContactInsert = {
    page_id: message.pageId,
    owner_id: ownerId,
    name: `${message.firstName} ${message.lastName}`,
    email: message.email,
    status: 'Contact' as CrmContactStatus,
    source: 'Contact Form',
    notes: message.message
  };

  const { error } = await supabase.from('contacts').insert(contactToInsert);

  if (error) {
    console.error('Error creating contact message:', error.message, error);
    throw error;
  }

  // Fire webhook after successful insertion
  await fireWebhook((page as unknown as PageRow).booking_settings as unknown as BookingSettings | undefined, message);
}

export async function createContactFromSale(ownerId: string, order: Order): Promise<void> {
    const contactToInsert: ContactInsert = {
        page_id: order.pageId,
        owner_id: ownerId,
        name: `${order.customerInfo.firstName} ${order.customerInfo.lastName}`,
        email: order.customerInfo.email,
        status: 'Customer' as CrmContactStatus,
        source: 'Sale',
        notes: `Purchased ${order.items.length} item(s) for a total of $${order.total.toFixed(2)}.`
    };
    
    // Upsert based on email for this owner
    const { error } = await supabase.from('contacts').upsert(contactToInsert, { onConflict: 'owner_id,email' });
    if (error) {
        console.error('Error creating/updating contact from sale:', error);
        throw error;
    }
}

export async function getContacts(userId: string): Promise<CrmContact[]> {
    const { data, error } = await supabase
        .from('contacts')
        .select('*')
        .eq('owner_id', userId)
        .order('created_at', { ascending: false });
    
    if (error) throw error;
    return (data as unknown as CrmContact[]) || [];
}

export async function getContactList(userId: string): Promise<{ id: number, name: string | null }[]> {
    const { data, error } = await supabase
        .from('contacts')
        .select('id, name')
        .eq('owner_id', userId)
        .order('name', { ascending: true });
    
    if (error) {
        console.error("Error fetching contact list:", error);
        throw error;
    }
    return (data as any) || [];
}

export async function updateContactStatus(contactId: number, status: CrmContactStatus): Promise<CrmContact> {
    const payload: TablesUpdate<'contacts'> = { status };
    const { data, error } = await supabase
        .from('contacts')
        .update(payload)
        .eq('id', contactId)
        .select()
        .single();

    if (error) {
        console.error(`Error updating contact status for ID ${contactId}:`, error);
        throw error;
    }

    if (!data) {
        // This is the case where PGRST116 would have been thrown by .single().
        // It means either the contact ID doesn't exist or RLS prevented the update/select.
        throw new Error(`Failed to update contact ${contactId}. The contact may not exist or you may not have permission to modify it.`);
    }

    return data as unknown as CrmContact;
}

// --- Form Builder Functions ---
export async function getForms(userId: string): Promise<CrmForm[]> {
    const { data, error } = await supabase
        .from('forms')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });
    if (error) throw error;
    return ((data as unknown as FormRow[]) || []).map((f: FormRow) => ({ ...f, fields: f.fields as unknown as CrmFormField[] }));
}

export async function createForm(userId: string, name: string, fields: CrmFormField[]): Promise<CrmForm> {
    const payload: TablesInsert<'forms'> = { user_id: userId, name, fields: fields as unknown as Json };
    const { data, error } = await supabase
        .from('forms')
        .insert(payload)
        .select()
        .single();
    if (error) throw error;
    if (!data) throw new Error("Form creation failed.");
    const form = data as unknown as FormRow;
    return { ...form, fields: form.fields as unknown as CrmFormField[] };
}

export async function getFormById(formId: string): Promise<CrmForm | null> {
    const { data, error } = await supabase.from('forms').select('*').eq('id', formId).single();
    if (error) {
        console.error('Error fetching form by ID', error);
        return null;
    }
    const form = data as unknown as FormRow;
    return form ? { ...form, fields: form.fields as unknown as CrmFormField[] } : null;
}

export async function handleCustomFormSubmission(pageId: string, formId: string, submissionData: Record<string, string>): Promise<void> {
    const { data: page, error: pageError } = await supabase.from('pages').select('user_id, booking_settings').eq('id', pageId).single();
    if (pageError || !page) throw pageError || new Error("Could not find page for form submission.");
    
    const { data: form, error: formError } = await supabase.from('forms').select('name').eq('id', formId).single();
    if (formError || !form) throw formError || new Error("Could not find form for submission.");

    // Heuristic to find name and email
    const emailKey = Object.keys(submissionData).find(k => k.toLowerCase().includes('email'));
    const nameKey = Object.keys(submissionData).find(k => k.toLowerCase().includes('name'));

    const contactToInsert: ContactInsert = {
        page_id: pageId,
        owner_id: (page as unknown as PageRow).user_id,
        name: nameKey ? submissionData[nameKey] : 'N/A',
        email: emailKey ? submissionData[emailKey] : 'N/A',
        status: 'Contact' as CrmContactStatus,
        source: `Custom Form: ${(form as unknown as FormRow).name}`,
        notes: JSON.stringify(submissionData, null, 2),
    };

    const { error } = await supabase.from('contacts').insert(contactToInsert);
    if (error) throw error;

    await fireWebhook((page as unknown as PageRow).booking_settings as unknown as BookingSettings | undefined, { formId, formName: (form as unknown as FormRow).name, submission: submissionData });
}

export async function handleEmbeddedFormSubmission(pageId: string, formName: string, submissionData: Record<string, string>): Promise<void> {
  const { data: page, error: pageError } = await supabase
    .from('pages')
    .select('user_id, booking_settings')
    .eq('id', pageId)
    .single();

  if (pageError || !page) {
    throw pageError || new Error('Could not find the associated page to submit the message.');
  }

  const ownerId = (page as unknown as PageRow).user_id;

  // Heuristic to find name and email
  const emailKey = Object.keys(submissionData).find(k => k.toLowerCase().includes('email'));
  const nameKey = Object.keys(submissionData).find(k => k.toLowerCase().includes('name'));

  const contactToInsert: ContactInsert = {
    page_id: pageId,
    owner_id: ownerId,
    name: nameKey ? submissionData[nameKey] : 'N/A',
    email: emailKey ? submissionData[emailKey] : 'N/A',
    status: 'Contact' as CrmContactStatus,
    source: `Embedded Form: ${formName}`,
    notes: JSON.stringify(submissionData, null, 2)
  };

  const { error } = await supabase.from('contacts').insert(contactToInsert);

  if (error) {
    console.error('Error creating contact from embedded form:', error.message, error);
    throw error;
  }
  
  await fireWebhook((page as unknown as PageRow).booking_settings as unknown as BookingSettings | undefined, { formName, submission: submissionData });
}
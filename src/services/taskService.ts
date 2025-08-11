

import { supabase } from './supabase';
import type { Task, TaskSubtask } from '../types';
import type { TablesInsert, TablesUpdate, PublicEnumTaskPriority, PublicEnumTaskStatus, Json, Tables } from '../database.types';

type PageRow = Tables<'pages'>;

export async function getTasks(userId: string): Promise<Task[]> {
    // 1. Fetch only the tasks
    const { data: tasks, error: tasksError } = await supabase
        .from('tasks')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

    if (tasksError) {
        console.error("Error fetching tasks:", tasksError);
        throw tasksError;
    }
    if (!tasks) return [];
    
    const taskRows = tasks as Tables<'tasks'>[];

    // 2. Collect all unique IDs for related entities
    const teamMemberIds = [...new Set(taskRows.map(t => t.assigned_to).filter(Boolean))] as string[];
    const pageIds = [...new Set(taskRows.map(t => t.page_id).filter(Boolean))] as string[];
    const orderIds = [...new Set(taskRows.map(t => t.order_id).filter(Boolean))] as number[];
    const bookingIds = [...new Set(taskRows.map(t => t.booking_id).filter(Boolean))] as string[];
    const proofingRequestIds = [...new Set(taskRows.map(t => t.proofing_request_id).filter(Boolean))] as string[];
    const contactIds = [...new Set(taskRows.map(t => t.contact_id).filter(Boolean))] as number[];
    const productIds = [...new Set(taskRows.map(t => t.product_id).filter(Boolean))] as string[];
    const seoReportIds = [...new Set(taskRows.map(t => t.seo_report_id).filter(Boolean))] as string[];
    const pageGroupIds = [...new Set(taskRows.map(t => t.page_group_id).filter(Boolean))] as string[];

    // 3. Fetch all related entities in batch queries
    const [
        { data: teamMembers },
        { data: pages },
        { data: orders },
        { data: bookings },
        { data: proofingRequests },
        { data: contacts },
        { data: products },
        { data: seoReports },
        { data: pageGroups }
    ] = await Promise.all([
        teamMemberIds.length > 0 ? supabase.from('team_members').select('id, name').in('id', teamMemberIds) : Promise.resolve({ data: [] }),
        pageIds.length > 0 ? supabase.from('pages').select('id, name').in('id', pageIds) : Promise.resolve({ data: [] }),
        orderIds.length > 0 ? supabase.from('orders').select('id').in('id', orderIds) : Promise.resolve({ data: [] }), // only need id for identifier
        bookingIds.length > 0 ? supabase.from('bookings').select('id').in('id', bookingIds) : Promise.resolve({ data: [] }), // only need id for identifier
        proofingRequestIds.length > 0 ? supabase.from('proofing_requests').select('id, title').in('id', proofingRequestIds) : Promise.resolve({ data: [] }),
        contactIds.length > 0 ? supabase.from('contacts').select('id, name').in('id', contactIds) : Promise.resolve({ data: [] }),
        productIds.length > 0 ? supabase.from('products').select('id, name').in('id', productIds) : Promise.resolve({ data: [] }),
        seoReportIds.length > 0 ? supabase.from('seo_reports').select('id, page_id').in('id', seoReportIds) : Promise.resolve({ data: [] }),
        pageGroupIds.length > 0 ? supabase.from('page_groups').select('id, name').in('id', pageGroupIds) : Promise.resolve({ data: [] })
    ]);
    
    // Fetch page names for SEO reports as a secondary lookup
    const seoReportPageIds = [...new Set(((seoReports as Tables<'seo_reports'>[]) || []).map(r => r.page_id).filter(Boolean))] as string[];
    const { data: seoPages } = seoReportPageIds.length > 0 ? await supabase.from('pages').select('id, name').in('id', seoReportPageIds) : { data: [] };

    // 4. Create maps for easy lookup
    const teamMembersMap = new Map(((teamMembers as Tables<'team_members'>[]) || []).map(i => [i.id, i.name]));
    const pagesMap = new Map(((pages as Tables<'pages'>[]) || []).map(i => [i.id, i.name]));
    const ordersMap = new Map(((orders as Tables<'orders'>[]) || []).map(i => [i.id, `#${i.id}`]));
    const bookingsMap = new Map(((bookings as Tables<'bookings'>[]) || []).map(i => [i.id, `Booking #${i.id.substring(0, 8)}`]));
    const proofingRequestsMap = new Map(((proofingRequests as Tables<'proofing_requests'>[]) || []).map(i => [i.id, i.title]));
    const contactsMap = new Map(((contacts as Tables<'contacts'>[]) || []).map(i => [i.id, i.name]));
    const productsMap = new Map(((products as Tables<'products'>[]) || []).map(i => [i.id, i.name]));
    const seoPageMap = new Map(((seoPages as Tables<'pages'>[]) || []).map(p => [p.id, p.name]));
    const seoReportsMap = new Map(((seoReports as Tables<'seo_reports'>[]) || []).map(i => [i.id, `SEO Report for ${seoPageMap.get(i.page_id) || 'page'}`]));
    const pageGroupsMap = new Map(((pageGroups as Tables<'page_groups'>[]) || []).map(i => [i.id, i.name]));
    
    // 5. Map over tasks to enrich them
    return taskRows.map(task => ({
        ...task,
        subtasks: task.subtasks as TaskSubtask[] | null,
        assigned_to_name: task.assigned_to ? teamMembersMap.get(task.assigned_to) : undefined,
        page_name: task.page_id ? pagesMap.get(task.page_id) : undefined,
        order_identifier: task.order_id ? ordersMap.get(task.order_id) : undefined,
        booking_identifier: task.booking_id ? bookingsMap.get(task.booking_id) : undefined,
        proofing_request_title: task.proofing_request_id ? proofingRequestsMap.get(task.proofing_request_id) : undefined,
        contact_name: task.contact_id ? contactsMap.get(task.contact_id) : undefined,
        product_name: task.product_id ? productsMap.get(task.product_id) : undefined,
        seo_report_name: task.seo_report_id ? seoReportsMap.get(task.seo_report_id) : undefined,
        page_group_name: task.page_group_id ? pageGroupsMap.get(task.page_group_id) : undefined,
    } as Task));
}

export async function createTask(userId: string, taskData: Omit<Task, 'id' | 'user_id' | 'created_at' | 'updated_at'>): Promise<Task> {
    const { 
        page_name, order_identifier, booking_identifier, proofing_request_title, contact_name, assigned_to_name,
        product_name, seo_report_name, page_group_name,
        ...restOfTaskData 
    } = taskData as any;

    const payload: TablesInsert<'tasks'> = { 
        user_id: userId, 
        ...restOfTaskData,
        subtasks: restOfTaskData.subtasks as Json | null,
    };
    const { data, error } = await supabase.from('tasks').insert(payload).select().single();
    if (error) throw error;
    if (!data) throw new Error("Task creation failed.");
    const task = data as Task;
    return { ...task, subtasks: task.subtasks as TaskSubtask[] | null } as Task;
}

export async function updateTask(taskId: string, updates: Partial<Omit<Task, 'id' | 'user_id' | 'created_at' | 'updated_at'>>): Promise<Task> {
    const validFields: (keyof TablesUpdate<'tasks'>)[] = [
        'title', 'description', 'due_date', 'status', 'priority', 'assigned_to', 
        'is_prompt_mode', 'prompt', 'subtasks', 'page_id', 'order_id', 'booking_id',
        'proofing_request_id', 'contact_id', 'product_id', 'seo_report_id', 'page_group_id'
    ];
    
    const payload: Partial<TablesUpdate<'tasks'>> = {};

    for (const key in updates) {
        if (validFields.includes(key as keyof TablesUpdate<'tasks'>)) {
            (payload as any)[key] = (updates as any)[key];
        }
    }
    
    if (payload.subtasks) {
        payload.subtasks = payload.subtasks as Json;
    }

    const { data, error } = await supabase.from('tasks').update(payload).eq('id', taskId).select().single();
    
    if (error) {
        console.error("Supabase error during task update:", error);
        throw error;
    }
    if (!data) throw new Error("Task update failed.");
    
    const task = data as Task;
    return { ...task, subtasks: task.subtasks as TaskSubtask[] | null } as Task;
}

export async function deleteTask(taskId: string): Promise<void> {
    const { error } = await supabase.from('tasks').delete().eq('id', taskId);
    if (error) throw error;
}

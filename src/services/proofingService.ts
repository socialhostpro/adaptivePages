

import { supabase } from './supabase';
import type { ProofingRequest, ProofingComment, ProofingStatus, ProofingEntityType, ProofingVersion } from '../types';
import type { Tables, TablesInsert, TablesUpdate, Json, PublicEnumProofingStatus } from '../database.types';

type ProofingRequestRow = Tables<'proofing_requests'>;
type CommentRow = Tables<'proofing_comments'>;
type ContactRow = Tables<'contacts'>;

const PROOFING_REQUEST_COLUMNS = 'client_id, created_at, description, id, related_entity_id, related_entity_type, status, title, user_id, versions';

const rowToProofingRequest = (row: ProofingRequestRow, commentsMap: Map<string, ProofingComment[]>, contactsMap: Map<number, string | null>): ProofingRequest => {
    
    // Gracefully handle migration from simple string array to object array for assets
    const migratedVersions = ((row.versions as any[] | null) || []).map(v => {
        if (v.assets && v.assets.length > 0 && typeof v.assets[0] === 'string') {
            return {
                ...v,
                assets: v.assets.map((url: string) => ({ url }))
            };
        }
        return v;
    });

    return {
        ...row,
        status: row.status as ProofingStatus,
        related_entity_type: row.related_entity_type as ProofingEntityType | null,
        client_name: row.client_id ? contactsMap.get(row.client_id) || 'N/A' : 'N/A',
        versions: (migratedVersions as ProofingVersion[]) || [],
        comments: commentsMap.get(row.id) || [],
    };
};


export async function getProofingRequests(userId: string): Promise<ProofingRequest[]> {
    const { data: requests, error } = await supabase
        .from('proofing_requests')
        .select(PROOFING_REQUEST_COLUMNS)
        .eq('user_id', userId)
        .order('created_at', { ascending: false });
    
    if (error) {
        console.error("Error fetching proofing requests:", error);
        throw error;
    }
    if (!requests || requests.length === 0) return [];
    
    const requestRows = requests as ProofingRequestRow[];
    const requestIds = requestRows.map(r => r.id);
    const clientIds = [...new Set(requestRows.map(r => r.client_id).filter(Boolean))] as number[];

    const { data: comments, error: commentsError } = await supabase.from('proofing_comments').select('*').in('proofing_request_id', requestIds).order('created_at', { ascending: true });
    const { data: contacts, error: contactsError } = await supabase.from('contacts').select('*').in('id', clientIds);

    if (commentsError) throw commentsError;
    if (contactsError) throw contactsError;
    
    const commentsMap = new Map<string, ProofingComment[]>();
    ((comments as any) || []).forEach((c: any) => {
        const commentRow = c as CommentRow;
        if (!commentsMap.has(commentRow.proofing_request_id)) {
            commentsMap.set(commentRow.proofing_request_id, []);
        }
        commentsMap.get(commentRow.proofing_request_id)!.push({ ...commentRow, metadata: commentRow.metadata as any });
    });

    const contactsMap = new Map<number, string | null>();
    ((contacts as unknown as ContactRow[]) || []).forEach(c => {
        contactsMap.set(c.id, c.name || 'Unknown Contact');
    });

    return requestRows.map(row => rowToProofingRequest(row, commentsMap, contactsMap));
}

export async function createProofingRequest(userId: string, requestData: Partial<Omit<ProofingRequest, 'id' | 'user_id' | 'created_at'>>): Promise<ProofingRequest> {
    const payload: TablesInsert<'proofing_requests'> = {
        user_id: userId,
        title: requestData.title!,
        description: requestData.description,
        status: requestData.status || 'Out for Proof',
        client_id: requestData.client_id,
        related_entity_type: requestData.related_entity_type,
        related_entity_id: requestData.related_entity_id,
        versions: requestData.versions as unknown as Json,
    };

    const { data, error } = await supabase
        .from('proofing_requests')
        .insert(payload as any)
        .select(PROOFING_REQUEST_COLUMNS)
        .single();
    
    if (error) {
        console.error("Error creating proofing request:", error);
        throw error;
    }
    if (!data) throw new Error("Proofing request creation failed.");

    return rowToProofingRequest(data as unknown as ProofingRequestRow, new Map(), new Map()); // Comments and contacts won't be available immediately without extra fetches
}

export async function updateProofingRequest(requestId: string, updates: Partial<ProofingRequest>): Promise<ProofingRequest> {
    const { client_name, comments, ...rest } = updates;
    const payload: TablesUpdate<'proofing_requests'> = {
        ...rest,
        versions: updates.versions as unknown as Json,
    };
    
    const { data, error } = await supabase
        .from('proofing_requests')
        .update(payload as any)
        .eq('id', requestId)
        .select(PROOFING_REQUEST_COLUMNS)
        .single();
        
    if (error) {
        console.error("Error updating proofing request:", error);
        throw error;
    }
    if (!data) throw new Error("Proofing request update failed.");
    
    return rowToProofingRequest(data as unknown as ProofingRequestRow, new Map(), new Map());
}

export async function addComment(requestId: string, userId: string | null, authorName: string, commentText: string, metadata?: any): Promise<ProofingComment> {
    const payload: TablesInsert<'proofing_comments'> = {
        proofing_request_id: requestId,
        user_id: userId,
        author_name: authorName,
        comment_text: commentText,
        metadata: metadata as Json,
    };

    const { data, error } = await supabase
        .from('proofing_comments')
        .insert(payload as any)
        .select()
        .single();

    if (error) {
        console.error("Error adding comment:", error);
        throw error;
    }
    if (!data) throw new Error("Comment creation failed.");

    const comment = data as unknown as CommentRow;
    return {
        ...comment,
        metadata: comment.metadata as any
    };
}

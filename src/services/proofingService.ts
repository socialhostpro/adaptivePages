

import { supabase } from '../../services/supabase';
import type { ProofingRequest, ProofingComment, ProofingStatus, ProofingEntityType, ProofingVersion } from '../types';
import type { Tables, TablesInsert, TablesUpdate, Json, PublicEnumProofingStatus } from '../types/database.types';

type ProofingRequestRow = Tables<'proofing_requests'>;
type CommentRow = Tables<'proofing_comments'>;
type ContactRow = Tables<'contacts'>;

const PROOFING_REQUEST_COLUMNS = 'client_id, created_at, description, id, related_entity_id, related_entity_type, status, title, user_id, versions';

// Type-safe converter functions
function convertDbProofingCommentToProofingComment(dbComment: CommentRow): ProofingComment {
    return {
        id: dbComment.id,
        created_at: dbComment.created_at,
        proofing_request_id: dbComment.proofing_request_id,
        user_id: dbComment.user_id,
        author_name: dbComment.author_name,
        comment_text: dbComment.comment_text,
        metadata: dbComment.metadata as ProofingComment['metadata'],
    };
}

function convertJsonToProofingVersions(versionsJson: Json | null): ProofingVersion[] {
    if (!versionsJson || !Array.isArray(versionsJson)) return [];
    
    // Gracefully handle migration from simple string array to object array for assets
    return versionsJson.map(v => {
        if (v && typeof v === 'object' && 'assets' in v && Array.isArray(v.assets)) {
            if (v.assets.length > 0 && typeof v.assets[0] === 'string') {
                return {
                    ...v,
                    assets: v.assets.map((url: string) => ({ url }))
                } as unknown as ProofingVersion;
            }
            return v as unknown as ProofingVersion;
        }
        return v as unknown as ProofingVersion;
    });
}

const rowToProofingRequest = (row: ProofingRequestRow, commentsMap: Map<string, ProofingComment[]>, contactsMap: Map<number, string | null>): ProofingRequest => {
    return {
        id: row.id,
        created_at: row.created_at,
        user_id: row.user_id,
        title: row.title,
        description: row.description,
        status: row.status as ProofingStatus, // Safe cast since enum values are identical
        client_id: row.client_id,
        related_entity_type: row.related_entity_type as ProofingEntityType | null,
        related_entity_id: row.related_entity_id,
        client_name: row.client_id ? contactsMap.get(row.client_id) || 'N/A' : 'N/A',
        versions: convertJsonToProofingVersions(row.versions),
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
    
    const requestIds = requests.map(r => r.id);
    const clientIds = [...new Set(requests.map(r => r.client_id).filter(Boolean))] as number[];

    const { data: comments, error: commentsError } = await supabase.from('proofing_comments').select('*').in('proofing_request_id', requestIds).order('created_at', { ascending: true });
    const { data: contacts, error: contactsError } = await supabase.from('contacts').select('*').in('id', clientIds);

    if (commentsError) throw commentsError;
    if (contactsError) throw contactsError;
    
    const commentsMap = new Map<string, ProofingComment[]>();
    (comments || []).forEach((comment) => {
        const proofingComment = convertDbProofingCommentToProofingComment(comment);
        if (!commentsMap.has(comment.proofing_request_id)) {
            commentsMap.set(comment.proofing_request_id, []);
        }
        commentsMap.get(comment.proofing_request_id)!.push(proofingComment);
    });

    const contactsMap = new Map<number, string | null>();
    (contacts || []).forEach(contact => {
        contactsMap.set(contact.id, contact.name || 'Unknown Contact');
    });

    return requests.map(row => rowToProofingRequest(row, commentsMap, contactsMap));
}

export async function createProofingRequest(userId: string, requestData: Partial<Omit<ProofingRequest, 'id' | 'user_id' | 'created_at'>>): Promise<ProofingRequest> {
    const payload: TablesInsert<'proofing_requests'> = {
        user_id: userId,
        title: requestData.title!,
        description: requestData.description,
        status: (requestData.status || 'Out for Proof') as PublicEnumProofingStatus,
        client_id: requestData.client_id,
        related_entity_type: requestData.related_entity_type,
        related_entity_id: requestData.related_entity_id,
        versions: (requestData.versions || []) as unknown as Json,
    };

    const { data, error } = await supabase
        .from('proofing_requests')
        .insert(payload)
        .select(PROOFING_REQUEST_COLUMNS)
        .single();
    
    if (error) {
        console.error("Error creating proofing request:", error);
        throw error;
    }
    if (!data) throw new Error("Proofing request creation failed.");

    return rowToProofingRequest(data, new Map(), new Map()); // Comments and contacts won't be available immediately without extra fetches
}

export async function updateProofingRequest(requestId: string, updates: Partial<ProofingRequest>): Promise<ProofingRequest> {
    const { client_name, comments, ...rest } = updates;
    const payload: TablesUpdate<'proofing_requests'> = {};
    
    if (rest.title !== undefined) payload.title = rest.title;
    if (rest.description !== undefined) payload.description = rest.description;
    if (rest.status !== undefined) payload.status = rest.status as PublicEnumProofingStatus;
    if (rest.client_id !== undefined) payload.client_id = rest.client_id;
    if (rest.related_entity_type !== undefined) payload.related_entity_type = rest.related_entity_type;
    if (rest.related_entity_id !== undefined) payload.related_entity_id = rest.related_entity_id;
    if (rest.versions !== undefined) payload.versions = rest.versions as unknown as Json;
    
    const { data, error } = await supabase
        .from('proofing_requests')
        .update(payload)
        .eq('id', requestId)
        .select(PROOFING_REQUEST_COLUMNS)
        .single();
        
    if (error) {
        console.error("Error updating proofing request:", error);
        throw error;
    }
    if (!data) throw new Error("Proofing request update failed.");
    
    return rowToProofingRequest(data, new Map(), new Map());
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
        .insert(payload)
        .select()
        .single();

    if (error) {
        console.error("Error adding comment:", error);
        throw error;
    }
    if (!data) throw new Error("Comment creation failed.");

    return convertDbProofingCommentToProofingComment(data);
}

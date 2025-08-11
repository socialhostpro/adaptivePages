export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type PublicEnumProofingStatus =
  | "Out for Proof"
  | "Response from Client"
  | "Approved"
  | "Disapproved"
  | "Canceled"
export type PublicEnumTaskPriority = "Low" | "Medium" | "High"
export type PublicEnumTaskStatus = "To-Do" | "In Progress" | "Done" | "On Hold"
export type PublicEnumTeamRole = "Admin" | "Member" | "Viewer"

export type Database = {
  public: {
    Tables: {
      bookings: {
        Row: {
          id: string
          created_at: string
          page_id: string
          owner_id: string
          customer_info: Json | null
          service_id: string | null
          service_name: string | null
          booking_date: string
          duration: number
          status: string
          notes: string | null
          price: number | null
          order_id: number | null
        }
        Insert: {
          id?: string
          created_at?: string
          page_id: string
          owner_id: string
          customer_info?: Json | null
          service_id?: string | null
          service_name?: string | null
          booking_date: string
          duration: number
          status?: string
          notes?: string | null
          price?: number | null
          order_id?: number | null
        }
        Update: {
          id?: string
          created_at?: string
          page_id?: string
          owner_id?: string
          customer_info?: Json | null
          service_id?: string | null
          service_name?: string | null
          booking_date?: string
          duration?: number
          status?: string
          notes?: string | null
          price?: number | null
          order_id?: number | null
        }
        Relationships: []
      }
      contacts: {
        Row: {
          created_at: string
          email: string | null
          id: number
          name: string | null
          notes: string | null
          owner_id: string
          page_id: string | null
          source: string | null
          status: string | null
        }
        Insert: {
          created_at?: string
          email?: string | null
          id?: number
          name?: string | null
          notes?: string | null
          owner_id: string
          page_id?: string | null
          source?: string | null
          status?: string | null
        }
        Update: {
          created_at?: string
          email?: string | null
          id?: number
          name?: string | null
          notes?: string | null
          owner_id?: string
          page_id?: string | null
          source?: string | null
          status?: string | null
        }
        Relationships: []
      }
      forms: {
        Row: {
          created_at: string
          fields: Json | null
          id: string
          name: string
          user_id: string
        }
        Insert: {
          created_at?: string
          fields?: Json | null
          id?: string
          name: string
          user_id: string
        }
        Update: {
          created_at?: string
          fields?: Json | null
          id?: string
          name?: string
          user_id?: string
        }
        Relationships: []
      }
      lesson_views: {
        Row: {
          created_at: string
          id: number
          lesson_id: string
          lesson_title: string | null
          page_id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: number
          lesson_id: string
          lesson_title?: string | null
          page_id: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: number
          lesson_id?: string
          lesson_title?: string | null
          page_id?: string
          user_id?: string
        }
        Relationships: []
      }
      media_files: {
        Row: {
          created_at: string
          description: string | null
          file_path: string
          id: string
          keywords: string[] | null
          name: string
          url: string
          user_id: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          file_path: string
          id?: string
          keywords?: string[] | null
          name: string
          url: string
          user_id: string
        }
        Update: {
          created_at?: string
          description?: string | null
          file_path?: string
          id?: string
          keywords?: string[] | null
          name?: string
          url?: string
          user_id?: string
        }
        Relationships: []
      }
      onboarding_submissions: {
        Row: {
          created_at: string
          data: Json
          id: number
          owner_id: string
          wizard_id: string
        }
        Insert: {
          created_at?: string
          data: Json
          id?: number
          owner_id: string
          wizard_id: string
        }
        Update: {
          created_at?: string
          data?: Json
          id?: number
          owner_id?: string
          wizard_id?: string
        }
        Relationships: []
      }
      onboarding_wizards: {
        Row: {
          created_at: string
          id: string
          name: string
          steps: Json
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          name: string
          steps: Json
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          name?: string
          steps?: Json
          user_id?: string
        }
        Relationships: []
      }
      orders: {
        Row: {
          created_at: string
          data: Json | null
          id: number
          owner_id: string
          page_id: string
        }
        Insert: {
          created_at?: string
          data?: Json | null
          id?: number
          owner_id: string
          page_id: string
        }
        Update: {
          created_at?: string
          data?: Json | null
          id?: number
          owner_id?: string
          page_id?: string
        }
        Relationships: []
      }
      page_groups: {
        Row: {
          created_at: string
          id: string
          name: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          name: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          name?: string
          user_id?: string
        }
        Relationships: []
      }
      pages: {
        Row: {
          body_scripts: string | null
          booking_settings: Json | null
          cart_settings: Json | null
          created_at: string
          custom_domain: string | null
          data: Json | null
          generation_config: Json | null
          group_id: string | null
          head_scripts: string | null
          id: string
          images: Json | null
          is_published: boolean
          name: string
          owner_contact_id: number | null
          published_data: Json | null
          published_images: Json | null
          slug: string | null
          staff_portal_enabled: boolean | null
          stripe_settings: Json | null
          thumbnail_url: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          body_scripts?: string | null
          booking_settings?: Json | null
          cart_settings?: Json | null
          created_at?: string
          custom_domain?: string | null
          data?: Json | null
          generation_config?: Json | null
          group_id?: string | null
          head_scripts?: string | null
          id?: string
          images?: Json | null
          is_published?: boolean
          name: string
          owner_contact_id?: number | null
          published_data?: Json | null
          published_images?: Json | null
          slug?: string | null
          staff_portal_enabled?: boolean | null
          stripe_settings?: Json | null
          thumbnail_url?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          body_scripts?: string | null
          booking_settings?: Json | null
          cart_settings?: Json | null
          created_at?: string
          custom_domain?: string | null
          data?: Json | null
          generation_config?: Json | null
          group_id?: string | null
          head_scripts?: string | null
          id?: string
          images?: Json | null
          is_published?: boolean
          name?: string
          owner_contact_id?: number | null
          published_data?: Json | null
          published_images?: Json | null
          slug?: string | null
          staff_portal_enabled?: boolean | null
          stripe_settings?: Json | null
          thumbnail_url?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      portals: {
        Row: {
          created_at: string
          id: string
          name: string
          page_id: string | null
          settings: Json | null
          type: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          name: string
          page_id?: string | null
          settings?: Json | null
          type: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          name?: string
          page_id?: string | null
          settings?: Json | null
          type?: string
          user_id?: string
        }
        Relationships: []
      }
      product_categories: {
        Row: {
          created_at: string
          id: string
          name: string
          parent_id: string | null
          position: number
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          name: string
          parent_id?: string | null
          position?: number
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          name?: string
          parent_id?: string | null
          position?: number
          user_id?: string
        }
        Relationships: []
      }
      products: {
        Row: {
          category_id: string | null
          created_at: string
          description: string | null
          featured_image_url: string | null
          fulfillment_type: string
          gallery_images: Json | null
          id: string
          name: string
          options: Json | null
          price: number
          status: string
          user_id: string
        }
        Insert: {
          category_id?: string | null
          created_at?: string
          description?: string | null
          featured_image_url?: string | null
          fulfillment_type: string
          gallery_images?: Json | null
          id?: string
          name: string
          options?: Json | null
          price?: number
          status?: string
          user_id: string
        }
        Update: {
          category_id?: string | null
          created_at?: string
          description?: string | null
          featured_image_url?: string | null
          fulfillment_type?: string
          gallery_images?: Json | null
          id?: string
          name?: string
          options?: Json | null
          price?: number
          status?: string
          user_id?: string
        }
        Relationships: []
      }
      proofing_comments: {
        Row: {
          author_name: string
          comment_text: string
          created_at: string
          id: number
          metadata: Json | null
          proofing_request_id: string
          user_id: string | null
        }
        Insert: {
          author_name: string
          comment_text: string
          created_at?: string
          id?: number
          metadata?: Json | null
          proofing_request_id: string
          user_id?: string | null
        }
        Update: {
          author_name?: string
          comment_text?: string
          created_at?: string
          id?: number
          metadata?: Json | null
          proofing_request_id?: string
          user_id?: string | null
        }
        Relationships: []
      }
      proofing_requests: {
        Row: {
          client_id: number | null
          created_at: string
          description: string | null
          id: string
          related_entity_id: string | null
          related_entity_type: string | null
          status: PublicEnumProofingStatus
          title: string
          user_id: string
          versions: Json | null
        }
        Insert: {
          client_id?: number | null
          created_at?: string
          description?: string | null
          id?: string
          related_entity_id?: string | null
          related_entity_type?: string | null
          status?: PublicEnumProofingStatus
          title: string
          user_id: string
          versions?: Json | null
        }
        Update: {
          client_id?: number | null
          created_at?: string
          description?: string | null
          id?: string
          related_entity_id?: string | null
          related_entity_type?: string | null
          status?: PublicEnumProofingStatus
          title?: string
          user_id?: string
          versions?: Json | null
        }
        Relationships: []
      }
      quiz_attempts: {
        Row: {
          chapter_id: string
          created_at: string
          id: number
          page_id: string
          passed: boolean
          quiz_title: string | null
          score: number
          total_questions: number
          user_id: string
        }
        Insert: {
          chapter_id: string
          created_at?: string
          id?: number
          page_id: string
          passed: boolean
          quiz_title?: string | null
          score: number
          total_questions: number
          user_id: string
        }
        Update: {
          chapter_id?: string
          created_at?: string
          id?: number
          page_id?: string
          passed?: boolean
          quiz_title?: string | null
          score?: number
          total_questions?: number
          user_id?: string
        }
        Relationships: []
      }
      seo_reports: {
        Row: {
          created_at: string
          id: string
          page_id: string
          report_data: Json
          score: number
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          page_id: string
          report_data: Json
          score: number
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          page_id?: string
          report_data?: Json
          score?: number
          user_id?: string
        }
        Relationships: []
      }
      site_components: {
        Row: {
          created_at: string
          data: Json
          id: string
          keywords: string[] | null
          name: string
          section_type: string
          tags: string[] | null
          user_id: string
        }
        Insert: {
          created_at?: string
          data: Json
          id?: string
          keywords?: string[] | null
          name: string
          section_type: string
          tags?: string[] | null
          user_id: string
        }
        Update: {
          created_at?: string
          data?: Json
          id?: string
          keywords?: string[] | null
          name?: string
          section_type?: string
          tags?: string[] | null
          user_id?: string
        }
        Relationships: []
      }
      tasks: {
        Row: {
          assigned_to: string | null
          booking_id: string | null
          contact_id: number | null
          created_at: string
          description: string | null
          due_date: string | null
          id: string
          is_prompt_mode: boolean | null
          order_id: number | null
          page_group_id: string | null
          page_id: string | null
          priority: PublicEnumTaskPriority
          product_id: string | null
          proofing_request_id: string | null
          prompt: string | null
          seo_report_id: string | null
          status: PublicEnumTaskStatus
          subtasks: Json | null
          title: string
          updated_at: string
          user_id: string
        }
        Insert: {
          assigned_to?: string | null
          booking_id?: string | null
          contact_id?: number | null
          created_at?: string
          description?: string | null
          due_date?: string | null
          id?: string
          is_prompt_mode?: boolean | null
          order_id?: number | null
          page_group_id?: string | null
          page_id?: string | null
          priority?: PublicEnumTaskPriority
          product_id?: string | null
          proofing_request_id?: string | null
          prompt?: string | null
          seo_report_id?: string | null
          status?: PublicEnumTaskStatus
          subtasks?: Json | null
          title: string
          updated_at?: string
          user_id: string
        }
        Update: {
          assigned_to?: string | null
          booking_id?: string | null
          contact_id?: number | null
          created_at?: string
          description?: string | null
          due_date?: string | null
          id?: string
          is_prompt_mode?: boolean | null
          order_id?: number | null
          page_group_id?: string | null
          page_id?: string | null
          priority?: PublicEnumTaskPriority
          product_id?: string | null
          proofing_request_id?: string | null
          prompt?: string | null
          seo_report_id?: string | null
          status?: PublicEnumTaskStatus
          subtasks?: Json | null
          title?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      team_members: {
        Row: {
          created_at: string
          email: string
          id: string
          name: string
          role: PublicEnumTeamRole
          user_id: string
        }
        Insert: {
          created_at?: string
          email: string
          id?: string
          name: string
          role?: PublicEnumTeamRole
          user_id: string
        }
        Update: {
          created_at?: string
          email?: string
          id?: string
          name?: string
          role?: PublicEnumTeamRole
          user_id?: string
        }
        Relationships: []
      }
      user_profiles: {
        Row: {
          default_custom_domain: string | null
          elevenlabs_api_key: string | null
          elevenlabs_webhook_url: string | null
          google_api_key: string | null
          google_build_config: Json | null
          id: string
          sendgrid_api_key: string | null
          sendgrid_from_email: string | null
          twilio_account_sid: string | null
          twilio_auth_token: string | null
          twilio_from_number: string | null
          updated_at: string | null
        }
        Insert: {
          default_custom_domain?: string | null
          elevenlabs_api_key?: string | null
          elevenlabs_webhook_url?: string | null
          google_api_key?: string | null
          google_build_config?: Json | null
          id: string
          sendgrid_api_key?: string | null
          sendgrid_from_email?: string | null
          twilio_account_sid?: string | null
          twilio_auth_token?: string | null
          twilio_from_number?: string | null
          updated_at?: string | null
        }
        Update: {
          default_custom_domain?: string | null
          elevenlabs_api_key?: string | null
          elevenlabs_webhook_url?: string | null
          google_api_key?: string | null
          google_build_config?: Json | null
          id?: string
          sendgrid_api_key?: string | null
          sendgrid_from_email?: string | null
          twilio_account_sid?: string | null
          twilio_auth_token?: string | null
          twilio_from_number?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      proofing_status: PublicEnumProofingStatus
      task_priority: PublicEnumTaskPriority
      task_status: PublicEnumTaskStatus
      team_role: PublicEnumTeamRole
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

export type Tables<T extends keyof Database["public"]["Tables"]> =
  Database["public"]["Tables"][T]["Row"]
export type TablesInsert<T extends keyof Database["public"]["Tables"]> =
  Database["public"]["Tables"][T]["Insert"]
export type TablesUpdate<T extends keyof Database["public"]["Tables"]> =
  Database["public"]["Tables"][T]["Update"]
export type Enums<T extends keyof Database["public"]["Enums"]> =
  Database["public"]["Enums"][T]

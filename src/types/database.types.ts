
export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[]

export type Database = {
  
  "graphql_public": {
          Tables: {
            [_ in never]: never
          }
          Views: {
            [_ in never]: never
          }
          Functions: {
            "graphql":
{ Args: { "extensions"?: Json,"operationName"?: string,"query"?: string,"variables"?: Json }; Returns: Json
                           }
          }
          Enums: {
            [_ in never]: never
          }
          CompositeTypes: {
            [_ in never]: never
          }
        },"public": {
          Tables: {
            "access_requests": {
                  Row: {
                    "created_at": string,"id": string,"invited_family_name": string,"message": string | null,"profile_id": string,"rejection_reason": string | null,"relationship_to_couple": string,"reviewed_at": string | null,"reviewed_by": string | null,"status": string,"updated_at": string
                  }
                  ComputedFields: never
                  Insert: {
                    "created_at"?: string,"id"?: string,"invited_family_name": string,"message"?: string | null,"profile_id": string,"rejection_reason"?: string | null,"relationship_to_couple": string,"reviewed_at"?: string | null,"reviewed_by"?: string | null,"status"?: string,"updated_at"?: string
                  }
                  Update: {
                    "created_at"?: string,"id"?: string,"invited_family_name"?: string,"message"?: string | null,"profile_id"?: string,"rejection_reason"?: string | null,"relationship_to_couple"?: string,"reviewed_at"?: string | null,"reviewed_by"?: string | null,"status"?: string,"updated_at"?: string
                  }
                  Relationships: [
                    {
      foreignKeyName: "access_requests_profile_id_fkey"
      columns: ["profile_id"]
isOneToOne: false
      referencedRelation: "profiles"
      referencedColumns: ["id"]
    },{
      foreignKeyName: "access_requests_reviewed_by_fkey"
      columns: ["reviewed_by"]
isOneToOne: false
      referencedRelation: "profiles"
      referencedColumns: ["id"]
    }
                  ]
                },"admin_notifications": {
                  Row: {
                    "created_at": string,"id": string,"is_read": boolean,"message": string,"permission_group": string,"related_entity_id": string | null,"title": string
                  }
                  ComputedFields: never
                  Insert: {
                    "created_at"?: string,"id"?: string,"is_read"?: boolean,"message": string,"permission_group": string,"related_entity_id"?: string | null,"title": string
                  }
                  Update: {
                    "created_at"?: string,"id"?: string,"is_read"?: boolean,"message"?: string,"permission_group"?: string,"related_entity_id"?: string | null,"title"?: string
                  }
                  Relationships: [
                    
                  ]
                },"admin_permissions": {
                  Row: {
                    "admin_id": string,"created_at": string,"id": string,"permission_group": string
                  }
                  ComputedFields: never
                  Insert: {
                    "admin_id": string,"created_at"?: string,"id"?: string,"permission_group": string
                  }
                  Update: {
                    "admin_id"?: string,"created_at"?: string,"id"?: string,"permission_group"?: string
                  }
                  Relationships: [
                    {
      foreignKeyName: "admin_permissions_admin_id_fkey"
      columns: ["admin_id"]
isOneToOne: false
      referencedRelation: "admin_users"
      referencedColumns: ["id"]
    }
                  ]
                },"admin_users": {
                  Row: {
                    "created_at": string,"id": string,"is_active": boolean,"is_super_admin": boolean,"updated_at": string
                  }
                  ComputedFields: never
                  Insert: {
                    "created_at"?: string,"id": string,"is_active"?: boolean,"is_super_admin"?: boolean,"updated_at"?: string
                  }
                  Update: {
                    "created_at"?: string,"id"?: string,"is_active"?: boolean,"is_super_admin"?: boolean,"updated_at"?: string
                  }
                  Relationships: [
                    {
      foreignKeyName: "admin_users_id_fkey"
      columns: ["id"]
isOneToOne: true
      referencedRelation: "profiles"
      referencedColumns: ["id"]
    }
                  ]
                },"attendees": {
                  Row: {
                    "age_category": string | null,"created_at": string,"family_member_id": string | null,"full_name": string,"id": string,"rsvp_id": string,"updated_at": string
                  }
                  ComputedFields: never
                  Insert: {
                    "age_category"?: string | null,"created_at"?: string,"family_member_id"?: string | null,"full_name": string,"id"?: string,"rsvp_id": string,"updated_at"?: string
                  }
                  Update: {
                    "age_category"?: string | null,"created_at"?: string,"family_member_id"?: string | null,"full_name"?: string,"id"?: string,"rsvp_id"?: string,"updated_at"?: string
                  }
                  Relationships: [
                    {
      foreignKeyName: "attendees_family_member_id_fkey"
      columns: ["family_member_id"]
isOneToOne: false
      referencedRelation: "family_members"
      referencedColumns: ["id"]
    },{
      foreignKeyName: "attendees_rsvp_id_fkey"
      columns: ["rsvp_id"]
isOneToOne: false
      referencedRelation: "rsvps"
      referencedColumns: ["id"]
    }
                  ]
                },"conversation_messages": {
                  Row: {
                    "conversation_id": string,"created_at": string,"id": string,"is_from_admin": boolean,"message_body": string,"read_at": string | null,"sender_id": string
                  }
                  ComputedFields: never
                  Insert: {
                    "conversation_id": string,"created_at"?: string,"id"?: string,"is_from_admin"?: boolean,"message_body": string,"read_at"?: string | null,"sender_id": string
                  }
                  Update: {
                    "conversation_id"?: string,"created_at"?: string,"id"?: string,"is_from_admin"?: boolean,"message_body"?: string,"read_at"?: string | null,"sender_id"?: string
                  }
                  Relationships: [
                    {
      foreignKeyName: "conversation_messages_conversation_id_fkey"
      columns: ["conversation_id"]
isOneToOne: false
      referencedRelation: "conversations"
      referencedColumns: ["id"]
    },{
      foreignKeyName: "conversation_messages_sender_id_fkey"
      columns: ["sender_id"]
isOneToOne: false
      referencedRelation: "profiles"
      referencedColumns: ["id"]
    }
                  ]
                },"conversations": {
                  Row: {
                    "created_at": string,"id": string,"profile_id": string,"status": string,"updated_at": string
                  }
                  ComputedFields: never
                  Insert: {
                    "created_at"?: string,"id"?: string,"profile_id": string,"status"?: string,"updated_at"?: string
                  }
                  Update: {
                    "created_at"?: string,"id"?: string,"profile_id"?: string,"status"?: string,"updated_at"?: string
                  }
                  Relationships: [
                    {
      foreignKeyName: "conversations_profile_id_fkey"
      columns: ["profile_id"]
isOneToOne: true
      referencedRelation: "profiles"
      referencedColumns: ["id"]
    }
                  ]
                },"events": {
                  Row: {
                    "ceremony_date": string,"created_at": string,"display_order": number,"end_instant": string | null,"google_maps_url": string,"id": string,"is_published": boolean,"rsvp_deadline_utc": string,"slug": string,"start_instant": string,"start_time_ist": string,"tagline": string | null,"title": string,"traditional_title": string | null,"updated_at": string,"venue_address": string,"venue_name": string
                  }
                  ComputedFields: never
                  Insert: {
                    "ceremony_date": string,"created_at"?: string,"display_order"?: number,"end_instant"?: string | null,"google_maps_url": string,"id": string,"is_published"?: boolean,"rsvp_deadline_utc": string,"slug": string,"start_instant": string,"start_time_ist": string,"tagline"?: string | null,"title": string,"traditional_title"?: string | null,"updated_at"?: string,"venue_address": string,"venue_name": string
                  }
                  Update: {
                    "ceremony_date"?: string,"created_at"?: string,"display_order"?: number,"end_instant"?: string | null,"google_maps_url"?: string,"id"?: string,"is_published"?: boolean,"rsvp_deadline_utc"?: string,"slug"?: string,"start_instant"?: string,"start_time_ist"?: string,"tagline"?: string | null,"title"?: string,"traditional_title"?: string | null,"updated_at"?: string,"venue_address"?: string,"venue_name"?: string
                  }
                  Relationships: [
                    
                  ]
                },"family_groups": {
                  Row: {
                    "created_at": string,"created_by": string | null,"id": string,"name": string,"notes": string | null,"updated_at": string
                  }
                  ComputedFields: never
                  Insert: {
                    "created_at"?: string,"created_by"?: string | null,"id"?: string,"name": string,"notes"?: string | null,"updated_at"?: string
                  }
                  Update: {
                    "created_at"?: string,"created_by"?: string | null,"id"?: string,"name"?: string,"notes"?: string | null,"updated_at"?: string
                  }
                  Relationships: [
                    {
      foreignKeyName: "family_groups_created_by_fkey"
      columns: ["created_by"]
isOneToOne: false
      referencedRelation: "profiles"
      referencedColumns: ["id"]
    }
                  ]
                },"family_managers": {
                  Row: {
                    "assigned_at": string,"assigned_by": string | null,"created_at": string,"family_group_id": string,"id": string,"is_active": boolean,"profile_id": string,"revoked_at": string | null
                  }
                  ComputedFields: never
                  Insert: {
                    "assigned_at"?: string,"assigned_by"?: string | null,"created_at"?: string,"family_group_id": string,"id"?: string,"is_active"?: boolean,"profile_id": string,"revoked_at"?: string | null
                  }
                  Update: {
                    "assigned_at"?: string,"assigned_by"?: string | null,"created_at"?: string,"family_group_id"?: string,"id"?: string,"is_active"?: boolean,"profile_id"?: string,"revoked_at"?: string | null
                  }
                  Relationships: [
                    {
      foreignKeyName: "family_managers_assigned_by_fkey"
      columns: ["assigned_by"]
isOneToOne: false
      referencedRelation: "profiles"
      referencedColumns: ["id"]
    },{
      foreignKeyName: "family_managers_family_group_id_fkey"
      columns: ["family_group_id"]
isOneToOne: false
      referencedRelation: "family_groups"
      referencedColumns: ["id"]
    },{
      foreignKeyName: "family_managers_profile_id_fkey"
      columns: ["profile_id"]
isOneToOne: false
      referencedRelation: "profiles"
      referencedColumns: ["id"]
    }
                  ]
                },"family_members": {
                  Row: {
                    "created_at": string,"family_group_id": string,"id": string,"name": string,"updated_at": string
                  }
                  ComputedFields: never
                  Insert: {
                    "created_at"?: string,"family_group_id": string,"id"?: string,"name": string,"updated_at"?: string
                  }
                  Update: {
                    "created_at"?: string,"family_group_id"?: string,"id"?: string,"name"?: string,"updated_at"?: string
                  }
                  Relationships: [
                    {
      foreignKeyName: "family_members_family_group_id_fkey"
      columns: ["family_group_id"]
isOneToOne: false
      referencedRelation: "family_groups"
      referencedColumns: ["id"]
    }
                  ]
                },"invitation_settings": {
                  Row: {
                    "created_at": string,"custom_announcement": string | null,"default_template": string,"headline_text": string,"id": string,"intro_text": string,"is_published": boolean,"qr_code_target_url": string,"updated_at": string
                  }
                  ComputedFields: never
                  Insert: {
                    "created_at"?: string,"custom_announcement"?: string | null,"default_template"?: string,"headline_text": string,"id"?: string,"intro_text": string,"is_published"?: boolean,"qr_code_target_url": string,"updated_at"?: string
                  }
                  Update: {
                    "created_at"?: string,"custom_announcement"?: string | null,"default_template"?: string,"headline_text"?: string,"id"?: string,"intro_text"?: string,"is_published"?: boolean,"qr_code_target_url"?: string,"updated_at"?: string
                  }
                  Relationships: [
                    
                  ]
                },"media_items": {
                  Row: {
                    "caption": string | null,"category": string,"created_at": string,"display_order": number,"download_enabled": boolean,"file_name": string | null,"file_size_bytes": number | null,"height": number | null,"id": string,"is_featured": boolean,"is_published": boolean,"media_type": string,"mime_type": string | null,"storage_path": string | null,"thumbnail_path": string | null,"updated_at": string,"uploaded_by": string,"width": number | null,"youtube_url": string | null
                  }
                  ComputedFields: never
                  Insert: {
                    "caption"?: string | null,"category"?: string,"created_at"?: string,"display_order"?: number,"download_enabled"?: boolean,"file_name"?: string | null,"file_size_bytes"?: number | null,"height"?: number | null,"id"?: string,"is_featured"?: boolean,"is_published"?: boolean,"media_type": string,"mime_type"?: string | null,"storage_path"?: string | null,"thumbnail_path"?: string | null,"updated_at"?: string,"uploaded_by": string,"width"?: number | null,"youtube_url"?: string | null
                  }
                  Update: {
                    "caption"?: string | null,"category"?: string,"created_at"?: string,"display_order"?: number,"download_enabled"?: boolean,"file_name"?: string | null,"file_size_bytes"?: number | null,"height"?: number | null,"id"?: string,"is_featured"?: boolean,"is_published"?: boolean,"media_type"?: string,"mime_type"?: string | null,"storage_path"?: string | null,"thumbnail_path"?: string | null,"updated_at"?: string,"uploaded_by"?: string,"width"?: number | null,"youtube_url"?: string | null
                  }
                  Relationships: [
                    {
      foreignKeyName: "media_items_uploaded_by_fkey"
      columns: ["uploaded_by"]
isOneToOne: false
      referencedRelation: "profiles"
      referencedColumns: ["id"]
    }
                  ]
                },"profiles": {
                  Row: {
                    "avatar_url": string | null,"created_at": string,"email": string,"family_group_id": string | null,"full_name": string,"id": string,"is_approved_guest": boolean,"mobile_number": string | null,"updated_at": string
                  }
                  ComputedFields: never
                  Insert: {
                    "avatar_url"?: string | null,"created_at"?: string,"email": string,"family_group_id"?: string | null,"full_name": string,"id": string,"is_approved_guest"?: boolean,"mobile_number"?: string | null,"updated_at"?: string
                  }
                  Update: {
                    "avatar_url"?: string | null,"created_at"?: string,"email"?: string,"family_group_id"?: string | null,"full_name"?: string,"id"?: string,"is_approved_guest"?: boolean,"mobile_number"?: string | null,"updated_at"?: string
                  }
                  Relationships: [
                    {
      foreignKeyName: "fk_profiles_family_group"
      columns: ["family_group_id"]
isOneToOne: false
      referencedRelation: "family_groups"
      referencedColumns: ["id"]
    }
                  ]
                },"public_rsvps": {
                  Row: {
                    "id": string,
                    "guest_name": string,
                    "mobile_number": string | null,
                    "address": string | null,
                    "relationship": string | null,
                    "guest_count": number,
                    "attending_haldi": boolean,
                    "attending_mehndi": boolean,
                    "attending_wedding": boolean,
                    "attending_reception": boolean,
                    "status": string,
                    "notes": string | null,
                    "created_at": string,
                    "updated_at": string
                  }
                  ComputedFields: never
                  Insert: {
                    "id"?: string,
                    "guest_name": string,
                    "mobile_number"?: string | null,
                    "address"?: string | null,
                    "relationship"?: string | null,
                    "guest_count"?: number,
                    "attending_haldi"?: boolean,
                    "attending_mehndi"?: boolean,
                    "attending_wedding"?: boolean,
                    "attending_reception"?: boolean,
                    "status"?: string,
                    "notes"?: string | null,
                    "created_at"?: string,
                    "updated_at"?: string
                  }
                  Update: {
                    "id"?: string,
                    "guest_name"?: string,
                    "mobile_number"?: string | null,
                    "address"?: string | null,
                    "relationship"?: string | null,
                    "guest_count"?: number,
                    "attending_haldi"?: boolean,
                    "attending_mehndi"?: boolean,
                    "attending_wedding"?: boolean,
                    "attending_reception"?: boolean,
                    "status"?: string,
                    "notes"?: string | null,
                    "created_at"?: string,
                    "updated_at"?: string
                  }
                  Relationships: []
                },"rsvps": {
                  Row: {
                    "arrival_details": string | null,"event_id": string,"family_group_id": string,"id": string,"special_dietary_requests": string | null,"status": string,"submitted_at": string,"submitted_by": string,"updated_at": string
                  }
                  ComputedFields: never
                  Insert: {
                    "arrival_details"?: string | null,"event_id": string,"family_group_id": string,"id"?: string,"special_dietary_requests"?: string | null,"status": string,"submitted_at"?: string,"submitted_by": string,"updated_at"?: string
                  }
                  Update: {
                    "arrival_details"?: string | null,"event_id"?: string,"family_group_id"?: string,"id"?: string,"special_dietary_requests"?: string | null,"status"?: string,"submitted_at"?: string,"submitted_by"?: string,"updated_at"?: string
                  }
                  Relationships: [
                    {
      foreignKeyName: "rsvps_event_id_fkey"
      columns: ["event_id"]
isOneToOne: false
      referencedRelation: "events"
      referencedColumns: ["id"]
    },{
      foreignKeyName: "rsvps_family_group_id_fkey"
      columns: ["family_group_id"]
isOneToOne: false
      referencedRelation: "family_groups"
      referencedColumns: ["id"]
    },{
      foreignKeyName: "rsvps_submitted_by_fkey"
      columns: ["submitted_by"]
isOneToOne: false
      referencedRelation: "profiles"
      referencedColumns: ["id"]
    }
                  ]
                },"wishes": {
                  Row: {
                    "author_display_name": string,"created_at": string,"id": string,"moderated_at": string | null,"moderated_by": string | null,"profile_id": string | null,"status": string,"updated_at": string,"wish_text": string
                  }
                  ComputedFields: never
                  Insert: {
                    "author_display_name": string,"created_at"?: string,"id"?: string,"moderated_at"?: string | null,"moderated_by"?: string | null,"profile_id"?: string | null,"status"?: string,"updated_at"?: string,"wish_text": string
                  }
                  Update: {
                    "author_display_name"?: string,"created_at"?: string,"id"?: string,"moderated_at"?: string | null,"moderated_by"?: string | null,"profile_id"?: string | null,"status"?: string,"updated_at"?: string,"wish_text"?: string
                  }
                  Relationships: [
                    {
      foreignKeyName: "wishes_moderated_by_fkey"
      columns: ["moderated_by"]
isOneToOne: false
      referencedRelation: "profiles"
      referencedColumns: ["id"]
    },{
      foreignKeyName: "wishes_profile_id_fkey"
      columns: ["profile_id"]
isOneToOne: false
      referencedRelation: "profiles"
      referencedColumns: ["id"]
    }
                  ]
                }
          }
          Views: {
            "approved_wishes": {
                  Row: {
                    "author_display_name": string,"created_at": string,"id": string,"wish_text": string
                  }
                  ComputedFields: never
                  Insert: {
                           "author_display_name"?: string | null,"created_at"?: string | null,"id"?: string | null,"wish_text"?: string | null
                         }
                        Update: {
                           "author_display_name"?: string | null,"created_at"?: string | null,"id"?: string | null,"wish_text"?: string | null
                         }
                        Relationships: [
                    
                  ]
                }
          }
          Functions: {
            "admin_create_media_item":
{ Args: { "p_caption"?: string,"p_category"?: string,"p_display_order"?: number,"p_download_enabled"?: boolean,"p_file_name"?: string,"p_file_size_bytes"?: number,"p_height"?: number,"p_is_published"?: boolean,"p_media_type": string,"p_mime_type"?: string,"p_storage_path"?: string,"p_thumbnail_path"?: string,"p_width"?: number,"p_youtube_url"?: string }; Returns: Json
                           },
"admin_delete_media_item":
{ Args: { "p_media_id": string }; Returns: Json
                           },
"admin_get_all_media":
{ Args: { "p_category"?: string,"p_media_type"?: string }; Returns: Json
                           },
"admin_get_invitation_settings":
{ Args: Record<PropertyKey, never>; Returns: Json
                           },
"admin_manage_admin_user":
{ Args: { "p_admin_id": string,"p_is_active": boolean,"p_permissions": (string)[] }; Returns: Json
                           },
"admin_mark_all_notifications_read":
{ Args: Record<PropertyKey, never>; Returns: number
                           },
"admin_mark_notification_read":
{ Args: { "p_notification_id": string }; Returns: undefined
                           },
"admin_moderate_wish":
{ Args: { "p_decision": string,"p_wish_id": string }; Returns: Json
                           },
"admin_review_access_request":
{ Args: { "p_decision": string,"p_existing_family_id"?: string,"p_family_name"?: string,"p_make_family_manager"?: boolean,"p_rejection_reason"?: string,"p_request_id": string }; Returns: Json
                           },
"admin_toggle_media_download":
{ Args: { "p_media_id": string }; Returns: Json
                           },
"admin_toggle_media_featured":
{ Args: { "p_media_id": string }; Returns: Json
                           },
"admin_toggle_media_published":
{ Args: { "p_media_id": string }; Returns: Json
                           },
"admin_update_conversation_status":
{ Args: { "p_conversation_id": string,"p_status": string }; Returns: Json
                           },
"admin_update_invitation_settings":
{ Args: { "p_custom_announcement"?: string,"p_default_template": string,"p_headline_text": string,"p_intro_text": string,"p_is_published": boolean,"p_qr_code_target_url": string }; Returns: Json
                           },
"admin_update_media_item":
{ Args: { "p_caption": string,"p_category": string,"p_display_order": number,"p_download_enabled": boolean,"p_is_published": boolean,"p_media_id": string,"p_youtube_url"?: string }; Returns: Json
                           },
"get_admin_dashboard_metrics":
{ Args: Record<PropertyKey, never>; Returns: Json
                           },
"get_admin_rsvp_report":
{ Args: Record<PropertyKey, never>; Returns: Json
                           },
"get_admin_team":
{ Args: Record<PropertyKey, never>; Returns: Json
                           },
"get_approved_wishes":
{ Args: Record<PropertyKey, never>; Returns: {
              "author_display_name": string,"created_at": string,"id": string,"wish_text": string
            }[]
                           },
"get_homepage_featured_media":
{ Args: { "p_limit"?: number }; Returns: Json
                           },
"get_invitation_settings":
{ Args: Record<PropertyKey, never>; Returns: Json
                           },
"get_published_media":
{ Args: { "p_category"?: string }; Returns: Json
                           },
"get_wedding_lifecycle_state":
{ Args: Record<PropertyKey, never>; Returns: Json
                           },
"initialize_user_household":
{ Args: { "p_full_name"?: string,"p_user_id": string }; Returns: string
                           },
"submit_public_wish":
{ Args: { "p_author_name": string,"p_wish_text": string }; Returns: Json
                            },
"submit_public_rsvp":
{ Args: { "p_guest_name": string,"p_mobile"?: string | null,"p_address"?: string | null,"p_relationship"?: string | null,"p_guest_count"?: number,"p_attending_haldi"?: boolean,"p_attending_mehndi"?: boolean,"p_attending_wedding"?: boolean,"p_attending_reception"?: boolean,"p_honeypot"?: string }; Returns: Json
                            },
"get_admin_public_rsvps":
{ Args: Record<PropertyKey, never>; Returns: {
  "id": string;
  "guest_name": string;
  "mobile_number": string | null;
  "address": string | null;
  "relationship": string | null;
  "guest_count": number;
  "attending_haldi": boolean;
  "attending_mehndi": boolean;
  "attending_wedding": boolean;
  "attending_reception": boolean;
  "status": string;
  "created_at": string;
  "updated_at": string;
}[]
                            },
"get_admin_wishes":
{ Args: Record<PropertyKey, never>; Returns: Json
                            },
"get_public_wishes":
{ Args: Record<PropertyKey, never>; Returns: Json
                            },
"admin_delete_wish":
{ Args: { "p_wish_id": string }; Returns: Json
                            },"submit_family_rsvp":
{ Args: { "p_arrival_details"?: string,"p_attendees"?: Json,"p_event_id": string,"p_family_group_id": string,"p_special_dietary_requests"?: string,"p_status": string }; Returns: Json
                           }
          }
          Enums: {
            [_ in never]: never
          }
          CompositeTypes: {
            [_ in never]: never
          }
        }
}

type DatabaseWithoutInternals = Omit<Database, '__InternalSupabase'>

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never
> = DefaultSchemaTableNameOrOptions extends { schema: keyof DatabaseWithoutInternals }
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
  ? (DefaultSchema["Tables"] & DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
      Row: infer R
    }
    ? R
    : never
  : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never
> = DefaultSchemaTableNameOrOptions extends { schema: keyof DatabaseWithoutInternals }
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
  ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
      Insert: infer I
    }
    ? I
    : never
  : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never
> = DefaultSchemaTableNameOrOptions extends { schema: keyof DatabaseWithoutInternals }
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
  ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
      Update: infer U
    }
    ? U
    : never
  : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never
> = DefaultSchemaEnumNameOrOptions extends { schema: keyof DatabaseWithoutInternals }
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
  ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
  : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never
> = PublicCompositeTypeNameOrOptions extends { schema: keyof DatabaseWithoutInternals }
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
  ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
  : never

export const Constants = {
  "graphql_public": {
          Enums: {
            
          }
        },"public": {
          Enums: {
            
          }
        }
} as const

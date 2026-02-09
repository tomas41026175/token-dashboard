export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          email: string;
          display_name: string | null;
          avatar_url: string | null;
          anthropic_api_key: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          email: string;
          display_name?: string | null;
          avatar_url?: string | null;
          anthropic_api_key?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          email?: string;
          display_name?: string | null;
          avatar_url?: string | null;
          anthropic_api_key?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      sources: {
        Row: {
          id: string;
          created_at: string;
          name: string;
          description: string | null;
          color: string;
          is_active: boolean;
          metadata: Json | null;
          user_id: string | null;
        };
        Insert: {
          id?: string;
          created_at?: string;
          name: string;
          description?: string | null;
          color?: string;
          is_active?: boolean;
          metadata?: Json | null;
          user_id?: string | null;
        };
        Update: {
          id?: string;
          created_at?: string;
          name?: string;
          description?: string | null;
          color?: string;
          is_active?: boolean;
          metadata?: Json | null;
          user_id?: string | null;
        };
      };
      token_usage: {
        Row: {
          id: string;
          created_at: string;
          source_id: string;
          model: string;
          input_tokens: number;
          output_tokens: number;
          total_tokens: number;
          cost_usd: number;
          request_type: string | null;
          metadata: Json | null;
          user_id: string | null;
        };
        Insert: {
          id?: string;
          created_at?: string;
          source_id: string;
          model: string;
          input_tokens: number;
          output_tokens: number;
          total_tokens: number;
          cost_usd: number;
          request_type?: string | null;
          metadata?: Json | null;
          user_id?: string | null;
        };
        Update: {
          id?: string;
          created_at?: string;
          source_id?: string;
          model?: string;
          input_tokens?: number;
          output_tokens?: number;
          total_tokens?: number;
          cost_usd?: number;
          request_type?: string | null;
          metadata?: Json | null;
          user_id?: string | null;
        };
      };
      alert_settings: {
        Row: {
          id: string;
          source_id: string;
          threshold_percentage: number;
          daily_limit_usd: number | null;
          monthly_limit_usd: number | null;
          notification_enabled: boolean;
          created_at: string;
          updated_at: string;
          user_id: string | null;
        };
        Insert: {
          id?: string;
          source_id: string;
          threshold_percentage?: number;
          daily_limit_usd?: number | null;
          monthly_limit_usd?: number | null;
          notification_enabled?: boolean;
          created_at?: string;
          updated_at?: string;
          user_id?: string | null;
        };
        Update: {
          id?: string;
          source_id?: string;
          threshold_percentage?: number;
          daily_limit_usd?: number | null;
          monthly_limit_usd?: number | null;
          notification_enabled?: boolean;
          created_at?: string;
          updated_at?: string;
          user_id?: string | null;
        };
      };
    };
    Views: {
      daily_token_usage: {
        Row: {
          date: string;
          source_id: string;
          model: string;
          request_count: number;
          total_input_tokens: number;
          total_output_tokens: number;
          total_tokens: number;
          total_cost_usd: number;
        };
      };
      monthly_token_usage: {
        Row: {
          month: string;
          source_id: string;
          request_count: number;
          total_input_tokens: number;
          total_output_tokens: number;
          total_tokens: number;
          total_cost_usd: number;
        };
      };
    };
    Functions: Record<string, never>;
    Enums: Record<string, never>;
  };
}

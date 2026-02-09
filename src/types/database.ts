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
      sources: {
        Row: {
          id: string;
          created_at: string;
          name: string;
          description: string | null;
          color: string;
          is_active: boolean;
          metadata: Json | null;
        };
        Insert: {
          id?: string;
          created_at?: string;
          name: string;
          description?: string | null;
          color?: string;
          is_active?: boolean;
          metadata?: Json | null;
        };
        Update: {
          id?: string;
          created_at?: string;
          name?: string;
          description?: string | null;
          color?: string;
          is_active?: boolean;
          metadata?: Json | null;
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

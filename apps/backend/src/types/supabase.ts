export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type Database = {
  public: {
    Tables: {
      activities: {
        Row: {
          child_id: string;
          created_at: string;
          data: Json;
          id: string;
          notes: string | null;
          timestamp: string;
          type: string;
          updated_at: string;
          user_id: string;
        };
        Insert: {
          child_id: string;
          created_at?: string;
          data: Json;
          id?: string;
          notes?: string | null;
          timestamp?: string;
          type: string;
          updated_at?: string;
          user_id: string;
        };
        Update: {
          child_id?: string;
          created_at?: string;
          data?: Json;
          id?: string;
          notes?: string | null;
          timestamp?: string;
          type?: string;
          updated_at?: string;
          user_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "activities_child_id_fkey";
            columns: ["child_id"];
            isOneToOne: false;
            referencedRelation: "children";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "activities_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: false;
            referencedRelation: "users";
            referencedColumns: ["id"];
          },
        ];
      };
      child_guardians: {
        Row: {
          accepted_at: string | null;
          child_id: string;
          created_at: string;
          id: string;
          invited_at: string;
          role: string;
          user_id: string;
        };
        Insert: {
          accepted_at?: string | null;
          child_id: string;
          created_at?: string;
          id?: string;
          invited_at?: string;
          role?: string;
          user_id: string;
        };
        Update: {
          accepted_at?: string | null;
          child_id?: string;
          created_at?: string;
          id?: string;
          invited_at?: string;
          role?: string;
          user_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "child_guardians_child_id_fkey";
            columns: ["child_id"];
            isOneToOne: false;
            referencedRelation: "children";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "child_guardians_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: false;
            referencedRelation: "users";
            referencedColumns: ["id"];
          },
        ];
      };
      children: {
        Row: {
          birth_date: string;
          birth_height: number | null;
          birth_weight: number | null;
          created_at: string;
          gender: string | null;
          id: string;
          invite_code: string | null;
          name: string;
          owner_id: string;
          photo_url: string | null;
          updated_at: string;
        };
        Insert: {
          birth_date: string;
          birth_height?: number | null;
          birth_weight?: number | null;
          created_at?: string;
          gender?: string | null;
          id?: string;
          invite_code?: string | null;
          name: string;
          owner_id: string;
          photo_url?: string | null;
          updated_at?: string;
        };
        Update: {
          birth_date?: string;
          birth_height?: number | null;
          birth_weight?: number | null;
          created_at?: string;
          gender?: string | null;
          id?: string;
          invite_code?: string | null;
          name?: string;
          owner_id?: string;
          photo_url?: string | null;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "children_owner_id_fkey";
            columns: ["owner_id"];
            isOneToOne: false;
            referencedRelation: "users";
            referencedColumns: ["id"];
          },
        ];
      };
      diary_entries: {
        Row: {
          child_id: string;
          content: string;
          created_at: string;
          date: string;
          id: string;
          photos: string[] | null;
          updated_at: string;
          user_id: string;
          videos: string[] | null;
        };
        Insert: {
          child_id: string;
          content: string;
          created_at?: string;
          date: string;
          id?: string;
          photos?: string[] | null;
          updated_at?: string;
          user_id: string;
          videos?: string[] | null;
        };
        Update: {
          child_id?: string;
          content?: string;
          created_at?: string;
          date?: string;
          id?: string;
          photos?: string[] | null;
          updated_at?: string;
          user_id?: string;
          videos?: string[] | null;
        };
        Relationships: [
          {
            foreignKeyName: "diary_entries_child_id_fkey";
            columns: ["child_id"];
            isOneToOne: false;
            referencedRelation: "children";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "diary_entries_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: false;
            referencedRelation: "users";
            referencedColumns: ["id"];
          },
        ];
      };
      growth_records: {
        Row: {
          child_id: string;
          created_at: string;
          head_circumference: number | null;
          height: number | null;
          id: string;
          recorded_at: string;
          updated_at: string;
          user_id: string;
          weight: number | null;
        };
        Insert: {
          child_id: string;
          created_at?: string;
          head_circumference?: number | null;
          height?: number | null;
          id?: string;
          recorded_at: string;
          updated_at?: string;
          user_id: string;
          weight?: number | null;
        };
        Update: {
          child_id?: string;
          created_at?: string;
          head_circumference?: number | null;
          height?: number | null;
          id?: string;
          recorded_at?: string;
          updated_at?: string;
          user_id?: string;
          weight?: number | null;
        };
        Relationships: [
          {
            foreignKeyName: "growth_records_child_id_fkey";
            columns: ["child_id"];
            isOneToOne: false;
            referencedRelation: "children";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "growth_records_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: false;
            referencedRelation: "users";
            referencedColumns: ["id"];
          },
        ];
      };
      milestones: {
        Row: {
          achieved_at: string;
          child_id: string;
          created_at: string;
          description: string;
          diary_entry_id: string | null;
          id: string;
          type: string;
        };
        Insert: {
          achieved_at: string;
          child_id: string;
          created_at?: string;
          description: string;
          diary_entry_id?: string | null;
          id?: string;
          type: string;
        };
        Update: {
          achieved_at?: string;
          child_id?: string;
          created_at?: string;
          description?: string;
          diary_entry_id?: string | null;
          id?: string;
          type?: string;
        };
        Relationships: [
          {
            foreignKeyName: "milestones_child_id_fkey";
            columns: ["child_id"];
            isOneToOne: false;
            referencedRelation: "children";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "milestones_diary_entry_id_fkey";
            columns: ["diary_entry_id"];
            isOneToOne: false;
            referencedRelation: "diary_entries";
            referencedColumns: ["id"];
          },
        ];
      };
      oauth_states: {
        Row: {
          created_at: string;
          expires_at: string;
          provider: string;
          state: string;
        };
        Insert: {
          created_at?: string;
          expires_at: string;
          provider?: string;
          state: string;
        };
        Update: {
          created_at?: string;
          expires_at?: string;
          provider?: string;
          state?: string;
        };
        Relationships: [];
      };
      users: {
        Row: {
          avatar_url: string | null;
          created_at: string;
          email: string;
          id: string;
          name: string | null;
          oauth_provider: string | null;
          oauth_provider_id: string | null;
          phone: string | null;
          registration_status: string;
          updated_at: string;
        };
        Insert: {
          avatar_url?: string | null;
          created_at?: string;
          email: string;
          id: string;
          name?: string | null;
          oauth_provider?: string | null;
          oauth_provider_id?: string | null;
          phone?: string | null;
          registration_status?: string;
          updated_at?: string;
        };
        Update: {
          avatar_url?: string | null;
          created_at?: string;
          email?: string;
          id?: string;
          name?: string | null;
          oauth_provider?: string | null;
          oauth_provider_id?: string | null;
          phone?: string | null;
          registration_status?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      cleanup_expired_oauth_states: {
        Args: Record<PropertyKey, never>;
        Returns: undefined;
      };
      generate_invite_code: {
        Args: Record<PropertyKey, never>;
        Returns: string;
      };
    };
    Enums: {
      [_ in never]: never;
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
};

type DefaultSchema = Database[Extract<keyof Database, "public">];

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database;
  }
    ? keyof (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R;
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R;
      }
      ? R
      : never
    : never;

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database;
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I;
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I;
      }
      ? I
      : never
    : never;

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database;
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U;
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U;
      }
      ? U
      : never
    : never;

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof Database },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof Database;
  }
    ? keyof Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never;

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database;
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never;

export const Constants = {
  public: {
    Enums: {},
  },
} as const;

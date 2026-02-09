export interface Source {
  id: string;
  created_at?: string;
  name: string;
  description?: string;
  color: string;
  is_active: boolean;
  metadata?: Record<string, unknown>;
}

export type SourceFormData = Omit<Source, 'id' | 'created_at'>;

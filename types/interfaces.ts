// types/interfaces.ts
export interface User {
  id: number;
  organization_id: number;
  name: string;
  email: string;
  created_at: Date;
  updated_at: Date;
  picture?: string;
}

// types/interfaces.ts

export interface User {
  id: number;
  organization_id: number;
  name: string;
  email: string;
  picture?: string;
  created_at: Date;
  updated_at: Date;
}

export interface Organization {
  id: number;
  name: string;
  created_at: Date;
  updated_at: Date;
}

export interface CategoryOption {
  label: string;
  value: string;
}

export interface Category {
  id: number;
  organization_id: number;
  name: string;
  options: CategoryOption[];
  created_at: Date;
  updated_at: Date;
}

export interface NotificationSetting {
  type: 'email' | 'in-app' | 'sms';
  timing: {
    amount: number;
    unit: 'minutes' | 'hours' | 'days';
    before: boolean;
  };
  recipients?: number[]; // User IDs
}

export interface Task {
  id: number;
  organization_id: number;
  title: string;
  description?: string;
  created_by: number;
  is_recurring: boolean;
  recurrence_type?: 'Fixed' | 'Variable';
  recurrence_interval?: string;
  last_occurrence?: Date;
  category_id?: number;
  notification_settings?: NotificationSetting[];
  created_at: Date;
  updated_at: Date;
}

export interface TaskDependency {
  id: number;
  task_id: number;
  dependency_id: number;
}

export interface Occurrence {
  id: number;
  task_id: number;
  status: 'Not Started' | 'In Progress' | 'Completed' | 'On Hold';
  due_date?: Date;
  assigned_to?: number;
  executed_by?: number;
  completed_at?: Date;
  is_deleted: boolean;
  created_at: Date;
  updated_at: Date;
}

export interface Comment {
  id: number;
  organization_id: number;
  occurrence_id: number;
  user_id: number;
  text: string;
  created_at: Date;
  updated_at: Date;
}

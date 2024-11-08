// services/ApiClient.ts
import type { Task } from "@/types/interfaces";

export class ApiError extends Error {
  constructor(message: string, public statusCode?: number, public data?: any) {
    super(message);
    this.name = "ApiError";
  }
}

export interface ApiResponse<T> {
  data?: T;
  error?: string;
  statusCode: number;
}

export interface ApiClientInterface {
  getTask(id: number): Promise<Task>;
  getTasks(): Promise<Task[]>;
  createTask(task: Omit<Task, "id" | "created_at" | "updated_at">): Promise<Task>;
  updateTask(task: Task): Promise<Task>;
  deleteTask(id: number): Promise<void>;
  get<T>(url: string): Promise<T>;
  post<T>(url: string, data: any): Promise<T>;
  put<T>(url: string, data: any): Promise<T>;
  delete(url: string): Promise<void>;
}

export class ApiClient implements ApiClientInterface {
  private async handleResponse<T>(response: Response): Promise<T> {
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new ApiError(
        errorData.message || "API call failed",
        response.status,
        errorData
      );
    }

    const data = await response.json();
    return data;
  }

  private async request<T>(url: string, options: RequestInit = {}): Promise<T> {
    const defaultOptions: RequestInit = {
      headers: {
        "Content-Type": "application/json",
        ...options.headers,
      },
    };

    const response = await fetch(url, { ...defaultOptions, ...options });
    return this.handleResponse<T>(response);
  }

  async getTask(id: number): Promise<Task> {
    return this.request<Task>(`/api/tasks?id=${id}`, {
      method: "GET",
    });
  }

  async getTasks(): Promise<Task[]> {
    return this.request<Task[]>("/api/tasks", {
      method: "GET",
    });
  }

  async createTask(
    task: Omit<Task, "id" | "created_at" | "updated_at">
  ): Promise<Task> {
    return this.request<Task>("/api/tasks", {
      method: "POST",
      body: JSON.stringify(task),
    });
  }

  async updateTask(task: Task): Promise<Task> {
    return this.request<Task>("/api/tasks", {
      method: "PUT",
      body: JSON.stringify(task),
    });
  }

  async deleteTask(id: number): Promise<void> {
    await this.request<void>(`/api/tasks?id=${id}`, {
      method: "DELETE",
    });
  }

  // Generic methods if needed for other endpoints
  async get<T>(url: string): Promise<T> {
    return this.request<T>(url, { method: "GET" });
  }

  async post<T>(url: string, data: any): Promise<T> {
    return this.request<T>(url, {
      method: "POST",
      body: JSON.stringify(data),
    });
  }

  async put<T>(url: string, data: any): Promise<T> {
    return this.request<T>(url, {
      method: "PUT",
      body: JSON.stringify(data),
    });
  }

  async delete(url: string): Promise<void> {
    await this.request(url, { method: "DELETE" });
  }
}

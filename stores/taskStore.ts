// stores/useTaskStore.ts
import { defineStore } from "pinia";
import { ref, computed } from "vue";
import {
  type Task,
  type TaskState,
  type NotificationSetting,
} from "@/types/interfaces";
import { useOccurrenceStore } from "@/stores/occurrenceStore";

export const useTaskStore = defineStore("tasks", () => {
  const tasks = ref<Task[]>([]);
  const loading = ref(false);
  const error = ref<string | null>(null);

  // Getters
  const getTaskById = computed(() => {
    return (id: number): Task | undefined =>
      tasks.value.find((task) => task.id === id);
  });

  const getTaskState = computed(() => {
    return (id: number): TaskState | null => {
      const task = tasks.value.find((task) => task.id === id);
      if (!task) return null;

      if (task.is_deleted) return "Deleted";

      const occurrenceStore = useOccurrenceStore();
      const occurrences = occurrenceStore.getOccurrencesByTaskId(id);

      if (
        !task.is_recurring &&
        occurrences.every((o) => o.status === "Completed")
      ) {
        return "Completed";
      }

      const latestOccurrence = [...occurrences].sort(
        (a, b) =>
          new Date(b.due_date).getTime() - new Date(a.due_date).getTime()
      )[0];

      if (latestOccurrence?.status === "Overdue") return "Overdue";
      if (occurrences.some((o) => o.status === "Upcoming")) return "Active";

      return null;
    };
  });

  const activeTasks = computed((): Task[] => {
    return tasks.value.filter((task) => !task.is_deleted);
  });

  // Actions
  const fetchTasks = async () => {
    loading.value = true;
    try {
      const response = await fetch("/api/tasks");
      tasks.value = await response.json();
    } catch (e) {
      error.value = e instanceof Error ? e.message : "An error occurred";
    } finally {
      loading.value = false;
    }
  };

  const getTaskByIdFromApi = async (id: number) => {
    loading.value = true;
    try {
      const response = await fetch(`/api/tasks?id=${id}`);
      const task = await response.json();
      const index = tasks.value.findIndex((t) => t.id === id);
      if (index !== -1) {
        tasks.value[index] = task;
      } else {
        tasks.value.push(task);
      }
      return task;
    } catch (e) {
      error.value = e instanceof Error ? e.message : "An error occurred";
      throw e;
    } finally {
      loading.value = false;
    }
  };

  interface CreateTaskData {
    organization_id: number;
    title: string;
    created_by: number;
    description?: string;
    is_recurring: boolean;
    recurrence_type?: "Fixed" | "Variable";
    recurrence_interval?: string;
    category_id?: number;
    notification_settings?: NotificationSetting[];
    initial_due_date?: Date;
  }

  const createTask = async (taskData: CreateTaskData) => {
    loading.value = true;
    try {
      const { initial_due_date, ...apiTaskData } = taskData;

      const response = await fetch("/api/tasks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...apiTaskData,
          is_deleted: false,
          notification_settings: JSON.stringify(
            apiTaskData.notification_settings
          ),
        }),
      });
      const newTask = await response.json();
      tasks.value.push(newTask);

      if (newTask.id && initial_due_date) {
        const occurrenceStore = useOccurrenceStore();
        await occurrenceStore.createOccurrence({
          task_id: newTask.id,
          status: "Upcoming",
          due_date: initial_due_date,
        });
      }

      return newTask;
    } catch (e) {
      error.value = e instanceof Error ? e.message : "An error occurred";
      throw e;
    } finally {
      loading.value = false;
    }
  };

  const updateTask = async (id: number, updates: Partial<Task>) => {
    loading.value = true;
    try {
      const response = await fetch(`/api/tasks`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...updates,
          id,
          notification_settings: updates.notification_settings
            ? JSON.stringify(updates.notification_settings)
            : undefined,
        }),
      });
      const updatedTask = await response.json();
      const index = tasks.value.findIndex((task) => task.id === id);
      if (index !== -1) {
        tasks.value[index] = updatedTask;
      }
      return updatedTask;
    } catch (e) {
      error.value = e instanceof Error ? e.message : "An error occurred";
      throw e;
    } finally {
      loading.value = false;
    }
  };

  const deleteTask = async (id: number) => {
    loading.value = true;
    try {
      await fetch(`/api/tasks?id=${id}`, {
        method: "DELETE",
      });
      const index = tasks.value.findIndex((task) => task.id === id);
      if (index !== -1) {
        tasks.value.splice(index, 1);
      }
    } catch (e) {
      error.value = e instanceof Error ? e.message : "An error occurred";
      throw e;
    } finally {
      loading.value = false;
    }
  };

  return {
    tasks,
    loading,
    error,
    getTaskById,
    getTaskState,
    activeTasks,
    fetchTasks,
    getTaskByIdFromApi,
    createTask,
    updateTask,
    deleteTask,
  };
});

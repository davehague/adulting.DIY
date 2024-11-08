// stores/useTaskStore.ts
import { defineStore } from "pinia";
import { ref, computed } from "vue";
import { type Task, type TaskState } from "@/types/interfaces";
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

  const createTask = async (taskData: Partial<Task>) => {
    loading.value = true;
    try {
      const response = await fetch("/api/tasks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(taskData),
      });
      const newTask = await response.json();
      tasks.value.push(newTask);

      // Create initial occurrence
      if (newTask.id && "initial_due_date" in taskData) {
        const occurrenceStore = useOccurrenceStore();
        await occurrenceStore.createOccurrence({
          task_id: newTask.id,
          status: "Upcoming",
          due_date: taskData.initial_due_date as Date,
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
      const response = await fetch(`/api/tasks/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updates),
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
      await fetch(`/api/tasks/${id}`, {
        method: "DELETE",
      });
      const index = tasks.value.findIndex((task) => task.id === id);
      if (index !== -1) {
        tasks.value[index] = { ...tasks.value[index], is_deleted: true };
      }
    } catch (e) {
      error.value = e instanceof Error ? e.message : "An error occurred";
      throw e;
    } finally {
      loading.value = false;
    }
  };

  return {
    // State
    tasks,
    loading,
    error,
    // Getters
    getTaskById,
    getTaskState,
    activeTasks,
    // Actions
    fetchTasks,
    createTask,
    updateTask,
    deleteTask,
  };
});

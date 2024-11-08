// stores/useOccurrenceStore.ts
import { defineStore } from "pinia";
import { ref, computed } from "vue";
import { type Occurrence, type Task } from "@/types/interfaces";
import { useTaskStore } from "@/stores/taskStore";

export const useOccurrenceStore = defineStore("occurrences", () => {
  const occurrences = ref<Occurrence[]>([]);
  const loading = ref(false);
  const error = ref<string | null>(null);

  const getOccurrenceById = computed(() => {
    return (id: number): Occurrence | undefined =>
      occurrences.value.find((occurrence) => occurrence.id === id);
  });

  const getOccurrencesByTaskId = computed(() => {
    return (taskId: number): Occurrence[] =>
      occurrences.value.filter((occurrence) => occurrence.task_id === taskId);
  });

  const upcomingOccurrences = computed((): Occurrence[] => {
    return occurrences.value
      .filter((o) => o.status === "Upcoming")
      .sort(
        (a, b) =>
          new Date(a.due_date).getTime() - new Date(b.due_date).getTime()
      );
  });

  const overdueOccurrences = computed((): Occurrence[] => {
    return occurrences.value
      .filter((o) => o.status === "Overdue")
      .sort(
        (a, b) =>
          new Date(a.due_date).getTime() - new Date(b.due_date).getTime()
      );
  });

  const fetchOccurrences = async () => {
    loading.value = true;
    try {
      const response = await fetch("/api/occurrences");
      occurrences.value = await response.json();
    } catch (e) {
      error.value = e instanceof Error ? e.message : "An error occurred";
    } finally {
      loading.value = false;
    }
  };

  const getOccurrenceByIdFromApi = async (id: number) => {
    loading.value = true;
    try {
      const response = await fetch(`/api/occurrences?id=${id}`);
      const occurrence = await response.json();
      const index = occurrences.value.findIndex((o) => o.id === id);
      if (index !== -1) {
        occurrences.value[index] = occurrence;
      } else {
        occurrences.value.push(occurrence);
      }
      return occurrence;
    } catch (e) {
      error.value = e instanceof Error ? e.message : "An error occurred";
      throw e;
    } finally {
      loading.value = false;
    }
  };

  interface CreateOccurrenceData {
    task_id: number;
    status: "Upcoming" | "Overdue" | "Completed" | "Deleted";
    due_date: Date;
    assigned_to?: number;
  }

  const createOccurrence = async (occurrenceData: CreateOccurrenceData) => {
    if (
      occurrenceData.status === "Upcoming" &&
      new Date(occurrenceData.due_date) < new Date()
    ) {
      throw new Error(
        "Cannot set due date in the past for upcoming occurrences"
      );
    }

    loading.value = true;
    try {
      const response = await fetch("/api/occurrences", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...occurrenceData,
          is_deleted: false,
          completed_at: null,
          executed_by: null,
        }),
      });
      const newOccurrence = await response.json();
      occurrences.value.push(newOccurrence);
      return newOccurrence;
    } catch (e) {
      error.value = e instanceof Error ? e.message : "An error occurred";
      throw e;
    } finally {
      loading.value = false;
    }
  };

  const calculateNextDueDate = (task: Task, lastDueDate: Date): Date => {
    const dueDate = new Date(lastDueDate);
    if (task.recurrence_type === "Fixed" && task.recurrence_interval) {
      const [amount, unit] = task.recurrence_interval.split(" ");
      const numAmount = parseInt(amount, 10);

      switch (unit.toLowerCase()) {
        case "days":
          dueDate.setDate(dueDate.getDate() + numAmount);
          break;
        case "weeks":
          dueDate.setDate(dueDate.getDate() + numAmount * 7);
          break;
        case "months":
          dueDate.setMonth(dueDate.getMonth() + numAmount);
          break;
        case "years":
          dueDate.setFullYear(dueDate.getFullYear() + numAmount);
          break;
      }
    }
    return dueDate;
  };

  const updateOccurrence = async (id: number, updates: Partial<Occurrence>) => {
    if (
      updates.status === "Upcoming" &&
      updates.due_date &&
      new Date(updates.due_date) < new Date()
    ) {
      throw new Error(
        "Cannot set due date in the past for upcoming occurrences"
      );
    }

    loading.value = true;
    try {
      const response = await fetch(`/api/occurrences`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...updates,
          id,
        }),
      });
      const updatedOccurrence = await response.json();
      const index = occurrences.value.findIndex(
        (occurrence) => occurrence.id === id
      );
      if (index !== -1) {
        occurrences.value[index] = updatedOccurrence;
      }

      // Handle recurring task logic
      if (updates.status === "Completed" || updates.is_deleted) {
        const occurrence = getOccurrenceById.value(id);
        if (occurrence) {
          const taskStore = useTaskStore();
          const task = taskStore.getTaskById(occurrence.task_id);

          if (task?.is_recurring) {
            await createOccurrence({
              task_id: task.id,
              status: "Upcoming",
              due_date: calculateNextDueDate(task, occurrence.due_date),
              assigned_to: occurrence.assigned_to,
            });
          }
        }
      }

      return updatedOccurrence;
    } catch (e) {
      error.value = e instanceof Error ? e.message : "An error occurred";
      throw e;
    } finally {
      loading.value = false;
    }
  };

  return {
    occurrences,
    loading,
    error,
    getOccurrenceById,
    getOccurrencesByTaskId,
    upcomingOccurrences,
    overdueOccurrences,
    fetchOccurrences,
    getOccurrenceByIdFromApi,
    createOccurrence,
    updateOccurrence,
    calculateNextDueDate,
  };
});

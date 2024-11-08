// stores/useOccurrenceStore.ts
import { defineStore } from "pinia";
import { ref, computed } from "vue";
import { type Occurrence, type Task } from "@/types/interfaces";
import { useTaskStore } from "@/stores/taskStore";

export const useOccurrenceStore = defineStore("occurrences", () => {
  const occurrences = ref<Occurrence[]>([]);
  const loading = ref(false);
  const error = ref<string | null>(null);

  // Getters
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

  // Actions
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

  const createOccurrence = async (occurrenceData: Partial<Occurrence>) => {
    if (
      occurrenceData.status === "Upcoming" &&
      occurrenceData.due_date &&
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
        body: JSON.stringify(occurrenceData),
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
    switch (task.recurrence_type) {
      case "Fixed":
        // Add interval based on recurrence_interval value
        // This is a simplified example
        dueDate.setMonth(dueDate.getMonth() + 1);
        break;
      case "Variable":
        // Implement variable recurrence logic
        break;
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
      const response = await fetch(`/api/occurrences/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updates),
      });
      const updatedOccurrence = await response.json();
      const index = occurrences.value.findIndex(
        (occurrence) => occurrence.id === id
      );
      if (index !== -1) {
        occurrences.value[index] = updatedOccurrence;
      }

      // If marking as deleted and task is recurring, create new occurrence
      if (updates.status === "Deleted") {
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
    // State
    occurrences,
    loading,
    error,
    // Getters
    getOccurrenceById,
    getOccurrencesByTaskId,
    upcomingOccurrences,
    overdueOccurrences,
    // Actions
    fetchOccurrences,
    createOccurrence,
    updateOccurrence,
    calculateNextDueDate,
  };
});

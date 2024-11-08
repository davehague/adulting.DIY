// services/TaskService.ts
import type {
  Task,
  Occurrence,
  NotificationSetting,
  CategoryOption,
} from "@/types/interfaces";
import type { ApiClientInterface } from "./ApiClient";

interface RecurrenceConfig {
  frequency: "DAILY" | "WEEKLY" | "MONTHLY" | "YEARLY";
  interval: number;
  byDay?: string[]; // For weekly recurrence: ['MO', 'WE', 'FR']
}

interface VariableRecurrenceConfig {
  basis: "after_completion" | "from_due_date";
  amount: number;
  unit: "days" | "weeks" | "months" | "years";
}

export class TaskService {
  constructor(private api: ApiClientInterface) {}

  private parseFixedRecurrence(
    recurrenceInterval: string
  ): RecurrenceConfig | null {
    try {
      const parts = recurrenceInterval.split(";");
      const freqMatch = parts.find((p) => p.startsWith("FREQ="))?.split("=")[1];
      const intervalMatch = parseInt(
        parts.find((p) => p.startsWith("INTERVAL="))?.split("=")[1] || "",
        10
      );
      const byDayMatch = parts
        .find((p) => p.startsWith("BYDAY="))
        ?.split("=")[1]
        .split(",");

      if (!freqMatch || isNaN(intervalMatch)) {
        return null;
      }

      const frequency = freqMatch as RecurrenceConfig["frequency"];
      return {
        frequency,
        interval: intervalMatch,
        byDay: byDayMatch,
      };
    } catch (error) {
      console.error("Error parsing fixed recurrence:", error);
      return null;
    }
  }

  private parseVariableRecurrence(
    recurrenceInterval: string
  ): VariableRecurrenceConfig | null {
    try {
      const [basis, amount, unit] = recurrenceInterval.split(";");

      if (!basis || !amount || !unit) {
        return null;
      }

      if (!["after_completion", "from_due_date"].includes(basis)) {
        return null;
      }

      const parsedAmount = parseInt(amount, 10);
      if (isNaN(parsedAmount)) {
        return null;
      }

      if (!["days", "weeks", "months", "years"].includes(unit)) {
        return null;
      }

      return {
        basis: basis as "after_completion" | "from_due_date",
        amount: parsedAmount,
        unit: unit as "days" | "weeks" | "months" | "years",
      };
    } catch (error) {
      console.error("Error parsing variable recurrence:", error);
      return null;
    }
  }

  private calculateNextOccurrence(
    task: Task,
    lastOccurrence?: Occurrence
  ): Date | null {
    if (
      !task.is_recurring ||
      !task.recurrence_type ||
      !task.recurrence_interval
    ) {
      return null;
    }

    const baseDate =
      lastOccurrence?.completed_at || task.last_occurrence || new Date();
    const nextDate = new Date(baseDate);

    if (task.recurrence_type === "Fixed") {
      const config = this.parseFixedRecurrence(task.recurrence_interval);
      if (!config) return null;

      switch (config.frequency) {
        case "DAILY":
          nextDate.setDate(nextDate.getDate() + config.interval);
          break;
        case "WEEKLY":
          nextDate.setDate(nextDate.getDate() + config.interval * 7);
          // TODO: Handle byDay if needed
          break;
        case "MONTHLY":
          nextDate.setMonth(nextDate.getMonth() + config.interval);
          break;
        case "YEARLY":
          nextDate.setFullYear(nextDate.getFullYear() + config.interval);
          break;
      }
    } else if (task.recurrence_type === "Variable") {
      const config = this.parseVariableRecurrence(task.recurrence_interval);
      if (!config) return null;

      const baseDateToUse =
        config.basis === "after_completion"
          ? lastOccurrence?.completed_at || new Date()
          : lastOccurrence?.due_date || new Date();

      nextDate.setTime(baseDateToUse.getTime());

      switch (config.unit) {
        case "days":
          nextDate.setDate(nextDate.getDate() + config.amount);
          break;
        case "weeks":
          nextDate.setDate(nextDate.getDate() + config.amount * 7);
          break;
        case "months":
          nextDate.setMonth(nextDate.getMonth() + config.amount);
          break;
        case "years":
          nextDate.setFullYear(nextDate.getFullYear() + config.amount);
          break;
      }
    }

    return nextDate;
  }

  private createOccurrencePayload(task: Task, dueDate: Date): Occurrence {
    return {
      id: 0,
      task_id: task.id,
      status: "Not Started",
      due_date: dueDate,
      assigned_to: undefined,
      executed_by: undefined,
      completed_at: undefined,
      is_deleted: false,
      created_at: new Date(),
      updated_at: new Date(),
    };
  }

  private validateNotificationSettings(
    settings?: NotificationSetting[]
  ): boolean {
    if (!settings) return true;

    return settings.every((setting) => {
      const validTypes = ["email", "in-app", "sms"];
      const validUnits = ["minutes", "hours", "days"];

      return (
        validTypes.includes(setting.type) &&
        typeof setting.timing.amount === "number" &&
        validUnits.includes(setting.timing.unit) &&
        typeof setting.timing.before === "boolean" &&
        (!setting.recipients ||
          setting.recipients.every((id) => typeof id === "number"))
      );
    });
  }

  private validateTask(task: Task): boolean {
    // Required fields
    if (!task.title || !task.organization_id || !task.created_by) {
      return false;
    }

    // Validate notification settings if present
    if (!this.validateNotificationSettings(task.notification_settings)) {
      return false;
    }

    // Validate recurrence settings if task is recurring
    if (task.is_recurring) {
      if (!task.recurrence_type || !task.recurrence_interval) {
        return false;
      }

      if (task.recurrence_type === "Fixed") {
        if (!this.parseFixedRecurrence(task.recurrence_interval)) {
          return false;
        }
      } else if (task.recurrence_type === "Variable") {
        if (!this.parseVariableRecurrence(task.recurrence_interval)) {
          return false;
        }
      } else {
        return false;
      }
    }

    return true;
  }

  async saveTaskAndOccurrence(task: Task): Promise<Task> {
    if (!this.validateTask(task)) {
      throw new Error("Invalid task data");
    }

    // Use specific task methods instead of generic put/post
    const savedTask = task.id
      ? await this.api.updateTask(task)
      : await this.api.createTask({
          organization_id: task.organization_id,
          title: task.title,
          description: task.description,
          created_by: task.created_by,
          is_recurring: task.is_recurring,
          recurrence_type: task.recurrence_type,
          recurrence_interval: task.recurrence_interval,
          last_occurrence: task.last_occurrence,
          category_id: task.category_id,
          notification_settings: task.notification_settings,
        });

    if (savedTask.is_recurring) {
      // Get the latest occurrence for this task if it exists
      const existingOccurrences = await this.api.get<Occurrence[]>(
        `/api/occurrences?task_id=${savedTask.id}`
      );
      const latestOccurrence =
        existingOccurrences.length > 0
          ? existingOccurrences.reduce(
              (latest: Occurrence, current: Occurrence) =>
                latest.due_date &&
                current.due_date &&
                latest.due_date > current.due_date
                  ? latest
                  : current
            )
          : null;

      const nextOccurrenceDate = this.calculateNextOccurrence(
        savedTask,
        latestOccurrence || undefined
      );
      if (nextOccurrenceDate) {
        const occurrencePayload = this.createOccurrencePayload(
          savedTask,
          nextOccurrenceDate
        );
        await this.api.post<Occurrence>("/api/occurrences", occurrencePayload);
      }
    }

    return savedTask;
  }

  async deleteTask(taskId: number): Promise<void> {
    await this.api.delete(`/api/tasks?id=${taskId}`);
  }

  // Helper method to get next occurrence date without saving
  async getNextOccurrenceDate(task: Task): Promise<Date | null> {
    if (!task.is_recurring) {
      return null;
    }

    const existingOccurrences = await this.api.get<Occurrence[]>(
      `/api/occurrences?task_id=${task.id}`
    );
    const latestOccurrence =
      existingOccurrences.length > 0
        ? existingOccurrences.reduce((latest, current) =>
            latest.due_date &&
            current.due_date &&
            latest.due_date > current.due_date
              ? latest
              : current
          )
        : null;

    return this.calculateNextOccurrence(task, latestOccurrence || undefined);
  }
}

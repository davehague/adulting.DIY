// composables/useTaskOperations.ts
import { ref } from 'vue'
import { TaskService } from '@/services/TaskService'
import { ApiClient } from '@/services/ApiClient'
import type { Task } from '@/types/interfaces'

export function useTaskOperations() {
  const taskService = new TaskService(new ApiClient())
  const isLoading = ref(false)
  const error = ref<string | null>(null)

  async function handleTaskSave(task: Task) {
    isLoading.value = true
    error.value = null
    
    try {
      const result = await taskService.saveTaskAndOccurrence(task)
      return { success: true, task: result }
    } catch (e) {
      error.value = e instanceof Error ? e.message : 'An error occurred'
      return { success: false, error: error.value }
    } finally {
      isLoading.value = false
    }
  }

  async function handleTaskDelete(taskId: number) {
    isLoading.value = true
    error.value = null

    try {
      await taskService.deleteTask(taskId)
      return { success: true }
    } catch (e) {
      error.value = e instanceof Error ? e.message : 'An error occurred'
      return { success: false, error: error.value }
    } finally {
      isLoading.value = false
    }
  }

  return {
    isLoading,
    error,
    handleTaskSave,
    handleTaskDelete
  }
}
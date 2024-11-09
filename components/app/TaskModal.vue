<template>
  <div class="fixed z-10 inset-0 overflow-y-auto" aria-labelledby="modal-title" role="dialog" aria-modal="true">
    <div class="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
      <div class="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" aria-hidden="true"></div>
      <span class="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>
      <div
        class="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-4xl sm:w-full">
        <form @submit.prevent="$emit('save', tempTask)">
          <div class="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
            <div class="mb-4">
              <label for="title" class="block text-sm font-medium text-gray-700">Task Name</label>
              <input type="text" name="title" id="title" v-model="tempTask.title"
                class="p-2 mt-1 focus:ring-indigo-500 focus:border-indigo-500 block w-full shadow-sm sm:text-sm border-2 border-gray-300 rounded-md">
            </div>
            <div class="mb-4">
              <label for="description" class="block text-sm font-medium text-gray-700">Description</label>
              <textarea name="description" id="description" v-model="tempTask.description" rows="3"
                class="p-2 mt-1 focus:ring-indigo-500 focus:border-indigo-500 block w-full shadow-sm sm:text-sm border-2 border-gray-300 rounded-md"></textarea>
            </div>
            <div class="mb-4">
              <label for="last_occurrence" class="block text-sm font-medium text-gray-700">Last Occurrence</label>
              <input type="date" name="last_occurrence" id="last_occurrence" v-model="tempTask.last_occurrence"
                class="p-2 mt-1 focus:ring-indigo-500 focus:border-indigo-500 block w-full shadow-sm sm:text-sm border-2 border-gray-300 rounded-md">
            </div>
            <div class="mb-4">
              <label for="category_id" class="block text-sm font-medium text-gray-700">Category</label>
              <select name="category_id" id="category_id" v-model="tempTask.category_id"
                class="mt-1 block w-full py-2 px-3 border-2 border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm">
                <option v-for="category in categories" :key="category.id" :value="category.id">{{ category.name }}
                </option>
              </select>
            </div>
            <div class="mb-4">
              <label for="is_recurring" class="block text-sm font-medium text-gray-700">Recurring</label>
              <input type="checkbox" name="is_recurring" id="is_recurring" v-model="tempTask.is_recurring"
                class="mt-1 focus:ring-indigo-500 h-4 w-4 text-indigo-600 border-gray-300 rounded">
            </div>
            <div v-if="tempTask.is_recurring" class="mb-4">
              <label for="recurrence_type" class="block text-sm font-medium text-gray-700">Recurrence Type</label>
              <select name="recurrence_type" id="recurrence_type" v-model="tempTask.recurrence_type"
                class="mt-1 block w-full py-2 px-3 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm">
                <option value="Fixed">Fixed</option>
                <option value="Variable">Variable</option>
              </select>
            </div>
            <div v-if="tempTask.is_recurring" class="mb-4">
              <label for="recurrence_interval" class="block text-sm font-medium text-gray-700">Recurrence
                Interval</label>
              <input type="text" name="recurrence_interval" id="recurrence_interval"
                v-model="tempTask.recurrence_interval"
                class="p-2 mt-1 focus:ring-indigo-500 focus:border-indigo-500 block w-full shadow-sm sm:text-sm border-2 border-gray-300 rounded-md"
                placeholder="e.g., 7 days, 2 weeks, 1 month">
            </div>
          </div>
          <div class="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
            <button type="submit"
              class="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-blue-600 text-base font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:ml-3 sm:w-auto sm:text-sm">
              Save
            </button>
            <button type="button" @click="$emit('close')"
              class="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm">
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'
import type { Task, Category } from '@/types/interfaces'

const props = defineProps<{
  task: Task | null
  categories: Category[]
}>()

const emit = defineEmits<{
  (e: 'save', task: Task): void
  (e: 'close'): void
}>()

// Create a temporary task for editing
const tempTask = ref<Task>({
  id: 0,
  organization_id: 0,
  title: '',
  description: '',
  created_by: 0,
  is_recurring: false,
  recurrence_type: 'Fixed',
  recurrence_interval: '',
  last_occurrence: new Date(),
  category_id: undefined,
  notification_settings: [],
  is_deleted: false,
  created_at: new Date(),
  updated_at: new Date()
} as Task)

// Watch for changes in the task prop and update tempTask
watch(() => props.task, (newTask) => {
  if (newTask) {
    // Clone the task with proper date handling
    tempTask.value = {
      ...newTask,
      // Ensure dates are properly instantiated
      last_occurrence: newTask.last_occurrence ? new Date(newTask.last_occurrence) : undefined,
      created_at: new Date(newTask.created_at),
      updated_at: new Date(newTask.updated_at)
    }
  } else {
    // Reset to default values for new task
    tempTask.value = {
      id: 0,
      organization_id: 0,
      title: '',
      description: '',
      created_by: 0,
      is_recurring: false,
      recurrence_type: 'Fixed',
      recurrence_interval: '',
      last_occurrence: undefined,
      category_id: undefined,
      notification_settings: [],
      is_deleted: false,
      created_at: new Date(),
      updated_at: new Date()
    } as Task
  }
}, { immediate: true })
</script>
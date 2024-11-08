// components/app/TaskList.vue
<template>
  <div class="px-4 py-6 sm:px-0">
    <div class="flex justify-between items-center mb-4">
      <h2 class="text-xl font-semibold text-gray-900"></h2>
      <button @click="$emit('openTaskModal', {} as Task)"
        class="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">
        Add Task
      </button>
    </div>
    <div class="bg-white shadow overflow-hidden sm:rounded-md">
      <ul class="divide-y divide-gray-200">
        <li v-for="task in tasks" :key="task.id">
          <div class="px-4 py-4 sm:px-6">
            <div class="flex items-center justify-between">
              <p class="text-sm font-medium text-indigo-600 truncate">{{ task.title }}</p>
              <div class="ml-2 flex-shrink-0 flex">
                <p class="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">
                  {{ task.is_recurring ? 'Recurring' : 'One-time' }}
                </p>
              </div>
            </div>
            <div class="mt-2 sm:flex sm:justify-between">
              <div class="sm:flex">
                <p class="flex items-center text-sm text-gray-500">
                  <CalendarIcon class="flex-shrink-0 mr-1.5 h-5 w-5 text-gray-400" />
                  {{ formatDate(task.last_occurrence?.toString()) }}
                </p>
                <p class="mt-2 flex items-center text-sm text-gray-500 sm:mt-0 sm:ml-6">
                  <FolderIcon class="flex-shrink-0 mr-1.5 h-5 w-5 text-gray-400" />
                  {{ getCategoryName(task.category_id) }}
                </p>
              </div>
              <div class="mt-2 flex items-center text-sm text-gray-500 sm:mt-0">
                <button @click="$emit('openTaskModal', task)"
                  class="text-indigo-600 hover:text-indigo-900 mr-2">Edit</button>
                <button @click="$emit('deleteTask', task.id)" class="text-red-600 hover:text-red-900">Delete</button>
              </div>
            </div>
          </div>
          <div class="pl-8 pr-4 py-2 bg-gray-50">
            <h4 class="text-sm font-medium text-gray-700 mb-2">Occurrences:</h4>
            <ul class="space-y-2">
              <li v-for="occurrence in getOccurrencesForTask(task.id)" :key="occurrence.id"
                class="flex items-center justify-between">
                <span class="text-sm text-gray-600">{{ formatDate(occurrence.due_date?.toString()) }}</span>
                <span :class="[
                  'px-2 inline-flex text-xs leading-5 font-semibold rounded-full',
                  occurrence.status === 'Completed' ? 'bg-green-100 text-green-800' :
                    occurrence.status === 'Overdue' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-red-100 text-red-800'
                ]">
                  {{ occurrence.status }}
                </span>
                <button @click="$emit('openOccurrenceModal', occurrence)"
                  class="text-indigo-600 hover:text-indigo-900 text-sm">Update</button>
              </li>
            </ul>
          </div>
        </li>
      </ul>
    </div>
  </div>
</template>

<script setup lang="ts">
import { CalendarIcon, FolderIcon } from 'lucide-vue-next'
import type { Task, Category, Occurrence } from '@/types/interfaces'

const props = defineProps<{
  tasks: Task[]
  categories: Category[]
  occurrences: Occurrence[]
}>()

defineEmits<{
  (e: 'openTaskModal', task: Task): void
  (e: 'openOccurrenceModal', occurrence: Occurrence): void
  (e: 'deleteTask', id: number): void
}>()

function getOccurrencesForTask(taskId: number): Occurrence[] {
  return props.occurrences.filter(occurrence => occurrence.task_id === taskId)
}

function formatDate(dateString: string | undefined): string {
  return dateString ? new Date(dateString).toLocaleDateString() : 'N/A'
}

function getCategoryName(categoryId: number | undefined): string {
  if (!categoryId) return 'Uncategorized'
  const category = props.categories.find(c => c.id === categoryId)
  return category ? category.name : 'Unknown'
}
</script>
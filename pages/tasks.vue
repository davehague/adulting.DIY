// pages/tasks.vue
<template>
  <div class="min-h-screen bg-gray-100">
    <header class="bg-white shadow">
      <div class="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        <div class="flex justify-between items-center">
          <h1 class="text-3xl font-bold text-gray-900">Tasks</h1>
          <div class="flex space-x-4">
            <select v-model="currentFilter"
              class="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md">
              <option value="all">All Tasks</option>
              <option value="today">Due Today</option>
              <option value="overdue">Overdue</option>
              <option value="upcoming">Upcoming</option>
              <option value="assigned">Assigned to Me</option>
            </select>
          </div>
        </div>
      </div>
    </header>
    <main>
      <div class="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div v-if="error" class="mb-4 p-4 bg-red-100 text-red-700 rounded-md">
          {{ error }}
        </div>

        <TaskList :tasks="filteredTasks" :categories="categories" :occurrences="occurrences" :loading="isLoading"
          @open-task-modal="openTaskModal" @open-occurrence-modal="openOccurrenceModal" @delete-task="deleteTask" />

        <TaskModal v-if="isTaskModalOpen" :task="currentTask" :categories="categories" :loading="isLoading"
          @save="saveTask" @close="closeTaskModal" />

        <OccurrenceModal v-if="isOccurrenceModalOpen" :occurrence="currentOccurrence" :loading="isLoading"
          @save="saveOccurrence" @close="closeOccurrenceModal" />
      </div>
    </main>
  </div>
</template>

// pages/tasks.vue
<script setup lang="ts">
definePageMeta({
  layout: 'app',
  middleware: ['auth']
})

import { ref, computed } from 'vue'
import { storeToRefs } from 'pinia'
import { useTaskStore } from '@/stores/taskStore'
import { useOccurrenceStore } from '@/stores/occurrenceStore'
import { useCategoryStore } from '@/stores/categoryStore'
import { useAuthStore } from '@/stores/authStore'
import { type Task, type Occurrence, type Category } from '@/types/interfaces'

// Store initialization
const taskStore = useTaskStore()
const occurrenceStore = useOccurrenceStore()
const categoryStore = useCategoryStore()
const authStore = useAuthStore()

// Destructure store properties with storeToRefs to maintain reactivity
const { tasks, loading: tasksLoading, error: taskError } = storeToRefs(taskStore)
const { occurrences, loading: occurrencesLoading } = storeToRefs(occurrenceStore)
const { categories, loading: categoriesLoading } = storeToRefs(categoryStore)

// Local state
const currentFilter = ref('all')
const isTaskModalOpen = ref(false)
const isOccurrenceModalOpen = ref(false)
const currentTask = ref<Task | null>(null)
const currentOccurrence = ref<Occurrence | null>(null)

// Computed properties
const isLoading = computed(() =>
  tasksLoading.value || occurrencesLoading.value || categoriesLoading.value
)

const error = computed(() => taskError.value)

const filteredTasks = computed(() => {
  const today = new Date()
  today.setHours(0, 0, 0, 0)

  switch (currentFilter.value) {
    case 'today':
      return tasks.value.filter(task => {
        const occurrence = occurrences.value.find(o =>
          o.task_id === task.id &&
          o.status === 'Upcoming' &&
          new Date(o.due_date).setHours(0, 0, 0, 0) === today.getTime()
        )
        return occurrence !== undefined
      })
    case 'overdue':
      return tasks.value.filter(task =>
        taskStore.getTaskState(task.id) === 'Overdue'
      )
    case 'upcoming':
      return tasks.value.filter(task =>
        occurrences.value.some(o =>
          o.task_id === task.id &&
          o.status === 'Upcoming'
        )
      )
    case 'assigned':
      // Assuming you have access to current user ID
      const currentUserId = authStore.user?.id
      if (!currentUserId) return []
      
      return tasks.value.filter(task =>
        occurrences.value.some(o =>
          o.task_id === task.id &&
          o.assigned_to === currentUserId
        )
      )
    default:
      return tasks.value.filter(task => !task.is_deleted)
  }
})

// Methods
const fetchData = async () => {
  try {
    await Promise.all([
      taskStore.fetchTasks(),
      occurrenceStore.fetchOccurrences(),
      categoryStore.fetchCategories()
    ])
  } catch (e) {
    console.error('Error fetching data:', e)
  }
}

const openTaskModal = (task?: Task) => {
  currentTask.value = task || null
  isTaskModalOpen.value = true
}

const closeTaskModal = () => {
  currentTask.value = null
  isTaskModalOpen.value = false
}

const openOccurrenceModal = (occurrence: Occurrence) => {
  currentOccurrence.value = occurrence
  isOccurrenceModalOpen.value = true
}

const closeOccurrenceModal = () => {
  currentOccurrence.value = null
  isOccurrenceModalOpen.value = false
}

const saveTask = async (taskData: Partial<Task>) => {
  try {
    if (currentTask.value) {
      await taskStore.updateTask(currentTask.value.id, taskData)
    } else {
      await taskStore.createTask(taskData)
    }
    closeTaskModal()
  } catch (e) {
    console.error('Error saving task:', e)
  }
}

const saveOccurrence = async (occurrenceData: Partial<Occurrence>) => {
  try {
    if (currentOccurrence.value) {
      await occurrenceStore.updateOccurrence(
        currentOccurrence.value.id,
        occurrenceData
      )
    }
    closeOccurrenceModal()
  } catch (e) {
    console.error('Error saving occurrence:', e)
  }
}

const deleteTask = async (taskId: number) => {
  try {
    await taskStore.deleteTask(taskId)
  } catch (e) {
    console.error('Error deleting task:', e)
  }
}

// Fetch data on component mount
fetchData()
</script>
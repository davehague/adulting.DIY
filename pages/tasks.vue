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


import { ref, onMounted, computed, watch } from 'vue'
import { useRoute } from 'vue-router'
import { useTaskOperations } from '@/composables/useTaskOperations'
import { useAuthStore } from '@/stores/auth'
import TaskList from '@/components/app/TaskList.vue'
import TaskModal from '@/components/app/TaskModal.vue'
import OccurrenceModal from '@/components/app/OccurrenceModal.vue'
import type { Task, Category, Occurrence } from '@/types/interfaces'
import { ApiClient } from '@/services/ApiClient'

const route = useRoute()
const api = new ApiClient()
const authStore = useAuthStore()
const { isLoading, error, handleTaskSave, handleTaskDelete } = useTaskOperations()

const currentFilter = ref(route.query.filter?.toString() || 'all')
const tasks = ref<Task[]>([])
const categories = ref<Category[]>([])
const occurrences = ref<Occurrence[]>([])
const isTaskModalOpen = ref(false)
const isOccurrenceModalOpen = ref(false)

// Default task template
const defaultTask: Task = {
  id: 0,
  organization_id: authStore.user?.organization_id ?? 0,
  title: '',
  description: '',
  created_by: authStore.user?.id ?? 0,
  is_recurring: false,
  recurrence_type: undefined,
  recurrence_interval: undefined,
  last_occurrence: new Date(),
  category_id: undefined,
  notification_settings: undefined,
  created_at: new Date(),
  updated_at: new Date()
}

const currentTask = ref<Task>({ ...defaultTask })

const currentOccurrence = ref<Occurrence>({
  id: 0,
  task_id: 0,
  status: 'Not Started',
  due_date: new Date(),
  assigned_to: undefined,
  executed_by: undefined,
  completed_at: undefined,
  is_deleted: false,
  created_at: new Date(),
  updated_at: new Date()
})

// Helper function to get start of day
function getStartOfDay(date: Date): number {
  const start = new Date(date)
  start.setHours(0, 0, 0, 0)
  return start.getTime()
}

// Helper function for safe date comparison
function isSameDay(date1: Date | undefined, date2: Date): boolean {
  if (!date1) return false
  return getStartOfDay(date1) === getStartOfDay(date2)
}

function isBeforeDay(date1: Date | undefined, date2: Date): boolean {
  if (!date1) return false
  return getStartOfDay(date1) < getStartOfDay(date2)
}

function isAfterDay(date1: Date | undefined, date2: Date): boolean {
  if (!date1) return false
  return getStartOfDay(date1) > getStartOfDay(date2)
}

// Computed tasks based on filter with safe date handling
const filteredTasks = computed(() => {
  const today = new Date()
  const nextWeek = new Date(today)
  nextWeek.setDate(today.getDate() + 7)

  switch (currentFilter.value) {
    case 'today':
      return tasks.value.filter(task => {
        const occurrenceDueToday = occurrences.value.find(
          occ => occ.task_id === task.id &&
            isSameDay(occ.due_date, today) &&
            occ.status !== 'Completed'
        )
        return occurrenceDueToday !== undefined
      })
    case 'overdue':
      return tasks.value.filter(task => {
        const overdueOccurrence = occurrences.value.find(
          occ => occ.task_id === task.id &&
            isBeforeDay(occ.due_date, today) &&
            occ.status !== 'Completed'
        )
        return overdueOccurrence !== undefined
      })
    case 'upcoming':
      return tasks.value.filter(task => {
        const upcomingOccurrence = occurrences.value.find(
          occ => occ.task_id === task.id &&
            isAfterDay(occ.due_date, today) &&
            new Date(occ.due_date!) <= nextWeek &&
            occ.status !== 'Completed'
        )
        return upcomingOccurrence !== undefined
      })
    case 'assigned':
      return tasks.value.filter(task => {
        const assignedOccurrence = occurrences.value.find(
          occ => occ.task_id === task.id &&
            occ.assigned_to === authStore.user?.id &&
            occ.status !== 'Completed'
        )
        return assignedOccurrence !== undefined
      })
    default:
      return tasks.value
  }
})

// Fetch data on mount
onMounted(async () => {
  await Promise.all([
    fetchTasks(),
    fetchCategories(),
    fetchOccurrences()
  ])
})

// Data fetching functions using ApiClient
async function fetchTasks() {
  try {
    tasks.value = await api.getTasks()
  } catch (error) {
    console.error('Error fetching tasks:', error)
  }
}

async function fetchCategories() {
  try {
    categories.value = await api.get<Category[]>('/api/categories')
  } catch (error) {
    console.error('Error fetching categories:', error)
  }
}

async function fetchOccurrences() {
  try {
    occurrences.value = await api.get<Occurrence[]>('/api/occurrences')
  } catch (error) {
    console.error('Error fetching occurrences:', error)
  }
}

// Modal management
function openTaskModal(task?: Task) {
  if (task) {
    currentTask.value = { ...task }
  } else {
    currentTask.value = { ...defaultTask }
  }
  isTaskModalOpen.value = true
}

function closeTaskModal() {
  isTaskModalOpen.value = false
}

function openOccurrenceModal(occurrence: Occurrence) {
  currentOccurrence.value = { ...occurrence }
  isOccurrenceModalOpen.value = true
}

function closeOccurrenceModal() {
  isOccurrenceModalOpen.value = false
}

// Task operations using TaskService through composable
async function saveTask(task: Task) {
  const result = await handleTaskSave(task)
  if (result.success) {
    await Promise.all([
      fetchTasks(),
      fetchOccurrences()
    ])
    closeTaskModal()
  }
}

async function deleteTask(id: number) {
  if (confirm('Are you sure you want to delete this task? This will also delete all associated occurrences.')) {
    const result = await handleTaskDelete(id)
    if (result.success) {
      await Promise.all([
        fetchTasks(),
        fetchOccurrences()
      ])
    }
  }
}

// Occurrence operations
async function saveOccurrence(occurrence: Occurrence) {
  try {
    await api.put<Occurrence>('/api/occurrences', occurrence)
    await fetchOccurrences()
    closeOccurrenceModal()
  } catch (error) {
    console.error('Error saving occurrence:', error)
  }
}
</script>
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
        <TaskList 
          :tasks="filteredTasks" 
          :categories="categories" 
          :occurrences="occurrences"
          @open-task-modal="openTaskModal"
          @open-occurrence-modal="openOccurrenceModal"
          @delete-task="deleteTask"
        />

        <TaskModal
          v-if="isTaskModalOpen"
          :task="currentTask"
          :categories="categories"
          @save="saveTask"
          @close="closeTaskModal"
        />

        <OccurrenceModal
          v-if="isOccurrenceModalOpen"
          :occurrence="currentOccurrence"
          @save="saveOccurrence"
          @close="closeOccurrenceModal"
        />
      </div>
    </main>
  </div>
</template>

<script setup lang="ts">
definePageMeta({
  layout: 'app',
  middleware: ['auth']
})

import { ref, onMounted, computed, watch } from 'vue'
import { useRoute } from 'vue-router'
import TaskList from '@/components/app/TaskList.vue'
import TaskModal from '@/components/app/TaskModal.vue'
import OccurrenceModal from '@/components/app/OccurrenceModal.vue'
import type { Task, Category, Occurrence } from '@/types/interfaces'

const route = useRoute()
const currentFilter = ref(route.query.filter?.toString() || 'all')
const tasks = ref<Task[]>([])
const categories = ref<Category[]>([])
const occurrences = ref<Occurrence[]>([])
const isTaskModalOpen = ref(false)
const isOccurrenceModalOpen = ref(false)
const currentUserId = 1 // Mock current user ID

// Handle route query changes
watch(() => route.query.filter, (newFilter) => {
  if (newFilter) {
    currentFilter.value = newFilter.toString()
  }
})

const currentTask = ref<Task>({
  id: 0,
  organization_id: 1,
  title: '',
  description: '',
  created_by: 1,
  is_recurring: false,
  recurrence_type: undefined,
  recurrence_interval: undefined,
  last_occurrence: new Date(),
  category_id: undefined,
  notification_settings: undefined,
  created_at: new Date(),
  updated_at: new Date()
})

const currentOccurrence = ref<Occurrence>({
  id: 0,
  task_id: 0,
  status: 'Not Started',
  due_date: new Date(),
  assigned_to: undefined,
  executed_by: undefined,
  completed_at: undefined,
  notes: '',
  is_deleted: false,
  created_at: new Date(),
  updated_at: new Date()
})

const filteredTasks = computed(() => {
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const nextWeek = new Date(today)
  nextWeek.setDate(today.getDate() + 7)

  switch (currentFilter.value) {
    case 'today':
      return tasks.value.filter(task => {
        const occurrenceDueToday = occurrences.value.find(
          occ => occ.task_id === task.id && 
          new Date(occ.due_date).setHours(0, 0, 0, 0) === today.getTime() &&
          occ.status !== 'Completed'
        )
        return occurrenceDueToday !== undefined
      })
    case 'overdue':
      return tasks.value.filter(task => {
        const overdueOccurrence = occurrences.value.find(
          occ => occ.task_id === task.id && 
          new Date(occ.due_date) < today &&
          occ.status !== 'Completed'
        )
        return overdueOccurrence !== undefined
      })
    case 'upcoming':
      return tasks.value.filter(task => {
        const upcomingOccurrence = occurrences.value.find(
          occ => occ.task_id === task.id && 
          new Date(occ.due_date) > today &&
          new Date(occ.due_date) <= nextWeek &&
          occ.status !== 'Completed'
        )
        return upcomingOccurrence !== undefined
      })
    case 'assigned':
      return tasks.value.filter(task => {
        const assignedOccurrence = occurrences.value.find(
          occ => occ.task_id === task.id && 
          occ.assigned_to === currentUserId &&
          occ.status !== 'Completed'
        )
        return assignedOccurrence !== undefined
      })
    default:
      return tasks.value
  }
})

onMounted(async () => {
  await Promise.all([
    fetchTasks(),
    fetchCategories(),
    fetchOccurrences()
  ])
})

async function fetchTasks() {
  try {
    const response = await fetch('/api/tasks')
    tasks.value = await response.json()
  } catch (error) {
    console.error('Error fetching tasks:', error)
  }
}

async function fetchCategories() {
  try {
    const response = await fetch('/api/categories')
    categories.value = await response.json()
  } catch (error) {
    console.error('Error fetching categories:', error)
  }
}

async function fetchOccurrences() {
  try {
    const response = await fetch('/api/occurrences')
    occurrences.value = await response.json()
  } catch (error) {
    console.error('Error fetching occurrences:', error)
  }
}

function openTaskModal(task?: Task) {
  if (task) {
    currentTask.value = { ...task }
  } else {
    currentTask.value = {
      id: 0,
      organization_id: 1,
      title: '',
      description: '',
      created_by: 1,
      is_recurring: false,
      recurrence_type: undefined,
      recurrence_interval: undefined,
      last_occurrence: new Date(),
      category_id: undefined,
      notification_settings: undefined,
      created_at: new Date(),
      updated_at: new Date()
    }
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

async function saveTask(task: Task) {
  try {
    const method = task.id ? 'PUT' : 'POST'
    const response = await fetch('/api/tasks', {
      method,
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(task),
    })

    if (response.ok) {
      await fetchTasks()
      closeTaskModal()
    } else {
      console.error('Error saving task:', await response.text())
    }
  } catch (error) {
    console.error('Error saving task:', error)
  }
}

async function saveOccurrence(occurrence: Occurrence) {
  try {
    const method = occurrence.id ? 'PUT' : 'POST'
    const response = await fetch('/api/occurrences', {
      method,
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(occurrence),
    })

    if (response.ok) {
      await fetchOccurrences()
      closeOccurrenceModal()
    } else {
      console.error('Error saving occurrence:', await response.text())
    }
  } catch (error) {
    console.error('Error saving occurrence:', error)
  }
}

async function deleteTask(id: number) {
  if (confirm('Are you sure you want to delete this task? This will also delete all associated occurrences.')) {
    try {
      const response = await fetch(`/api/tasks?id=${id}`, {
        method: 'DELETE',
      })

      if (response.ok) {
        await Promise.all([
          fetchTasks(),
          fetchOccurrences()
        ])
      } else {
        console.error('Error deleting task:', await response.text())
      }
    } catch (error) {
      console.error('Error deleting task:', error)
    }
  }
}
</script>
// pages/dashboard.vue
<template>
  <div class="min-h-screen bg-gray-100">
    <header class="bg-white shadow">
      <div class="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        <h1 class="text-3xl font-bold text-gray-900">Dashboard</h1>
      </div>
    </header>
    <main>
      <div class="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <!-- Summary Stats -->
        <div class="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4 mb-6">
          <div class="bg-white overflow-hidden shadow rounded-lg">
            <div class="p-5">
              <div class="flex items-center">
                <div class="flex-shrink-0">
                  <ClipboardCheckIcon class="h-6 w-6 text-gray-400" />
                </div>
                <div class="ml-5 w-0 flex-1">
                  <dl>
                    <dt class="text-sm font-medium text-gray-500 truncate">Tasks Due Today</dt>
                    <dd class="flex items-baseline">
                      <div class="text-2xl font-semibold text-gray-900">{{ tasksDueToday.length }}</div>
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
            <div class="bg-gray-50 px-5 py-3">
              <NuxtLink to="/tasks?filter=today" class="text-sm text-indigo-700 hover:text-indigo-900">View all</NuxtLink>
            </div>
          </div>

          <div class="bg-white overflow-hidden shadow rounded-lg">
            <div class="p-5">
              <div class="flex items-center">
                <div class="flex-shrink-0">
                  <AlertCircleIcon class="h-6 w-6 text-red-400" />
                </div>
                <div class="ml-5 w-0 flex-1">
                  <dl>
                    <dt class="text-sm font-medium text-gray-500 truncate">Overdue Tasks</dt>
                    <dd class="flex items-baseline">
                      <div class="text-2xl font-semibold text-gray-900">{{ overdueTasks.length }}</div>
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
            <div class="bg-gray-50 px-5 py-3">
              <NuxtLink to="/tasks?filter=overdue" class="text-sm text-indigo-700 hover:text-indigo-900">View all</NuxtLink>
            </div>
          </div>

          <div class="bg-white overflow-hidden shadow rounded-lg">
            <div class="p-5">
              <div class="flex items-center">
                <div class="flex-shrink-0">
                  <CalendarIcon class="h-6 w-6 text-gray-400" />
                </div>
                <div class="ml-5 w-0 flex-1">
                  <dl>
                    <dt class="text-sm font-medium text-gray-500 truncate">Upcoming Tasks</dt>
                    <dd class="flex items-baseline">
                      <div class="text-2xl font-semibold text-gray-900">{{ upcomingTasks.length }}</div>
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
            <div class="bg-gray-50 px-5 py-3">
              <NuxtLink to="/tasks?filter=upcoming" class="text-sm text-indigo-700 hover:text-indigo-900">View all</NuxtLink>
            </div>
          </div>

          <div class="bg-white overflow-hidden shadow rounded-lg">
            <div class="p-5">
              <div class="flex items-center">
                <div class="flex-shrink-0">
                  <UserIcon class="h-6 w-6 text-gray-400" />
                </div>
                <div class="ml-5 w-0 flex-1">
                  <dl>
                    <dt class="text-sm font-medium text-gray-500 truncate">Assigned to Me</dt>
                    <dd class="flex items-baseline">
                      <div class="text-2xl font-semibold text-gray-900">{{ assignedToMe.length }}</div>
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
            <div class="bg-gray-50 px-5 py-3">
              <NuxtLink to="/tasks?filter=assigned" class="text-sm text-indigo-700 hover:text-indigo-900">View all</NuxtLink>
            </div>
          </div>
        </div>

        <!-- Recent Activity -->
        <div class="grid grid-cols-1 gap-5 lg:grid-cols-2">
          <div class="bg-white overflow-hidden shadow rounded-lg">
            <div class="p-5">
              <h3 class="text-lg leading-6 font-medium text-gray-900 mb-4">Due Today</h3>
              <div class="flow-root">
                <ul class="-my-5 divide-y divide-gray-200">
                  <li v-for="task in tasksDueToday.slice(0, 5)" :key="task.id" class="py-4">
                    <div class="flex items-center space-x-4">
                      <div class="flex-1 min-w-0">
                        <p class="text-sm font-medium text-gray-900 truncate">{{ task.title }}</p>
                        <p class="text-sm text-gray-500 truncate">{{ getCategoryName(task.category_id) }}</p>
                      </div>
                      <div>
                        <NuxtLink :to="`/tasks?id=${task.id}`"
                          class="inline-flex items-center shadow-sm px-2.5 py-0.5 border border-gray-300 text-sm leading-5 font-medium rounded-full text-gray-700 bg-white hover:bg-gray-50">
                          View
                        </NuxtLink>
                      </div>
                    </div>
                  </li>
                </ul>
              </div>
            </div>
          </div>

          <div class="bg-white overflow-hidden shadow rounded-lg">
            <div class="p-5">
              <h3 class="text-lg leading-6 font-medium text-gray-900 mb-4">Recently Updated</h3>
              <div class="flow-root">
                <ul class="-my-5 divide-y divide-gray-200">
                  <li v-for="occurrence in recentOccurrences" :key="occurrence.id" class="py-4">
                    <div class="flex items-center space-x-4">
                      <div class="flex-1 min-w-0">
                        <p class="text-sm font-medium text-gray-900 truncate">
                          {{ getTaskTitle(occurrence.task_id) }}
                        </p>
                        <p class="text-sm text-gray-500">
                          Updated {{ formatDate(occurrence.updated_at?.toString()) }}
                        </p>
                      </div>
                      <div>
                        <span :class="[
                          'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium',
                          occurrence.status === 'Completed' ? 'bg-green-100 text-green-800' :
                            occurrence.status === 'Overdue' ? 'bg-yellow-100 text-yellow-800' :
                              'bg-red-100 text-red-800'
                        ]">
                          {{ occurrence.status }}
                        </span>
                      </div>
                    </div>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  </div>
</template>

<script setup lang="ts">
definePageMeta({
  layout: 'app',
  middleware: ['auth']
})

import { ref, onMounted, computed } from 'vue'
import { ClipboardCheckIcon, AlertCircleIcon, CalendarIcon, UserIcon } from 'lucide-vue-next'
import type { Task, Category, Occurrence } from '@/types/interfaces'

const tasks = ref<Task[]>([])
const categories = ref<Category[]>([])
const occurrences = ref<Occurrence[]>([])

// Mock current user ID
const currentUserId = 1

// Computed properties for task filtering
const tasksDueToday = computed(() => {
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  return tasks.value.filter(task => {
    const occurrenceDueToday = occurrences.value.find(
      occ => occ.task_id === task.id && 
      new Date(occ.due_date).setHours(0, 0, 0, 0) === today.getTime() &&
      occ.status !== 'Completed'
    )
    return occurrenceDueToday !== undefined
  })
})

const overdueTasks = computed(() => {
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  return tasks.value.filter(task => {
    const overdueOccurrence = occurrences.value.find(
      occ => occ.task_id === task.id && 
      new Date(occ.due_date) < today &&
      occ.status !== 'Completed'
    )
    return overdueOccurrence !== undefined
  })
})

const upcomingTasks = computed(() => {
  const today = new Date()
  const nextWeek = new Date(today)
  nextWeek.setDate(today.getDate() + 7)
  
  return tasks.value.filter(task => {
    const upcomingOccurrence = occurrences.value.find(
      occ => occ.task_id === task.id && 
      new Date(occ.due_date) > today &&
      new Date(occ.due_date) <= nextWeek &&
      occ.status !== 'Completed'
    )
    return upcomingOccurrence !== undefined
  })
})

const assignedToMe = computed(() => {
  return tasks.value.filter(task => {
    const assignedOccurrence = occurrences.value.find(
      occ => occ.task_id === task.id && 
      occ.assigned_to === currentUserId &&
      occ.status !== 'Completed'
    )
    return assignedOccurrence !== undefined
  })
})

const recentOccurrences = computed(() => {
  return [...occurrences.value]
    .sort((a, b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime())
    .slice(0, 5)
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

function getCategoryName(categoryId: number | undefined): string {
  if (!categoryId) return 'Uncategorized'
  const category = categories.value.find(c => c.id === categoryId)
  return category ? category.name : 'Unknown'
}

function getTaskTitle(taskId: number): string {
  const task = tasks.value.find(t => t.id === taskId)
  return task ? task.title : 'Unknown Task'
}

function formatDate(dateString: string | undefined): string {
  if (!dateString) return 'N/A'
  const date = new Date(dateString)
  return new Intl.RelativeTimeFormat('en', { numeric: 'auto' }).format(
    Math.ceil((date.getTime() - Date.now()) / (1000 * 60 * 60 * 24)),
    'day'
  )
}
</script>
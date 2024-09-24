<template>
  <div class="min-h-screen bg-gray-100">
    <header class="bg-white shadow">
      <div class="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        <h1 class="text-3xl font-bold text-gray-900">Tasks</h1>
      </div>
    </header>
    <main>
      <div class="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <!-- Task List -->
        <div class="px-4 py-6 sm:px-0">
          <div class="flex justify-between items-center mb-4">
            <h2 class="text-xl font-semibold text-gray-900"></h2>
            <button @click="openTaskModal()"
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
                      <p
                        class="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">
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
                      <button @click="openTaskModal(task)"
                        class="text-indigo-600 hover:text-indigo-900 mr-2">Edit</button>
                      <button @click="deleteTask(task.id)" class="text-red-600 hover:text-red-900">Delete</button>
                    </div>
                  </div>
                </div>
                <!-- Occurrences for this task -->
                <div class="pl-8 pr-4 py-2 bg-gray-50">
                  <h4 class="text-sm font-medium text-gray-700 mb-2">Occurrences:</h4>
                  <ul class="space-y-2">
                    <li v-for="occurrence in getOccurrencesForTask(task.id)" :key="occurrence.id"
                      class="flex items-center justify-between">
                      <span class="text-sm text-gray-600">{{ formatDate(occurrence.due_date?.toString()) }}</span>
                      <span :class="[
                        'px-2 inline-flex text-xs leading-5 font-semibold rounded-full',
                        occurrence.status === 'Completed' ? 'bg-green-100 text-green-800' :
                          occurrence.status === 'In Progress' ? 'bg-yellow-100 text-yellow-800' :
                            'bg-red-100 text-red-800'
                      ]">
                        {{ occurrence.status }}
                      </span>
                      <button @click="openOccurrenceModal(occurrence)"
                        class="text-indigo-600 hover:text-indigo-900 text-sm">Update</button>
                    </li>
                  </ul>
                </div>
              </li>
            </ul>
          </div>
        </div>

        <!-- Task Modal -->
        <div v-if="isTaskModalOpen" class="fixed z-10 inset-0 overflow-y-auto" aria-labelledby="modal-title"
          role="dialog" aria-modal="true">
          <div class="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div class="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" aria-hidden="true"></div>
            <span class="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>
            <div
              class="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
              <form @submit.prevent="saveTask">
                <div class="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                  <div class="mb-4">
                    <label for="title" class="block text-sm font-medium text-gray-700">Title</label>
                    <input type="text" name="title" id="title" v-model="currentTask.title"
                      class="mt-1 focus:ring-indigo-500 focus:border-indigo-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md">
                  </div>
                  <div class="mb-4">
                    <label for="description" class="block text-sm font-medium text-gray-700">Description</label>
                    <textarea name="description" id="description" v-model="currentTask.description" rows="3"
                      class="mt-1 focus:ring-indigo-500 focus:border-indigo-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"></textarea>
                  </div>
                  <div class="mb-4">
                    <label for="last_occurrence" class="block text-sm font-medium text-gray-700">Last Occurrence</label>
                    <input type="date" name="last_occurrence" id="last_occurrence" v-model="currentTask.last_occurrence"
                      class="mt-1 focus:ring-indigo-500 focus:border-indigo-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md">
                  </div>
                  <div class="mb-4">
                    <label for="category_id" class="block text-sm font-medium text-gray-700">Category</label>
                    <select name="category_id" id="category_id" v-model="currentTask.category_id"
                      class="mt-1 block w-full py-2 px-3 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm">
                      <option v-for="category in categories" :key="category.id" :value="category.id">{{ category.name }}
                      </option>
                    </select>
                  </div>
                  <div class="mb-4">
                    <label for="is_recurring" class="block text-sm font-medium text-gray-700">Recurring</label>
                    <input type="checkbox" name="is_recurring" id="is_recurring" v-model="currentTask.is_recurring"
                      class="mt-1 focus:ring-indigo-500 h-4 w-4 text-indigo-600 border-gray-300 rounded">
                  </div>
                  <div v-if="currentTask.is_recurring" class="mb-4">
                    <label for="recurrence_type" class="block text-sm font-medium text-gray-700">Recurrence Type</label>
                    <select name="recurrence_type" id="recurrence_type" v-model="currentTask.recurrence_type"
                      class="mt-1 block w-full py-2 px-3 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm">
                      <option value="Fixed">Fixed</option>
                      <option value="Variable">Variable</option>
                    </select>
                  </div>
                  <div v-if="currentTask.is_recurring" class="mb-4">
                    <label for="recurrence_interval" class="block text-sm font-medium text-gray-700">Recurrence
                      Interval</label>
                    <input type="text" name="recurrence_interval" id="recurrence_interval"
                      v-model="currentTask.recurrence_interval"
                      class="mt-1 focus:ring-indigo-500 focus:border-indigo-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
                      placeholder="e.g., 7 days, 2 weeks, 1 month">
                  </div>
                </div>
                <div class="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                  <button type="submit"
                    class="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-blue-600 text-base font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:ml-3 sm:w-auto sm:text-sm">
                    Save
                  </button>
                  <button type="button" @click="closeTaskModal"
                    class="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm">
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>

        <!-- Occurrence Modal -->
        <div v-if="isOccurrenceModalOpen" class="fixed z-10 inset-0 overflow-y-auto" aria-labelledby="modal-title"
          role="dialog" aria-modal="true">
          <div class="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div class="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" aria-hidden="true"></div>
            <span class="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>
            <div
              class="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
              <form @submit.prevent="saveOccurrence">
                <div class="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                  <div class="mb-4">
                    <label for="due_date" class="block text-sm font-medium text-gray-700">Due Date</label>
                    <input type="date" name="due_date" id="due_date" v-model="currentOccurrence.due_date"
                      class="mt-1 focus:ring-indigo-500 focus:border-indigo-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md">
                  </div>
                  <div class="mb-4">
                    <label for="status" class="block text-sm font-medium text-gray-700">Status</label>
                    <select name="status" id="status" v-model="currentOccurrence.status"
                      class="mt-1 block w-full py-2 px-3 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm">
                      <option value="Not Started">Not Started</option>
                      <option value="In Progress">In Progress</option>
                      <option value="Completed">Completed</option>
                      <option value="On Hold">On Hold</option>
                    </select>
                  </div>
                </div>
                <div class="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                  <button type="submit"
                    class="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-blue-600 text-base font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:ml-3 sm:w-auto sm:text-sm">
                    Save
                  </button>
                  <button type="button" @click="closeOccurrenceModal"
                    class="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm">
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </main>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { CalendarIcon, FolderIcon } from 'lucide-vue-next'
import type { Task, Category, Occurrence } from '@/types/interfaces'

const tasks = ref<Task[]>([])
const categories = ref<Category[]>([])
const occurrences = ref<Occurrence[]>([])
const isTaskModalOpen = ref(false)
const isOccurrenceModalOpen = ref(false)
const currentTask = ref<Task>({
  id: 0,
  organization_id: 1, // Assuming a default organization_id
  title: '',
  description: '',
  created_by: 1, // Assuming a default user_id
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
  is_deleted: false,
  created_at: new Date(),
  updated_at: new Date()
})

onMounted(async () => {
  await fetchTasks()
  await fetchCategories()
  await fetchOccurrences()
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

function getOccurrencesForTask(taskId: number): Occurrence[] {
  return occurrences.value.filter(occurrence => occurrence.task_id === taskId)
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

async function saveTask() {
  try {
    const method = currentTask.value.id ? 'PUT' : 'POST'
    const response = await fetch('/api/tasks', {
      method,
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(currentTask.value),
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

async function saveOccurrence() {
  try {
    const method = currentOccurrence.value.id ? 'PUT' : 'POST'
    const response = await fetch('/api/occurrences', {
      method,
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(currentOccurrence.value),
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
        await fetchTasks()
        await fetchOccurrences()
      } else {
        console.error('Error deleting task:', await response.text())
      }
    } catch (error) {
      console.error('Error deleting task:', error)
    }
  }
}

function formatDate(dateString: string | undefined): string {
  return dateString ? new Date(dateString).toLocaleDateString() : 'N/A'
}

function getCategoryName(categoryId: number | undefined): string {
  if (!categoryId) return 'Uncategorized'
  const category = categories.value.find(c => c.id === categoryId)
  return category ? category.name : 'Unknown'
}
</script>
<template>
  <div class="min-h-screen bg-gray-100 p-4 sm:p-6 lg:p-8">
    <div class="max-w-4xl mx-auto bg-white rounded-xl shadow-md overflow-hidden">
      <div class="p-6 sm:p-8">
        <h1 class="text-3xl font-bold text-gray-900 mb-6">Adulting.diy Task Manager</h1>
        
        <!-- Task Input Form -->
        <form @submit.prevent="addTask" class="mb-8">
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <input
              v-model="newTask.title"
              type="text"
              placeholder="Task title"
              class="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
            <select
              v-model="newTask.category"
              class="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Select category</option>
              <option v-for="category in categories" :key="category" :value="category">
                {{ category }}
              </option>
            </select>
            <div class="flex items-center">
              <input
                v-model="newTask.isRecurring"
                type="checkbox"
                id="isRecurring"
                class="mr-2"
              />
              <label for="isRecurring">Recurring task</label>
            </div>
            <input
              v-if="newTask.isRecurring"
              v-model="newTask.recurrencePattern"
              type="text"
              placeholder="Recurrence pattern (e.g., 'daily', 'weekly')"
              class="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <button
            type="submit"
            class="mt-4 px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          >
            Add Task
          </button>
        </form>
        
        <!-- Task List -->
        <div v-if="tasks.length > 0">
          <h2 class="text-2xl font-semibold text-gray-900 mb-4">Tasks</h2>
          <ul class="space-y-4">
            <li
              v-for="task in tasks"
              :key="task.id"
              class="bg-gray-50 rounded-lg p-4 flex items-center justify-between transition duration-300 ease-in-out hover:bg-gray-100"
            >
              <div>
                <h3 class="text-lg font-medium text-gray-900">{{ task.title }}</h3>
                <p class="text-sm text-gray-600">
                  Category: {{ task.category || 'Uncategorized' }}
                  <span v-if="task.isRecurring" class="ml-2">
                    (Recurring: {{ task.recurrencePattern }})
                  </span>
                </p>
              </div>
              <button
                @click="removeTask(task.id)"
                class="text-red-600 hover:text-red-800 focus:outline-none"
              >
                <TrashIcon class="h-5 w-5" />
              </button>
            </li>
          </ul>
        </div>
        <div v-else class="text-center py-8">
          <p class="text-gray-600 text-lg">No tasks yet. Add a task to get started!</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { TrashIcon } from 'lucide-vue-next'

interface Task {
  id: number
  title: string
  category: string
  isRecurring: boolean
  recurrencePattern?: string
}

const tasks = ref<Task[]>([])
const categories = ['Work', 'Personal', 'Health', 'Finance']

const newTask = ref<Task>({
  id: 0,
  title: '',
  category: '',
  isRecurring: false,
  recurrencePattern: ''
})

const addTask = () => {
  if (newTask.value.title.trim()) {
    tasks.value.push({
      ...newTask.value,
      id: Date.now()
    })
    newTask.value = {
      id: 0,
      title: '',
      category: '',
      isRecurring: false,
      recurrencePattern: ''
    }
  }
}

const removeTask = (id: number) => {
  tasks.value = tasks.value.filter(task => task.id !== id)
}
</script>
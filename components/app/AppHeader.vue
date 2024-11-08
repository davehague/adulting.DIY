// components/app/AppHeader.vue
<template>
  <nav class="bg-white border-b border-gray-200">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div class="flex justify-between h-16">
        <div class="flex">
          <!-- Logo -->
          <div class="flex-shrink-0 flex items-center">
            <NuxtLink to="/dashboard" class="text-2xl font-bold text-gray-800">
              Adulting.diy
            </NuxtLink>
          </div>
          <!-- Navigation Links -->
          <div class="hidden sm:ml-6 sm:flex sm:space-x-8">
            <NuxtLink to="/dashboard"
              class="border-indigo-500 text-gray-900 inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium"
              :class="{ 'border-indigo-500': route.path === '/dashboard', 'border-transparent': route.path !== '/dashboard' }">
              Dashboard
            </NuxtLink>
            <NuxtLink to="/tasks"
              class="border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700 inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium"
              :class="{ 'border-indigo-500': route.path === '/categories', 'border-transparent': route.path !== '/categories' }">
              Tasks
            </NuxtLink>
            <NuxtLink to="/occurrences"
              class="border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700 inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium"
              :class="{ 'border-indigo-500': route.path === '/categories', 'border-transparent': route.path !== '/categories' }">
              Occurrences
            </NuxtLink>
          </div>
        </div>

        <!-- Right side -->
        <div class="flex items-center">
          <div class="ml-3 relative">
            <div class="flex items-center">
              <span class="text-sm text-gray-700 mr-2">{{ authStore.user?.name }}</span>
              <button @click="isUserMenuOpen = !isUserMenuOpen" type="button"
                class="max-w-xs bg-white flex items-center text-sm rounded-full focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                id="user-menu-button">
                <span class="sr-only">Open user menu</span>
                <img class="h-8 w-8 rounded-full" src="/public/profile.png" alt="User profile">
              </button>
            </div>

            <!-- Dropdown menu -->
            <div v-if="isUserMenuOpen"
              class="origin-top-right absolute right-0 mt-2 w-48 rounded-md shadow-lg py-1 bg-white ring-1 ring-black ring-opacity-5 focus:outline-none"
              role="menu">
              <a href="#" class="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100" role="menuitem">Your
                Profile</a>
              <a href="#" class="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100" role="menuitem">Settings</a>
              <button @click="handleLogout"
                class="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">Sign out</button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Mobile menu -->
    <div class="sm:hidden">
      <div class="pt-2 pb-3 space-y-1">
        <NuxtLink to="/dashboard" class="block pl-3 pr-4 py-2 border-l-4 text-base font-medium" :class="[
          route.path === '/dashboard'
            ? 'bg-indigo-50 border-indigo-500 text-indigo-700'
            : 'border-transparent text-gray-600 hover:bg-gray-50 hover:border-gray-300 hover:text-gray-800'
        ]">
          Dashboard
        </NuxtLink>
        <NuxtLink to="/tasks" class="block pl-3 pr-4 py-2 border-l-4 text-base font-medium" :class="[
          route.path === '/tasks'
            ? 'bg-indigo-50 border-indigo-500 text-indigo-700'
            : 'border-transparent text-gray-600 hover:bg-gray-50 hover:border-gray-300 hover:text-gray-800'
        ]">
          Tasks
        </NuxtLink>
        <NuxtLink to="/occurrences" class="block pl-3 pr-4 py-2 border-l-4 text-base font-medium" :class="[
          route.path === '/occurrences'
            ? 'bg-indigo-50 border-indigo-500 text-indigo-700'
            : 'border-transparent text-gray-600 hover:bg-gray-50 hover:border-gray-300 hover:text-gray-800'
        ]">
          Occurrences
        </NuxtLink>
      </div>
    </div>
  </nav>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useAuthStore } from '@/stores/auth'
import { useRoute, useRouter } from 'vue-router'

const route = useRoute()
const router = useRouter()
const authStore = useAuthStore()
const isUserMenuOpen = ref(false)

const handleLogout = async () => {
  authStore.logout()
  await router.push('/login')
}
</script>
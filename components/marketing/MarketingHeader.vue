<template>
  <nav class="container mx-auto px-6 py-4">
    <div class="flex justify-between items-center">
      <a href="#" class="text-2xl font-bold">Adulting.diy</a>
      <div class="hidden md:flex space-x-6">
        <a v-for="item in navItems" :key="item.id" :href="`#${item.id}`" class="hover:text-blue-400 transition duration-300">{{ item.text }}</a>
      </div>
      <NuxtLink to="/login" class="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition duration-300">Login</NuxtLink>
      <button @click="toggleMobileMenu" class="md:hidden focus:outline-none">
        <MenuIcon v-if="!isMobileMenuOpen" class="h-6 w-6" />
        <XIcon v-else class="h-6 w-6" />
      </button>
    </div>
    <!-- Mobile Menu -->
    <div v-if="isMobileMenuOpen" class="md:hidden mt-4 space-y-2">
      <a v-for="item in navItems" :key="item.id" :href="`#${item.id}`" class="block hover:text-blue-400 transition duration-300">{{ item.text }}</a>
      <div v-if="isAuthenticated" class="flex items-center space-x-4 mt-4">
        <img :src="user?.picture" alt="Profile" class="w-8 h-8 rounded-full">
        <span>{{ user?.name }}</span>
        <button @click="logout" class="text-red-500 hover:text-red-700">Logout</button>
      </div>
      <NuxtLink v-else to="/login" class="block text-blue-500 hover:text-blue-700 mt-4">Login</NuxtLink>
    </div>
  </nav>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { MenuIcon, XIcon } from 'lucide-vue-next'
import { useAuthStore } from '~/stores/auth'
import { storeToRefs } from 'pinia'
import { useRouter } from 'vue-router'

const authStore = useAuthStore()
const { user, isAuthenticated } = storeToRefs(authStore)
const router = useRouter()

const isMobileMenuOpen = ref(false)
const toggleMobileMenu = () => {
  isMobileMenuOpen.value = !isMobileMenuOpen.value
}

const logout = () => {
  authStore.logout()
  router.push('/login')
}

const navItems = [
  { id: 'features', text: 'Features' },
  { id: 'how-it-works', text: 'How It Works' },
  { id: 'testimonials', text: 'Testimonials' }
]

onMounted(() => {
  console.log("AuthStore user: ", authStore.user)
})
</script>
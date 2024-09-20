<template>
  <nav class="container mx-auto px-6 py-4">
    <div class="flex justify-between items-center">
      <a href="#" class="text-2xl font-bold">Adulting.diy</a>
      <div class="hidden md:flex space-x-6">
        <a v-for="item in navItems" :key="item.id" :href="`#${item.id}`" class="hover:text-blue-400 transition duration-300">{{ item.text }}</a>
      </div>
      <button @click="toggleMobileMenu" class="md:hidden focus:outline-none">
        <MenuIcon v-if="!isMobileMenuOpen" class="h-6 w-6" />
        <XIcon v-else class="h-6 w-6" />
      </button>
    </div>
    <!-- Mobile Menu -->
    <div v-if="isMobileMenuOpen" class="md:hidden mt-4 space-y-2">
      <a v-for="item in navItems" :key="item.id" :href="`#${item.id}`" class="block hover:text-blue-400 transition duration-300">{{ item.text }}</a>
    </div>
  </nav>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { MenuIcon, XIcon } from 'lucide-vue-next'

const isMobileMenuOpen = ref(false)
const toggleMobileMenu = () => {
  isMobileMenuOpen.value = !isMobileMenuOpen.value
}

const navItems = [
  { id: 'features', text: 'Features' },
  { id: 'how-it-works', text: 'How It Works' },
  { id: 'testimonials', text: 'Testimonials' }
]
</script>
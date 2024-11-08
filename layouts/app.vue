<template>
  <div class="app-layout">
    <AppHeader />
    <slot />
    <AppFooter />
  </div>
</template>

<script setup>
import AppHeader from '~/components/app/AppHeader.vue'
import AppFooter from '~/components/app/AppFooter.vue'

// Check auth status when app layout is mounted
onMounted(() => {
  const authStore = useAuthStore()
  if (!authStore.isAuthenticated) {
    navigateTo('/login')
  }
})
</script>
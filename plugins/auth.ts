export default defineNuxtPlugin(() => {
    const authStore = useAuthStore()
  
    return {
      provide: {
        auth: {
          isAuthenticated: () => authStore.isAuthenticated,
          user: () => authStore.user
        }
      }
    }
  })
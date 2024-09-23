// middleware/auth.ts

export default defineNuxtRouteMiddleware((to) => {
  const authStore = useAuthStore();

  // List of routes that don't require authentication
  const publicRoutes = ["/", "/login"];

  if (publicRoutes.includes(to.path)) {
    return;
  }

  if (!authStore.isAuthenticated && !publicRoutes.includes(to.path)) {
    // Redirect to login page
    return navigateTo("/login");
  }
});

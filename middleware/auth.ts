// middleware/auth.ts
import { useAuthStore } from "~/stores/authStore";

export default defineNuxtRouteMiddleware((to) => {
  const authStore = useAuthStore();
  const publicRoutes = ["/", "/login"];

  if (!authStore.isAuthenticated && !publicRoutes.includes(to.path)) {
    return navigateTo("/login");
  }
});

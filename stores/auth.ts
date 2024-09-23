import { defineStore } from "pinia";
import { type User } from "@/types/interfaces";

export const useAuthStore = defineStore("auth", {
  state: () => ({
    user: null as User | null,
    accessToken: null as string | null,
  }),
  getters: {
    isAuthenticated: (state) => !!state.accessToken,
  },
  actions: {
    setUser(user: User) {
      this.user = user;
    },
    setAccessToken(token: string) {
      this.accessToken = token;
    },
    async login(email: string, password: string) {
      try {
        const response = await fetch("/api/auth/login", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email, password }),
        });
        const data = await response.json();
        if (data.success) {
          this.setAccessToken(data.token);
          // You might want to fetch user details here and set the user
        }
        return data;
      } catch (error) {
        console.error("Login error:", error);
        return { success: false, message: "An error occurred during login" };
      }
    },
    async register(
      name: string,
      email: string,
      password: string,
      organizationName: string
    ) {
      try {
        const response = await fetch("/api/auth/register", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ name, email, password, organizationName }),
        });
        return await response.json();
      } catch (error) {
        console.error("Registration error:", error);
        return {
          success: false,
          message: "An error occurred during registration",
        };
      }
    },
    logout() {
      this.user = null;
      this.accessToken = null;
    },
  },
});

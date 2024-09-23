// stores/auth.ts
import { defineStore } from "pinia";

interface User {
  name: string;
  email: string;
  picture: string;
}

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
    logout() {
      this.user = null;
      this.accessToken = null;
    },
  },
});

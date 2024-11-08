<template>
  <div class="flex justify-center items-center h-screen bg-gray-100">
    <div class="bg-white p-8 rounded-lg shadow-md">
      <h1 class="text-2xl font-bold mb-4 text-center">Welcome to Adulting.DIY</h1>
      <p class="mb-6 text-center text-gray-600">Sign in to access your account</p>
      <GoogleSignInButton @success="handleLoginSuccess" @error="handleLoginError" class="w-full"></GoogleSignInButton>
    </div>
  </div>
</template>

<script setup lang="ts">
import { GoogleSignInButton, type CredentialResponse } from "vue3-google-signin";
import { useAuthStore } from '@/stores/auth';
import { useRouter } from 'vue-router';

const authStore = useAuthStore();
const router = useRouter();

const handleLoginSuccess = async (response: CredentialResponse) => {
  const { credential } = response;

  if (!credential) {
    console.error("No credential found");
    return;
  }

  // Decode the JWT to get user information
  const payload = JSON.parse(atob(credential.split('.')[1]));

  try {
    // Fetch or create user data from your API using the information from Google auth
    const userResponse = await fetch(`/api/users?email=${encodeURIComponent(payload.email)}&name=${encodeURIComponent(payload.name)}&picture=${encodeURIComponent(payload.picture)}`);

    if (!userResponse.ok) {
      throw new Error('Failed to fetch or create user data');
    }

    const userData = await userResponse.json();

    // Set user and token in the store
    authStore.setUser(userData);
    authStore.setAccessToken(credential);

    // Navigate to dashboard page
    router.push('/dashboard');
  } catch (error) {
    console.error("Failed to fetch or create user data", error);
    // You might want to show an error message to the user here
  }
};

// handle an error event
const handleLoginError = () => {
  console.error("Login failed");
  // You might want to show an error message to the user here
};
</script>
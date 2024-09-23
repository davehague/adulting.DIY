<template>
  <div class="flex justify-center items-center h-screen bg-gray-100">
    <div class="bg-white p-8 rounded-lg shadow-md">
      <h1 class="text-2xl font-bold mb-4 text-center">Welcome to Adulting.DIY</h1>
      <p class="mb-6 text-center text-gray-600">Sign in to access your account</p>
      <GoogleSignInButton
        @success="handleLoginSuccess"
        @error="handleLoginError"
        class="w-full"
      ></GoogleSignInButton>
    </div>
  </div>
</template>

<script setup lang="ts">
import { GoogleSignInButton, type CredentialResponse } from "vue3-google-signin";
import { useAuthStore } from '~/stores/auth';
import { useRouter } from 'vue-router';

const authStore = useAuthStore();
const router = useRouter();

const handleLoginSuccess = (response: CredentialResponse) => {
  const { credential } = response;
  console.log("Access Token", credential);

  if (!credential) {
    console.error("No credential found");
    return;
  }
  
  // Decode the JWT to get user information
  const payload = JSON.parse(atob(credential.split('.')[1]));
  console.log("User", payload);

  // Set user and token in the store
  authStore.setUser({
    name: payload.name,
    email: payload.email,
    picture: payload.picture,
  });
  authStore.setAccessToken(credential);
  
  // Navigate to home page
  router.push('/home');
};

// handle an error event
const handleLoginError = () => {
  console.error("Login failed");
  // You might want to show an error message to the user here
};
</script>
<template>
  <footer class="bg-white border-t border-gray-200">
    <div class="max-w-7xl mx-auto py-4 px-4 sm:px-6 lg:px-8">
      <div class="flex justify-between items-center">
        <div class="text-sm text-gray-500">
          &copy; {{ new Date().getFullYear() }} TaskTracker. All rights reserved.
        </div>
        <div class="flex space-x-6">
          <a href="#" class="text-gray-400 hover:text-gray-500">
            Help
          </a>
          <a href="#" class="text-gray-400 hover:text-gray-500">
            Privacy
          </a>
          <a href="#" class="text-gray-400 hover:text-gray-500">
            Terms
          </a>
        </div>
      </div>
    </div>
  </footer>
</template>

<script setup lang="ts">
</script>
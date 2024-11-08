// layouts/marketing.vue
<template>
  <div class="marketing-layout">
    <MarketingHeader />
    <main class="min-h-screen">
      <slot />
    </main>
    <MarketingFooter />
  </div>
</template>

<script setup>
import MarketingHeader from '~/components/marketing/MarketingHeader.vue'
import MarketingFooter from '~/components/marketing/MarketingFooter.vue'
</script>

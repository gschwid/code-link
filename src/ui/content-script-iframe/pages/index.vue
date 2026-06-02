<script setup lang="ts">
function test() {
  console.info("getting user data");
}
</script>

<template>
  <div>
    <h1 class="text-center">Detected Linkedin Profile</h1>
    <div class="text-center">
      <UButton size="xl" @click="test">Compare Profile</UButton>
    </div>
  </div>
</template>

<script setup lang="ts"></script>

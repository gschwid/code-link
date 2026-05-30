<script setup lang="ts"></script>

<template>
  <div>
    <div class="hero">
      <div class="hero-content text-center">
        <div class="max-w-md">
          <h1>Code Link</h1>
          <p>
            Navigate to linkedin to use the extension!
          </p>

          <div class="flex gap-2 justify-center mb-4">
            <UButton
              to="/common/features"
              icon="ph:list-heart"
              variant="subtle"
            >
              Features
            </UButton>
            <UButton
              to="/common/pricing"
              icon="ph:presentation-chart"
              variant="subtle"
            >
              Features
            </UButton>
          </div>

          <UButton
            to="/common/account/login"
            icon="ph:rocket-launch"
            size="xl"
          >
            Get Started Now
          </UButton>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped></style>

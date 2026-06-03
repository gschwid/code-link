<script setup lang="ts">
async function initiateParsing() {
  console.info("calling content script");
  let queryOptions = { active: true, currentWindow: true };
  let [tab] = await chrome.tabs.query(queryOptions);
  if (tab && tab.id) {
     browser.tabs.sendMessage(tab.id, { action: "parseLinkedinProfile" });
  }
  else {
    console.error("No active tab found");
  }
}

</script>

<template>
  <div>
    <h1 class="text-center">Detected Linkedin Profile</h1>
    <div class="text-center">
      <UButton size="xl" 
      @click="initiateParsing">
      Compare Profile</UButton>
    </div>
  </div>
</template>

<script setup lang="ts"></script>

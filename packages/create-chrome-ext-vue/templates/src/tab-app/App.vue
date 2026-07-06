<template>
  <div class="app-container">
    <router-view />
  </div>
</template>

<script setup lang="ts"></script>

<style lang="scss">
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

#app {
  font-size: 14px;
}

.app-container {
  width: 100%;
  min-height: 100vh;
}

body {
  margin: 0;
  padding: 0;
  background: var(--bg-primary);
  color: var(--text-primary);
  transition: background-color 0.2s ease, color 0.2s ease;
}
</style>

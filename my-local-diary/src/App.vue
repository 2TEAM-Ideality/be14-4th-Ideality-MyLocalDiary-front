<template>
  <h1>Health Check</h1>
  <button @click="healthCheck">건강하니?</button>
  <h3>{{ health }}</h3>
</template>

<script setup>
  import { ref} from 'vue';

  const health=ref("chcking....");

  const healthCheck=async()=>{
    const response=await fetch('http://localhost:8080/');
    const text=await response.text();
    health.value=text;
  }
  
</script>


<style scoped>
</style>
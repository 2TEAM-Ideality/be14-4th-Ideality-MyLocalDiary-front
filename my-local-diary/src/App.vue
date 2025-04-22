<template>
  <h1>Health Check</h1>
  <button @click="mybatisTest">Mybatis Test</button><br>
  <h3>{{ health }}</h3>
  <hr>
  <input type="text" v-model="inputValue" placeholder="값을 입력하세요" />
  <button @click="jpaTest">JPA Test</button><br>
  <h3>{{ jpaHealth }}</h3>
  
</template>

<script setup>
  import { ref} from 'vue';

  const health=ref("checking....");
  const jpaHealth=ref("waiting for input...");
  const inputValue=ref("");

  const mybatisTest=async()=>{
    const response=await fetch('http://localhost:8080/');
    const text=await response.text();
    health.value=text;
  }

  const jpaTest=async ()=>{
    const response=await fetch('http://localhost:8080/update',{
      method: 'PUT',
      headers:{
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({value:inputValue.value})
    });

    const data=await response.text();
    jpaHealth.value=data;
  }
  
</script>


<style scoped>
</style>
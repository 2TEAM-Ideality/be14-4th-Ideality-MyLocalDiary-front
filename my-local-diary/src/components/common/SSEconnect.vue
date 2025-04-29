<template>
    <div></div> <!-- UI 요소는 없어도 됨 -->
  </template>
  
  <script setup>
  import { onMounted, onBeforeUnmount } from 'vue';
  
  let eventSource = null;
  
  onMounted(() => {
    const token = 'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzUxMiJ9.eyJzdWIiOiIxIiwiZW1haWwiOiJ0ZXN0QGVtYWlsLmNvbSIsInJvbGUiOiJVU0VSIiwiaWF0IjoxNzQ1ODkzODQ3LCJleHAiOjE3NDU5MzcwNDd9.NFobldMYwGB7Lm6R85hKpF61GsbomgtSNasnTcaikJjw7zhrXLiZ337WRgNYUWMpYv6XM97tB4RytKkMtCvI2Q'; // 🔥 토큰 복붙하기
  
    
const eventSource = new EventSource(`http://localhost:8080/api/follow/stream?token=${token}`);
  
    eventSource.addEventListener('connect', (event) => {
      console.log('✅ SSE 연결 성공:', event.data);
    });
  
    eventSource.addEventListener('follow', (event) => {
      console.log('🔔 팔로우 알림 도착:', event.data);
      // 여기서 알림을 UI로 띄워줄 수도 있음!
    });
  
    eventSource.onerror = (error) => {
      console.error('❌ SSE 연결 에러:', error);
      eventSource.close();
    };
  });
  
  onBeforeUnmount(() => {
    if (eventSource) {
      eventSource.close();
      console.log('SSE 연결 종료');
    }
  });
  </script>
  
  <style scoped>
  /* 스타일은 필요 없으면 비워두자 */
  </style>
  
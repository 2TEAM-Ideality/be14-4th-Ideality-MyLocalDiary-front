<template>
    <div class="min-h-screen bg-black text-white flex items-center justify-center">
      <div class="flex flex-col md:flex-row w-full max-w-4xl p-4">
        <!-- Left side: Logo and Title -->
<div class="flex-1 flex flex-col items-center justify-center mb-8 md:mb-0">
  <div class="text-4xl font-bold mb-2 text-center">My local<br />Diary</div>
  <div class="mt-4">
    <img src="@/assets/My_Local_Diary_Black.png" alt="logo" class="w-24 h-24" />
  </div>
</div>

  
        <!-- Right side: Login form -->
        <div class="flex-1 bg-[#111] p-8 rounded-lg shadow-md">
          <div class="flex justify-center text-4xl mb-6">🐟</div> <!-- 붕어빵 아이콘 이모지로 대체 -->
  
          <input
            type="text"
            placeholder="아이디 / 이메일"
            class="w-full mb-4 p-3 rounded bg-gray-800 placeholder-gray-400 text-white focus:outline-none"
          />
          <input
            type="password"
            placeholder="비밀번호"
            class="w-full mb-4 p-3 rounded bg-gray-800 placeholder-gray-400 text-white focus:outline-none"
          />
          <button
            class="w-full bg-white text-black font-semibold py-2 rounded hover:bg-gray-200 transition"
          >
            로그인
          </button>
  
          <div class="flex items-center my-6">
            <div class="flex-grow border-t border-gray-600"></div>
            <span class="mx-4 text-gray-400">또는</span>
            <div class="flex-grow border-t border-gray-600"></div>
          </div>
  
          <button
            class="w-full flex items-center justify-center gap-2 bg-yellow-400 text-black font-semibold py-2 rounded hover:bg-yellow-300 transition"
          >
            <img src="https://upload.wikimedia.org/wikipedia/commons/e/e3/KakaoTalk_logo.svg" class="w-6 h-6" />
            카카오로 로그인
          </button>
  
          <div class="mt-6 text-center text-sm text-gray-400">
            아직 계정이 없으신가요?
            <a href="#" class="text-white font-bold ml-1">회원가입 하기</a>
          </div>
        </div>
      </div>
    </div>
  </template>
  
  <script setup>
  // No additional logic yet
  </script>
  
  <style scoped>
  </style>
  
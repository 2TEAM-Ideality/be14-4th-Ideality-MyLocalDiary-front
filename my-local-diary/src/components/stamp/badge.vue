<template>
    <div class="badge-wrapper">
      <div class="title-wrapper">
        <h2 class="badge-title">나는 어떤 유형의 집사일까?</h2>
        <div class="tooltip-wrapper">
          <span class="tooltip-text">* 나의 유형은?</span>
          <div class="tooltip-box">
            스탬프 5개를 모으면 해당하는 뱃지를 얻을 수 있습니다! <br>뱃지를 모아 내가 어떤 유형인지 알아보세요.
          </div>
        </div>
      </div>
  
      <div class="badge-list">
        <div
          v-for="(badge, index) in badges"
          :key="index"
          class="badge-item"
          @click="playRandomMeow"
        >
          <img :src="getBadgeImage(badge)" alt="badge" />
        </div>
      </div>
    </div>
  </template>
  
  <script setup>
  import { ref, onMounted } from 'vue';
  import { useUserStore } from '/src/stores/userStore';
  
  const userStore = useUserStore();
  const badges = ref([]);
  
  const catSounds = [
    'https://prismatic-sunshine-3445cc.netlify.app/cats/cat1.mp3',
    'https://prismatic-sunshine-3445cc.netlify.app/cats/cat2.wav',
    'https://prismatic-sunshine-3445cc.netlify.app/cats/cat3.mp3',
    'https://prismatic-sunshine-3445cc.netlify.app/cats/cat4.mp3',
    'https://prismatic-sunshine-3445cc.netlify.app/cats/cat5.mp3',
    'https://prismatic-sunshine-3445cc.netlify.app/cats/cat6.mp3',
    'https://prismatic-sunshine-3445cc.netlify.app/cats/cat7.mp3',
    'https://prismatic-sunshine-3445cc.netlify.app/cats/cat8.mp3',
    'https://prismatic-sunshine-3445cc.netlify.app/cats/cat9.mp3',
    'https://prismatic-sunshine-3445cc.netlify.app/cats/cat10.wav',
  ];
  
  const playRandomMeow = () => {
    const randomIndex = Math.floor(Math.random() * catSounds.length);
    const audio = new Audio(catSounds[randomIndex]);
    audio.volume = 0.8; // (선택) 소리 약간 부드럽게
    audio.play();
  };
  
  const getBadgeImage = (name) => {
    return `/src/assets/badge/${name}뱃지.png`; 
  };
  
  const fetchBadges = async () => {
    try {
      const pageMemberId = Number(userStore.id);
      const res = await fetch(`http://localhost:8080/api/badge?memberId=${pageMemberId}`);
      badges.value = await res.json();
    } catch (error) {
      console.error('❌ 뱃지 불러오기 실패:', error);
    }
  };
  
  onMounted(async () => {
    await userStore.restoreUser();
    await fetchBadges();
  });
  </script>
  
  <style scoped>
  .badge-wrapper {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 6px;
  }
  
  .title-wrapper {
    display: flex;
    align-items: center;
    gap: 8px;
  }
  
  .badge-title {
    font-size: 18px;
    font-weight: 600;
    margin: 0;
  }
  
  .tooltip-wrapper {
    position: relative;
    cursor: pointer;
  }
  
  .tooltip-text {
    font-size: 12px;
    color: #aaa;
  }
  
  .tooltip-box {
    position: absolute;
    top: 24px;
    left: 50%;
    transform: translateX(-50%);
    padding: 6px 10px;
    background-color: #333;
    color: #fff;
    font-size: 12px;
    border-radius: 6px;
    white-space: nowrap;
    opacity: 0;
    pointer-events: none;
    transition: opacity 0.3s ease;
    z-index: 10;
  }
  
  .tooltip-wrapper:hover .tooltip-box {
    opacity: 1;
  }
  
  .badge-list {
    display: flex;
    flex-wrap: wrap;
    justify-content: center;
    gap: 12px;
    max-width: 700px;
  }
  
  .badge-item img {
    width: auto;
    height: 250px;
    object-fit: cover;
    transition: transform 0.3s ease;
    cursor: pointer;
  }
  
  .badge-item img:hover {
    transform: scale(1.2);
  }
  </style>
  
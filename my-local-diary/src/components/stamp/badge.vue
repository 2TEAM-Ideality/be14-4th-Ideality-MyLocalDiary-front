<template>
    <div class="badge-wrapper">
      <div class="title-wrapper">
        <h2 class="badge-title">나는 어떤 유형의 집사일까?</h2>
        <div class="tooltip-wrapper">
          <span class="tooltip-text">* 나의 유형은?</span>
          <div class="tooltip-box">
            스탬프 5개를 모으면 해당하는 뱃지를 얻을 수 있습니다! <br>뱃지를 모아내가 어떤 유형인지 알아보세요.
          </div>
        </div>
      </div>
      <div class="badge-list">
        <div
          v-for="(badge, index) in badges"
          :key="index"
          class="badge-item"
        >
          <img :src="getBadgeImage(badge.name)" alt="badge" />
        </div>
      </div>
    </div>
  </template>
  
  <script setup>
  import { ref, onMounted } from 'vue';
  import { useUserStore } from '/src/stores/userStore';
  
  const userStore = useUserStore();
  const badges = ref([]);
  
  const getBadgeImage = (name) => {
    return `/src/assets/badge/${name}뱃지.png`; 
  };
  
  const fetchBadges = async () => {
    try {
      const memberId = Number(userStore.id);
  
      const [memberBadgeRes, badgeRes] = await Promise.all([
        fetch('http://localhost:3001/member_badge'),
        fetch('http://localhost:3001/badge')
      ]);
  
      const memberBadges = await memberBadgeRes.json();
      const badgeList = await badgeRes.json();
  
      const myBadgeIds = memberBadges
        .filter(b => b.member_id === memberId)
        .map(b => b.badge_id);
  
      badges.value = badgeList.filter(b => myBadgeIds.includes(Number(b.id)));
  
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
    gap: 8px; /* 제목과 *설명 사이 간격 */
  }
  
  .badge-title {
    font-size: 18px;
    font-weight: 600;
    margin: 0; /* h2 기본 margin 없앰 */
  }
  
  .tooltip-wrapper {
    position: relative;
    cursor: pointer;
  }
  
  .tooltip-text {
    font-size: 12px;
    color: #aaa; /* ✅ 연한 회색 */
  }
  
  .tooltip-box {
    position: absolute;
    top: 24px; /* 아래로 툴팁 */
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
    max-width: 500px;
  }
  
  .badge-item img {
    width: auto;
    height: 170px;
    object-fit: cover;
    transition: transform 0.3s ease;
  }
  
  .badge-item img:hover {
    transform: scale(1.2);
  }
  </style>
  
<template>
    <div class="badge-wrapper">
      <h2 class="badge-title"> 나는 어떤 유형의 집사일까?</h2> <!-- ✅ 제목만 추가 -->
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
  gap: 2px; /* ✅ 전체적으로 간격 살짝 좁힘 */
}

.badge-title {
  font-size: 18px; /* ✅ 글자 크기 줄임 */
  font-weight: 600;
  margin-bottom: 8px; /* ✅ 아래 여백도 줄임 */
}

.badge-list {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 12px; /* ✅ 뱃지 간격 살짝 줄임 */
  max-width: 500px;
}

.badge-item img {
  width: auto;
  height: 170px; /* ✅ 이미지 크기도 살짝 줄여줌 */
  object-fit: cover;
  transition: transform 0.3s ease;
}

.badge-item img:hover {
  transform: scale(1.2);
}

  </style>
  
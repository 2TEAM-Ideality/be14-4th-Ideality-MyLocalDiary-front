<template>
    <div class="map-container">
      <!-- 📌 지도 위에 떠 있는 모달 -->
      <div class="floating-modal">
        <UserProfileModal />
      </div>
  
      <!-- 지도 -->
      <div id="map" class="map"></div>
    </div>
  </template>
  
  <script setup>
  import { onMounted } from 'vue';
  import UserProfileModal from '@/components/mypage/UserProfileModal.vue';
  
  onMounted(() => {
    const latestPostLocation = {
      lat: 37.487325,
      lng: 126.913483,
      title: '신대방동 돈까스 투어',
    };
  
    const map = new naver.maps.Map('map', {
      center: new naver.maps.LatLng(latestPostLocation.lat, latestPostLocation.lng),
      zoom: 15,
      customStyleId: 'ae8bf51c-899d-4773-9851-1f670d719a19',
      gl: true,
      mapTypeControl: true,
      scaleControl: true,
      zoomControl: true,
      zoomControlOptions: {
        position: naver.maps.Position.RIGHT_CENTER
      }
    });
  
    new naver.maps.Marker({
      position: new naver.maps.LatLng(latestPostLocation.lat, latestPostLocation.lng),
      map: map,
      title: latestPostLocation.title,
      icon: {
        content: `
          <div style="
            background: #ff9800;
            color: white;
            font-size: 12px;
            padding: 4px 8px;
            border-radius: 12px;
            box-shadow: 0 2px 6px rgba(0,0,0,0.15);
          ">
            📍 ${latestPostLocation.title}
          </div>
        `,
        size: new naver.maps.Size(80, 30),
        anchor: new naver.maps.Point(40, 15)
      }
    });
  });
  </script>
  
  <style scoped>
  .map-container {
    position: relative;
    width: 100%;
    height: 100vh;
    overflow: hidden;
  }
  
  .map {
    width: 100%;
    height: 100%;
  }
  
  /* 🔥 지도 위에 떠 있는 플로팅 모달 */
  .floating-modal {
    position: absolute;
    top: 80px;
    right: 40px;
    z-index: 1000;
  }
  </style>
  
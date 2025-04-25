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
import { onMounted, h, render } from 'vue'
import UserProfileModal from '@/components/mypage/UserProfileModal.vue'
import CustomMarker from '@/components/common/CustomMarker.vue' // 실제 경로에 맞게 수정

// 더미 마커들 (CustomMarker로 표시될 데이터)
const postLocations = [
  {
    lat: 37.5704,
    lng: 126.9958,
    title: '서순라길 산책로',
    image: ''
  },
  {
    lat: 37.5710,
    lng: 126.9945,
    title: '아티장 베이커리',
    image: ''
  },
  {
    lat: 37.5685,
    lng: 126.9976,
    title: '청계천',
    image: ''
  },
  {
    lat: 37.5700,
    lng: 126.9769,
    title: '광화문 교보문고',
    image: ''
  }
]

// 대표 위치 (텍스트 말풍선 마커로 표시)
const latestPostLocation = {
  lat: 37.487325,
  lng: 126.913483,
  title: '신대방동 돈까스 투어'
}

onMounted(() => {
  if (!window.naver || !window.naver.maps) {
    console.error('❌ Naver Maps API가 아직 로드되지 않았어요.')
    return
  }

  const testMemberData = async () => {
  try {
    const response = await fetch('http://localhost:3001/members');
    if (!response.ok) {
      throw new Error(`HTTP 오류! 상태: ${response.status}`);
    }
    const data = await response.json();
    console.log('📦 전체 members 데이터:', data);
  } catch (error) {
    console.error('🚨 members 데이터 가져오기 실패:', error);
  }
};

// 호출 예시
testMemberData();

  const map = new naver.maps.Map('map', {
    center: new naver.maps.LatLng(postLocations[0].lat, postLocations[0].lng),
    zoom: 15,
    customStyleId: 'ae8bf51c-899d-4773-9851-1f670d719a19',
    gl: true,
    mapTypeControl: true,
    scaleControl: true,
    zoomControl: false
  })

  // 🔶 마커 (텍스트 마커)
  // new naver.maps.Marker({
  //   position: new naver.maps.LatLng(latestPostLocation.lat, latestPostLocation.lng),
  //   map: map,
  //   title: latestPostLocation.title,
  //   icon: {
  //     content: `
  //       <div style="
  //         background: #ff9800;
  //         color: white;
  //         font-size: 12px;
  //         padding: 4px 8px;
  //         border-radius: 12px;
  //         box-shadow: 0 2px 6px rgba(0,0,0,0.15);
  //       ">
  //         📍 ${latestPostLocation.title}
  //       </div>
  //     `,
  //     size: new naver.maps.Size(80, 30),
  //     anchor: new naver.maps.Point(40, 15)
  //   }
  // })

  // 🔷 커스텀 마커 추가
  postLocations.forEach((loc, index) => {
    const vnode = h(CustomMarker, {
      image: loc.image,
      post_id: index,
      name: loc.title,
      onClick: (id) => {
        console.log(`📌 CustomMarker 클릭됨! post_id=${id}, 장소=${loc.title}`)
      }
    })

    const container = document.createElement('div')
    render(vnode, container)

    new naver.maps.Marker({
      position: new naver.maps.LatLng(loc.lat, loc.lng),
      map: map,
      icon: {
        content: container,
        size: new naver.maps.Size(70, 80),
        anchor: new naver.maps.Point(35, 80) // 꼬리까지 포함한 마커 기준 조정
      }
    })
  })
})
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

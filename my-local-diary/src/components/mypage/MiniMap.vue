<template>
  <div class="mini-map" ref="mapContainer" :style="{ width, height }"></div>
</template>

<script setup>
  import { ref, onMounted, h, render } from 'vue'
  import CustomMarker from '../common/CustomMarker.vue'

  // 부모 컴포넌트에서 지도 크기를 설정
  const props = defineProps({
    width: { type: String, default: '100%' },
    height: { type: String, default: '300px' }
  })
  // 지도 초기화
  const mapContainer = ref(null)
  let map = null

  // 더미 데이터
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

  onMounted(() => {
    if (!window.naver || !window.naver.maps) {
      console.error('❌ Naver Maps API가 아직 로드되지 않았어요.')
      return
    }

    const avgLat = postLocations.reduce((sum, p) => sum + p.lat, 0) / postLocations.length
    const avgLng = postLocations.reduce((sum, p) => sum + p.lng, 0) / postLocations.length

    // 맵 생성 및 중심 좌표, 줌 레벨 설정
    map = new naver.maps.Map(mapContainer.value, {
      center: new naver.maps.LatLng(avgLat, avgLng),        // 모든 마커가 균형 있게 보이는 중간 위치
      // center: new naver.maps.LatLng(postLocations[0].lat, postLocations[0].lng),   // 가장 처음 등록된 장소의 좌표를 중심
      zoom: 15,
      customStyleId: 'ae8bf51c-899d-4773-9851-1f670d719a19',
      gl: true,
      mapTypeControl: true,
      scaleControl: true,
      zoomControl: true
    })

    // 마커 생성
    postLocations.forEach((loc, index) => {
      // 1. 마커 컴포넌트를 가상 노드로 생성
      const vnode = h(CustomMarker, {
        image: loc.image,
        post_id: index,
        name: loc.title,
        onClick: (id) => {
          console.log(`📌 마커 클릭됨: post_id=${id}, 장소명=${loc.title}`)
        }
      })

      // 2. 실제 DOM 요소로 렌더링
      const container = document.createElement('div')
      render(vnode, container)   

      // 3. 네이버 지도에 마커로 추가
      new naver.maps.Marker({
        position: new naver.maps.LatLng(loc.lat, loc.lng),
        map: map,
        icon: {
          content: container,
          size: new naver.maps.Size(70, 70),
          anchor: new naver.maps.Point(35, 35)
        }
      })
    })
  })
</script>

<style scoped>
  .mini-map {
    box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
  }
</style>

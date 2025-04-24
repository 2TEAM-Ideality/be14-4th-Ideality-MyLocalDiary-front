<template>
        <div
          class="mini-map"
          ref="mapContainer"
          :style="{ width, height }"
        ></div>
      </template>
      
      <script setup>
      import { ref, onMounted } from 'vue'
      
      const props = defineProps({
        width: {
          type: String,
          default: '100%'
        },
        height: {
          type: String,
          default: '300px'
        }
      })
      
      const mapContainer = ref(null)
      let map = null
      
      // ✅ 임의의 위치 데이터 배열
      const postLocations = [
        {
          lat: 37.5704,
          lng: 126.9958,
          title: '서순라길 산책로'
        },
        {
          lat: 37.5710,
          lng: 126.9945,
          title: '아티장 베이커리'
        },
        {
          lat: 37.5685,
          lng: 126.9976,
          title: '청계천'
        },
        {
          lat: 37.5700,
          lng: 126.9769,
          title: '광화문 교보문고'
        }
      ]
      
      onMounted(() => {
        if (!window.naver || !window.naver.maps) {
          console.error('❌ Naver Maps API가 아직 로드되지 않았어요.')
          return
        }
      
        // ✅ 첫 장소를 기준으로 지도 중심 설정
        map = new naver.maps.Map(mapContainer.value, {
          center: new naver.maps.LatLng(postLocations[0].lat, postLocations[0].lng),
          zoom: 15,
          customStyleId: 'ae8bf51c-899d-4773-9851-1f670d719a19',
          gl: true,
          mapTypeControl: true,
          scaleControl: true,
          zoomControl: true
        })
      
        // ✅ 마커 여러 개 찍기
        postLocations.forEach(loc => {
          new naver.maps.Marker({
            position: new naver.maps.LatLng(loc.lat, loc.lng),
            map: map,
            title: loc.title,
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
                  📍 ${loc.title}
                </div>
              `,
              size: new naver.maps.Size(80, 30),
              anchor: new naver.maps.Point(40, 15)
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
      
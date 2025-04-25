<template>
  <div class="map-wrapper">
    <!-- 지도 -->
    <div ref="mapRef" class="map-container" />

    <!-- (검색창 + 결과 리스트 + 내 위치 버튼) -->
    <div class="search-overlay"  :style="{ marginLeft: ui.isHover ? '200px' : '80px' }">
      <v-text-field
        v-model="query"
        label="장소 검색"
        append-inner-icon="mdi-magnify"
        @keyup.enter="searchAddressToCoordinate"
        @click:append-inner="searchAddressToCoordinate"
        density="comfortable"
        variant="outlined"
        hide-details
        class="search-bar"
      />

      <v-list v-if="searchResults.length" class="result-list">
        <v-list-item
          v-for="(item, index) in searchResults"
          :key="index"
          @click="selectPlace(item)"
          class="result-item"
        >
          <v-list-item-title v-html="item.title" />
          <v-list-item-subtitle>
            {{ item.roadAddress || item.address }}
          </v-list-item-subtitle>
        </v-list-item>
      </v-list>

      
    </div>
    <!-- ✅ 내 위치 버튼 (오른쪽 아래 고정) -->
    <v-btn class="my-location-btn" @click="moveToMyLocation" icon color="primary">
        📍
    </v-btn>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import axios from 'axios'
import { useUIStore } from '@/stores/uiStore'

const ui = useUIStore()


const query = ref('')
const mapRef = ref(null)
const searchResults = ref([])
let map
let infoWindow
let currentMarker = null

function initMap() {
  map = new naver.maps.Map(mapRef.value, {
    center: new naver.maps.LatLng(37.3595316, 127.1052133), // 기본 좌표 (판교)
    zoom: 15,
    mapTypeControl: true,
  })

  infoWindow = new naver.maps.InfoWindow({ anchorSkew: true })

  map.setCursor('pointer')
  map.addListener('click', (e) => searchCoordinateToAddress(e.coord))

  // 🔽 자동 내 위치
  moveToMyLocation()

  // 🔍 검색어가 있을 경우 실행
  if (query.value.trim()) {
    searchAddressToCoordinate()
  }
}

function moveToMyLocation() {
  if (!navigator.geolocation) {
    alert('이 브라우저는 위치 서비스를 지원하지 않습니다.')
    return
  }

  navigator.geolocation.getCurrentPosition(
    (pos) => {
      const latlng = new naver.maps.LatLng(pos.coords.latitude, pos.coords.longitude)
      map.setCenter(latlng)
      map.setZoom(15)
      renderResult(latlng, '내 위치', '')
      placeMarker(latlng, '내 위치')
    },
    (err) => {
      console.warn('❌ 위치 권한 거부 혹은 오류:', err)
    }
  )
}

async function searchAddressToCoordinate() {
  infoWindow.close()
  clearMarker()
  searchResults.value = []

  try {
    const res = await axios.get('/naver/v1/search/local.json', {
      params: { query: query.value, display: 5 },
      headers: {
        'X-Naver-Client-Id': import.meta.env.VITE_NAVER_SEARCH_CLIENT_ID,
        'X-Naver-Client-Secret': import.meta.env.VITE_NAVER_SEARCH_CLIENT_SECRET,
      },
    })

    if (res.data.items?.length) {
      searchResults.value = res.data.items
    } else {
      fallbackToAddress()
    }
  } catch (err) {
    console.error(err)
    alert('검색 중 오류 발생')
  }
}

function fallbackToAddress() {
  naver.maps.Service.geocode({ query: query.value }, (status, response) => {
    if (status !== naver.maps.Service.Status.OK || response.v2.meta.totalCount === 0) return

    const addr = response.v2.addresses[0]
    const latlng = new naver.maps.LatLng(addr.y, addr.x)
    renderResult(latlng, query.value, addr.roadAddress || addr.jibunAddress)
    placeMarker(latlng, query.value)
  })
}

function selectPlace(item) {
  const lat = Number(item.mapy) / 1e7
  const lng = Number(item.mapx) / 1e7
  const latlng = new naver.maps.LatLng(lat, lng)

  renderResult(latlng, item.title, item.roadAddress || item.address)
  placeMarker(latlng, item.title)
}

function renderResult(latlng, title, address) {
  map.setCenter(latlng)
  map.setZoom(15)
  infoWindow.setContent(`
    <div style="padding:10px;min-width:200px;">
      <strong>📍 ${title.replace(/<[^>]*>?/g, '')}</strong><br/>
      ${address}
    </div>
  `)
  infoWindow.open(map, latlng)
}

function placeMarker(latlng, name) {
  if (currentMarker) currentMarker.setMap(null)

  currentMarker = new naver.maps.Marker({
    position: latlng,
    map: map,
    title: name.replace(/<[^>]*>?/g, ''),
  })
}

function clearMarker() {
  if (currentMarker) {
    currentMarker.setMap(null)
    currentMarker = null
  }
}

function searchCoordinateToAddress(latlng) {
  infoWindow.close()
  naver.maps.Service.reverseGeocode({
    coords: latlng,
    orders: [naver.maps.Service.OrderType.ADDR, naver.maps.Service.OrderType.ROAD_ADDR].join(','),
  }, (status, response) => {
    if (status !== naver.maps.Service.Status.OK) return
    const addr = response.v2.results[0]
    const full = addr.region.area1.name + ' ' + addr.region.area2.name + ' ' + addr.region.area3.name
    renderResult(latlng, '선택한 위치', full)
    placeMarker(latlng, full)
  })
}

onMounted(() => {
  if (window.naver?.maps) {
    initMap()
  }
})
</script>

<style scoped>
.map-wrapper {
  position: relative;
  width: 100%;
  height: 100vh;
}
.map-container {
  width: 100%;
  height: 100%;
}
.search-overlay {
  position: absolute;
  top: 24px;
  left: 24px;
  width: 360px;
  z-index: 10;
}
.search-bar {
  background-color: white;
}
.result-list {
  max-height: 260px;
  overflow-y: auto;
  background: white;
  border: 1px solid #ccc;
  border-radius: 6px;
  margin-top: 4px;
}
.result-item {
  cursor: pointer;
}
.result-item:hover {
  background-color: #f0f0f0;
}
.location-btn {
  margin-top: 12px;
  margin-left: 4px;
  font-size: 20px;
}
.my-location-btn {
  position: absolute;
  bottom: 24px;
  right: 24px;
  z-index: 10;
  box-shadow: 0 2px 10px rgba(0,0,0,0.15);
}
</style>

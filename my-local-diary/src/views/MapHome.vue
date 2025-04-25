<template>
  <div class="map-wrapper">
    <!-- 지도 -->
    <div ref="mapRef" class="map-container" />

    <!-- 검색창 컴포넌트 -->
    <SearchLocation2
      :query="query"
      @update:query="query = $event"
      @place-selected="selectPlace"
    />

    <!-- 내 위치 버튼 -->
    <v-btn class="my-location-btn" @click="moveToMyLocation" icon color="primary">
      📍
    </v-btn>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import SearchLocation2 from '@/components/map/SearchLocation2.vue'
import { useUIStore } from '@/stores/uiStore'

const ui = useUIStore()
const query = ref('')
const mapRef = ref(null)
let map
let infoWindow
let currentMarker = null

function initMap() {
  map = new naver.maps.Map(mapRef.value, {
    center: new naver.maps.LatLng(37.3595316, 127.1052133),
    zoom: 15,
    mapTypeControl: true,
  })

  infoWindow = new naver.maps.InfoWindow({ anchorSkew: true })

  map.setCursor('pointer')
  map.addListener('click', (e) => searchCoordinateToAddress(e.coord))

  moveToMyLocation()

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
.my-location-btn {
  position: absolute;
  bottom: 24px;
  right: 24px;
  z-index: 10;
  box-shadow: 0 2px 10px rgba(0,0,0,0.15);
}
</style>

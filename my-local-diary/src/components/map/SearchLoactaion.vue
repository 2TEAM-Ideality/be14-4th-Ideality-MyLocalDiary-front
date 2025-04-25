<template>
  <div class="search-location">
    <!-- 검색창 -->
    <v-text-field
      v-model="query"
      label="장소 검색"
      append-inner-icon="mdi-magnify"
      @keyup.enter="searchAddressToCoordinate"
      @click:append-inner="searchAddressToCoordinate"
      density="comfortable"
      variant="outlined"
    />
    <!-- 지도 -->
    <div ref="mapRef" class="map-container" />
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import axios from 'axios'

const query = ref('정자동 178-1')
const mapRef = ref(null)
let map
let infoWindow
let currentMarker = null // ⭐ 현재 마커 저장

function initMap() {
  map = new naver.maps.Map(mapRef.value, {
    center: new naver.maps.LatLng(37.3595316, 127.1052133),
    zoom: 15,
    mapTypeControl: true,
  })

  infoWindow = new naver.maps.InfoWindow({ anchorSkew: true })

  map.setCursor('pointer')

  map.addListener('click', (e) => {
    searchCoordinateToAddress(e.coord)
  })

  searchAddressToCoordinate()
}

// 📍 장소명 → 실패 시 주소 fallback 검색
async function searchAddressToCoordinate() {
  infoWindow.close()
  clearMarker()

  try {
    // 1️⃣ 장소명 검색 API
    const res = await axios.get('/naver/v1/search/local.json', {
      params: { query: query.value, display: 1 },
      headers: {
        'X-Naver-Client-Id': import.meta.env.VITE_NAVER_SEARCH_CLIENT_ID,
        'X-Naver-Client-Secret': import.meta.env.VITE_NAVER_SEARCH_CLIENT_SECRET,
      },
    })
    console.log('🧭 응답 전체:', res)
    console.log('🧭 res.data:', res.data)
    const item = res.data.items[0]

    if (item) {
      const lng = Number(item.mapx) / 1e7  // 경도
      const lat = Number(item.mapy) / 1e7  // 위도
      const latlng = new naver.maps.LatLng(lat, lng)

      console.log('🗺️ 최종 변환 좌표:', latlng)

      renderResult(latlng, item.title, item.roadAddress || item.address)
      placeMarker(latlng, item.title)
      return
    }

    // 2️⃣ 장소 검색 실패 시 → 주소 검색
    naver.maps.Service.geocode({ query: query.value }, (status, response) => {
      if (status !== naver.maps.Service.Status.OK || response.v2.meta.totalCount === 0) {
        alert('장소 또는 주소를 찾을 수 없습니다.')
        return
      }

      const addr = response.v2.addresses[0]
      const latlng = new naver.maps.LatLng(addr.y, addr.x)

      renderResult(latlng, query.value, addr.roadAddress || addr.jibunAddress)
      placeMarker(latlng, query.value)
    })
  } catch (err) {
    console.error(err)
    alert('장소 검색 중 오류가 발생했습니다.')
  }
}

// 결과 표시 (지도 이동 + 말풍선)
function renderResult(latlng, title, address) {
  map.setCenter(latlng)

  infoWindow.setContent(`
    <div style="padding:10px;min-width:200px;">
      <strong>📍 ${title.replace(/<[^>]*>?/g, '')}</strong><br/>
      ${address}
    </div>
  `)
  infoWindow.open(map, latlng)
}

// 📌 마커 생성
function placeMarker(latlng, name) {
  if (currentMarker) currentMarker.setMap(null)

  currentMarker = new naver.maps.Marker({
    position: latlng,
    map: map,
    title: name.replace(/<[^>]*>?/g, ''),
  })
}

// 📌 기존 마커 제거
function clearMarker() {
  if (currentMarker) {
    currentMarker.setMap(null)
    currentMarker = null
  }
}

// 지도 클릭 시 → 주소 정보
function searchCoordinateToAddress(latlng) {
  infoWindow.close()

  naver.maps.Service.reverseGeocode(
    {
      coords: latlng,
      orders: [naver.maps.Service.OrderType.ADDR, naver.maps.Service.OrderType.ROAD_ADDR].join(','),
    },
    (status, response) => {
      if (status !== naver.maps.Service.Status.OK) {
        alert('주소를 불러올 수 없습니다.')
        return
      }

      const items = response.v2.results
      const htmlAddresses = items.map((item, i) => {
        const addrType = item.name === 'roadaddr' ? '[도로명 주소]' : '[지번 주소]'
        return `${i + 1}. ${addrType} ${makeAddress(item)}`
      })

      infoWindow.setContent(`
        <div style="padding:10px;min-width:200px;line-height:150%;">
          <h4 style="margin-top:5px;">검색 좌표</h4><br/>
          ${htmlAddresses.join('<br/>')}
        </div>
      `)
      infoWindow.open(map, latlng)

      placeMarker(latlng, '선택된 위치')
    }
  )
}

// 주소 객체 → 문자열
function makeAddress(item) {
  if (!item) return ''

  const { name, region, land } = item
  let [sido, sigugun, dongmyun, ri, rest] = ['', '', '', '', '']

  if (region?.area1?.name) sido = region.area1.name
  if (region?.area2?.name) sigugun = region.area2.name
  if (region?.area3?.name) dongmyun = region.area3.name
  if (region?.area4?.name) ri = region.area4.name

  if (land?.number1) {
    rest += land.type === '2' ? '산' : ''
    rest += land.number1
    if (land.number2) rest += '-' + land.number2
    if (name === 'roadaddr') {
      if (dongmyun.endsWith('면')) ri = land.name
      else {
        dongmyun = land.name
        ri = ''
      }
      if (land.addition0?.value) rest += ' ' + land.addition0.value
    }
  }

  return [sido, sigugun, dongmyun, ri, rest].join(' ')
}

onMounted(() => {
  if (window.naver?.maps) {
    initMap()
  }
})
</script>

<style scoped>
.map-container {
  width: 100%;
  height: 500px;
  margin-top: 16px;
}
</style>

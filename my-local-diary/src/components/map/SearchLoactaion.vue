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
  
  // 🔑 .env 파일에 VITE_NAVER_MAP_CLIENT_ID 설정 필요
  const query = ref('정자동 178-1')
  const mapRef = ref(null)
  let map
  let infoWindow
  
  // 지도 및 지오코더 초기화
  function initMap() {
    map = new naver.maps.Map(mapRef.value, {
      center: new naver.maps.LatLng(37.3595316, 127.1052133),
      zoom: 15,
      mapTypeControl: true,
    })
  
    infoWindow = new naver.maps.InfoWindow({
      anchorSkew: true,
    })
  
    map.setCursor('pointer')
  
    map.addListener('click', (e) => {
      searchCoordinateToAddress(e.coord)
    })
  
    searchAddressToCoordinate()
  }
  
  // 좌표 → 주소
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
      }
    )
  }
  
  // 주소 → 좌표
  function searchAddressToCoordinate() {
    infoWindow.close()
  
    naver.maps.Service.geocode({ query: query.value }, (status, response) => {
      if (status !== naver.maps.Service.Status.OK || response.v2.meta.totalCount === 0) {
        alert('주소를 찾을 수 없습니다.')
        return
      }
  
      const item = response.v2.addresses[0]
      const point = new naver.maps.Point(item.x, item.y)
      const htmlAddresses = []
  
      if (item.roadAddress) htmlAddresses.push('[도로명 주소] ' + item.roadAddress)
      if (item.jibunAddress) htmlAddresses.push('[지번 주소] ' + item.jibunAddress)
      if (item.englishAddress) htmlAddresses.push('[영문 주소] ' + item.englishAddress)
  
      map.setCenter(point)
      infoWindow.setContent(`
        <div style="padding:10px;min-width:200px;line-height:150%;">
          <h4 style="margin-top:5px;">검색 주소: ${query.value}</h4><br/>
          ${htmlAddresses.join('<br/>')}
        </div>
      `)
      infoWindow.open(map, point)
    })
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
  
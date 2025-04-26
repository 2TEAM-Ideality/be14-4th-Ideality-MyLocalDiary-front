<template>
  <div class="map-wrapper">
    <!-- 지도 -->
    <div ref="mapRef" class="map-container" />

    <!-- 검색창 -->
    <SearchLocation2
      :query="query"
      @update:query="query = $event"
      @place-selected="selectPlace"
    />

    <!-- 유저 아이콘 리스트 (페이지네이션 적용) -->
    <div class="user-icon-pagination">
      <v-btn
        v-if="userList.length > itemsPerPage"
        icon
        class="arrow-btn"
        @click="prevPage"
        :disabled="page === 0"
        size="small"
      >
        <v-icon size="40">mdi-menu-up</v-icon>
      </v-btn>

      <div class="user-icon-list">
        <div
          v-for="user in paginatedUsers"
          :key="user.id"
          class="user-icon-wrapper"
          @click="goToUserMap"
        >
          <div class="user-icon">
            <img :src="getUserImage(user.image)" alt="user" />
            <div class="user-name-tooltip">{{ user.name }}</div>
          </div>
        </div>
      </div>

      <v-btn
        v-if="userList.length > itemsPerPage"
        icon
        class="arrow-btn"
        @click="nextPage"
        :disabled="endIndex >= userList.length"
        size="small"
      >
        <v-icon size="40">mdi-menu-down</v-icon>
      </v-btn>
    </div>

    <!-- 내 위치 버튼 -->
    <v-btn class="my-location-btn" @click="moveToMyLocation" icon color="primary">
      📍
    </v-btn>
  </div>
</template>

<script setup>
    import { ref, computed, onMounted } from 'vue'
    import { useRouter } from 'vue-router'
    import axios from 'axios'
    import SearchLocation2 from '@/components/map/SearchLocation2.vue'
    import profileImageDummy from '@/assets/profile/profile.png'

    const router = useRouter()
    const query = ref('')
    const mapRef = ref(null)
    let map, infoWindow, currentMarker

    const userList = ref([])

    function getUserImage(image) {
      return image && image.trim() !== '' ? image : profileImageDummy
    }

    // 페이지네이션
    const page = ref(0)
    const itemsPerPage = 6
    const startIndex = computed(() => page.value * itemsPerPage)
    const endIndex = computed(() => startIndex.value + itemsPerPage)
    const paginatedUsers = computed(() => userList.value.slice(startIndex.value, endIndex.value))

    function prevPage() {
      if (page.value > 0) page.value--
    }

    function nextPage() {
      if (endIndex.value < userList.value.length) page.value++
    }

    // 지도 관련
    function moveToMyLocation() {
      if (!navigator.geolocation) return
      navigator.geolocation.getCurrentPosition(pos => {
        const latlng = new naver.maps.LatLng(pos.coords.latitude, pos.coords.longitude)
        map.setCenter(latlng)
        map.setZoom(15)
        renderResult(latlng, '📍 내 위치', '')
        placeMarker(latlng, '내 위치')
      })
    }

    function initMap() {
      map = new naver.maps.Map(mapRef.value, {
        center: new naver.maps.LatLng(37.3595316, 127.1052133),
        zoom: 15
      })
      infoWindow = new naver.maps.InfoWindow({ anchorSkew: true })
      map.setCursor('pointer')
      moveToMyLocation()
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
      infoWindow.setContent(`<div style="padding:10px;"><strong>${title}</strong><br/>${address}</div>`)
      infoWindow.open(map, latlng)
    }

    function placeMarker(latlng, name) {
      if (currentMarker) currentMarker.setMap(null)
      currentMarker = new naver.maps.Marker({
        position: latlng,
        map: map,
        title: name
      })
    }

    // JSON 데이터 받아오기
    async function fetchUserList() {
      try {
        const response = await axios.get('/json/following_list.json')
        userList.value = response.data.following
          .filter(member => member.status === 'ACTIVE') 
          .map(member => ({
            id: member.id,
            name: member.nickname,
            image: member.profile_image || '' 
          }))
      } catch (error) {
        console.error('유저 리스트를 불러오는 데 실패했습니다.', error)
      }
    }

    const goToUserMap = () => {router.push('/user-map-home')}

    onMounted(() => {
      if (window.naver?.maps) {
        initMap()
      }
      fetchUserList()
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
    box-shadow: 0 2px 10px rgba(0, 0, 0, 0.15);
  }

  .user-icon-pagination {
    position: absolute;
    top: 24px;
    right: 24px;
    width: 60px;
    z-index: 999;
    display: flex;
    flex-direction: column;
    align-items: center;
    padding: 8px 0;
  }

  .user-icon-list {
    display: flex;
    flex-direction: column;
    gap: 12px;
    margin: 8px 0;
  }

  .user-icon {
    width: 60px;
    height: 60px;
    border-radius: 50%;
    overflow: hidden;
    background-color: white;
    box-shadow: 0 2px 6px rgba(0, 0, 0, 0.2);
    cursor: pointer;
  }

  .user-icon img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }

  .arrow-btn {
    min-width: 20px;
    height: 20px;
    font-size: 16px;
    padding: 0;
  }

  .user-icon-wrapper {
    position: relative;
  }

  .user-name-tooltip {
    position: absolute;
    top: 50%;
    left: -8px;
    transform: translateY(-50%) translateX(-100%);
    background: rgba(0, 0, 0, 0.75);
    color: white;
    font-size: 12px;
    padding: 4px 8px;
    border-radius: 4px;
    white-space: nowrap;
    opacity: 0;
    transition: opacity 0.2s ease;
    pointer-events: none;
    z-index: 1000;
  }

  .user-icon:hover .user-name-tooltip {
    opacity: 1;
  }
</style>

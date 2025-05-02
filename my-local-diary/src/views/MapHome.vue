<template>
  <div class="map-wrapper">
    <!-- 지도 -->
    <div ref="mapRef" class="map-container" />

    <!-- 모달 -->
    <div v-if="selectedPostId !== null" class="modal-overlay" @click="selectedPostId = null">
      <div class="modal-content" @click.stop>
        <div class="d-flex justify-end">
          <button class="pr-3 pl-3" @click="selectedPostId = null">X</button>
        </div>
        <PostCard :postId="selectedPostId" />
      </div>
    </div>

    <!-- 검색창 -->
    <SearchLocation2
      :query="query"
      :map="map"
      @update:query="query = $event"
      @place-selected="selectPlace"
    />

    <!-- 유저 아이콘 리스트 -->
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
          @click="goToUserMap(user.id)"
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
  import { ref, computed, onMounted, h, render, watch } from 'vue'
  import { useRouter, useRoute } from 'vue-router'
  import axios from 'axios'
  import SearchLocation2 from '@/components/map/SearchLocation2.vue'
  import CustomMarker from '@/components/common/CustomMarker.vue'
  import PostCard from '@/components/post/PostCard.vue'
  import profileImageDummy from '@/assets/profile/default.png'
  import { useUserStore } from '@/stores/userStore'
  const userStore = useUserStore()

  console.log(userStore.id)
  const router = useRouter(); 
  const route = useRoute();

  const query = ref('') // 검색창 입력 값
  const selectedPostId = ref(null) // 선택된 포스트 ID (모달 띄우기용)

  const mapRef = ref(null) // 지도 DOM 참조
  const map = ref(null) // 네이버 지도 객체
  const infoWindow = ref(null) // 검색 결과 InfoWindow
  const currentMarker = ref(null) // 현재 선택된 마커
  const places = ref([]) // 장소 리스트 (포스트 안의 장소)
  const markers = ref([]) // 지도에 표시한 마커들

  const userList = ref([]) // 유저 리스트 (오른쪽 프로필)
  const page = ref(0) // 유저 리스트 현재 페이지
  const itemsPerPage = 6 // 페이지당 유저 수

  const startIndex = computed(() => page.value * itemsPerPage) // 유저 리스트 시작 인덱스
  const endIndex = computed(() => startIndex.value + itemsPerPage) // 유저 리스트 끝 인덱스
  const paginatedUsers = computed(() => userList.value.slice(startIndex.value, endIndex.value)) // 현재 페이지 유저 리스트

  // 프로필 이미지 없을 때 기본 이미지로 대체
  function getUserImage(image) {
    return image?.trim() ? image : profileImageDummy
  }

  // 유저 리스트 이전 페이지로 이동
  function prevPage() {
    if (page.value > 0) page.value--
  }

  // 유저 리스트 다음 페이지로 이동
  function nextPage() {
    if (endIndex.value < userList.value.length) page.value++
  }

  // 내 현재 위치로 지도 이동
  function moveToMyLocation() {
    if (!navigator.geolocation) return

    navigator.geolocation.getCurrentPosition(pos => {
      const latlng = new naver.maps.LatLng(pos.coords.latitude, pos.coords.longitude)

      // ✅ 기존 마커 제거
      if (currentMarker.value) currentMarker.value.setMap(null)

      // ✅ 커스텀 마커 없이 InfoWindow만 보여줌
      renderResult(latlng, '📍 내 위치', '')
    })
  }

  // 네이버 지도 초기화
  function initMap() {
    map.value = new naver.maps.Map(mapRef.value, {
      center: new naver.maps.LatLng(37.3595316, 127.1052133),
      zoom: 15
    })
    infoWindow.value = new naver.maps.InfoWindow({ anchorSkew: true })
    map.value.setCursor('pointer')
    moveToMyLocation()
  }

  // 검색된 장소 클릭 시 지도 이동 및 InfoWindow 표시
  function selectPlace(place) {
    const latlng = new naver.maps.LatLng(place.lat, place.lng)

    // 기존 마커 제거
    if (currentMarker.value) currentMarker.value.setMap(null)

    renderResult(latlng, place.title, place.address)  // 🗨️ 말풍선도 띄우기
  }



  // InfoWindow로 장소 정보 표시
  function renderResult(latlng, title, address) {
    map.value.setCenter(latlng)
    map.value.setZoom(15)
    infoWindow.value.setContent(`<div style="padding:10px;"><strong>${title}</strong><br/>${address}</div>`)
    infoWindow.value.open(map.value, latlng)
  }

  // 마커 찍기 (기존 마커 제거 후 새로 생성)
  function placeMarker(latlng, name) {
    if (currentMarker.value) currentMarker.value.setMap(null)
    currentMarker.value = new naver.maps.Marker({
      position: latlng,
      map: map.value,
      title: name
    })
  }

  // 서버에서 유저 리스트 가져오기
  async function fetchUserList() {
    try {
      const { data } = await axios.get('http://localhost:8080/api/mypage/follow/list', {
        params: { memberId: userStore.id }
      });

      console.log('📌 팔로우 유저 목록:', data);

      userList.value = data.map(user => ({
        id: user.id,
        name: user.nickname,
        image: user.profileImage || profileImageDummy
      }));
    } catch (error) {
      console.error('❌ 유저 리스트 로드 실패:', error);
    }
  }


  // 서버에서 포스트/장소 데이터 가져오기
  async function fetchFollowPosts() {
    try {
      const { data } = await axios.get('http://localhost:8080/api/posts/follow/map', {
        params: { memberId: userStore.id }  // 👈 실제 로그인 유저 ID 사용
      })

      // 서버에서 받은 포스트 리스트를 마커용 장소 데이터로 변환
      places.value = data.map(post => ({
        latitude: post.latitude,
        longitude: post.longitude,
        name: post.placeName,
        post_id: post.postId,
        thumbnail_image: post.thumbnailImage
      }))
    } catch (error) {
      console.error('팔로우 포스트 데이터 로드 실패', error)
    }
  }
  


  // 유저 아이콘 클릭시 유저 맵 홈으로 이동
  function goToUserMap(userId) {
    console.log('유저 클릭됨. id:', userId)
    router.push(`/map/${userId}`)
  }

  // 커스텀 마커 생성하고 클릭 시 모달 오픈
  function createCustomMarker(place) {
    const vnode = h(CustomMarker, {
      image: place.thumbnail_image,
      post_id: place.post_id,
      name: place.name,
      onClick: (id) => {
        selectedPostId.value = id
      }
    })

    const container = document.createElement('div')
    render(vnode, container)

    const marker = new naver.maps.Marker({
      position: new naver.maps.LatLng(place.latitude, place.longitude),
      map: map.value,
      icon: {
        content: container,
        size: new naver.maps.Size(70, 80),
        anchor: new naver.maps.Point(35, 80)
      }
    })
    markers.value.push(marker)
  }

  // 페이지 로드시 지도/유저/포스트 데이터 로드
  onMounted(async () => {
    if (window.naver?.maps) {
      initMap()
      await fetchUserList()
      await fetchFollowPosts()
      places.value.forEach((place, index) => {
        createCustomMarker(place, index)
      })
    }
  })

  watch(
    () => userStore.id,
    (id) => {
      if (id) {
        fetchUserList();
        fetchFollowPosts();
      }
    },
    { immediate: true }
  );

  watch(
    () => route.params.id,
    (newId) => {
      if (newId) {
        console.log('📌 라우트 ID 바뀜:', newId)
        fetchFollowPosts()
        // 필요시 initMap() 호출하거나 마커 갱신 로직도 여기에
      }
    },
    { immediate: true }
  )


</script>


<style scoped>
.map-wrapper {
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

.modal-overlay {
  position: fixed;
  top: 0; left: 0;
  width: 100%; height: 100%;
  background-color: rgba(0, 0, 0, 0.4);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.modal-content {
  background: white;
  padding: 12px;
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
}
</style>

<template>
  <div class="map-container">
    <!-- 📌 지도 위에 떠 있는 모달 -->
    <div class="floating-modal">
      <UserProfileModal
        :userInfo="userInfo"
        :postCount="postCount"
        :followers="followers"
        :followings="followings"
        :postList="postLocations"
      />
      <!-- :postList ="postLocations" -->

    </div>

    <!-- 지도 -->
    <div id="map" class="map"></div>

    <!-- 검색창 -->
    <SearchLocation2
      :query="query"
      @update:query="query = $event"
      @place-selected="selectPlace"
    />
  </div>

  <!-- 📌 PostCard 모달 -->
  <div v-if="selectedPostId !== null" class="modal-overlay" @click="selectedPostId = null">
      <div class="modal-content" @click.stop>
        <div class="d-flex justify-end">
          <button class="pr-3 pl-3" @click="selectedPostId = null">X</button>
        </div>
        <PostCard :postId="selectedPostId" />
      </div>
    </div>
</template>

<script setup>
import { onMounted, h, render, ref, computed, watch } from 'vue'
import { useRoute } from 'vue-router'
import axios from 'axios'
import { useUserStore } from '@/stores/userStore'
import UserProfileModal from '@/components/mypage/UserProfileModal.vue'
import CustomMarker from '@/components/common/CustomMarker.vue'
import SearchLocation2 from '@/components/map/SearchLocation2.vue'
import ReportModal from '@/components/report/ReportModal.vue'
import PostCard from '@/components/post/PostCard.vue'

// 🧩 라우트에서 /map/:id 추출
const route = useRoute()
const userStore = useUserStore();
const targetMemberId = computed(() => Number(route.params.id))
console.log(targetMemberId.value, "의 지도 홈 페이지")

// 상태 정의
const userInfo = ref(null)
const query = ref('')
const map = ref(null)
const postLocations = ref([])

const selectedPostId = ref(null)

const postCount = ref(0)
const followers = ref(0)
const followings = ref(0)


// 📍 유저 정보 fetch
async function fetchOtherUserInfo() {
  try {
    const isMyPage = Number(route.params.id) === userStore.id;

    const url = isMyPage
      ? `/api/member/info`                     // 🔄 내 페이지면 내 정보
      : `/api/member/${targetMemberId.value}` // 🔄 남이면 그 사람 정보
    const res = await axios.get(url, {
      params: { memberId: userStore.id },
      headers: {
        Authorization: `Bearer ${userStore.token}`
      }
    });
    console.log('🌐 유저 조회 응답:', res.data)

    if (res.data?.data) {
      userInfo.value = res.data.data
    } else {
      console.warn('⚠️ 유저 정보가 없습니다:', res.data)
    }
  } catch (err) {
    console.error('❌ 유저 정보 가져오기 실패:', err)
  }
}

async function fetchPostCount() {
  try {
    const res = await axios.get('/api/mypage/posts/count', {
      params: { memberId: targetMemberId.value }
    })
    postCount.value = res.data
    console.log('✅ 게시글 수:', postCount.value)
  } catch (err) {
    console.error('❌ 게시글 수 가져오기 실패:', err)
  }
}


async function fetchFollowingCount() {
  try {
    const res = await axios.get(`http://localhost:8080/api/mypage/follow/count`, {
      params: { memberId: targetMemberId.value }
    })
    followings.value = res.data
  } catch (err) {
    console.error('❌ 팔로우 수 가져오기 실패:', err)
  }
}



// 📍 포스트/마커용 장소 fetch
async function fetchUserPostLocations() {
  try {
    const res = await axios.get(`http://localhost:8080/api/posts/my/map`, {
      params: { memberId: targetMemberId.value }
    })
    postLocations.value = res.data || []
    console.log(postLocations.value)

    renderMarkers()
  } catch (err) {
    console.error('❌ 포스트 장소 정보 가져오기 실패:', err)
  }
}

// 📍 마커 렌더링
function renderMarkers() {
  if (!map.value || postLocations.value.length === 0) return

  const avgLat = postLocations.value.reduce((sum, p) => sum + p.latitude, 0) / postLocations.value.length
  const avgLng = postLocations.value.reduce((sum, p) => sum + p.longitude, 0) / postLocations.value.length
  map.value.setCenter(new naver.maps.LatLng(avgLat, avgLng))

  postLocations.value.forEach((loc, idx) => {
    const vnode = h(CustomMarker, {
      image: loc.thumbnailImage,
      post_id: loc.postId,
      name: loc.placeName,
      onClick: (id) => {
        console.log(`📌 마커 클릭됨: post_id=${id}`)
        selectedPostId.value = id // ✅ 모달 열기
      }
    })

    const container = document.createElement('div')
    render(vnode, container)

    new naver.maps.Marker({
      position: new naver.maps.LatLng(loc.latitude, loc.longitude),
      map: map.value,
      icon: {
        content: container,
        size: new naver.maps.Size(70, 80),
        anchor: new naver.maps.Point(35, 80)
      }
    })
  })
}

// 📍 장소 선택 시 이동
function selectPlace(item) {
  const latlng = new naver.maps.LatLng(Number(item.mapy) / 1e7, Number(item.mapx) / 1e7)
  map.value.setCenter(latlng)
  map.value.setZoom(15)
}

// 📍 지도 초기화
function initMap() {
  map.value = new naver.maps.Map('map', {
    center: new naver.maps.LatLng(37.5665, 126.9780),
    zoom: 14,
    customStyleId: 'ae8bf51c-899d-4773-9851-1f670d719a19',
    gl: true
  })
}

// 📦 전체 초기화
onMounted(async () => {
  if (!window.naver?.maps) {
    console.error('❌ Naver Maps API 미로드')
    return
  }
  initMap()
  console.log("지도 초기화 완료")
  await fetchOtherUserInfo()
  console.log("유저 정보 가져오기 완료", userInfo.value)

  await fetchUserPostLocations()
  console.log("유저 마커 가져오기 완료")

  await fetchPostCount()
  console.log("유저 게시물 개수 가져오기 완료", postCount.value)

  fetchFollowingCount()
  console.log("유저 팔로잉 개수 가져오기 완료", followings.value)

})

watch(() => route.params.id, async (newId) => {
  if (newId) {
    await fetchOtherUserInfo()
    await fetchUserPostLocations()
    await fetchPostCount()
    await fetchFollowingCount()
  }
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
.floating-modal {
  position: absolute;
  top: 80px;
  right: 40px;
  z-index: 1000;
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

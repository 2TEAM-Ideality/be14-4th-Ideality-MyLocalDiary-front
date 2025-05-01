<template>
  <div class="mini-map" ref="mapContainer" :style="{ width, height }">
    <!-- 모달 -->
    <div v-if="selectedPostId !== null" class="modal-overlay" @click="selectedPostId = null">
      <div class="modal-content" @click.stop>
        <div class="d-flex justify-end">
          <button class="pr-3 pl-3" @click="selectedPostId = null">X</button>
        </div>
        <PostCard :postId="selectedPostId" />
      </div>
    </div>
  </div>
</template>

<script setup>
  import { ref, onMounted, h, render } from 'vue'
  import axios from 'axios'
  import CustomMarker from '../common/CustomMarker.vue'
  import PostCard from '../post/PostCard.vue'

  // 부모 컴포넌트에서 지도 크기를 설정
  const props = defineProps({
    memberId: { type: Number, required: true },
    width: { type: String, default: '100%' },
    height: { type: String, default: '300px' }
  })

  const emit = defineEmits(['post-selected'])   // 마커 클릭 시, 전달 이벤트

  // 지도 초기화
  const mapContainer = ref(null)
  let map = null
  const postLocations = ref([])


  // 마커 렌더링
  function renderMarkers() {
    if (!map || postLocations.value.length === 0) return

    const avgLat = postLocations.value.reduce((sum, p) => sum + p.latitude, 0) / postLocations.value.length
    const avgLng = postLocations.value.reduce((sum, p) => sum + p.longitude, 0) / postLocations.value.length

    map.setCenter(new naver.maps.LatLng(avgLat, avgLng))

    postLocations.value.forEach((loc) => {
      const vnode = h(CustomMarker, {
        image: loc.thumbnailImage,
        post_id: loc.postId,
        name: loc.placeName,
        onClick: (id) => emit('post-selected', id) // ✅ 클릭 시 postId 전달
      })

      const container = document.createElement('div')
      render(vnode, container)

      new naver.maps.Marker({
        position: new naver.maps.LatLng(loc.latitude, loc.longitude),
        map,
        icon: {
          content: container,
          size: new naver.maps.Size(70, 70),
          anchor: new naver.maps.Point(35, 70)
        }
      })
    })
  }

  // 서버에서 게시글 좌표 불러오기
  async function fetchPostLocations() {
    try {
      const res = await axios.get('http://localhost:8080/api/posts/my/map', {
        params: { memberId: props.memberId }
      })
      postLocations.value = res.data || []
      renderMarkers()
    } catch (err) {
      console.error('❌ 게시글 위치 가져오기 실패:', err)
    }
  }

  // 지도 초기화
  onMounted(() => {
    if (!window.naver?.maps) return
    map = new naver.maps.Map(mapContainer.value, {
      center: new naver.maps.LatLng(37.5665, 126.9780),
      zoom: 13,
      customStyleId: 'ae8bf51c-899d-4773-9851-1f670d719a19',
      gl: true,
      mapTypeControl: false,
      scaleControl: false,
      zoomControl: false
    })
    fetchPostLocations()
  })

</script>

<style scoped>
  .mini-map {
    box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
  }

</style>

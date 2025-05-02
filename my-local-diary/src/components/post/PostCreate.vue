<template>
  <v-container class="pa-0 d-flex">
    <!-- 왼쪽 사진 업로드 -->
    <v-col cols="12" md="6" class="pa-10 border-r">
      <div class="text-h5 font-weight-bold mb-1">{{ today }}</div>
      <div class="d-flex gap-4 mb-6">
        <span class="tab" :class="{ active: uploadedImages.length > 0 }">사진 등록</span>
        <span class="tab" :class="{ active: markers.length > 0 }">장소</span>
      </div>

      <div class="d-flex align-center justify-space-between mb-3">
        <h2 class="text-h6 font-weight-bold">사진 등록하기</h2>
        <v-btn size="small" class="pink-small" @click="openFileDialog">추가하기</v-btn>
      </div>

      <div class="upload-area mb-4" @dragover.prevent="currentStep = 'photo'" @drop.prevent="handleDrop">
        <input type="file" multiple accept="image/*" ref="fileInput" @change="handleFileSelect" hidden />
        <template v-if="uploadedImages.length > 0">
          <swiper :modules="[Pagination]" :pagination="{ clickable: true }" class="image-swiper">
            <swiper-slide v-for="(image, index) in uploadedImages" :key="index">
              <img :src="image" class="uploaded-image" />
            </swiper-slide>
          </swiper>
        </template>
      </div>
      <div class="thumbnail-bar">
        <div v-for="(image, index) in uploadedImages" :key="index" class="thumbnail">
          <img :src="image" />
          <v-btn icon size="x-small" class="delete-thumb" @click="removeImage(index)">
            <v-icon>mdi-minus</v-icon>
          </v-btn>
        </div>
      </div>
    </v-col>

    <!-- 오른쪽 장소 등록 + 다이어리 작성 -->
    <v-col cols="12" md="6" class="pa-10">
      <h2 class="text-h6 font-weight-bold mb-3">장소 및 썸네일 등록</h2>
      <p class="text-caption mb-2">장소는 최대 5곳까지 등록할 수 있습니다.</p>

      <div class="d-flex align-center mb-2">
        <v-select
          v-model="searchMode"
          :items="['도로명', '장소']"
          dense outlined hide-details
          class="me-2"
          style="width: 40px; height: 55px;"
        />

        <v-text-field
          v-model="query"
          label="장소 검색"
          outlined dense
          class="flex-grow-1 me-2"
          @keyup.enter="searchPlace"
          style="width: 100px; height: 55px;"
        >
          <template #append-inner>
            <v-btn icon variant="text" @click="searchPlace">
              <v-icon>mdi-magnify</v-icon>
            </v-btn>
          </template>
        </v-text-field>
        <v-btn class="pink-small" @click="fixMarker">장소 등록</v-btn>
      </div>

      <v-list v-if="searchResults.length" class="result-list mb-3">
        <v-list-item
          v-for="(item, index) in searchResults"
          :key="index"
          @click="selectResult(item)"
          class="result-item"
        >
          <v-list-item-title v-html="item.title" />
          <v-list-item-subtitle>{{ item.roadAddress || item.address }}</v-list-item-subtitle>
        </v-list-item>
      </v-list>

      <div ref="mapRef" class="map-container mb-4" style="height: 300px;"></div>

      <div class="mb-4">
        <v-row>
          <v-col v-for="(marker, i) in markers" :key="i" cols="4" class="text-center">
            <div class="marker-wrapper">
              <label class="upload-label">
                <input type="file" accept="image/*" @change="onThumbnailChange($event, i)" hidden />
                <img :src="marker.image" class="marker-img" />
              </label>
            </div>
            <p class="text-caption mt-1">{{ marker.label }}</p>
            <v-btn size="x-small" icon @click="removeMarker(i)"><v-icon>mdi-close</v-icon></v-btn>
          </v-col>
        </v-row>
      </div>

      <h2 class="text-h6 font-weight-bold mb-2">Diary</h2>
      <v-text-field v-model="title" label="제목" outlined dense class="mb-2" />

      <div class="mb-4 d-flex gap-2">
        <v-btn-toggle v-model="activeTab" dense mandatory>
          <v-btn value="post">공개 게시글</v-btn>
          <v-btn value="diary">비공개 일기</v-btn>
        </v-btn-toggle>
      </div>

      <v-textarea
  :model-value="activeTab === 'post' ? postContent : diaryContent"
  @update:modelValue="(val) => {
    if (activeTab === 'post') postContent = val
    else diaryContent = val
  }"
  :label="activeTab === 'post' ? '공개 게시글 내용' : '비공개 일기 내용'"
  :placeholder="activeTab === 'post' ? '게시글 내용을 작성하세요' : '일기 내용을 작성하세요'"
  outlined
  rows="6"
  class="mb-1"
/>

      <p class="text-caption text-grey">{{ activeTab === 'post' ? '해당 내용은 게시글로 저장됩니다.' : '해당 내용은 일기로 저장됩니다.' }}</p>

      <div class="text-end mt-4">
        <v-btn color="black" class="me-2" @click="submitPost">글 등록하기</v-btn>
      </div>
    </v-col>
  </v-container>
</template>

<script setup>
import { ref, onMounted, h, render, nextTick } from 'vue'
import axios from 'axios'
import { useRouter } from 'vue-router'
import { useUserStore } from '@/stores/userStore'
import { Swiper, SwiperSlide } from 'swiper/vue'
import { Pagination } from 'swiper/modules'
import 'swiper/css'
import 'swiper/css/pagination'
import CustomMarker from '@/components/common/CustomMarker.vue'

const router = useRouter()
const userStore = useUserStore()

const fileInput = ref(null)
const uploadedImages = ref([])
const markers = ref([])
const title = ref('')
const postContent = ref('')
const diaryContent = ref('')
const activeTab = ref('post')
const currentStep = ref('photo')
const searchMode = ref('도로명')
const query = ref('')
const searchResults = ref([])

const today = (() => {
  const date = new Date()
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  const weekdays = ['일', '월', '화', '수', '목', '금', '토']
  const weekday = weekdays[date.getDay()]
  return `${year}.${month}.${day} (${weekday})`
})()

let map
const mapRef = ref(null)
let previewMarker = null

class CustomOverlay extends naver.maps.OverlayView {
  constructor(position, content) {
    super()
    this._position = position
    this._content = content
    this.setMap(map)
  }
  onAdd() {
    const pane = this.getPanes().overlayLayer
    pane.appendChild(this._content)
  }
  draw() {
    const projection = this.getProjection()
    const el = this._content
    if (!el) return
    if (el.offsetWidth === 0 || el.offsetHeight === 0) {
      setTimeout(() => this.draw(), 0)
      return
    }
    const pixel = projection.fromCoordToOffset(this._position)
    el.style.position = 'absolute'
    el.style.left = `${pixel.x - el.offsetWidth / 2}px`
    el.style.top = `${pixel.y - el.offsetHeight / 2}px`
  }
  onRemove() {
    if (this._content?.parentNode) {
      this._content.parentNode.removeChild(this._content)
    }
  }
}

onMounted(() => {
  const clientId = import.meta.env.VITE_NAVER_MAP_CLIENT_ID
  const script = document.createElement('script')
  script.src = `https://openapi.map.naver.com/openapi/v3/maps.js?ncpClientId=${clientId}&submodules=geocoder`
  script.defer = true
  script.onload = initMap
  document.head.appendChild(script)
})

function initMap() {
  map = new naver.maps.Map(mapRef.value, {
    center: new naver.maps.LatLng(37.3595704, 127.105399),
    zoom: 13,
    mapTypeControl: true,
    zoomControl: true,
    zoomControlOptions: {
      position: naver.maps.Position.RIGHT_CENTER
    }
  })
}

function searchPlace() {
  if (!query.value) return

  if (searchMode.value === '도로명') {
    naver.maps.Service.geocode({ query: query.value }, (status, response) => {
      if (status !== naver.maps.Service.Status.OK || response.v2.meta.totalCount === 0) {
        alert('주소를 찾을 수 없습니다.')
        return
      }

      // ✅ 여러 개 결과 받기
      const results = response.v2.addresses.map((addr) => ({
        title: addr.roadAddress || addr.jibunAddress,
        address: addr.jibunAddress,
        roadAddress: addr.roadAddress,
        mapx: Number(addr.x),
        mapy: Number(addr.y)
      }))

      searchResults.value = results
    })
  }else {
    axios.get('/api/naver/search', {
      params: { query: query.value }      
    }).then(res => {
      searchResults.value = res.data.data || []
    }).catch(err => {
      console.error('장소 검색 오류:', err)
      searchResults.value = []
    })
  }
}

function selectResult(item) {
  const lat = Number(item.mapy) / 1e7
  const lng = Number(item.mapx) / 1e7
  const latlng = new naver.maps.LatLng(lat, lng)
  if (previewMarker) previewMarker.setMap(null)
  previewMarker = new naver.maps.Marker({
    map,
    position: latlng,
    title: item.title.replace(/<[^>]*>/g, '')
  })
  map.setCenter(latlng)
}

function fixMarker() {
  if (!previewMarker) return
  const position = previewMarker.getPosition()
  const lat = position.lat()
  const lng = position.lng()
  const label = previewMarker.getTitle()
  const markerIndex = markers.value.length
  const markerImage = ''

  markers.value.push({ lat, lng, label, image: markerImage, overlay: null })

  const container = document.createElement('div')
  const vnode = h(CustomMarker, {
    image: markerImage || 'https://placehold.co/100x100?text=+',
    post_id: markerIndex,
    name: label
  })
  render(vnode, container)
  const el = container.firstElementChild
  const img = el.querySelector('img')

  const mountOverlay = () => {
    const overlay = new CustomOverlay(new naver.maps.LatLng(lat, lng), el)
    markers.value[markerIndex].overlay = overlay
  }

  if (img && !img.complete) {
    img.onload = () => setTimeout(mountOverlay, 0)
  } else {
    setTimeout(mountOverlay, 0)
  }
}

function onThumbnailChange(event, index) {
  const file = event.target.files[0]
  if (!file) return

  const reader = new FileReader()
  reader.onload = () => {
    const newImage = reader.result
    markers.value[index].image = newImage
    const { lat, lng, label } = markers.value[index]

    const container = document.createElement('div')
    const vnode = h(CustomMarker, { image: newImage, post_id: index, name: label })
    render(vnode, container)
    const el = container.firstElementChild
    const img = el.querySelector('img')

    if (markers.value[index].overlay) {
      markers.value[index].overlay.setMap(null)
    }

    const mountOverlay = () => {
      const overlay = new CustomOverlay(new naver.maps.LatLng(lat, lng), el)
      markers.value[index].overlay = overlay
    }

    if (img && !img.complete) {
      img.onload = () => setTimeout(mountOverlay, 0)
    } else {
      setTimeout(mountOverlay, 0)
    }
  }

  reader.readAsDataURL(file)
}

function removeMarker(index) {
  const marker = markers.value[index]
  if (marker.overlay) marker.overlay.setMap(null)
  markers.value.splice(index, 1)
}

function openFileDialog() {
  fileInput.value?.click()
}

function handleFileSelect(event) {
  const files = Array.from(event.target.files)
  files.forEach(readAndAddImage)
  currentStep.value = 'photo'
}

function handleDrop(event) {
  const files = Array.from(event.dataTransfer.files)
  files.forEach(readAndAddImage)
  currentStep.value = 'photo'
}

function readAndAddImage(file) {
  const reader = new FileReader()
  reader.onload = () => {
    uploadedImages.value.push(reader.result)
  }
  reader.readAsDataURL(file)
}

function removeImage(index) {
  uploadedImages.value.splice(index, 1)
}

function dataURLtoFile(dataUrl, filename) {
  const arr = dataUrl.split(',')
  const mime = arr[0].match(/:(.*?);/)[1]
  const bstr = atob(arr[1])
  let n = bstr.length
  const u8arr = new Uint8Array(n)
  while (n--) u8arr[n] = bstr.charCodeAt(n)
  return new File([u8arr], filename, { type: mime })
}

async function submitPost() {
  const formData = new FormData()

  const postRequest = {
    memberId: userStore.id,
    title: title.value,
    post: postContent.value,
    diary: diaryContent.value,
    places: markers.value.map((m) => ({
      name: m.label,
      latitude: m.lat,
      longitude: m.lng,
      thumbnailImage: '' // 서버에서 S3 경로로 대체됨
    }))
  }

  formData.append(
    'request',
    new Blob([JSON.stringify(postRequest)], {
      type: 'application/json'
    })
  )

  formData.append('memberId', userStore.id)
  
  uploadedImages.value.forEach((dataUrl, i) => {
    const file = dataURLtoFile(dataUrl, `photo${i}.jpg`)
    formData.append('images', file)
  })

  markers.value.forEach((m, i) => {
    if (m.image) {
      const file = dataURLtoFile(m.image, `thumb${i}.jpg`)
      formData.append('thumbnails', file)
    }
  })

  
  const token = userStore.token

  try {
    await axios.post('/api/posts', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
        Authorization: `Bearer ${token}`
      }
    })
    alert('게시글이 성공적으로 등록되었습니다.')
    router.push(`/mypage/${userStore.id}`)
  } catch (err) {
    console.error('업로드 실패:', err)
    console.log(token);
    alert('등록 실패')
  }
}
</script>

<style scoped>
.border-r {
  border-right: 1px solid #f4d6dc;
}
.tab {
  font-size: 0.95rem;
  font-weight: 600;
  color: #c26b85;
  cursor: pointer;
  padding: 4px 10px;
  border-radius: 8px;
  transition: background 0.3s;
}
.tab:hover {
  background-color: #fbe4ec;
}
.tab.active {
  background-color: #f08caa;
  color: white;
}

.marker-wrapper {
  width: 60px;
  height: 60px;
  border-radius: 50%;
  border: 3px solid #d86f91;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto;
  background-color: white;
  box-shadow: 0 2px 6px rgba(210, 110, 130, 0.2);
  transition: transform 0.2s;
}
.marker-wrapper:hover {
  transform: scale(1.05);
}
.marker-img {
  width: 48px;
  height: 48px;
  object-fit: cover;
  border-radius: 50%;
  transition: opacity 0.2s;
}
.marker-img:hover {
  opacity: 0.85;
}
.upload-label {
  cursor: pointer;
}
.map-container {
  width: 100%;
  height: 300px; /* 변경됨 */
  border-radius: 12px;
  overflow: hidden;
  border: 1px solid #f5c1cd;
  box-shadow: 0 1px 5px rgba(210, 110, 130, 0.1);
  margin-top: 16px;
}

.upload-area {
  width: 100%;
  height: 300px;
  background: linear-gradient(to right, #ffe6ec, #ffd1e1);
  border: 2px dashed #e49ba9;
  border-radius: 12px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  transition: all 0.3s;
  text-align: center;
  padding: 16px;
  color: #c26b85;
  position: relative;
  font-size: 1.2rem;
}
.upload-area::before {
  content: "+";
  font-size: 3rem;
  color: #d86f91;
  opacity: 0.6;
  transition: transform 0.3s ease;
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
}
.upload-area:hover::before {
  transform: translate(-50%, -50%) scale(1.1);
  opacity: 0.8;
}

.v-btn {
  font-weight: bold;
  text-transform: none;
  border-radius: 12px;
}
.v-btn.primary {
  background-color: #f08caa !important;
  color: white !important;
}
.v-btn.primary:hover {
  background-color: #ea7599 !important;
}
.v-btn.outlined {
  color: #d86f91 !important;
  border-color: #f08caa !important;
}
.v-btn.outlined:hover {
  background-color: #ffe0ec !important;
}

/* 💗 추가하기 버튼 - 파스텔 핑크 */
.v-btn.pink-small {
  background-color: #f8c1d1 !important;
  color: white !important;
  font-weight: bold;
  border-radius: 8px;
  padding: 4px 12px;
  font-size: 0.85rem;
}
.v-btn.pink-small:hover {
  background-color: #f4a8c2 !important;
}

/* 🔴 삭제 버튼 (썸네일 옆) */
.v-btn.delete-thumb {
  background-color: #ff5f5f !important;
  color: white !important;
  font-size: 0.8rem;
  min-width: 24px;
  height: 24px;
  border-radius: 50%;
  margin-left: 4px;
  line-height: 1;
  padding: 0;
}

/* 입력 영역 스타일 */
.v-text-field, .v-textarea {
  background-color: #fff5f7;
  border-radius: 8px;
  --v-field-border-color: #f4c7d2;
  --v-field-label-color: hsl(342, 42%, 59%);
  --v-field-input-color: #2e2e2e;
}
.v-textarea textarea {
  padding: 12px !important;
  line-height: 1.6;
}

/* 스와이퍼 스타일 */
.image-swiper {
  width: 100%;
  height: 300px;
  border: 2px dashed #e49ba9;
  border-radius: 12px;
  background: linear-gradient(to right, #ffe6ec, #ffd1e1);
  display: flex;
  align-items: center;
  justify-content: center;
}
.uploaded-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
  border-radius: 8px;
}

/* 썸네일 바 */
.thumbnail-bar {
  display: flex;
  gap: 8px;
  justify-content: center;
  margin-top: 10px;
}
.thumbnail {
  position: relative;
}
.thumbnail img {
  width: 56px;
  height: 56px;
  border-radius: 50%;
  object-fit: cover;
  box-shadow: 0 1px 4px rgba(0,0,0,0.1);
}
.search-controls {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 16px;
}

.search-select {
  min-width: 120px;
  height: 40px;
  font-size: 0.95rem;
  border-radius: 8px;
  background-color: #fff5f7;
  border: 1px solid #f4c7d2;
  padding: 4px 8px;
  color: #c26b85;
}
.search-select:focus {
  outline: none;
  border-color: #f08caa;
}
.result-list {
  max-height: 200px;
  overflow-y: auto;
  background: white;
  border: 1px solid #ccc;
  border-radius: 6px;
}
.result-item {
  cursor: pointer;
}
.result-item:hover {
  background-color: #f0f0f0;
}
.v-btn-toggle .v-btn {
  font-size: 0.85rem;
  padding: 4px 12px;
  border-radius: 8px;
  background-color: #f8f8f8;
  color: #444;
  box-shadow: none;
}

.v-btn-toggle .v-btn--active {
  background-color: #f08caa !important;
  color: white !important;
}
</style>
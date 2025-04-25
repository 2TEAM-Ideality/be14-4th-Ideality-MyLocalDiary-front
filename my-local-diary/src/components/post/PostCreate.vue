<template>
  <v-container class="pa-0 d-flex">
    <!-- 왼쪽 사진 업로드 -->
    <v-col cols="12" md="6" class="pa-10 border-r">
      <div class="text-h5 font-weight-bold mb-1">{{ today }}</div>
      <div class="d-flex gap-4 mb-6">
        <span class="tab" :class="{ active: uploadedImages.length > 0 }">사진 등록</span>
        <span class="tab" :class="{ active: markers.length > 0 }">장소</span>
        <span class="tab" :class="{ active: isPublic }" @click="isPublic = true">공개글</span>
        <span class="tab" :class="{ active: !isPublic }" @click="isPublic = false">비밀글</span>
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

          <div class="thumbnail-bar">
            <div v-for="(image, index) in uploadedImages" :key="index" class="thumbnail">
              <img :src="image" />
              <v-btn icon size="x-small" class="delete-thumb" @click="removeImage(index)">
                <v-icon>mdi-minus</v-icon>
              </v-btn>
            </div>
          </div>
        </template>
      </div>
    </v-col>

    <!-- 오른쪽 장소 등록 + 다이어리 작성 -->
    <v-col cols="12" md="6" class="pa-10">
      <h2 class="text-h6 font-weight-bold mb-3">장소 및 썸네일 등록</h2>
      <p class="text-caption mb-2">장소는 최대 5곳까지 등록할 수 있습니다.</p>

      <!-- 공통 장소 검색 컴포넌트 -->
      <SearchLocation @place-selected="addMarkerFromChild" class="mb-4" />
      <SearchLocation2 @place-selected="addMarkerFromChild" class="mb-6" />

      <p class="text-caption mb-4">업로드한 이미지를 드래그 앤 드롭해서 썸네일로 등록해주세요!</p>

      <v-row class="mb-4">
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

      <div id="map" class="map-container mb-6" style="height: 300px;"></div>

      <h2 class="text-h6 font-weight-bold mb-2">Diary</h2>
      <v-text-field v-model="title" label="제목" outlined dense class="mb-2" />
      <v-textarea v-model="content" label="내용" rows="6" outlined class="mb-4" />

      <div class="text-end">
        <v-btn color="black" class="me-2" @click="submitPost">글 등록하기</v-btn>
      </div>
    </v-col>
  </v-container>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import axios from 'axios'
import { Swiper, SwiperSlide } from 'swiper/vue'
import { Pagination } from 'swiper/modules'
import SearchLocation from '@/components/map/SearchLocation.vue'
import SearchLocation2 from '@/components/map/SearchLocation2.vue'
import 'swiper/css'
import 'swiper/css/pagination'

const fileInput = ref(null)
const uploadedImages = ref([])
const markers = ref([])
const title = ref('')
const content = ref('')
const isPublic = ref(true)
const currentStep = ref('photo')
const today = (() => {
  const d = new Date()
  return `${d.getFullYear()}.${String(d.getMonth() + 1).padStart(2, '0')}.${String(d.getDate()).padStart(2, '0')} (${['일','월','화','수','목','금','토'][d.getDay()]})`
})()

let map

function openFileDialog() {
  fileInput.value?.click()
}
function handleFileSelect(e) {
  Array.from(e.target.files).forEach(readAndAddImage)
  currentStep.value = 'photo'
}
function handleDrop(e) {
  Array.from(e.dataTransfer.files).forEach(readAndAddImage)
  currentStep.value = 'photo'
}
function readAndAddImage(file) {
  const reader = new FileReader()
  reader.onload = () => uploadedImages.value.push(reader.result)
  reader.readAsDataURL(file)
}
function removeImage(i) {
  uploadedImages.value.splice(i, 1)
}

function createMarkerHTML(imageUrl) {
  return `<div style="width: 60px; height: 80px; display: flex; flex-direction: column; align-items: center;">
    <div style="width: 56px; height: 56px; background: white; border: 4px solid black; border-radius: 50%; overflow: hidden;">
      <img src="${imageUrl}" style="width: 100%; height: 100%; object-fit: cover;" />
    </div>
    <div style="width: 0; height: 0; border-left: 8px solid transparent; border-right: 8px solid transparent; border-top: 12px solid black; margin-top: -4px;"></div>
  </div>`
}

function initMap() {
  map = new naver.maps.Map('map', {
    center: new naver.maps.LatLng(37.3595704, 127.105399),
    zoom: 10,
    zoomControl: true,
    zoomControlOptions: { position: naver.maps.Position.RIGHT_CENTER }
  })
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition((pos) => {
      const loc = new naver.maps.LatLng(pos.coords.latitude, pos.coords.longitude)
      map.setCenter(loc)
      map.setZoom(15)
    })
  }
}

function addMarkerFromChild({ lat, lng, label }) {
  if (markers.value.length >= 5) return

  const latlng = new naver.maps.LatLng(lat, lng)
  new naver.maps.Marker({
    position: latlng,
    map,
    icon: {
      content: createMarkerHTML('https://via.placeholder.com/100x100.png?text=+'),
      size: new naver.maps.Size(60, 80),
      anchor: new naver.maps.Point(30, 80)
    }
  })

  markers.value.push({ lat, lng, label, image: 'https://via.placeholder.com/100x100.png?text=+' })
}

function onThumbnailChange(e, i) {
  const file = e.target.files[0]
  if (!file) return
  const reader = new FileReader()
  reader.onload = () => { markers.value[i].image = reader.result }
  reader.readAsDataURL(file)
}

function removeMarker(i) {
  markers.value.splice(i, 1)
}

function submitPost() {
  axios.post('/api/posts', {
    title: title.value,
    content: content.value,
    images: uploadedImages.value,
    markers: markers.value,
    isPublic: isPublic.value
  }).then(() => {
    alert('게시글이 등록되었습니다!')
  }).catch(err => {
    console.error('등록 실패:', err)
  })
}

onMounted(() => {
  const clientId = import.meta.env.VITE_NAVER_MAP_CLIENT_ID
  const script = document.createElement('script')
  script.src = `https://openapi.map.naver.com/openapi/v3/maps.js?ncpClientId=${clientId}&submodules=geocoder`
  script.defer = true
  script.onload = initMap
  document.head.appendChild(script)
})
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
</style>
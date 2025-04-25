<template>
  <v-app class="mypage-container">
    <v-main>
      <div style="display: flex; height: 100vh;">
        <!-- 왼쪽 영역 -->
        <div
          class="d-flex justify-center"
          style="flex: 4.5; border-right: 1px solid #E5E7EB; box-shadow: 4px 0 12px -4px rgba(0, 0, 0, 0.1);"
        >
          <div class="left-side">
            <div style="font-size: 20px;">마이 페이지 유저 정보</div>

            <!-- 추후 장소 검색 추가용 컴포넌트 -->
            <!--
            <SearchLoactaion :onPlaceSelect="(place) => {
              console.log('🧭 선택된 장소:', place)
              new naver.maps.Marker({
                map,
                position: new naver.maps.LatLng(place.y, place.x),
                title: place.name
              })
            }" />
            -->

            <!-- 오늘의 다이어리 카드 -->
            <TodayDiaryCard
              :date="date"
              title="오늘 신대방동 돈까스 투어 했는데...."
              :places="neighborhoods"
              thumbnail="/images/profile-thumbnail.png"
            />

            <!-- 미니 지도 -->
            <div class="mini-map">
              <router-link to="/user-map-home" class="link-to">지도에서 보기 →</router-link>
              <MiniMap />
            </div>
          </div>
        </div>

        <!-- 오른쪽 영역 -->
        <div style="flex: 4.4; display: flex; justify-content: center; align-items: center;">
          오른쪽 영역
        </div>
      </div>
    </v-main>
  </v-app>
</template>

<script setup>
import { format } from 'date-fns'
import { ko } from 'date-fns/locale'

import SearchLoactaion from '@/components/map/SearchLoactaion.vue'
import MiniMap from '@/components/mypage/MiniMap.vue'
import TodayDiaryCard from '@/components/mypage/TodayDiary.vue'

// ✅ 오늘 날짜: "2025.04.24.THU" 형태로 포맷팅
const date = format(new Date(), 'yyyy.MM.dd.EEE', { locale: ko }).toUpperCase()

// 🏠 발견한 동네 목록 (props용)
const neighborhoods = [
  { name: '신대방동 294', latitude: 37.4854, longitude: 126.9016 },
  { name: '보라매로 73', latitude: 37.4923, longitude: 126.9248 },
  { name: '보라매로 73', latitude: 37.4923, longitude: 126.9248 },
  { name: '보라매로 73', latitude: 37.4923, longitude: 126.9248 }
]
</script>

<style scoped>
.mypage-container {
  margin-left: 220px;
}

.left-side {
  display: flex;
  flex-direction: column;
  width: 90%;
  padding-right: 15px;
}

.mini-map {
  width: 100%;
  margin-top: 16px;
}

.link-to {
  font-size: 15px;
  font-weight: bold;
  color: #2C2C2C;
  text-decoration: none;
  cursor: pointer;
  display: inline-block;
}
.link-to:hover {
  text-decoration: underline;
}
</style>

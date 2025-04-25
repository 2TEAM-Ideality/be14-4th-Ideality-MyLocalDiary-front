<template>
  <v-app class="mypage-container">
    <v-main>
      <div style="display: flex; height: 100vh;">
        <div
          class="d-flex align-center justify-center left-side"
          style="flex: 5.6; border-right: 1px solid #E5E7EB; box-shadow: 4px 0 12px -4px rgba(0, 0, 0, 0.1);"
        >
          <div>마이 페이지 유저 정보</div>

          <router-link to="/user-map-home" class="see-all">지도에서 보기 →</router-link>
          <div class="mini-map">
            <MiniMap/>
          </div>
        </div>
       
       
        <div style="flex: 4.4; display: flex; justify-content: center; align-items: center;">
          오른쪽 영역
        </div>
      </div>
    </v-main>
  </v-app>
</template>


<script setup>
import MiniMap from '@/components/mypage/MiniMap.vue';
import postDummy from '@/json/post.json';




</script>

<style scoped>
.mypage-container {
  margin-left: 200px;
  /* background-color: yellow; */
}

.left-side {
  display:flex;
  flex-direction: column;
}
.mini-map {
  margin: 0 auto;
  width: 80%;
  height: 100%;
}
</style>
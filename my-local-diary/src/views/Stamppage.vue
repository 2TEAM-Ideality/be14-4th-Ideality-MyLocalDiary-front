<template>
    <div class="container">
      <!-- 왼쪽 비워둔 영역 -->
      <div class="left-side"></div>
  
      <!-- 오른쪽 스탬프 영역 -->
      <div class="right-side">
        <div class="stamps">
          <CatStampBar
            v-for="(stamp, index) in paginatedStamps"
            :key="index"
            :title="stamp.title"
            :stampImage="stamp.stampImage"
            :count="stamp.count"
          />
          
          <!-- 버튼들: 이전/다음 페이지 버튼 -->
          <div class="button-row">
            <button
              v-if="currentPage > 0"
              @click="previousPage"
              class="prev-button"
            >
              이전장으로
            </button>
            <button
              v-if="currentPage < totalPages - 1"
              @click="nextPage"
              class="next-button"
            >
              다음장으로 넘기기
            </button>
          </div>
        </div>
        
      </div>
    </div>
  </template>
  
  
  
  <script>
  import CatStampBar from '/src/components/stamp/stamp.vue';
  
  export default {
    name: 'Stamppage',
    components: { CatStampBar },
    data() {
      return {
        currentPage: 0,
        stampsPerPage: 4,
        stamps: [
          { title: '카페냥', stampImage: '/src/assets/stamp_pic/카페냥.png', count: 5 },
          { title: '산책냥', stampImage: '/src/assets/stamp_pic/산책냥.png', count: 5 },
          // 추가 스탬프
          { title: '꽐라냥', stampImage: '/src/assets/stamp_pic/꽐라냥.png', count: 5 },
          { title: '독서냥', stampImage: '/src/assets/stamp_pic/독서냥.png', count: 5 },
          { title: '맛집냥', stampImage: '/src/assets/stamp_pic/맛집냥.png', count: 5 },
          { title: '영화냥', stampImage: '/src/assets/stamp_pic/영화냥.png', count: 5 },
        ],
      };
    },
    computed: {
      totalPages() {
        return Math.ceil(this.stamps.length / this.stampsPerPage);
      },
      paginatedStamps() {
        const start = this.currentPage * this.stampsPerPage;
        return this.stamps.slice(start, start + this.stampsPerPage);
      },
    },
    methods: {
      nextPage() {
        if (this.currentPage < this.totalPages - 1) {
          this.currentPage++;
        }
      },
      previousPage() {
      if (this.currentPage > 0) {
        this.currentPage--;
      }
    },
    },
  };
  </script>
  
  <style scoped>
  .container {
    display: flex;
    height: 100vh;
  }
  
  .left-side {
    flex: 1;
    background-color: #f0f0f0; /* 선택 사항 */
  }
  
  .right-side {
    
  flex: 1;
  background-color: #fff5f7;
  padding: 20px;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.stamps {
    justify-content: center; /* 중앙 정렬을 위해 추가 */
    align-items: center; 
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: 16px;
  flex-grow: 1; /* flex-grow를 추가하여 stamps 영역이 남은 공간을 채우도록 */
}

.button-row {
  display: flex;
  justify-content: flex-end;
  width: 100%;
  margin-top: auto; /* 이 부분을 추가하여 버튼이 아래로 밀려가게 */
}


.next-button, .prev-button {
  background-color: #ff88a0;
  color: white;
  border: none;
  padding: 10px 20px;
  border-radius: 10px;
  cursor: pointer;
}

.prev-button {
  margin-right: 10px; /* "이전장으로"와 "다음장으로" 버튼 간의 간격 */
}


  </style>
  
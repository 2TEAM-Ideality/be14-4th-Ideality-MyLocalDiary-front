<template>
    <div class="cat-stamp-container">
      <div class="category-bar">
        <img src="/src/assets/stamp_pic/cat_bar.png" alt="카테고리 바" class="category-img" />
        <div class="category-title">{{ title }}</div>
      </div>
      <div class="stamp-list">
        <img
          v-for="(stamp, index) in generatedStamps"
          :key="index"
          :src="stamp"
          alt="스탬프"
          class="stamp"
        />
      </div>
    </div>
  </template>
  
  <script>
  export default {
    name: 'CatStampBar',
    props: {
      title: { type: String, required: true },
      stampImage: { type: String, required: true },
      count: { type: Number, default: 5 },
    },
    computed: {
      generatedStamps() {
        return Array(this.count).fill(this.stampImage);
      },
    },
  };
  </script>
  
  <style scoped>
.cat-stamp-container {
  background-color: #fff5f7;
  padding: 10px;
  width: 566px; /* 🔒 5개 도장이 딱 들어가는 고정 크기 */

}

  
  .category-bar {
    position: relative;
    display: flex;
    align-items: center;
  }
  
  .category-img {
    height: 60px;
  }
  
  .category-title {
    position: absolute;
    left: 14px;
    top: 65%;
    transform: translateY(-50%);
    color: #333;
    font-size: 15px;
    font-weight: bold;
  }
  
  .stamp-list {
    display: flex;
    gap: 15px;
  }
  
  .stamp {
  width: 80px;
  height: 80px;
  display: block; /* ✅ 요거 중요! */
  border: none;
  border-radius: 0;
  padding: 0;
  margin: 0; /* 혹시 모를 margin도 제거 */
  background-color: transparent;
}

</style>
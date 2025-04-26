<template>
  <div class="cat-stamp-container">
    <div class="category-bar">
      <img
        src="/src/assets/stamp_pic/cat_bar.png"
        alt="카테고리 바"
        class="category-img"
      />
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

<script setup>
import { computed } from 'vue';
import { defineProps } from 'vue';

const props = defineProps({
  title: { type: String, required: true },
  stampImage: { type: String, required: true },
  count: { type: Number, default: 1 },
});

const generatedStamps = computed(() => {
  return Array(props.count).fill(props.stampImage);
});
</script>

<style scoped>
.cat-stamp-container {
  background-color: #fff5f7;
  padding: 10px;
  width: 566px;
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
  display: block;
  border: none;
  background-color: transparent;
  cursor: pointer;
  transition: transform 0.3s ease;
}

.stamp:hover {
  transform: scale(1.3);
}
</style>

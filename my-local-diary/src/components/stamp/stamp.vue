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
        @click="playRandomMeow"
      />
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue';
import { ref } from 'vue';
import { defineProps } from 'vue';

const props = defineProps({
  title: { type: String, required: true },
  stampImage: { type: String, required: true },
  count: { type: Number, default: 1 },
});

const generatedStamps = computed(() => {
  return Array(props.count).fill(props.stampImage);
});

const playRandomMeow = () => {
  const catSounds = [
    'https://prismatic-sunshine-3445cc.netlify.app/cats/cat1.mp3',
    'https://prismatic-sunshine-3445cc.netlify.app/cats/cat2.wav',
    'https://prismatic-sunshine-3445cc.netlify.app/cats/cat3.mp3',
    'https://prismatic-sunshine-3445cc.netlify.app/cats/cat4.mp3',
    'https://prismatic-sunshine-3445cc.netlify.app/cats/cat5.mp3',
    'https://prismatic-sunshine-3445cc.netlify.app/cats/cat6.mp3',
    'https://prismatic-sunshine-3445cc.netlify.app/cats/cat7.mp3',
    'https://prismatic-sunshine-3445cc.netlify.app/cats/cat8.mp3',
    'https://prismatic-sunshine-3445cc.netlify.app/cats/cat9.mp3',
    'https://prismatic-sunshine-3445cc.netlify.app/cats/cat10.wav',
  ];
  const randomIndex = Math.floor(Math.random() * catSounds.length);
  const audio = new Audio(catSounds[randomIndex]);
  audio.play();
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
  width: 90px;
  height: 90px;
  display: block;
  border: none;
  border-radius: 0;
  padding: 0;
  margin: 0;
  background-color: transparent;
  cursor: pointer;
  transition: transform 0.3s ease;
}

.stamp:hover {
  transform: scale(1.3); /* 🐾 확실히 커지는 hover 효과 */
}
</style>

<template>
  <v-card class="today-diary-card" flat>
    <div class="header d-flex justify-space-between align-center mb-2">
      <p class="today-text">
        TODAY : <span class="today-date">{{ formattedToday }} {{ dayOfWeek }}</span>
      </p>
      <template v-if="isMyPage">
        <v-icon size="18" color="grey" @click="createDiary">mdi-pencil</v-icon>
      </template>
    </div>

    <div v-if="todayDiary">
      <!-- 오늘 작성한 다이어리 있을 때 -->
      <div class="content">
        

        <div class="text-content">
          <div class="title-section d-flex align-center mb-2">
              <img :src="todayDiary.thumbnail" 
                    class="thumbnail"
                    alt="Diary Thumbnail"
                    @error="handleImageError"
              />
          </div>
          <div class="title-place">
            <span class="diary-title text-truncate">
              {{ todayDiary.postTitle }}
            </span>
            <div class="place-chips d-flex flex-wrap gap-2">
              <LocationChip
                v-for="(place, i) in visiblePlaces"
                :key="i"
                :place="place"
              />
              <v-chip
                v-if="hiddenCount > 0"
                size="small"
                class="text-caption muted"
                color="grey-lighten-3"
              >
                +{{ hiddenCount }}
              </v-chip>
          </div>
        </div>
        </div>
        <!-- 날짜 출력 -->
        <div class="created-at muted text-caption">{{ formattedCreatedAt }}</div>
      </div>
    </div>

    <div v-else class="no-diary">
      아직 글을 작성하지 않았어요.<br />

      <template v-if="isMyPage">
        오늘의 일기를 작성해보세요 ✍️
      </template>
     
    </div>
  </v-card>
</template>


<script setup>
import { ref, onMounted, computed } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useUserStore } from '@/stores/userStore'

import axios from 'axios'
import LocationChip from '@/components/common/LocationChip.vue'
import defaultThumbnail from '@/assets/cursor/슈크림붕어빵1.png';


// 라우터 이동용
const router = useRouter()

const userStore = useUserStore()
const route = useRoute()

// 내가 쓴 페이지인지 판별
const isMyPage = computed(() => {
  return Number(route.params.id) === userStore.id
})



// 오늘 다이어리 데이터 (초기에는 null)
const todayDiary = ref({})

// 최대 보여줄 장소 개수
const maxVisible = 3
const visiblePlaces = ref([])
const hiddenCount = ref(0)

// 오늘 날짜
const dayNames = ['일요일', '월요일', '화요일', '수요일', '목요일', '금요일', '토요일']
const today = new Date()
const formattedToday = `${today.getFullYear()}.${(today.getMonth()+1).toString().padStart(2, '0')}.${today.getDate().toString().padStart(2, '0')}`
const dayOfWeek = dayNames[today.getDay()]

const formattedCreatedAt = computed(() => {
  if (!todayDiary.value?.createdAt) return '';
  const date = new Date(todayDiary.value.createdAt);
  const yyyy = date.getFullYear();
  const mm = String(date.getMonth() + 1).padStart(2, '0');
  const dd = String(date.getDate()).padStart(2, '0');
  return `${yyyy}.${mm}.${dd}`;
});



// 다이어리 작성 페이지 이동
const createDiary = () => {
  router.push('/post/create')
}

// 오늘 다이어리 데이터 가져오기
const fetchTodayDiary = async () => {
  try {
    const isMyPost = Number(route.params.id) === userStore.id;

    const url = isMyPost
      ? `/api/posts/my/map`
      : `/api/posts/follow/map`;
    
    
    const res = await axios.get(url, {
      params: { memberId : userStore.id },
      headers: {
        Authorization: `Bearer ${userStore.token}`
      }
    });
    const data = res.data;
    console.log('📌 받아온 게시글 목록:', data);

    if (data && data.length > 0) {
      const lastPost = data[data.length - 1];
      const postDate = new Date(lastPost.createdAt);
      
      // 오늘 날짜 문자열과 비교
      const postDateStr = `${postDate.getFullYear()}.${(postDate.getMonth() + 1).toString().padStart(2, '0')}.${postDate.getDate().toString().padStart(2, '0')}`;
      
      if (postDateStr === formattedToday) {
        todayDiary.value = {
          ...lastPost,
          title: lastPost.placeName,
          thumbnail: lastPost.thumbnailImage,
          places: [{ name: lastPost.placeName }]
        };

        visiblePlaces.value = todayDiary.value.places.slice(0, maxVisible);
        hiddenCount.value = todayDiary.value.places.length - maxVisible;
      } else {
        todayDiary.value = null;
      }
    } else {
      todayDiary.value = null;
    }

    console.log('📌 TODAY DIARY 보여줄 것: ', todayDiary.value);
  } catch (error) {
    console.error('❌ 오늘 다이어리 가져오기 실패', error);
    todayDiary.value = null;
  }
};

const handleImageError = (event) => {
  event.target.src = defaultThumbnail;
}

onMounted(() => {
  fetchTodayDiary()
})
</script>

<style scoped>
.today-diary-card {
  height:100%;
  display: flex;
  flex-direction: column;
  border: 1px solid #e0e0e0;
  border-radius: 12px;
  padding: 20px 30px 30px 30px;
  background-color: white;
  box-shadow: 0 2px 8px rgba(0,0,0,0.05);
}

.header {
  margin-bottom: 20px;
  padding-bottom: 10px;
}

.content {
  display: flex;
  flex-direction: row;
  gap: 10px;
  justify-content: space-between;
}

.today-text {
  font-size: 18px;
  font-weight: bold;
  color: #ff6e7f;
}

.today-date {
  color: #FECCCC;
  margin-left: 4px;
}

.text-content {
  display: flex;
  flex-direction: row;
  gap: 20px;
}

.diary-title {
  font-size: 16px;
  font-weight: bold;
  max-width: 200px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.title-place {
  display:flex;
  flex-direction: column;
  gap: 15px;
}
.thumbnail {
  width: 70px;
  height: 70px;
  object-fit: cover;
  border-radius: 50%; /* ✅ 원형 썸네일 */
  border: 2px solid #ccc;
}

.place-chips {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 4px;
  margin-top: 4px;
}

.muted {
  color: #777;
}

.no-diary {
  text-align: center;
  padding: 40px 0;
  font-size: 16px;
  color: #555;
  line-height: 1.6;
}
</style>

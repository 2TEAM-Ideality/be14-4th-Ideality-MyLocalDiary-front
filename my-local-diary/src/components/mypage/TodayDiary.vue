<template>
    <v-card class="today-diary-card" flat>
      <!-- 상단 날짜 + 펜 아이콘 -->
        <div class="header d-flex justify-space-between align-center mb-2">
            <span class="today-text">
                TODAY : <span class="today-date">{{ date }}</span>
            </span>
            <v-icon size="18" color="grey" @click="createDiary">mdi-pencil</v-icon>
        </div>
        
      <!-- 마커 썸네일 -->
       <div class="content">
        <div class="title-section d-flex align-center mb-2">
            <v-avatar size="30" class="mr-2">
            <img :src="thumbnail" />
            </v-avatar>
        </div>
        <!-- 글 정보 -->
        <div class="text-content">
            <span class="diary-title text-truncate">{{ title }}</span>
            <!-- 장소 목록 -->
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
      
      
    </v-card>
  </template>
  
<script setup>
import {useRouter} from 'vue-router';
import LocationChip from '@/components/common/LocationChip.vue'
  
  const props = defineProps({
    date: String,
    title: String,
    places: {
      type: Array,
      default: () => []
    },
    thumbnail: String,
    maxVisible: {
      type: Number,
      default: 3
    }
  })
  const router = useRouter(); 

  const visiblePlaces = props.places.slice(0, props.maxVisible)
  const hiddenCount = props.places.length - props.maxVisible

  const createDiary = () => {
    router.push('/create-diary');
  }

</script>
  

<style scoped>
  .today-diary-card {
    border: 1px solid #e0e0e0;
    border-radius: 12px;
    padding: 20px 18px 30px 18px;
    background-color: white;  /* ✅ 노랑이 테스트용이면 원래 배경색 추천 */
    box-shadow: 0 2px 8px rgba(0,0,0,0.05); /* 👈 약간의 입체감 */
  }

  .content {
    display: flex;
    flex-direction: row;
    gap: 15px;
  }
  
  .today-text {
    font-size: 18px;
    font-weight: bold;
    color: #ff6e7f;
    }

    .today-date {
    color: #FECCCC;
    margin-left: 4px; /* 너무 붙지 않도록 살짝만 띄움 */
    }
  .text-content {
    display: flex;
    flex-direction: column;
    gap: 10px;
  }
  
  .diary-title {
    font-size: 14px;
    font-weight: 500;
    max-width: 200px;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
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
  </style>
  
<template>
    <div class="search-overlay" :style="{ marginLeft: ui.isHover ? '200px' : '80px' }">
      <v-text-field
        v-model="localQuery"
        append-inner-icon="mdi-magnify"
        placeholder="장소명 또는 주소를 입력해주세요."
        @keydown="onKeyDown"
        @click:append-inner="handleSearch"
        density="comfortable"
        variant="outlined"
        hide-details
        class="search-bar"
        rounded="xl"
        ref="searchInput"
      />
      <!-- label="장소 검색" -->

  
      <v-list v-if="searchResults.length" class="result-list">
        <v-list-item
          v-for="(item, index) in searchResults"
          :key="index"
          @click="selectItem(item)"
          :class="{ 'selected-item': index === selectedIndex }"
          class="result-item"
        >
          <v-list-item-title v-html="item.title" />
          <v-list-item-subtitle>
            {{ item.roadAddress || item.address }}
          </v-list-item-subtitle>
        </v-list-item>
      </v-list>
    </div>
  </template>
  
  <script setup>
  import { ref, watch, onMounted } from 'vue'
  import { useUIStore } from '@/stores/uiStore'
  import axios from 'axios'
  
  const props = defineProps({ query: String })
  const emit = defineEmits(['update:query', 'place-selected'])
  
  const ui = useUIStore()
  const localQuery = ref(props.query || '')
  const searchResults = ref([])
  const selectedIndex = ref(-1)
  
  const searchInput = ref(null)
  
  watch(() => props.query, (val) => {
    localQuery.value = val
  })
  
  async function handleSearch() {
    try {
      if (!localQuery.value.trim()) return
  
      const res = await axios.get('/naver/v1/search/local.json', {
        params: { query: localQuery.value, display: 5 },
        headers: {
          'X-Naver-Client-Id': import.meta.env.VITE_NAVER_SEARCH_CLIENT_ID,
          'X-Naver-Client-Secret': import.meta.env.VITE_NAVER_SEARCH_CLIENT_SECRET,
        },
      })
  
      searchResults.value = res.data.items || []
      selectedIndex.value = 0
      emit('update:query', localQuery.value)
      console.log('🔍 검색 결과:', res.data.items) // 추가
      
    } catch (err) {
      console.error(err)
      alert('검색 오류 발생')
    }
  }
  
  function selectItem(item) {
    emit('place-selected', item)
    searchResults.value = []
    selectedIndex.value = -1
  }
  
  function onKeyDown(e) {
    const total = searchResults.value.length

    // ⛔ Enter 키 눌렀을 때, 검색하지 않도록 검색 로직 제거
    if (e.key === 'Enter') {
      if (selectedIndex.value >= 0 && selectedIndex.value < total) {
        selectItem(searchResults.value[selectedIndex.value])
      }
      // else 문 제거됨
    } else if (e.key === 'ArrowDown') {
      selectedIndex.value = (selectedIndex.value + 1) % total
      e.preventDefault()
    } else if (e.key === 'ArrowUp') {
      selectedIndex.value = (selectedIndex.value - 1 + total) % total
      e.preventDefault()
    }
  }

  </script>
  
  <style scoped>
  .search-overlay {
    position: absolute;
    top: 24px;
    left: 24px;
    width: 360px;
    z-index: 10;
    border-radius: 50px;
  }
  .search-bar {
    background-color: white;
    border-radius: 50px !important;
  }
  .result-list {
    max-height: 260px;
    overflow-y: auto;
    background: white;
    border: 1px solid #ccc;
    border-radius: 6px;
    margin-top: 4px;
  }
  .result-item {
    cursor: pointer;
  }
  .result-item:hover,
  .selected-item {
    background-color: #f0f0f0;
  }
  </style>
  
<template>
    <div class="sidebar" @mouseenter="isHover = true" @mouseleave="isHover = false">
      <nav>
        <ul>
          <!-- 홈 아이콘만 이미지 전환 -->
          <li>
            <div class="icon-container">
              <img
                v-if="!isHover"
                src="@/assets/cursor_ 10.svg"
                alt="cursor"
                class="default-img"
              />
              <img
                v-else
                src="@/assets/My_Local_Diary.png"
                alt="diary"
                class="hover-img"
              />
            </div>
          </li>
            <li>
            <img src="@/assets/Map.png" alt="map" />
            <span>지도 홈</span>
          </li>
          <li class="clickable"  @click="goToMypage">
            <img src="@/assets/person.png" alt="마이페이지" width=36px />
            <span>마이페이지</span>
          </li>
          <li>
            <img src="@/assets/Pen.png" alt="pen" />
            <span>글쓰기</span>
          </li>
          <li>
            <img src="@/assets/Search.png" alt="search" />
            <span>검색</span>
          </li>
          <li>
            <img class="stamp-img" src="@/assets/stamp.png" alt="stamp" />
            <span>스탬프 목록</span>
          </li>
          <li>
            <img src="@/assets/notifications.png" alt="notifications" />
            <span>알림</span>
          </li>
        </ul>
      </nav>
    </div>
  </template>
  
  <script setup>
  import { ref } from 'vue'
    import { useRouter } from 'vue-router'

  const isHover = ref(false)
    const router = useRouter()

const goToMypage = () => {
  router.push('/mypage')
}
  </script>
  
  <style scoped>
  .sidebar {
    width: 60px;
    background: #fff;
    border-right: 1px solid #ddd;
    height: 100vh;
    padding-top: 1rem;
    transition: width 0.3s ease;
    overflow: hidden;
    position: fixed;
  }
  
  .sidebar:hover {
    width: 200px;
  }
  
  nav ul {
    list-style: none;
    padding: 0;
  }
  
  nav li {
    margin: 1.5rem 0;
    text-align: left;
    display: flex;
    align-items: center;
    gap: 12px;
    padding-left: 16px;
  }
  
  .icon-container {
    display: flex;
    align-items: center;
    justify-content: center;
  }
  
  /* 일반 아이콘 */
  nav img {
    width: 24px;
    flex-shrink: 0;
  }
  
  /* 스탬프만 크게 */
  .stamp-img {
    width: 36px;
    margin-left: -4px;
  }
  
  /* 홈 아이콘 기본 */
  .default-img {
    width: 36px;
    margin-left:-6px;
  }
  
  /* hover 시 교체될 홈 아이콘 */
  .hover-img {
    width: 150px;
  }
  
  nav span {
    opacity: 0;
    transition: opacity 0.2s ease;
    white-space: nowrap;
  }
  
  .sidebar:hover nav span {
    opacity: 1;
  }
  
  .clickable {
  cursor: pointer;
}


  </style>
  
  
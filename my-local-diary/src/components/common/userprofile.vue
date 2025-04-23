<template>
    <div class="w-full max-w-md mx-auto p-6 rounded-2xl shadow-lg bg-white text-gray-900">
      <div class="flex items-center gap-4">
        <img :src="profileImage" alt="profile" class="w-20 h-20 rounded-full object-cover border-2 border-black" />
        <div>
          <h1 class="text-2xl font-bold">Madara Uchiha</h1>
          <div class="flex gap-4 mt-1 text-sm text-gray-600">
            <div>게시글 <strong>{{ posts }}</strong>개</div>
            <div>팔로워 <strong>{{ followers }}</strong></div>
            <div>팔로우 <strong>{{ following }}</strong></div>
          </div>
        </div>
        <button class="ml-auto bg-black text-white px-4 py-1 rounded-lg hover:bg-gray-800 transition">
          팔로우
        </button>
      </div>
  
      <p class="mt-4 text-sm">
        세미 매국노, 패션 애국인 
      </p>
  
      <div class="mt-4 text-sm flex items-center">
        <span class="mr-2">🎵</span>
        <span>요아소비 - IDOL</span>
      </div>
  
      <!-- 자동재생 버튼 (visible하지 않음) -->
      <div class="mt-2">
        <button @click="playMusic" class="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700" style="display: none;">
          음악 재생
        </button>
      </div>
  
      <!-- YouTube Player -->
      <div id="player" style="display: none;"></div>
    </div>
  </template>
  
  <script>
  export default {
    name: 'UserProfile',
    data() {
      return {
        profileImage: '/src/assets/profile/idol_profile.png',
        posts: 10,
        followers: 600,
        following: 600,
        searchQuery: '', // 유저가 검색한 음악
        searchResults: [], // 검색 결과
        player: null,
        ytReady: false,
        videoId: 'DC13_hnbzCA', // 영상 ID
      };
    },
    mounted() {
  if (!window.YT || !window.YT.Player) {
    const tag = document.createElement('script');
    tag.src = 'https://www.youtube.com/iframe_api';
    const firstScriptTag = document.getElementsByTagName('script')[0];
    firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);

    window.onYouTubeIframeAPIReady = () => {
      this.initPlayer();
    };
  } else {
    // 이미 API가 로드된 경우 바로 초기화
    this.initPlayer();
  }
},
methods: {
  initPlayer() {
    // 기존 플레이어가 있을 경우 제거 (다시 진입 시 충돌 방지)
    if (this.player && typeof this.player.destroy === 'function') {
      this.player.destroy();
    }

    this.player = new YT.Player('player', {
      height: '0',
      width: '0',
      videoId: this.videoId,
      playerVars: {
        autoplay: 1,
        mute: 1, // 자동재생을 위한 mute
        controls: 0,
        modestbranding: 1,
        rel: 0,
      },
      events: {
        onReady: (event) => {
          this.ytReady = true;
          event.target.playVideo();
          event.target.unMute();
          event.target.setVolume(50);
        },
      },
    });
  },
},

      playMusic() {
        if (this.player && this.ytReady) {
          this.player.playVideo(); // 영상 자동 재생
        }
      },
    };
  </script>
  
  <style scoped>
  /* 전체 카드 스타일 */
  div {
    font-family: 'Pretendard', sans-serif;
  }
  
  /* 버튼 효과 */
  button {
    transition: all 0.3s ease;
  }
  
  /* 음악 정보 섹션 */
  .music-section {
    display: flex;
    align-items: center;
    margin-top: 1rem;
    font-size: 0.95rem;
    color: #4b5563; /* text-gray-600 */
  }
  
  .music-section span:first-child {
    font-size: 1.2rem;
    margin-right: 0.5rem;
  }
  
  /* 재생 버튼 스타일 */
  .play-button {
    background-color: #2563eb; /* blue-600 */
    color: white;
    padding: 0.5rem 1rem;
    border-radius: 0.5rem;
    font-weight: 500;
  }
  
  .play-button:hover {
    background-color: #1d4ed8; /* blue-700 */
  }
  
  /* 숨겨진 iframe 영역 */
  #player {
    width: 0;
    height: 0;
    overflow: hidden;
  }
  </style>
  
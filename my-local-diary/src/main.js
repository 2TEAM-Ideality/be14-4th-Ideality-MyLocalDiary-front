import { createApp } from 'vue'
import { createPinia } from 'pinia'
import App from './App.vue'
import router from './router'
import vuetify from './plugins/vuetify'
import 'swiper/css';
import 'swiper/css/pagination';

import '@mdi/font/css/materialdesignicons.css'  // 아이콘

// main.js 또는 App.vue의 setup이나 onMounted 등에서

const TEMP_TOKEN = 'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzUxMiJ9.eyJzdWIiOiIxIiwiZW1haWwiOiJ0ZXN0QGVtYWlsLmNvbSIsInJvbGUiOiJVU0VSIiwiaWF0IjoxNzQ1OTA2MTM1LCJleHAiOjE3NDU5NDkzMzV9.1UOC3RseaAZ-QKxbEsKAVlWFBCNA18jR6SOnGfVq38iDWOOKOl1xC4Jm5HVGRfVpR5gskTr3sf9wtY27Bas1uQ';

if (!localStorage.getItem('accessToken')) {
  localStorage.setItem('accessToken', TEMP_TOKEN);
}


// ⭐ Naver Maps API 스크립트 동적 로딩
const loadNaverMapsScript = () => {
  return new Promise((resolve, reject) => {
    if (document.getElementById('naver-maps-script')) {
      resolve();
      return;
    }
    // initGeocoder();
    const script = document.createElement('script');
    script.id = 'naver-maps-script';
    script.src = `https://oapi.map.naver.com/openapi/v3/maps.js?ncpKeyId=${import.meta.env.VITE_NAVER_MAP_CLIENT_ID}&submodules=geocoder`;
    script.async = true;
    script.onload = resolve;
    script.onerror = reject;
    document.head.appendChild(script);
  });
};

loadNaverMapsScript()
  .then(() => {
    console.log('✅ Naver Maps script loaded!')
    
    const pinia = createPinia()
    const app = createApp(App)
    
    app.use(router)
    app.use(vuetify)
    app.use(pinia)

    app.mount('#app')
  })
  .catch((err) => {
    console.error('❌ Failed to load Naver Maps script', err)
  })



  
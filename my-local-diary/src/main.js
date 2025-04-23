import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import vuetify from './plugins/vuetify'



// ⭐ Naver Maps API 스크립트 동적 로딩
const loadNaverMapsScript = () => {
  return new Promise((resolve, reject) => {
    if (document.getElementById('naver-maps-script')) {
      resolve();
      return;
    }

    const script = document.createElement('script');
    script.id = 'naver-maps-script';
    script.src = `https://oapi.map.naver.com/openapi/v3/maps.js?ncpKeyId=${import.meta.env.VITE_NAVER_MAP_CLIENT_ID}&style=ae8bf51c-899d-4773-9851-1f670d719a19`;
    script.async = true;
    script.onload = resolve;
    script.onerror = reject;
    document.head.appendChild(script);
  });
};


loadNaverMapsScript()
  .then(() => {
    console.log('✅ Naver Maps script loaded!')
    const app = createApp(App)
    app.use(router)
    app.use(vuetify)
    app.mount('#app')
  })
  .catch((err) => {
    console.error('❌ Failed to load Naver Maps script', err)
  })
import { fileURLToPath, URL } from 'node:url'
import { defineConfig, loadEnv } from 'vite'
import vue from '@vitejs/plugin-vue'
import vueDevTools from 'vite-plugin-vue-devtools'

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd())

  return {
    plugins: [vue(), vueDevTools()],
    resolve: {
      alias: {
        '@': fileURLToPath(new URL('./src', import.meta.url))
      },
    },
    server: {
      proxy: {
        '/geocode': {
          target: 'https://naveropenapi.apigw.ntruss.com',
          changeOrigin: true,
          rewrite: (path) => path.replace(/^\/geocode/, ''),
          headers: {
            'X-NCP-APIGW-API-KEY-ID': env.VITE_NAVER_CLIENT_ID,
            'X-NCP-APIGW-API-KEY': env.VITE_NAVER_CLIENT_SECRET
          }
        }
      }
    }
  }
})
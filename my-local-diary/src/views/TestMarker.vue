<template>
    <div id="map" style="width:100%; height:100%;"></div>

    <!-- 마커 반복 렌더링 -->
    <CustomMarker
        v-for="(place, index) in places"
        :key="place.id"
        :ref="el => markerRefs[index] = el"
        :image="place.thumbnail_image"
        :post_id="place.post_id"
        :name="name"
        @click="handleMarkerClick"
    />

    <!-- 모달 예시 -->
    <div v-if="selectedPostId !== null" class="modal-overlay" @click="selectedPostId = null">
        <div class="modal-content" @click.stop>
            <h3>Post ID: {{ selectedPostId }}</h3>
            <!-- 실제 콘텐츠는 post_id로 API 조회하거나 컴포넌트 연결 -->
            <p>이 포스트에 대한 내용을 여기에 표시</p>
            <button @click="selectedPostId = null">닫기</button>
    </div>
</div>

</template>

<script setup>
    import { ref, onMounted, nextTick } from 'vue'
    import CustomMarker from '@/components/common/CustomMarker.vue'
    import places from '@/data/places'

    const selectedPostId = ref(null)
    function handleMarkerClick(postId) {
    selectedPostId.value = postId
}

    

    const markerRefs = ref([])

    onMounted(() => {
        const map = new naver.maps.Map('map', {
            center: new naver.maps.LatLng(37.4979, 127.0276),
            zoom: 15,
            mapTypeControl: true,
            scaleControl: true,
            zoomControl: true,
            zoomControlOptions: {
                position: naver.maps.Position.RIGHT_CENTER
            }
        })

        places.forEach((place, index) => {
            const markerEl = markerRefs.value[index]?.markerEl
            if (!markerEl) return

            const position = new naver.maps.LatLng(place.latitude, place.longitude)

            new naver.maps.Marker({
                position,
                map,
                title: place.name,
                icon: {
                    content: markerEl,
                    size: new naver.maps.Size(50, 50),
                    anchor: new naver.maps.Point(25, 25)
                }
            })
        })
    })
</script>

<style scoped>
    .modal-overlay {
        position: fixed;
        top: 0; left: 0;
        width: 100%; height: 100%;
        background-color: rgba(0, 0, 0, 0.4);
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 1000;
    }

    .modal-content {
        background-color: white;
        padding: 24px;
        border-radius: 12px;
        box-shadow: 0 4px 12px rgba(0,0,0,0.3);
    }
</style>
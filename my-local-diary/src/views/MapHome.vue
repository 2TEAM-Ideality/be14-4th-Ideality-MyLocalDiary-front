<template>
    <div>
        지도 홈 페이지 
    </div>
    <div id="map" style="width:100%;height:100%;"></div>
</template>

<script setup>
import { onMounted } from 'vue';
  
onMounted(() => {
    // 1.지도 객체 생성
    const map = new naver.maps.Map('map', {
      center: new naver.maps.LatLng(37.3595704, 127.105399), // 초기값 (판교 네이버 본사)
      zoom: 10,
      mapTypeControl : true, // 지도 타입(일반/위성) 변경 버튼 추가
      scaleControl: true,   // 지도 스케일 표시
	    zoomControl: true,    // 확대/축소 버튼 표시
	    zoomControlOptions: {
	      position: naver.maps.Position.RIGHT_CENTER
	    }
    });
  
    // 2. 브라우저 Geolocation API 로 내 위치 요청 
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const lat = position.coords.latitude;
	        const lng = position.coords.longitude;
	        console.log('📍 내 위치:', lat, lng);
  
          const currentLocation = new naver.maps.LatLng(lat, lng);
          
          // 지도 중심을 내 위치로 이동
	        map.setCenter(currentLocation);
	        
	        // 확대 레벨 조정
          map.setZoom(15); 
          
          // 내 위치에 마커 추가
	        const marker = new naver.maps.Marker({
	          position: currentLocation,
	          map: map,
	          title: '내 위치',
	          icon: {
	            content: `<div style="background: #4caf50; color: white; padding: 4px 8px; border-radius: 12px;">나</div>`,
	            size: new naver.maps.Size(38, 38),
	            anchor: new naver.maps.Point(19, 19)
	          }
	        });
        },
        (error) => {
          console.error('❌ 내 위치 가져오기 실패:', error);
          // 실패했을 때는 기본 중심 좌표 유지
        }
      );
    } else {
       console.error('❌ 이 브라우저는 Geolocation을 지원하지 않습니다.');
    }
  });
  
// 네이버 지도 인증 실패 처리
window.navermap_authFailure = function () {
	 console.log('❌ 네이버 지도 인증 실패');
};

</script>

<style scoped>

</style>
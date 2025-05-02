<template>
    <div class="admin-dashboard">
      <!-- 대시보드 제목 -->
      <h1 class="dashboard-title">관리자 대시보드</h1>
  
      <!-- 요약 카드 영역 -->
      <div class="summary-cards">
        <div class="summary-card" v-for="item in summaryItems" :key="item.title">
          <div class="summary-title">{{ item.title }}</div>
          <div class="summary-value">{{ item.value }}</div>
        </div>
      </div>
  
      <!-- 그래프 영역 -->
      <div class="graph-section">
        <div class="graph-card">
          <h2>일일 게시글/댓글 추이</h2>
          <div class="graph-placeholder">
            <canvas id="postCommentChart"></canvas>
          </div>
        </div>
  
        <div class="graph-card">
          <h2>신고 및 규제 추이</h2>
          <div class="graph-placeholder"> 
            <canvas id="reportRegulationChart"></canvas>

          </div>
        </div>
      </div>
  
      <!-- 테이블 영역 -->
      <div class="table-section">
        <div class="table-card">
          <h2>최근 신고 내역</h2>
          <table class="report-table">
            <thead>
              <tr>
                <th>신고 번호</th>
                <th>신고 대상</th>
                <th>신고 사유</th>
                <th>신고 일자</th>
                <th>처리 상태</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="report in recentReports" :key="report.id">
                <td>{{ report.id }}</td>
                <td>{{ report.target }}</td>
                <td>{{ report.reason }}</td>
                <td>{{ report.date }}</td>
                <td>{{ report.status }}</td>
              </tr>
            </tbody>
          </table>
        </div>
  
        <div class="table-card">
          <h2>최근 규제 내역</h2>
          <table class="regulation-table">
            <thead>
              <tr>
                <th>정지 번호</th>
                <th>대상 회원</th>
                <th>정지 시작일</th>
                <th>정지 종료일</th>
                <th>상태</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="regulation in recentRegulations" :key="regulation.id">
                <td>{{ regulation.id }}</td>
                <td>{{ regulation.member }}</td>
                <td>{{ regulation.startDate }}</td>
                <td>{{ regulation.endDate }}</td>
                <td>{{ regulation.status }}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  </template>
  
  <script setup>
  import { ref, onMounted } from 'vue'
  import { Chart, registerables } from 'chart.js'

    Chart.register(...registerables)


  
  // 요약 카드용 데이터
  const summaryItems = ref([
    { title: '회원 수', value: 1200 },
    { title: '게시글 수', value: 3400 },
    { title: '신고 건수', value: 45 },
    { title: '활성 회원 수', value: 750 },
  ])
  
  // 최근 신고 데이터
  const recentReports = ref([
    { id: 1, target: '게시글 #24', reason: '욕설', date: '2025-05-01', status: '처리중' },
    { id: 2, target: '댓글 #56', reason: '광고성', date: '2025-05-02', status: '반려' },
  ])
  
  // 최근 규제 데이터
  const recentRegulations = ref([
    { id: 1, member: '유저08', startDate: '2025-05-01', endDate: '2025-05-08', status: '정지중' },
    { id: 2, member: '관리자01', startDate: '2025-04-01', endDate: '2025-04-10', status: '만료됨' },
  ])

  onMounted(() => {
    const ctx1 = document.getElementById('postCommentChart').getContext('2d')
    new Chart(ctx1, {
        type: 'line',
        data: {
        labels: ['4/25', '4/26', '4/27', '4/28', '4/29', '4/30', '5/1'],
        datasets: [
            {
            label: '게시글 수',
            data: [12, 19, 3, 5, 2, 3, 7],
            borderColor: 'blue',
            backgroundColor: 'rgba(0, 0, 255, 0.2)',
            fill: true,
            },
            {
            label: '댓글 수',
            data: [2, 3, 20, 5, 1, 4, 10],
            borderColor: 'green',
            backgroundColor: 'rgba(0, 255, 0, 0.2)',
            fill: true,
            }
        ]
        },
        options: {
        responsive: true,
        maintainAspectRatio: false
        }
    })

    const ctx2 = document.getElementById('reportRegulationChart').getContext('2d')
    new Chart(ctx2, {
        type: 'bar',
        data: {
        labels: ['4/25', '4/26', '4/27', '4/28', '4/29', '4/30', '5/1'],
        datasets: [
            {
            label: '신고 건수',
            data: [2, 1, 3, 5, 2, 3, 1],
            backgroundColor: 'rgba(255, 99, 132, 0.5)',
            },
            {
            label: '규제 건수',
            data: [0, 1, 0, 2, 1, 1, 0],
            backgroundColor: 'rgba(54, 162, 235, 0.5)',
            }
        ]
        },
        options: {
        responsive: true,
        maintainAspectRatio: false
        }
    })
    })


  </script>
  
  <style scoped>
  .admin-dashboard {
    margin-left: 210px;
    padding: 30px;
  }
  
  .dashboard-title {
    font-size: 28px;
    font-weight: bold;
    margin-bottom: 30px;
  }
  
  .summary-cards {
    display: flex;
    gap: 20px;
    margin-bottom: 40px;
    flex-wrap: wrap;
  }
  
  .summary-card {
    background: #f7f7f7;
    padding: 20px;
    border-radius: 12px;
    flex: 1 1 200px;
    min-width: 200px;
    text-align: center;
    box-shadow: 2px 2px 6px rgba(0,0,0,0.1);
  }
  
  .summary-title {
    font-size: 16px;
    margin-bottom: 10px;
  }
  
  .summary-value {
    font-size: 24px;
    font-weight: bold;
  }
  
  .graph-section {
    display: flex;
    gap: 20px;
    margin-bottom: 40px;
    flex-wrap: wrap;
  }
  
  .graph-card {
    flex: 1;
    min-width: 400px;
    background: #fff;
    padding: 20px;
    border-radius: 12px;
    box-shadow: 2px 2px 6px rgba(0,0,0,0.1);
  }
  
  .graph-placeholder {
    background: #eee;
    height: 200px;
    margin-top: 10px;
    border-radius: 8px;
  }
  
  .table-section {
    display: flex;
    gap: 20px;
    flex-wrap: wrap;
  }
  
  .table-card {
    flex: 1;
    min-width: 500px;
    background: #fff;
    padding: 20px;
    border-radius: 12px;
    box-shadow: 2px 2px 6px rgba(0,0,0,0.1);
  }
  
  table {
    width: 100%;
    border-collapse: collapse;
    margin-top: 10px;
    font-size: 13px;
  }
  
  th, td {
    border: 1px solid #ddd;
    padding: 8px;
    text-align: center;
  }
  
  th {
    background: #f2f2f2;
  }
  .graph-placeholder {
    background: #eee;
    height: 300px; /* 200px → 300px 정도로 */
    margin-top: 10px;
    border-radius: 8px;
    position: relative;
    }

    .graph-placeholder canvas {
    position: absolute;
    top: 0;
    left: 0;
    width: 100% !important;
    height: 100% !important;
    }
  </style>
  
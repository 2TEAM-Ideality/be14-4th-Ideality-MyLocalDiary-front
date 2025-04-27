<template>
    <div class="report-management">
      <!-- 고양이 그림 + 제목 -->
      <div class="header">
        <img src="/src/assets/stamp_pic/cat_bar.png" alt="고양이" class="cat-image" />
        <div class="title">신고 관리</div>
      </div>
  
      <!-- 테이블 -->
      <table class="report-table" v-if="reports.length">
        <thead>
          <tr>
            <th>신고 번호</th>
            <th>신고 신청일</th>
            <th>신고 대상 유형</th>
            <th>신고 대상 번호</th>
            <th>신고내용</th>
            <th>처리 상태</th>
            <th>신고자 id</th>
            <th>신고 사유 번호</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="report in reports" :key="report.id">
            <td>{{ report.id }}</td>
            <td>{{ report.created_at }}</td>
            <td>{{ report.report_type }}</td>
            <td>{{ report.reported_id }}</td>
            <td>
              <button class="detail-button" @click="openModal(report.content)">자세히보기</button>
            </td>
            <td>
              <select v-model="report.status" @change="updateReportStatus(report)">
                <option value="처리중">처리중</option>
                <option value="처리완료">처리완료</option>
                <option value="반려">반려</option>
              </select>
            </td>
            <td>{{ report.member_id }}</td>
            <td>
              <div class="reason-select">
                <select v-model="report.report_reason_id" @change="handleReasonChange(report)">
                  <option v-for="reason in reportReasons" :key="reason.id" :value="reason.id">
                    {{ reason.reason }}
                  </option>
                </select>
                <div v-if="report.report_reason_id === 10">
                  <input
                    v-model="report.custom_reason"
                    type="text"
                    placeholder="신고 사유를 입력하세요"
                    class="custom-reason-input"
                  />
                </div>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
  
      <div v-else>로딩중...</div>
  
      <!-- 신고 내용 모달 -->
      <div v-if="showModal" class="modal-overlay" @click.self="closeModal">
        <div class="modal">
          <h3>신고 내용</h3>
          <p>{{ selectedContent }}</p>
          <button @click="closeModal" class="close-button">닫기</button>
        </div>
      </div>
    </div>
  </template>
  
  <script>
  import axios from 'axios';
  
  export default {
    data() {
      return {
        reports: [],
        reportReasons: [],
        showModal: false,
        selectedContent: '',
      };
    },
    created() {
      this.fetchReports();
      this.fetchReportReasons();
    },
    methods: {
      async fetchReports() {
        try {
          const response = await axios.get('http://localhost:3001/reports');
          this.reports = response.data.map(report => ({
            ...report,
            custom_reason: '',
          }));
        } catch (error) {
          console.error('Failed to fetch reports', error);
        }
      },
      async fetchReportReasons() {
        try {
          const response = await axios.get('http://localhost:3001/report_reasons');
          this.reportReasons = response.data;
        } catch (error) {
          console.error('Failed to fetch report reasons', error);
        }
      },
      openModal(content) {
        this.selectedContent = content;
        this.showModal = true;
      },
      closeModal() {
        this.showModal = false;
        this.selectedContent = '';
      },
      async updateReportStatus(report) {
        try {
          await axios.patch(`http://localhost:3001/reports/${report.id}`, {
            status: report.status,
          });
          // 업데이트 성공해도 alert 띄우지 않음
        } catch (error) {
          console.error('Failed to update report status', error);
        }
      },
      async handleReasonChange(report) {
        if (report.report_reason_id !== 10) {
          report.custom_reason = '';
          await this.updateReportReason(report);
        }
      },
      async updateReportReason(report) {
        try {
          await axios.patch(`http://localhost:3001/reports/${report.id}`, {
            report_reason_id: report.report_reason_id,
          });
          // 업데이트 성공해도 alert 띄우지 않음
        } catch (error) {
          console.error('Failed to update report reason', error);
        }
      }
    },
  };
  </script>
  
  <style scoped>
  .report-management {
    padding: 20px;
    padding-left: 220px; /* 사이드바 공간 확보 */
  }
  
  .header {
    position: relative;
    width: 300px;
    margin-bottom: 20px;
  }
  
  .cat-image {
    width: 100%;
  }
  
  .title {
    position: absolute;
    top:50px;
    left: 20px;
    font-size: 24px;
    font-weight: bold;
    color: black;
  }
  
  .report-table {
    width: 100%;
    min-width: 1000px; /* 테이블 넓이 확보 */
    border-collapse: collapse;
  }
  
  .report-table th,
  .report-table td {
    border: 1px solid #ddd;
    padding: 8px;
    text-align: center;
  }
  
  .detail-button {
    background-color: transparent;
    border: 1px solid #ccc;
    padding: 5px 10px;
    cursor: pointer;
    border-radius: 4px;
  }
  
  select {
    padding: 6px 30px 6px 10px;
    border-radius: 4px;
    border: 1px solid #ccc;
    background: url('data:image/svg+xml;charset=US-ASCII,<svg xmlns="http://www.w3.org/2000/svg" width="10" height="5" viewBox="0 0 10 5"><path fill="none" stroke="%23333" stroke-width="1" d="M0 0l5 5 5-5"/></svg>') no-repeat right 10px center;
    background-size: 10px 5px;
    appearance: none;
    -webkit-appearance: none;
    -moz-appearance: none;
  }
  
  .reason-select {
    display: flex;
    flex-direction: column;
    align-items: center;
  }
  
  .custom-reason-input {
    margin-top: 5px;
    padding: 5px;
    border: 1px solid #ccc;
    border-radius: 4px;
  }
  
  /* 모달 스타일 */
  .modal-overlay {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: rgba(0, 0, 0, 0.5);
    display: flex;
    align-items: center;
    justify-content: center;
  }
  
  .modal {
    background: white;
    padding: 20px;
    border-radius: 10px;
    min-width: 300px;
    text-align: center;
  }
  
  .close-button {
    margin-top: 20px;
    padding: 5px 10px;
    background: #ccc;
    border: none;
    border-radius: 4px;
    cursor: pointer;
  }
  </style>
  
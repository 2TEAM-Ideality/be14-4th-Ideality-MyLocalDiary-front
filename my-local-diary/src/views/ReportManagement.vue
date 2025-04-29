<template>
    <div class="report-management">
      <!-- 고양이 그림 + 제목 -->
      <div class="header">
        <img src="@/assets/stamp_pic/cat_bar.png" alt="고양이" class="cat-image" />
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
              <button class="detail-button" @click="openContentModal(report.content)">자세히보기</button>
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
              </div>
            </td>
          </tr>
        </tbody>
      </table>
  
      <div v-else>로딩중...</div>
  
      <!-- 신고 내용 모달 -->
      <div v-if="showContentModal" class="modal-overlay" @click.self="closeContentModal">
        <div class="modal">
          <h3>신고 내용</h3>
          <p>{{ selectedContent }}</p>
          <button @click="closeContentModal" class="close-button">닫기</button>
        </div>
      </div>
  
      <!-- 기타 입력 모달 -->
      <div v-if="showCustomReasonModal" class="modal-overlay" @click.self="closeCustomReasonModal">
        <div class="modal">
          <h3>신고 사유 직접 입력</h3>
          <input
            v-model="customReasonInput"
            type="text"
            placeholder="직접 신고 사유를 입력하세요"
            class="custom-reason-input"
          />
          <div style="margin-top: 20px;">
            <button @click="confirmCustomReason" class="close-button">확인</button>
            <button @click="closeCustomReasonModal" class="close-button">취소</button>
          </div>
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
        showContentModal: false,
        showCustomReasonModal: false,
        selectedContent: '',
        selectedReport: null,
        customReasonInput: '',
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
      openContentModal(content) {
        this.selectedContent = content;
        this.showContentModal = true;
      },
      closeContentModal() {
        this.showContentModal = false;
        this.selectedContent = '';
      },
      async updateReportStatus(report) {
        try {
          await axios.patch(`http://localhost:3001/reports/${report.id}`, {
            status: report.status,
          });
        } catch (error) {
          console.error('Failed to update report status', error);
        }
      },
      async handleReasonChange(report) {
        if (report.report_reason_id === 10) {
          // 기타 선택 -> 모달 열기
          this.selectedReport = report;
          this.customReasonInput = '';
          this.showCustomReasonModal = true;
        } else {
          // 기타가 아닌 경우 바로 업데이트
          await this.updateReportReason(report);
        }
      },
      async updateReportReason(report) {
        try {
          await axios.patch(`http://localhost:3001/reports/${report.id}`, {
            report_reason_id: report.report_reason_id,
          });
        } catch (error) {
          console.error('Failed to update report reason', error);
        }
      },
      async confirmCustomReason() {
        if (!this.customReasonInput.trim()) {
          alert('신고 사유를 입력해주세요.');
          return;
        }
        try {
          await axios.patch(`http://localhost:3001/reports/${this.selectedReport.id}`, {
            report_reason_id: 10,
            custom_reason: this.customReasonInput,
          });
          this.selectedReport.custom_reason = this.customReasonInput;
        } catch (error) {
          console.error('Failed to save custom reason', error);
        } finally {
          this.closeCustomReasonModal();
        }
      },
      closeCustomReasonModal() {
        this.showCustomReasonModal = false;
        this.selectedReport = null;
        this.customReasonInput = '';
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
    top: 50px;
    left: 20px;
    font-size: 24px;
    font-weight: bold;
    color: black;
  }
  
  .report-table {
    width: 100%;
    min-width: 1000px;
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
    z-index: 1000;
  }
  
  .modal {
    background: white;
    padding: 20px;
    border-radius: 10px;
    min-width: 300px;
    text-align: center;
  }
  
  .close-button {
    margin: 10px;
    padding: 5px 10px;
    background: #ccc;
    border: none;
    border-radius: 4px;
    cursor: pointer;
  }
  </style>
  
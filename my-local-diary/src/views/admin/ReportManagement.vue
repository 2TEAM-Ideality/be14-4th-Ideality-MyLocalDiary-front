<template>
  <div class="report-management">
    <div style="display:flex; flex-direction: row; justify-content: space-between; align-items: flex-end;">
      <!-- 고양이 그림 + 제목 -->
      <div class="header">
        <img src="/src/assets/stamp_pic/cat_bar.png" alt="고양이" class="cat-image" />
        <div class="title">신고 관리</div>
      </div>

      <!-- 필터링 버튼 -->
      <!-- 상태별 필터 버튼 -->
      <div class="filter-buttons">
        <button @click="filterStatus('ALL')" :class="{ active: selectedStatus === 'ALL' }">전체</button>
        <button @click="filterStatus('WAITING')" :class="{ active: selectedStatus === 'WAITING' }">처리중</button>
        <button @click="filterStatus('RESOLVED')" :class="{ active: selectedStatus === 'RESOLVED' }">처리완료</button>
        <button @click="filterStatus('REJECTED')" :class="{ active: selectedStatus === 'REJECTED' }">반려</button>
      </div>
    </div>
    

    <!-- 테이블 -->
    <div  v-if="reports.length > 0" class="table-container">
      <table class="report-table" v-if="pagedReports.length">
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
            <th>신고 대상 확인</th>
          </tr>
        </thead>
        <tbody>
          
          <tr v-for="report in pagedReports" :key="report.id">
            <td>{{ report.id }}</td>
            <td>{{ report.createdAt }}</td>
            <td>{{ report.reportType }}</td>
            <td>{{ report.reportedId }}</td>
            <td>
              <button class="detail-button" @click="openContentModal(report.content)">자세히보기</button>
            </td>
            <td>
              <template v-if="report.status === 'WAITING'">
                <select v-model="report.status" @change="updateReportStatus(report, report.status)">
                  <option value="WAITING">처리중</option>
                  <option value="RESOLVED">처리완료</option>
                  <option value="REJECTED">반려</option>
                </select>
              </template>

              <!-- 처리 완료 상태인 경우: 텍스트 표시 -->
              <template v-else>
                <span>
                  {{ report.status === 'RESOLVED' ? '처리완료' : '반려' }}
                </span>
              </template>
            </td>
            <td>
              {{ report.memberId  }}
            </td>
            <td>
              {{ report.reportReasonId }}
              <!-- <div class="reason-select">
                <select v-model="report.report_reason_id" @change="handleReasonChange(report)" disabled>
                  <option v-for="reason in reportReasons" :key="reason.id" :value="reason.id">
                    {{ reason.reportReasons }}
                  </option>
                </select>
              </div> -->
            </td>
            <td>
              <div class="report-link">
                <router-link :to="getReportLink(report)" target="_blank" class="link-button">
                  신고 대상 확인
                </router-link>
              </div>
            </td>

          </tr>
        </tbody>
      </table>

      <div v-else>
        <div style="padding: 5%;">
          해당 상태의 신고 내역이 없습니다.
        </div>
      </div>
    </div>

    <!-- 페이지네이션 -->
    <div v-if="reports.length" class="pagination">
      <button @click="prevPage" :disabled="currentPage === 1">이전</button>
      <button
        v-for="page in totalPages"
        :key="page"
        @click="goToPage(page)"
        :class="{ active: page === currentPage }"
      >
        {{ page }}
      </button>
      <button @click="nextPage" :disabled="currentPage === totalPages">다음</button>
    </div>

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

  <!-- 확인 모달 -->
  <div v-if="showConfirmModal" class="modal-overlay" @click.self="closeConfirmModal">
    <div class="modal">
      <h3>상태 변경 확인</h3>
      <p>
        해당 신고를 <strong>{{ confirmAction === 'RESOLVED' ? '처리완료' : '반려' }}</strong> 상태로 변경하시겠습니까?
      </p>
      <div style="margin-top: 20px;">
        <button @click="confirmStatusChange" class="close-button">확인</button>
        <button @click="closeConfirmModal" class="close-button">취소</button>
      </div>
    </div>
  </div>



</template>
<script>
import LoadingModal from '@/components/common/LoadingModal.vue';
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
      currentPage: 1,
      pageSize: 10,
      selectedStatus: 'ALL', 
      
      // 신고 처리 확인 모달 
      showConfirmModal: false,
      confirmAction: null,
      confirmTargetReport: null,
    };
  },
  computed: {
    totalPages() {
    return Math.ceil(this.filteredReports.length / this.pageSize);
    },
    pagedReports() {
      const start = (this.currentPage - 1) * this.pageSize;
      const end = start + this.pageSize;
      return this.filteredReports.slice(start, end);
    },
    filteredReports() {
      if (this.selectedStatus === 'ALL') {
        return this.reports;
      }
      return this.reports.filter(report => report.status === this.selectedStatus);
    }
  },
  created() {
    this.fetchReports();
    // this.fetchReportReasons();
  },
  methods: {
    async fetchReports() {
      try {
        const response = await axios.get('/api/admin/report/all');
        console.log("신고 내역 리스트 요청됨")
        console.log(response)
        this.reports = response.data.data.map(report => ({ ...report }));
      } catch (error) {
        console.error('Failed to fetch reports', error);
      }
    },
    filterStatus(status) {   //  상태 필터링 메소드
      this.selectedStatus = status;
      this.currentPage = 1; // 필터 바꿀 때 페이지도 1로 초기화
    },
    openContentModal(content) {
      this.selectedContent = content;
      this.showContentModal = true;
    },
    closeContentModal() {
      this.showContentModal = false;
      this.selectedContent = '';
    },
    async updateReportStatus(report, status) {
      if (status === 'RESOLVED' || status === 'REJECTED') {
        // 모달창 띄우고, 나중에 확인되면 호출
        this.confirmTargetReport = report;
        this.confirmAction = status;
        this.showConfirmModal = true;
        return;
      }

      // WAITING 등 기타 상태 처리
      try {
        await axios.patch(`/api/admin/report/${report.id}`, {
          status
        });
        console.log('상태 업데이트 완료');
      } catch (error) {
        console.error('상태 업데이트 실패:', error);
      }
    },
    async confirmStatusChange() {
      const report = this.confirmTargetReport;
      const status = this.confirmAction;
      console.log(report)
      console.log(status)
      try {
        if (status === 'RESOLVED') {
          await axios.patch(`/api/admin/report/${report.id}/resolve`);
        } else if (status === 'REJECTED') {
          await axios.patch(`/api/admin/report/${report.id}/reject`);
        }
        report.status = status;
        this.closeConfirmModal();
      } catch (error) {
        console.error(`❌ ${status} 상태 변경 실패`, error);
        alert('상태 변경에 실패했습니다.');
      }
    },
    closeConfirmModal() {
      this.showConfirmModal = false;
      this.confirmAction = null;
      this.confirmTargetReport = null;
    },



    async handleReasonChange(report) {
      if (report.report_reason_id === 10) {
        this.selectedReport = report;
        this.customReasonInput = '';
        this.showCustomReasonModal = true;
      } else {
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
    },
    nextPage() {
      if (this.currentPage < this.totalPages) {
        this.currentPage++;
      }
    },
    prevPage() {
      if (this.currentPage > 1) {
        this.currentPage--;
      }
    },
    goToPage(page) {
      this.currentPage = page;
    },
    getReportLink(report) {
      if (report.report_type === '게시글') {
        return `/posts/${report.reported_id}`;
      } else if (report.report_type === '댓글') {
        return `/comments/${report.reported_id}`;
      } else if (report.report_type === '회원') {
        return `/mypage`;
      } else {
        return '#'; // 혹시 모르는 타입 대비
      }
    },

  },
};
</script>
<style scoped>
.report-management {
  /* height: 100vh; */
  display: flex;
  flex-direction: column;
  padding-top: 30px;
  padding-bottom: 30px;
  padding-right: 100px;
  padding-left: 220px;
  font-size: 15px;
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

.table-container {
  flex: 1;
  overflow-y: auto;
  font-size: 12px;
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
  padding: 20px 50px;
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

.pagination {
  display: flex;
  justify-content: center;
  align-items: center;
  margin-top: 40px;
  gap: 5px;
  flex-wrap: wrap;
}

.pagination button {
  padding: 5px 10px;
  background-color: #eee;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}

.pagination button.active {
  background-color: #FF9A9A;
  font-weight: bold;
}

.link-button {
  display: inline-block;
  padding: 4px 8px;
  background-color: #D9D9D9;
  color: black;
  text-decoration: none;
  border-radius: 4px;
  font-size: 12px;
}

.link-button:hover {
  background-color: #9f9f9f;
}
.filter-buttons {
  height: fit-content;
  display: flex;
  gap: 10px;
  margin-bottom: 20px;
  /* margin-left: 220px; */
  justify-content: flex-end;
}

.filter-buttons button {
  padding: 6px 12px;
  border: none;
  background-color: #eee;
  border-radius: 4px;
  cursor: pointer;
}

.filter-buttons button.active {
  background-color: #FF9A9A;
  font-weight: bold;
  color: white;
}



</style>

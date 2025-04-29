<template>
    <div class="report-management">
      <!-- 고양이 그림 + 제목 -->
      <div class="header">
        <img src="/src/assets/stamp_pic/cat_bar.png" alt="고양이" class="cat-image" />
        <div class="title">규제 내역</div>
      </div>
  
      <!-- 테이블 -->
      <div class="table-container">
        <table class="report-table" v-if="pagedRegulations.length">
          <thead>
            <tr>
              <th>정지 번호</th>
              <th>정지 시작일</th>
              <th>정지 종료일</th>
              <th>대상 회원</th>
              <th>정지 상태</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="regulation in pagedRegulations" :key="regulation.id">
              <td>{{ regulation.id }}</td>
              <td>{{ regulation.start_date }}</td>
              <td>{{ regulation.end_date }}</td>
              <td>{{ regulation.target_member_id }}</td>
              <td>
                <button class="status-button" :class="statusClass(calcStatus(regulation.start_date, regulation.end_date))">
                    {{ calcStatus(regulation.start_date, regulation.end_date) }}
                </button>
              </td>
            </tr>
          </tbody>
        </table>
  
        <div v-else>
          <LoadingModal />
        </div>
      </div>
  
      <!-- 페이지네이션 -->
      <div v-if="regulations.length" class="pagination">
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
    </div>
</template>


<script>
import LoadingModal from '@/components/common/LoadingModal.vue';
import axios from 'axios';

export default {
  data() {
    return {
      regulations: [],
      currentPage: 1,
      pageSize: 10,
    };
  },
  computed: {
    totalPages() {
      return Math.ceil(this.regulations.length / this.pageSize);
    },
    pagedRegulations() {
      const start = (this.currentPage - 1) * this.pageSize;
      const end = start + this.pageSize;
      return this.regulations.slice(start, end);
    },
  },
  created() {
    this.fetchRegulations();
  },
  methods: {
    async fetchRegulations() {
      try {
        const response = await axios.get('http://localhost:3001/regulations');
        this.regulations = response.data;
      } catch (error) {
        console.error('Failed to fetch regulations', error);
      }
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
    statusClass(status) {
      return status === '정지중' ? 'active-status' : 'expired-status';
    },
    calcStatus (startDate, endDate)  {
        const now = new Date();
        return new Date(endDate) < now ? '해제됨' : '정지중';
    }
  },
};
</script>


<style scoped>
.report-management {
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

.status-button {
  padding: 4px 8px;
  border-radius: 4px;
  border: none;
  font-size: 12px;
  cursor: default;
}

.active-status {
  background-color: #FF9A9A;
  color: black;
}

.expired-status {
  background-color: #D9D9D9;
  color: black;
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
</style>

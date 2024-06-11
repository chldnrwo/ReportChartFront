<template>
  <div class="form-container">
    <div>
      <div class="dropdown">
        <button class="btn btn-primary custom-btn dropdown-toggle" type="button" id="dropdownGroupButton" data-bs-toggle="dropdown" aria-expanded="false">
          기관 이름
        </button>
        <ul class="dropdown-menu custom-dropdown-menu" aria-labelledby="dropdownGroupButton">
          <li v-for="group in groupNames" :key="group.groupName">
            <a class="dropdown-item" href="#" @click="selectGroupName(group.groupName)">{{ group.groupName }}</a>
          </li>
        </ul>
      </div>
      
      <div class="dropdown mt-3">
        <button class="btn btn-primary custom-btn dropdown-toggle" type="button" id="dropdownMonthButton" data-bs-toggle="dropdown" aria-expanded="false">
          선택된 월
        </button>
        <ul class="dropdown-menu custom-dropdown-menu" aria-labelledby="dropdownMonthButton">
          <li v-for="month in months" :key="month">
            <a class="dropdown-item" href="#" @click="selectMonth(month)">{{ month }}</a>
          </li>
        </ul>
      </div>
      
      <div v-if="selectedGroupName" class="selected-info mt-3">
        선택된 기관: {{ selectedGroupName }}
      </div>
      <div v-if="selectedMonth" class="selected-info mt-1">
        선택된 월: {{ selectedMonth }}
      </div>
      
      <button class="btn btn-success mt-3" @click="submitForm">제출</button>
    </div>
    <br><br><br><br><br><br><br><br><br>

    <div v-if="chartsData.length > 0">
      <div v-for="chartData in chartsData" :key="chartData.title" class="chart-container">
        <h3 class="selected-info" >{{ chartData.title }}</h3>
        <canvas class="selected-info" :id="chartData.title" width="1200" height="709"></canvas>
        <br>
      </div>
      
    </div>

    <div v-if="totalPages > 1" class="pagination">
      <button @click="prevPage" :disabled="currentPage === 0">Previous</button>
      <span>{{ currentPage + 1 }} / {{ totalPages }}</span>
      <button @click="nextPage" :disabled="currentPage === totalPages - 1">Next</button>
    </div>
  </div>
</template>

<script>
import axios from 'axios';
import Worker from 'worker-loader!../workers/chartWorker.js';

export default {
  data() {
    return {
      groupNames: [],
      months: ['01', '02', '03', '04', '05', '06', '07', '08', '09', '10', '11', '12'],
      selectedGroupName: '',
      selectedMonth: '',
      chartsData: [],
      currentPage: 0,
      totalPages: 0,
      pageSize: 150  // 한 페이지에 표시할 hostid 종류 수
    };
  },
  mounted() {
    this.fetchGroupNames();
  },
  methods: {
    fetchGroupNames() {
      axios.get('http://localhost:8080/datapoints/group-names')
        .then(response => {
          this.groupNames = response.data;
        })
        .catch(error => {
          console.error('Error fetching group names:', error);
        });
    },
    selectGroupName(groupName) {
      this.selectedGroupName = groupName;
      console.log('Selected group name:', groupName);
    },
    selectMonth(month) {
      this.selectedMonth = month;
      console.log('Selected month:', month);
    },
    submitForm() {
      if (!this.selectedGroupName || !this.selectedMonth) {
        alert('기관과 월을 선택해주세요.');
        return;
      }

      this.fetchData(this.currentPage);
    },
    fetchData(page) {
      axios.post(`http://localhost:8080/datapoints/${this.selectedGroupName}/${this.selectedMonth}?page=${page}&size=${this.pageSize}`)
        .then(response => {
          console.log('POST 요청 성공:', response.data);
          if (response.data.data && Array.isArray(response.data.data)) {
            this.chartsData = response.data.data;
            this.currentPage = response.data.currentPage;
            this.totalPages = response.data.totalPages;
            this.$nextTick(() => {
              this.renderCharts();
            });
          } else {
            console.error('데이터 형식이 올바르지 않습니다:', response.data);
          }
        })
        .catch(error => {
          console.error('POST 요청 실패:', error);
        });
    },
    renderCharts() {
      console.time('chartRenderTime');  // 시간 측정 시작

      const chunkSize = 1000;  // 데이터 분할 크기
      const totalChunks = Math.ceil(this.chartsData.length / chunkSize);
      let processedChunks = 0;  // 처리된 청크 수

      const renderChunk = (chunk, index) => {
        chunk.forEach((chartData, chunkIndex) => {
          const worker = new Worker();
          
          worker.postMessage({
            index: index * chunkSize + chunkIndex,
            title: chartData.title,
            data: JSON.parse(JSON.stringify(chartData.data))  // JSON 직렬화/역직렬화 사용
          });

          worker.onmessage = (event) => {
            const { index, imageData } = event.data;
            const canvas = document.getElementById(chartData.title);
            const ctx = canvas.getContext('2d');
            const img = new Image();
            img.src = imageData;
            img.onload = () => {
              ctx.drawImage(img, 0, 0);
              if (index === this.chartsData.length - 1) {
                console.timeEnd('chartRenderTime');  // 시간 측정 종료
              }
            };
          };
          
          worker.onerror = (error) => {
            console.error('Worker error:', error);
          };
        });
      };

      const processNextChunk = () => {
        if (processedChunks < totalChunks) {
          const start = processedChunks * chunkSize;
          const end = start + chunkSize;
          const chunk = this.chartsData.slice(start, end);
          renderChunk(chunk, processedChunks);
          processedChunks += 1;
          setTimeout(processNextChunk, 0);  // 다음 청크를 처리
        }
      };

      processNextChunk();
    },
    nextPage() {
      if (this.currentPage < this.totalPages - 1) {
        this.currentPage++;
        this.fetchData(this.currentPage);
      }
    },
    prevPage() {
      if (this.currentPage > 0) {
        this.currentPage--;
        this.fetchData(this.currentPage);
      }
    }
  }
};
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Noto+Sans+KR:wght@400;700&display=swap');

.form-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-top: 20px;
  font-family: 'Noto Sans KR', sans-serif; /* 본고딕 폰트 적용 */
}

.custom-btn {
  background-color: #004a9f;
  font-family: 'Noto Sans KR', sans-serif; /* 본고딕 폰트 적용 */
  font-weight: 700;
  color: white;
  border: none;
  padding: 10px 20px;
  border-radius: 5px;
  width: 250px;
}

.custom-btn:hover {
  background-color: #003b7a;
}

.custom-dropdown-menu {
  width: 250px;
}

.selected-info {
  font-family: 'Noto Sans KR', sans-serif; /* 본고딕 폰트 적용 */
  font-weight: 700;
  color: #004a9f;
}

.mt-3 {
  margin-top: 1rem;
}

.mt-1 {
  margin-top: 0.5rem;
}

.chart-container {
  margin: 20px;
}

.pagination {
  margin-top: 20px;
}

.pagination button {
  margin: 0 5px;
}
</style>

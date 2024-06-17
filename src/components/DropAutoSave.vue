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
      <br><br><br><br><br>
  
      <div v-if="chartsData.length > 0">
        <div v-for="chartData in chartsData" :key="chartData.tbName" class="chart-container">
          <canvas class="selected-info" :id="chartData.tbName" width="1000" height="520"></canvas>
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
              pageSize: 150,
              timer: null // 타이머를 추가합니다.
          };
      },
      mounted() {
          console.log('DropAuto component mounted');
          this.fetchGroupNames();
          this.setupAutoFetch(); // 컴포넌트가 마운트될 때 자동 데이터 가져오기 설정을 실행
          this.startAutoFetch(); // 주기적으로 데이터 가져오기를 시작합니다.
      },
      beforeUnmount() {
          // 컴포넌트가 파괴되기 전에 타이머를 정리합니다.
          clearInterval(this.timer);
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
              console.log('Submitting form with:', this.selectedGroupName, this.selectedMonth);
              this.fetchData(this.currentPage);
          },
          fetchData(page) {
              axios.post(`http://localhost:8080/datapoints/auto/${this.selectedGroupName}/${this.selectedMonth}?page=${page}&size=${this.pageSize}`)
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
              console.time('chartRenderTime');
              console.log('Rendering charts with data:', this.chartsData);
  
              const chunkSize = 1000;
              const totalChunks = Math.ceil(this.chartsData.length / chunkSize);
              let processedChunks = 0;
  
              const renderChunk = (chunk, index) => {
                  chunk.forEach((chartData, chunkIndex) => {
                      console.log('chartData:', chartData);
                      const worker = new Worker();
                      
                      worker.postMessage({
                          index: index * chunkSize + chunkIndex,
                          title: chartData.title,
                          host: chartData.host,
                          data: JSON.parse(JSON.stringify(chartData.data))
                      });
  
                      worker.onmessage = (event) => {
                          const { imageData } = event.data;
                          this.sendDataToBackend(chartData.host, imageData, chartData.tbname);
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
                      setTimeout(processNextChunk, 0);
                  }
              };
  
              processNextChunk();
          },
          sendDataToBackend(host, imageData, tbname) {
              const payload = {
                  host,
                  imageData,
                  month: this.selectedMonth,
                  groupName: this.selectedGroupName,
                  tbname
              };
  
              console.log('Sending data to backend:', payload);
  
              axios.post('http://localhost:8080/upload-image', payload)
                  .then(response => {
                      console.log('이미지 업로드 성공:', response.data);
                  })
                  .catch(error => {
                      console.error('이미지 업로드 실패:', error);
                  });
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
          },
          setupAutoFetch() {
              console.log('setupAutoFetch called');
              axios.get('http://localhost:3000/api/get-received-data')
                  .then(response => {
                      console.log('Received data from backend:', response.data);
                      const { groupName, month, page, size } = response.data;
                      this.selectedGroupName = groupName;
                      this.selectedMonth = month;
                      this.currentPage = page;
                      this.pageSize = size;
                      this.submitForm();
                  })
                  .catch(error => {
                      console.error('Error fetching auto data:', error);
                  });
          },
          startAutoFetch() {
              // 주기적으로 setupAutoFetch를 호출합니다.
              this.timer = setInterval(this.setupAutoFetch, 60000); // 1분마다 호출
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
      font-family: 'Noto Sans KR', sans-serif;
  }
  
  .custom-btn {
      background-color: #df591b;
      font-family: 'Noto Sans KR', sans-serif;
      font-weight: 700;
      color: white;
      border: none;
      padding: 10px 20px;
      border-radius: 5px;
      width: 250px;
  }
  
  .custom-btn:hover {
      background-color: #df591b;
  }
  
  .custom-dropdown-menu {
      width: 250px;
  }
  
  .selected-info {
      font-family: 'Noto Sans KR', sans-serif;
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
  .align-left {
      text-align: left;
  }
  
  .headGraph{
      background-color: #df591b;
      color: aliceblue;
  }
  
  .tailGraph{
      background-color: white;
  }
  </style>
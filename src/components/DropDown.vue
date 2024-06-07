<template>
  <div class="form-container">
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

    <div v-if="chartsData.length > 0">
      <div v-for="chartData in chartsData" :key="chartData.title" class="chart-container">
        <h3>{{ chartData.title }}</h3>
        <img :src="chartData.imageUrl" :alt="chartData.title" v-if="chartData.imageUrl"/>
      </div>
    </div>
  </div>
</template>

<script>
import axios from 'axios';
import Worker from 'worker-loader!../workers/chartWorker.js';  // worker-loader를 통해 워커를 가져옵니다.

export default {
  data() {
    return {
      groupNames: [],
      months: ['01', '02', '03', '04', '05', '06', '07', '08', '09', '10', '11', '12'],
      selectedGroupName: '',
      selectedMonth: '',
      chartsData: [],
      imageUrls: []  // 이미지 URL들을 저장할 배열
    };
  },
  mounted() {
    this.fetchGroupNames();
  },
  beforeMount() {
    // 페이지가 로드될 때 서버에 있는 기존 이미지를 삭제
    this.deleteExistingImages();
  },
  beforeUnmount() {  // beforeDestroy를 beforeUnmount로 변경
    // 페이지를 벗어날 때 이미지 삭제 요청을 보냄
    this.deleteExistingImages();
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

      axios.post(`http://localhost:8080/datapoints/${this.selectedGroupName}/${this.selectedMonth}`)
        .then(response => {
          console.log('POST 요청 성공:', response.data);
          if (Array.isArray(response.data)) {
            console.log('받은 데이터:', response.data); // 데이터를 로그에 출력
            if (response.data.length > 0 && typeof response.data[0].title === 'string' && Array.isArray(response.data[0].data)) {
              this.chartsData = response.data;
              this.$nextTick(() => {
                this.renderCharts();
              });
            } else {
              console.error('데이터 구조가 올바르지 않습니다:', response.data);
            }
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
              const { index, imageUrl } = event.data;
              this.chartsData[index] = { ...this.chartsData[index], imageUrl: `http://localhost:8080${imageUrl}` };
              this.imageUrls.push(imageUrl);  // 이미지 URL을 배열에 추가

              if (index === this.chartsData.length - 1) {
                  console.timeEnd('chartRenderTime');  // 시간 측정 종료
              }
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
    deleteExistingImages() {
      this.imageUrls.forEach(url => {
        axios.delete(`http://localhost:8080/upload`, { params: { url } })
          .then(() => {
            console.log('이미지 삭제 성공:', url);
          })
          .catch(error => {
            console.error('이미지 삭제 실패:', url, error);
          });
      });
    }
  }
};
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Poppins:wght@700&display=swap');

.form-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-top: 20px;
}

.custom-btn {
  background-color: #004a9f;
  font-family: 'Poppins', sans-serif;
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
  font-family: 'Poppins', sans-serif;
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

.chart-container img {
  width: 1200px;
  height: 480px;
}
</style>

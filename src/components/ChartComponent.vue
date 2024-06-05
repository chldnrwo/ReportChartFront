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

    <!-- 차트를 렌더링할 div 추가 -->
    <div v-for="chartData in chartsData" :key="chartData.title" class="chart-container">
      <h3>{{ chartData.title }}</h3>
      <canvas :id="`chart-${chartData.title}`"></canvas>
    </div>
  </div>
</template>

<script>
import axios from 'axios';
import { Chart } from 'chart.js/auto';  // Chart.js 임포트

export default {
  data() {
    return {
      groupNames: [],
      months: ['01', '02', '03', '04', '05', '06', '07', '08', '09', '10', '11', '12'],
      selectedGroupName: '', // 선택된 기관 이름을 저장할 변수
      selectedMonth: '', // 선택된 월을 저장할 변수
      chartsData: [], // 차트 데이터를 저장할 변수
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
    console.log('submitForm 메서드 호출됨'); // 확인 로그 추가
    if (!this.selectedGroupName || !this.selectedMonth) {
      alert('기관과 월을 선택해주세요.');
      return;
    }

    // 백엔드로 POST 요청 보내기
    axios.post(`http://localhost:8080/datapoints/${this.selectedGroupName}/${this.selectedMonth}`)
      .then(response => {
        console.log('POST 요청 성공:', response.data);
        this.chartsData = response.data;  // 차트 데이터 저장
        console.log('차트 데이터 설정됨:', this.chartsData);
        if (this.chartsData.length > 0) {
          this.renderCharts();  // 차트 렌더링 메서드 호출
        } else {
          console.warn('차트 데이터가 비어 있습니다.');
        }
      })
      .catch(error => {
        console.error('POST 요청 실패:', error);
      });
  },
  renderCharts() {
    console.log('renderCharts 메서드 호출됨'); // 확인 로그 추가
    if (!this.chartsData || this.chartsData.length === 0) {
      console.warn('차트 데이터가 비어 있습니다.');
      return;
    }

    this.chartsData.forEach(chartData => {
      const ctx = document.getElementById(`chart-${chartData.title}`).getContext('2d');
      console.log(`Rendering chart: ${chartData.title}`, chartData);
      new Chart(ctx, {
        type: 'line',
        data: {
          labels: chartData.data.map(item => item.column1), // x축 데이터
          datasets: [{
            label: chartData.title,
            data: chartData.data.map(item => item.column2), // y축 데이터
            borderColor: 'rgba(75, 192, 192, 1)',
            borderWidth: 1,
            fill: false
          }]
        },
        options: {
          scales: {
            y: {
              //min: -100,  // y축 최소값을 -100으로 고정
              //max: 100,  // y축 최대값을 100으로 고정
              title: {
                display: true,
                text: 'Percentage Change'  // y축 제목 설정 (선택사항)
              },
              ticks: {
                suggestedMax: 100,
                suggestedMin: -100,
                stepSize: 20
              }
            },
            x: {
              title: {
                display: true,
                text: 'Time'  // x축 제목 설정 (선택사항)
              }
            }
          },
          plugins: {
            legend: {
              display: true,
              position: 'top'
            }
          }
        }
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
  width: 250px; /* 버튼과 드롭다운의 너비를 동일하게 설정 */
}

.custom-btn:hover {
  background-color: #003b7a;
}

.custom-dropdown-menu {
  width: 250px; /* 버튼과 드롭다운의 너비를 동일하게 설정 */
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
  width: 80%;
  margin-top: 20px;
}

canvas {
  width: 100%;
  height: 400px; /* 차트의 높이 설정 */
}
</style>

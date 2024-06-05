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
        <canvas :id="chartData.title" width="1200" height="480"></canvas>
      </div>
    </div>
  </div>
</template>

<script>
import axios from 'axios';
import { Chart, registerables } from 'chart.js';
import 'chartjs-adapter-date-fns';
import { format } from 'date-fns';

Chart.register(...registerables);

export default {
  data() {
    return {
      groupNames: [],
      months: ['01', '02', '03', '04', '05', '06', '07', '08', '09', '10', '11', '12'],
      selectedGroupName: '',
      selectedMonth: '',
      chartsData: []
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

      axios.post(`http://localhost:8080/datapoints/${this.selectedGroupName}/${this.selectedMonth}`)
        .then(response => {
          console.log('POST 요청 성공:', response.data);
          this.chartsData = response.data;
          this.$nextTick(() => {
            this.renderCharts();
          });
        })
        .catch(error => {
          console.error('POST 요청 실패:', error);
        });
    },
    renderCharts() {
      this.chartsData.forEach(chartData => {
        const ctx = document.getElementById(chartData.title).getContext('2d');

        // 데이터의 첫 번째와 마지막 날짜를 계산
        const firstDate = new Date(chartData.data[0].column1);
        const lastDate = new Date(chartData.data[chartData.data.length - 1].column1);

        new Chart(ctx, {
          type: 'line',
          data: {
            labels: chartData.data.map(d => format(new Date(d.column1), 'yyyy-MM-dd')),
            datasets: [{
              label: chartData.title,
              data: chartData.data.map(d => d.column2),
              borderColor: 'rgba(75, 192, 192, 1)',
              backgroundColor: 'rgba(75, 192, 192, 0.2)',
              borderWidth: 1,
              radius: 0,
              fill: true
            }]
          },
          options: {
            responsive: true,
            maintainAspectRatio: true,
            scales: {
              x: {
                type: 'time',
                time: {
                  unit: 'day',
                  displayFormats: {
                    day: 'MMM d'
                  }
                },
                ticks: {
                  autoSkip: false,
                  callback: function(value, index, values) {
                    const date = new Date(values[index].value);
                    const day = date.getDate();
                    if (date.getTime() === firstDate.getTime() || date.getTime() === lastDate.getTime() || day % 5 === 0) {
                      return format(date, 'MMM d');
                    }
                    return null;
                  }
                }
              },
              y: {
                suggestedMin: 0,
                suggestedMax: 100
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
</style>

<template>
  <div class="form-container">
    <div>
      <div class="dropdown">
        <button class="btn btn-primary custom-btn dropdown-toggle" type="button" id="dropdownGroupButton" data-bs-toggle="dropdown" aria-expanded="false">
          기관 이름 웹훅테스트6
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
    <br><br><br><br>

    <div v-if="chartsData.length > 0">
      <div v-for="chartData in chartsData" :key="chartData.title" class="chart-container">
        <p style="line-height: 1.5;"> &nbsp;  </p>
        <h5 class="selected-info align-left" >{{ chartData.title }}</h5>
        <p class="selected-info align-left"  >Host : {{ chartData.host }}</p>
        <img 
          class="selected-info" 
          :id="chartData.title" 
          :src="getImagePath(chartData)" 
          alt="Chart Image" 
          width="1000" 
          height="520" 
          
        />
        <div class="container mt-4">
          <div class="row">
            <div class="col-4 border headGraph">MIN</div>
            <div class="col-4 border headGraph">MAX</div>
            <div class="col-4 border headGraph">AVG</div>
          </div>
          <div class="row">
            <div class="col-4 border tailGraph">{{ chartData.min }}</div>
            <div class="col-4 border tailGraph">{{ chartData.max }}</div>
            <div class="col-4 border tailGraph">{{ chartData.avg }}</div>
          </div>
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
            groupNames: [],
            months: ['01', '02', '03', '04', '05', '06', '07', '08', '09', '10', '11', '12'],
            selectedGroupName: '',
            selectedMonth: '',
            chartsData: [],
            currentPage: 0,
            totalPages: 0,
            pageSize: 99999,
            timer: null // 타이머를 추가합니다.
        };
    },
    mounted() {
        console.log('DropAuto component mounted');
        this.fetchGroupNames();
        
        
    },
    beforeUnmount() {
        // 컴포넌트가 파괴되기 전에 타이머를 정리합니다.
        clearInterval(this.timer);
    },
    methods: {
        fetchGroupNames() {
              axios.get('http://192.168.110.115:8080/datapoints/group-names', {
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            }
        })
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
            axios.post(`http://192.168.110.115:8080/datapoints/auto/${this.selectedGroupName}/${this.selectedMonth}?page=${page}&size=${this.pageSize}`)
                .then(response => {
                    console.log('POST 요청 성공:', response.data);
                    if (response.data.data && Array.isArray(response.data.data)) {
                        this.chartsData = response.data.data;
                    } else {
                        console.error('데이터 형식이 올바르지 않습니다:', response.data);
                    }
                })
                .catch(error => {
                    console.error('POST 요청 실패:', error);
                });
        },
        getImagePath(chartData) {
          return `http://192.168.110.115:3002/images/${chartData.yearMonth}/${chartData.groupName}/${chartData.tbname}.png`;
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
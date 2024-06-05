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
  </div>
</template>

<script>
import axios from 'axios';

export default {
  data() {
    return {
      groupNames: [],
      months: ['01', '02', '03', '04', '05', '06', '07', '08', '09', '10', '11', '12'],
      selectedGroupName: '', // 선택된 기관 이름을 저장할 변수
      selectedMonth: '', // 선택된 월을 저장할 변수
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

      // 백엔드로 POST 요청 보내기
      axios.post(`http://localhost:8080/datapoints/${this.selectedGroupName}/${this.selectedMonth}`)
        .then(response => {
          console.log('POST 요청 성공:', response.data);
        })
        .catch(error => {
          console.error('POST 요청 실패:', error);
        });
    },
  },
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
</style>

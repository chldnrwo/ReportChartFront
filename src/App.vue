<template>
  <!--img alt="Vue logo" src="./assets/logo.png"-->
  <HelloWorld msg="Vue Test"/>
  <div id="app">
    <ChartComponent />
  </div>
  <!-- <div>
    <button class="btn btn-primary btn-sm" @click="toggleStocks">Magnificent 7 YOY</button>
  </div>
  <br>
    <AutoComplete @ticker-selected="handleCompanySelected" />
  <br>
    <StockDetails v-if="selectedTicker" :ticker="selectedTicker" :companyName="selectedCompanyName" />
    <BarChart2 v-if="showStocks" /> -->
</template>

<script>
import HelloWorld from './components/HelloWorld.vue';
import ChartComponent from './components/ChartComponent.vue';
// import BarChart2 from './components/BarChart2.vue';
// import AutoComplete from './components/AutoComplete.vue';
// import StockDetails from './components/StockDetails.vue';

export default {
  name: 'App',
  components: {
    HelloWorld,
    ChartComponent,
    // BarChart2,
    // AutoComplete,
    // StockDetails
  },
  data() {
    return {
      showStocks: false,
      selectedTicker: null, // 선택된 티커를 저장할 변수
      selectedCompanyName: '', // 회사명
    };
  },
  methods: {
    toggleStocks() {
      this.showStocks = !this.showStocks;
      if (this.showStocks) {
        this.selectedTicker = null; // M7 차트가 표시될 때 개별 차트 숨기기
        this.selectedCompanyName = '';
      }
    },
    handleCompanySelected({ ticker, name }) {
      this.selectedTicker = ticker; // 선택된 티커를 저장
      this.selectedCompanyName = name; // 선택된 회사명을 저장
      this.showStocks = false; // 개별 차트가 표시될 때 M7 차트 숨기기
    }
  },
};
</script>

<style>
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
  margin-top: 60px;
}
</style>

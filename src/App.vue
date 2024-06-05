<template>
  <img alt="Vue logo" src="./assets/img_ci_new.png">
  <HelloWorld msg="JEJU Graph"/>
  <div id="app">
    <DropDown />
    <br>
    <!-- <ChartComponent /> -->
  </div>
</template>

<script>
import HelloWorld from './components/HelloWorld.vue';
//import ChartComponent from './components/ChartComponent.vue';
import DropDown from './components/DropDown.vue';

export default {
  name: 'App',
  components: {
    HelloWorld,
    //ChartComponent,
    DropDown,
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

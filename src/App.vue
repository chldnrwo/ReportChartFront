<template>
  <div id="app">
    <LockSlider :value="isLocked" @update:isLocked="isLocked = $event" />
    <br>
    <img alt="Vue logo" src="./assets/img_ci_new.png">
    <HelloWorld msg="JEJU Graph"/>
    <br>
    <div>
      <DropDown v-if="!isLocked" />
      <DropAuto v-if="isLocked" />
      <br>
    </div>
  </div>
</template>

<script>
import HelloWorld from './components/HelloWorld.vue';
import DropDown from './components/DropDown.vue';
import DropAuto from './components/DropAuto.vue';
import LockSlider from './components/LockSlider.vue';

export default {
  name: 'App',
  components: {
    HelloWorld,
    DropDown,
    DropAuto,
    LockSlider,
  },
  data() {
    return {
      isLocked: true
    };
  }
};
</script>

<style>
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
  margin-top: 10px;
}
</style>

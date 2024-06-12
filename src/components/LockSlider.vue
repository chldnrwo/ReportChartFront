<template>
    <div class="lock-slider-wrapper">
      <span :class="['label', 'label-left', { emphasizedLeft: isLocked }]">&emsp;&emsp;Auto&emsp;</span>
      <div class="lock-slider" :class="{ locked: isLocked, unlocked: !isLocked }" @click="toggleLock">
        <div class="slider-button" :style="{ left: isLocked ? '0' : 'calc(100% - 48px)' }">
          <i :class="isLocked ? 'fas fa-lock' : 'fas fa-unlock'"></i>
        </div>
      </div>
      <span :class="['label', 'label-right', { emphasizedRight: !isLocked }]">&emsp;Passive</span>
    </div>
  </template>
  
  <script>
  export default {
    props: {
      value: {
        type: Boolean,
        default: false
      }
    },
    data() {
      return {
        isLocked: this.value
      };
    },
    methods: {
      toggleLock() {
        this.isLocked = !this.isLocked;
        this.$emit('update:isLocked', this.isLocked); // 상태 변경 이벤트 발생
      }
    },
    watch: {
      value(newVal) {
        this.isLocked = newVal;
      }
    }
  };
  </script>
  
  <style scoped>
  .lock-slider-wrapper {
    width: 100%;
    display: flex;
    justify-content: center;
    align-items: center;
    margin-top: 20px;
  }
  .label {
    font-size: 25px;
    color: #333;
    font-weight: bold; /* 기본 bold 설정 */
    transition: color 0.3s ease;
  }
  .label.emphasizedLeft {
    color: #ff0000; /* 붉은 계열 강조 색상 */
  }
  .label.emphasizedRight {
    color: #007bff; /* 파란 계열 강조 색상 */
  }
  .lock-slider {
    width: 100px; /* 슬라이더 넓이 */
    height: 50px;
    background-color: #f0f0f0;
    border-radius: 25px;
    position: relative;
    user-select: none;
    overflow: hidden;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: background-color 0.3s ease; /* 배경색 전환 효과 */
  }
  .lock-slider.locked {
    background-color: #f0f0f0; /* 잠금 상태일 때 색상 */
  }
  .lock-slider.unlocked {
    background-color: #c0c0c0; /* 잠금 해제 상태일 때 색상 */
  }
  .lock-slider .slider-button {
    width: 48px; /* 버튼 크기 조정 */
    height: 48px;
    background-color: #007bff;
    border-radius: 50%;
    position: absolute;
    top: 1px; /* 중앙 정렬 */
    display: flex;
    align-items: center;
    justify-content: center;
    transition: left 0.3s ease;
  }
  .lock-slider .slider-button i {
    color: #fff;
  }
  .lock-slider.locked .slider-button {
    left: 0;
  }
  .lock-slider.unlocked .slider-button {
    left: calc(100% - 48px);
  }
  </style>
  
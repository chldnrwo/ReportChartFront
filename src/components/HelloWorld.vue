<template>
  <div class="hello">
    <h1 class="logo-text">{{ msg }}</h1>
    <!-- <p>report chart test</p> -->
  </div>
</template>

<script>
export default {
  name: 'HelloWorld',
  props: {
    msg: String
  }
}
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Poppins:wght@700&display=swap');

.logo-text {
  font-family: 'Poppins', sans-serif;
  font-size: 3rem; /* Adjust the size as needed */
  color: #004a9f; /* Adjust the color as needed to match the logo */
}
p {
  font-size: 1rem; /* Adjust the size as needed */
  color: #333; /* Adjust the color as needed */
}
</style>

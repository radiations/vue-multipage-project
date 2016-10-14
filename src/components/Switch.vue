<template>
  <div>
    <div>this is template body{{msg}}</div>
  </div>
</template>
<style>
  #switch {
    background-color: #ff0000;
  }
</style>
<script>
  export default{
    template: __gvptemplate,
    data(){
      return {
        msg: 'hello vue'
      }
    },
    components: {
    }
  }
</script>

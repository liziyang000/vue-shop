<template>
  <div>Home组件 <el-button type="info" @click="logOut" round>退出登录</el-button></div>
</template>

<script>
export default {
  name: 'Home',
  methods: {
    logOut() {
      window.sessionStorage.clear('token')
      this.$message.success('退出成功！')
      setTimeout(() => {
        this.$router.push('/login')
      }, 1000)
    }
  }
}
</script>

<style lang="less" scoped></style>

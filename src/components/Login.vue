<template>
  <div class="login_container">
    <div class="login_box">
      <!-- 头像区域 -->
      <div class="avatar_box">
        <img src="@/assets/logo.png" />
      </div>
      <!-- 登陆表单区域 -->
      <el-form class="login_form" ref="LoginFormRef" :model="Loginform" :rules="Loginrules">
        <!-- 用户名 -->
        <el-form-item prop="username">
          <el-input
            prefix-icon="iconfont icon-user_line"
            placeholder="请输入用户名"
            v-model="Loginform.username"></el-input>
        </el-form-item>
        <!-- 密码 -->
        <el-form-item prop="password">
          <el-input
            prefix-icon="iconfont icon-lock_line"
            placeholder="请输入登录密码"
            v-model="Loginform.password"
            show-password></el-input>
        </el-form-item>
        <!-- 提交按钮 -->
        <el-form-item class="btns">
          <el-button type="primary" @click="login">登录</el-button>
          <el-button type="info" @click="resetForm">重置</el-button>
        </el-form-item>
      </el-form>
    </div>
  </div>
</template>

<script>
export default {
  name: 'Login',
  data() {
    return {
      // 登陆表单的数据绑定对象
      Loginform: { username: 'admin', password: '123456' },
      // 表单的验证属性
      Loginrules: {
        username: [
          { required: true, message: '请输入用户名', trigger: 'blur' },
          { min: 3, message: '至少输入 3 个字符', trigger: 'blur' }
        ],
        password: [
          { required: true, message: '请输入密码', trigger: 'blur' },
          {
            min: 6,
            max: 15,
            message: '长度在 6 到 15 个字符',
            trigger: 'blur'
          }
        ]
      }
    }
  },
  methods: {
    resetForm() {
      this.$refs.LoginFormRef.resetFields()
    },
    login() {
      this.$refs.LoginFormRef.validate(async vaild => {
        if (!vaild) {
          return
        }
        const { data: res } = await this.$http.post('login', this.Loginform)
        // console.log(res)
        if (res.meta.status !== 200) {
          return this.$message.error('登陆失败！')
        }
        window.sessionStorage.setItem('token', res.data.token)
        this.$message.success('登陆成功')
        setTimeout(() => {
          this.$router.push('/home')
        }, 1000)
      })
      this.resetForm()
    }
  },
  created() {
    if (window.sessionStorage.getItem('token')) return this.$router.push('/home')
  }
}
</script>

<style lang="less" scoped>
.login_container {
  position: relative;
  background-color: #2b4b6b;
  height: 100%;
}
.login_box {
  width: 450px;
  height: 300px;
  background-color: #fff;
  border-radius: 5px;
  box-shadow: 5px 5px 10px #ddd;
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  .avatar_box {
    width: 130px;
    height: 130px;
    padding: 5px;
    border: 1px solid #eee;
    border-radius: 50%;
    box-shadow: 5px 5px 10px #ddd;
    background-color: #fff;
    position: absolute;
    left: 50%;
    transform: translate(-50%, -50%);

    img {
      width: 100%;
      height: 100%;
      border-radius: 50%;
      background-color: #eee;
      box-shadow: 0px 0px 15px #fddffd;
    }
  }
}

.login_form {
  box-sizing: border-box;
  padding: 0 30px;
  width: 100%;

  position: absolute;
  bottom: 0;
  .btns {
    display: flex;
    justify-content: right;
  }
}
</style>

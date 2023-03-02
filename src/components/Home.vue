<template>
  <el-container class="home-container">
    <!-- 头部区域 -->
    <el-header>
      <div @click="$router.push('home')" style="cursor: pointer">
        <img src="@/assets/logo.png" alt="" />
        <span>电商后台管理系统</span>
      </div>
      <el-button type="info" @click="logOut">退出登录</el-button>
    </el-header>
    <!-- 页面主体部分 -->
    <el-container>
      <!-- 侧边栏 -->
      <el-aside>
        <el-switch v-model="isCollapse" active-color="#909399"></el-switch>
        <el-menu
          class="el-menu-vertical-demo"
          :collapse="!isCollapse"
          unique-opened
          background-color="#333744"
          text-color="#fff"
          active-text-color="#409eff"
          router>
          <!-- 一级菜单 -->
          <el-submenu v-for="item in menuList" :key="item.id" :index="item.order + ''">
            <!-- 一级菜单模板区 -->
            <template slot="title">
              <i :class="iconsObj[item.id]"></i>
              <span slot="title">{{ item.authName }}</span>
            </template>
            <!-- 二级菜单 -->
            <el-menu-item v-for="subItem in item.children" :key="subItem.id" :index="'/' + subItem.path">
              <template slot="title">
                <i class="el-icon-menu"></i>
                <span>{{ subItem.authName }}</span>
              </template>
            </el-menu-item>
          </el-submenu>
        </el-menu>
      </el-aside>
      <!-- 右侧内容主体 -->
      <el-main>
        <router-view></router-view>
      </el-main>
    </el-container>
  </el-container>
</template>

<script>
export default {
  name: 'Home',
  data() {
    return {
      isCollapse: true,
      menuList: [],
      iconsObj: {
        125: 'el-icon-user-solid',
        103: 'el-icon-s-tools',
        101: 'el-icon-s-shop',
        102: 'el-icon-s-claim',
        145: 'el-icon-s-marketing'
      }
    }
  },
  methods: {
    logOut() {
      window.sessionStorage.clear('token')
      this.$message.success('退出成功！')
      setTimeout(() => {
        this.$router.push('/login')
      }, 1000)
    },
    // 获取所有菜单
    async getMenuList() {
      const { data: res } = await this.$http.get('menus')
      if (res.meta.status !== 200) return this.$message.error(res.meta.msg)
      this.menuList = res.data
    }
  },
  created() {
    this.getMenuList()
  }
}
</script>

<style lang="less" scoped>
.home-container {
  height: 100%;
}
.el-header {
  position: sticky;
  top: 0;
  z-index: 10;
  display: flex;
  justify-content: space-between;
  align-items: center;
  background-color: #333744;
  color: #fff;
  font-size: 20px;
  > div {
    display: flex;
    align-items: center;
    span {
      margin-left: 15px;
    }
  }
  img {
    width: 32px;
    height: 32px;
  }
}
.el-aside {
  width: auto !important;
  background-color: #333744;
  .el-switch {
    width: 60%;
    left: 50%;
    transform: translate(-50%);
  }
  /deep/.el-switch__core {
    width: 100% !important;
  }
  .el-menu {
    border-right: 0;
    i {
      margin-right: 10px;
    }
  }
}
.el-main {
  background-color: #eaedf1;
  height: calc(100vh - 60px);
}
.el-menu-vertical-demo:not(.el-menu--collapse) {
  width: 200px;
  min-height: 400px;
}
</style>

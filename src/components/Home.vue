<template>
  
    <el-container class="home-container">
        <!-- 头部区域 -->
  <el-header>
      <div>
          <img src="../assets/heima.png">
          <span>电商管理系统</span>
      </div>
      <el-button type="info" @click="logout">退出</el-button></el-header>
    <!-- 主体区域 -->
  <el-container>
      <!-- 侧边栏区域 -->
      <!-- 通过isCollapse判断是否折叠以此来改变侧边栏的宽度 -->
    <el-aside :width="isCollapse ? '64px': '200px'">
        <div class="toggle-button" @click="toggleCollapse">|||</div>
        <!-- 侧边栏菜单区域 -->
         <el-menu
      background-color="#333744"
      text-color="#fff"
      active-text-color="#409EFF" unique-opened :collapse="isCollapse" :collapse-transition="false"
       router :default-active="activePath"
       >
       <!-- collapse-transition	是否开启折叠动画
       default-active	当前激活菜单的 index
       collapse	是否水平折叠收起菜单（仅在 mode 为 vertical 时可用）
       unique-opened	是否只保持一个子菜单的展开
       router	是否使用 vue-router 的模式，启用该模式会在激活导航时以 index 作为 path 进行路由跳转
        -->
      <!-- 一级菜单 -->
      <el-submenu :index="item.id +''" v-for="item in menulist" :key="item.id">
          <!-- 一级菜单的模板区 -->
        <template slot="title">
            <!-- 图标 -->
          <i :class="iconsObj[item.id]"></i>
          <!-- 文本 -->
          <span>{{item.authName}}</span>
        </template>
        <!-- 二级菜单 -->
        <!-- 地址需要进行字符串拼接 -->
         <el-menu-item :index="'/' + subitem.path" v-for="subitem in item.children" :key="subitem.id"
          @click="saveNavState('/' + subitem.path)">
              <template slot="title">
            <!-- 图标 -->
          <i class="el-icon-location"></i>
          <!-- 文本 -->
          <span>{{subitem.authName}}</span>
        </template>
         </el-menu-item>
        
       
      </el-submenu>
     
    </el-menu>
    </el-aside>
    <!-- 右侧栏内容主体 -->
    <el-main>
      <!-- 路由占位符 -->
      <router-view></router-view>
      </el-main>
  </el-container>
</el-container>
  
  
</template>

<script>
export default {
    data(){
        return {
               menulist:[],
               iconsObj:{
                   '125':'iconfont icon-user',
                    '103':'iconfont icon-tijikongjian',
                     '101':'iconfont icon-shangpin',
                      '102':'iconfont icon-danju',
                       '145':'iconfont icon-baobiao',

               },
               isCollapse:false,//代表是否折叠
               //被激活的链接地址
               activePath:'',

        }
    },
    created() {
   this.getMenuList();
//    获取到缓存中的activepath
   this.activePath=window.sessionStorage.getItem('activePath');
    },
   methods:{
   logout(){
    //    清空sessionStorage
       window.sessionStorage.clear();
    //    跳往注册页面
       this.$router.push('/login');
   },
   //获取所有的菜单
  async getMenuList(){
     const { data: res}=await this.$http.get('menus');
     if(res.meta.status!=200){
              this.$message.error(res.meta.msg);
           }
         
           this.menulist=res.data;
           
   },
   //点击按钮切换菜单的折叠和展开
   toggleCollapse(){
     this.isCollapse=! this.isCollapse;
   },
   //保持链接的激活状态
   saveNavState(activePath){
        window.sessionStorage.setItem('activePath',activePath);
        this.activePath=activePath;
      
   },
   }
}
</script>

<style lang="less" scope>
.home-container{
    height: 100%;
}
.el-header{
    background-color: #373D41;
    display: flex;
    justify-content: space-between;
    padding-left: 0;
    align-items: center;
    color:#fff;
    font-size: 20px;
    > div{
        display: flex;
        align-items: center;
        span{
            margin-left: 15px;
        }
    }
}
.el-aside{
    background-color:#333744;
    .el-menu{
        border-right: none;
    }
}
.el-main{
     background-color:#EAEDF1;
}
.iconfont{
   margin-right: 10px;
}
.toggle-button{
     background-color:#4A5064;
     font-size: 20px;
     line-height: 24px;
     color: #fff;
     text-align: center;
     letter-spacing: 0.2em;
     cursor: pointer;
}
</style>
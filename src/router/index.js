import Vue from 'vue'

import VueRouter from 'vue-router'
import Login from '../components/Login.vue'//这里记得使用../使用./找不到路径
import Home from '../components/Home.vue'
import Welcome from '../components/Welcome.vue'
import Users from '../components/user/Users.vue'
import Rights from '../components/power/Rights.vue'
import Roles from '../components/power/Roles.vue'
import Cate from '../components/goods/Cate.vue'
import Params from '../components/goods/Params.vue'
const originalPush = VueRouter.prototype.push
   VueRouter.prototype.push = function push(location) {
   return originalPush.call(this, location).catch(err => err)
}

Vue.use(VueRouter)

  
const router= new VueRouter({
  routes:[
    {path:'/', redirect: '/login'},
    {path:'/login', component: Login},
    {path:'/home', component: Home,
    redirect:'/welcome',
    children:[
      {path:'/welcome', component: Welcome},
      {path:'/users', component: Users},
      {path:'/rights', component: Rights},
      {path:'/roles', component: Roles},
      {path:'/categories', component: Cate},
      {path:'/params', component: Params},
    ]
  },

  ]
})
//挂载路由导航守卫
router.beforeEach((to ,from , next) => {
   //to表示将要访问的路径
   //from表示从哪个路径来的
   //next一个函数，表示放行
   //next()放行 next('/login')强制跳转
   if(to.path==='/login') return next()
   //获取tkoen
   const tokenstr= window.sessionStorage.getItem('token')
   if(!tokenstr) return next('/login')
   next()
})
export default router
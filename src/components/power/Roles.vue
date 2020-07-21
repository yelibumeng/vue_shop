<template>
  <div>
    <!-- 面包屑导航区 -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>权限管理</el-breadcrumb-item>
      <el-breadcrumb-item>角色列表</el-breadcrumb-item>
    </el-breadcrumb>
    <el-card>
      <!-- 添加角色按钮区 -->
      <el-row :gutter="20">
        <el-col>
          <el-button type="primary" @click="addDialogVisible=true">添加角色</el-button>
        </el-col>
      </el-row>
      <!-- 角色列表区域 -->
      <el-table :data="rolesList" border :stripe="true">
        <!-- 展开列 -->
        <el-table-column type="expand">
          <template slot-scope="scope">
            <el-row
              :class="['vcenter','bdbottom',i1===0 ? 'bdtop' : '']"
              v-for="(item1 ,i1) in scope.row.children"
              :key="item1.id"
            >
              <!-- 渲染一级权限 -->
              <el-col :span="5">
                <el-tag closable @close="removeRightsById(scope.row,item1.id)">{{item1.authName}}</el-tag>
                <i class="el-icon-caret-right"></i>
              </el-col>
              <!-- 渲染二级三级权限 -->
              <el-col :span="19">
                <!-- 通过for循环嵌套渲染 -->
                <el-row
                  :class="['vcenter','bdtop',i2===0 ? '' : 'bdtop']"
                  v-for="(item2,i2) in item1.children"
                  :key="item2.id"
                >
                  <el-col :span="6">
                    <el-tag
                      type="success"
                      closable
                      @close="removeRightsById(scope.row,item2.id)"
                    >{{item2.authName}}</el-tag>
                    <i class="el-icon-caret-right"></i>
                  </el-col>

                  <el-col :span="18">
                    <el-tag
                      type="warning"
                      v-for="item3 in item2.children"
                      :key="item3.id"
                      closable
                      @close="removeRightsById(scope.row,item3.id)"
                    >{{item3.authName}}</el-tag>
                  </el-col>
                </el-row>
              </el-col>
            </el-row>
          </template>
        </el-table-column>
        <!-- 索引列 -->
        <el-table-column type="index"></el-table-column>
        <el-table-column label="角色名称" prop="roleName"></el-table-column>
        <el-table-column label="角色描述" prop="roleDesc"></el-table-column>
        <el-table-column label="操作">
          <!-- showEditDialog(scope.row.id)  @click="showEditDialog(scope.row.id)  removeRolesById(scope.row.id)  -->
          <template slot-scope="scope">
            <el-button size="mini" type="primary" icon="el-icon-edit" @click="showEditDialog(scope.row.id)" >编辑</el-button>
            <el-button size="mini" type="danger" icon="el-icon-delete" @click=" removeRolesById(scope.row.id)">删除</el-button>
            <el-button size="mini" type="warning" icon="el-icon-setting" @click="showSetRightDialog(scope.row)">分配权限</el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>
    <el-dialog title="添加角色" :visible.sync="addDialogVisible" width="50%" @close="addDialogClosed">
      <!-- 内容主题曲 -->
      <el-form :model="addForm" :rules="addFormRules" ref="addFormRef" label-width="70px">
        <el-form-item label="角色名称" prop="roleName">
          <el-input v-model="addForm.roleName"></el-input>
        </el-form-item>
        <el-form-item label="角色描述" prop="roleDesc">
          <el-input v-model="addForm.roleDesc"></el-input>
        </el-form-item>
      </el-form>
      <!-- 底部区 -->
      <span slot="footer" class="dialog-footer">
        <el-button @click="addDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="addRoles">确 定</el-button>
      </span>
    </el-dialog>
    <el-dialog title="修改角色" :visible.sync="editDialogVisible" width="50%" @close="editDialogClosed">
      <el-form :model="editForm" :rules="editFormRules" ref="editFormRef" label-width="70px">
        <el-form-item label="角色名称" prop="roleName">
          <el-input v-model="editForm.roleName"></el-input>
        </el-form-item>
        <el-form-item label="角色描述" prop="roleDesc">
          <el-input v-model="editForm.roleDesc"></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="editDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="editRolesInfo">确 定</el-button>
      </span>
    </el-dialog>
    <el-dialog title="分配权限" :visible.sync="setRightDialogVisible" width="30%"  @close="setRightDialogClosed">
      <el-tree :data="rightslist" :props="treeProps" show-checkbox node-key="id" default-expand-all  :default-checked-keys="defkeys" ref="treeRef"></el-tree>
      <span slot="footer" class="dialog-footer">
        <el-button @click="setRightDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="allotRights">确 定</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
export default {
  data() {
    return {
      rolesList: [],
      // 控制修改用户对话框的显示与隐藏
      editDialogVisible: false,
      // 查询到的用户对象信息
      editForm: {},
      //控制添加用户对话框的显示与隐藏
      addDialogVisible: false,
      addForm: {},
      // 控制分配权限对话框的显示与隐藏
      setRightDialogVisible: false,
      // 所有权限的数据
      rightslist: [],
      // 树形控件的属性绑定对象
      treeProps:{
        label: "authName",
        children: "children"
      },
      // 默认选中的节点ID值数组
      defkeys:[],
     roleId:'',
      addFormRules: {
        roleName: [
          { required: true, message: "请输入角色名称", trigger: "blur" },
          {
            min: 3,
            max: 10,
            message: "角色名称长度在 3 到 10 个字符",
            trigger: "blur"
          }
        ],
        roleDesc: [
          { required: true, message: "请输入角色描述", trigger: "blur" },
          {
            min: 3,
            max: 10,
            message: "角色描述在 3 到 10 个字符",
            trigger: "blur"
          }
        ]
      },
      editFormRules: {
        roleName: [
          { required: true, message: "请输入角色名称", trigger: "blur" },
          {
            min: 3,
            max: 10,
            message: "角色名称长度在 3 到 10 个字符",
            trigger: "blur"
          }
        ],
        roleDesc: [
          { required: true, message: "请输入角色描述", trigger: "blur" },
          {
            min: 3,
            max: 10,
            message: "角色描述在 3 到 10 个字符",
            trigger: "blur"
          }
        ]
      }
    };
  },
  created() {
    this.getRolesList();
  },
  methods: {
    async getRolesList() {
      const { data: res } = await this.$http.get("roles");

      if (res.meta.status !== 200) {
        return this.$message.error("获取角色列表失败");
      }
      this.$message.success("获取角色列表成功");
      this.rolesList = res.data;
      console.log(res.data);
    },
    //
    async removeRolesById(id) {
      //  弹框提问用户是否删除数据
      const confirmResult = await this.$confirm(
        "此操作将永久删除该角色, 是否继续?",
        "提示",
        {
          confirmButtonText: "确定",
          cancelButtonText: "取消",
          type: "warning"
        }
      ).catch(err => err);
      // 如果用户确认删除则返回confirm
      // 如果用户取消删除则返回cancel
      console.log(confirmResult);
      if (confirmResult !== "confirm") {
        return this.$message.info("已取消删除");
      }
      this.$message.info("已经确认删除");
      const { data: res } = await this.$http.delete("roles/" + id);
      if (res.meta.status != 200) {
        return this.$message.error("删除用户失败");
      }
      this.$message.success("删除用户成功");
      this.getRolesList();
    },
    //展示编辑用户的对话框
    async showEditDialog(id) {
      const { data: res } = await this.$http.get("roles/" + id);

      if (res.meta.status != 200) {
        return this.$message.error("查询用户失败");
      }
      console.log(res.data);
      this.$message.success("查询用户成功");
      this.editForm = res.data;
      this.editDialogVisible = true;
    },
    //  监听对话框关闭的事件
    editDialogClosed() {
      this.$refs.editFormRef.resetFields();
    },
    //修改角色信息并提交
    editRolesInfo() {
      this.$refs.editFormRef.validate(async vaild => {
        if (!vaild) return;
        //发起修改用户请求
        console.log(this.editForm.id);
        const { data: res } = await this.$http.put(
          "roles/" + this.editForm.roleId,
          { roleName: this.editForm.roleName, roleDesc: this.editForm.roleDesc }
        );
        if (res.meta.status != 200) {
          return this.$message.error("更新用户失败");
        }
        //  关闭对话框
        this.editDialogVisible = false;
        // 刷新数据
        this.getRolesList();
        // 提示修改成功
        this.$message.success("更新用户成功");
      });
    },
    // 监听添加表单对话框的关闭事件
    addDialogClosed() {
      this.$refs.addFormRef.resetFields();
    },
    // 点击按钮添加新用户
    addRoles() {
      this.$refs.addFormRef.validate(async vaild => {
        console.log(vaild);
        if (!vaild) return;
        // 可以发起添加用户的网络请求
        const { data: res } = await this.$http.post("roles", this.addForm);
        if (res.meta.status != 201) {
          return this.$message.error("添加用户失败");
        }
        this.$message.success("添加用户成功");
        //  隐藏对话框
        this.addDialogVisible = false;
        // 重新获取用户数据
        this.getRolesList();
      });
    },
    //根据ID删除对应的权限
    async removeRightsById(role, rightId) {
      //弹框提示是否要删除

      const confirmResult = await this.$confirm(
        "此操作将永久删除该文件, 是否继续?",
        "提示",
        {
          confirmButtonText: "确定",
          cancelButtonText: "取消",
          type: "warning"
        }
      ).catch(err => err);
      if (confirmResult !== "confirm") {
        return this.$message.info("已取消删除");
      }
      this.$message.info("已经确认删除");
      const { data: res } = await this.$http.delete(
        `roles/${role.id}/rights/${rightId}`
      );
      if (res.meta.status != 200) {
        return this.$message.error("删除对应权限失败");
      }
      this.$message.success("删除对应权限成功");
      role.children = res.data;
      //  this.getRolesList();
    },
  
  // 展示分配权限的对话框
  async showSetRightDialog(role) {
    this.roleId=role.id;
    // 获取所有权限的数据
    const { data: res } = await this.$http.get("rights/tree");

    if (res.meta.status !== 200) {
      return this.$message.error("获取权限数据失败！");
    }
this.$message.success("获取权限数据成功");
    // 把获取到的权限数据保存到 data 中
    this.rightslist = res.data;
    console.log(this.rightslist);
      //  递归获取三级节点的ID
      this.getLeafKeys(role,this.defkeys);
    this.setRightDialogVisible = true;
  },
  // 通过递归的方式，获取所有三级权限的id并保存到defkey
  getLeafKeys(node,arr){
    if(!node.children){
      return arr.push(node.id)
    }
node.children.forEach(item =>{
   this.getLeafKeys(item,arr)
})
  },
  setRightDialogClosed(){
    this.defkeys=[]
  },
  // 点击为角色分配权限
    async allotRights() {
      const keys = [
        ...this.$refs.treeRef.getCheckedKeys(),
        ...this.$refs.treeRef.getHalfCheckedKeys()
      ]

      const idStr = keys.join(',')

      const { data: res } = await this.$http.post(
        `roles/${this.roleId}/rights`,
        { rids: idStr }
      )

      if (res.meta.status !== 200) {
        return this.$message.error('分配权限失败！')
      }

      this.$message.success('分配权限成功！')
      this.getRolesList()
      this.setRightDialogVisible = false
    }
  },
 

};
</script>

<style lang="less" scoped>
.el-tag {
  margin: 7px;
}
.bdtop {
  border-top: 1px solid #eee;
}
.bdbottom {
  border-bottom: 1px solid#eee;
}
.vcenter {
  display: flex;
  align-items: center;
}
</style>
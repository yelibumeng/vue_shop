<template>
  <div>
    <!-- 面包屑导航区 -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>商品管理</el-breadcrumb-item>
      <el-breadcrumb-item>商品分类</el-breadcrumb-item>
    </el-breadcrumb>
    <!-- 卡牌视图区 -->
    <el-card>
      <el-row :gutter="20">
        <el-col :span="4">
          <el-button type="primary" @click="showAddCateDialog">添加用户</el-button>
        </el-col>
      </el-row>
      <!-- 用户列表区 -->
      <!-- 获取的数据可以通过el-table的:data属性绑定 -->
      <tree-table
        :data="cateList"
        :columns="columns"
        :selection-type="false"
        :expand-type="false"
        show-index
        index-text="#"
        border
        stripe
        :show-row-hover="false"
        class="treetable"
      >
        <!-- 是否有效 -->
        <template slot="isok" slot-scope="scope">
          <i
            class="el-icon-success"
            v-if="scope.row.cat_deleted === false"
            style="color :lightgreen"
          ></i>
          <i class="el-icon-error" v-else></i>
        </template>
        <!-- 排序 -->
        <template slot="order" slot-scope="scope">
          <el-tag size="mini" v-if="scope.row.cat_level===0">一级</el-tag>
          <el-tag type="success" size="mini" v-else-if="scope.row.cat_level===1">二级</el-tag>
          <el-tag type="warning" size="mini" v-else-if="scope.row.cat_level===2">三级</el-tag>
        </template>
        <!-- 操作 -->
        <template slot="opt" slot-scope="scope">
          <el-button
            type="primary"
            icon="el-icon-edit"
            size="mini"
            @click="showCateEditDialog(scope.row.cat_id)"
          >编辑</el-button>
          <!-- <p>{{scope.row}}</p> -->
          <el-button
            type="danger"
            icon="el-icon-delete"
            size="mini"
            @click="removeCateById(scope.row.cat_id)"
          >删除</el-button>
        </template>
      </tree-table>
      <!-- 分页区域 -->
      <el-pagination
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
        :current-page="queryInfo.pagenum"
        :page-sizes="[3, 5, 10, 15]"
        :page-size="queryInfo.pagesize"
        layout="total, sizes, prev, pager, next, jumper"
        :total="total"
      ></el-pagination>
    </el-card>
    <!-- 添加分类的对话框 -->
    <el-dialog
      title="添加分类"
      :visible.sync="addCateDialogVisible"
      width="50%"
      @close="addCateDialogClose"
    >
      <!-- 内容主题曲 -->
      <el-form
        :model="addCateForm"
        :rules="addCateFormRules"
        ref="addCateFormRef"
        label-width="70px"
      >
        <el-form-item label="分类名称" prop="cat_name">
          <el-input v-model="addCateForm.cat_name"></el-input>
        </el-form-item>
        <el-form-item label="父级分类">
          <!-- option用来指定数据源 -->
          <el-cascader
            v-model="selectedKeys"
            :options="ParentCateList"
            :props="cascadeProps"
            expand-trigger="hover"
            @change="parentCateChange"
            clearable
            change-on-select
          ></el-cascader>
        </el-form-item>
      </el-form>
      <!-- 底部区 -->
      <span slot="footer" class="dialog-footer">
        <el-button @click="addCateDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="addCate">确 定</el-button>
      </span>
    </el-dialog>
    <el-dialog title="修改商品分类" :visible.sync="editCateDialogVisible" width="50%">
      <el-form
        :model="editCateForm"
        :rules="addCateFormRules"
        ref="editCateFormRef"
        label-width="70px"
      >
        <el-form-item label="分类名称" prop="cat_name">
          <el-input v-model="editCateForm.cat_name"></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="editCateDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="editCateInfo">确 定</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
export default {
  data() {
    return {
      //  查询条件
      queryInfo: {
        type: 3,
        pagenum: 1,
        pagesize: 5,
      },
      // 控制分类添加对话框的显示与隐藏
      addCateDialogVisible: false,
      editCateDialogVisible: false,
      // 添加分类的表单对象
      addCateForm: {
        // 父级分类ID
        cat_pid: 0,
        cat_name: '',
        // 分类的等级默认添加一级分类
        cat_level: 0,
      },
      editCateForm:{},
      cascadeProps: {
        value: "cat_id",
        label: "cat_name",
        children: "children",
      },
      selectedKeys: [],
      addCateFormRules: {
        cat_name: [
          { required: true, message: "请输入商品分类名", trigger: "blur" },
        ],
      },
      editFormRules:{
         cat_name: [
          { required: true, message: "请输入商品分类名", trigger: "blur" },
        ],
      },
      total: 0,
      cateList: [],
      ParentCateList: [],
      //    为table指定列的定义
      columns: [
        {
          label: "分类名称",
          prop: "cat_name",
        },
        {
          label: "是否有效",
          //    表示将其当前列定义为模板
          type: "template",
          //  表示当前这一列使用模板的名字
          template: "isok",
        },
        {
          label: "排序",
          //    表示将其当前列定义为模板
          type: "template",
          //  表示当前这一列使用模板的名字
          template: "order",
        },
        {
          label: "操作",
          //    表示将其当前列定义为模板
          type: "template",
          //  表示当前这一列使用模板的名字
          template: "opt",
        },
      ],
    };
  },
  created() {
    this.getCateList();
  },
  methods: {
    async getCateList() {
      const { data: res } = await this.$http.get("categories", {
        params: this.queryInfo,
      });

      if (res.meta.status !== 200) {
        return this.$message.error("获取商品列表失败");
      }
      this.cateList = res.data.result;
      this.total = res.data.total;
      this.$message.success("获取商品列表成功");
    },
    // 监听pagesize改变的事件
    handleSizeChange(newSize) {
      this.queryInfo.pagesize = newSize;
      this.getCateLsit();
    },
    // 监听pageNum的改变
    handleCurrentChange(newPage) {
      this.queryInfo.pagenum = newPage;
      this.getCateList();
    },
    // 展示添加对话框
    showAddCateDialog() {
      this.getParentCateList();
      this.addCateDialogVisible = true;
    },
    // 获取父级分类的数据列表
    async getParentCateList() {
      const { data: res } = await this.$http.get("categories", {
        params: { type: 2 },
      });
      if (res.meta.status !== 200) {
        return this.$message.error("获取商品列表失败");
      }

      this.$message.success("获取商品列表成功");
      this.ParentCateList = res.data;
      console.log(res.data);
    },
    // 选择项发生变化时出发这个函数
    parentCateChange() {
      console.log(this.selectedKeys);
      // 如果selectedKeys中大于零证明选中了父级分类
      // 反之则没选中
      if (this.selectedKeys > 0) {
        this.addCateForm.cat_pid = this.selectedKeys[
          this.selectedKeys.length - 1
        ];
        this.addCateForm.cat_level = this.selectedKeys.length;
        return;
      } else {
        this.addCateForm.cat_pid = 0;
        this.addCateForm.cat_level = 0;
        return;
      }
    },
    // 点击按钮添加新的分类
    addCate() {
       this.$refs.addCateFormRef.validate(async valid => {
        if (!valid) return
        const { data: res } = await this.$http.post(
          'categories',
          this.addCateForm
        )

        if (res.meta.status !== 201) {
          return this.$message.error('添加分类失败！')
        }

        this.$message.success('添加分类成功！')
        this.getCateList()
        this.addCateDialogVisible = false
      })
    },
    // 监听对话框的关闭
    addCateDialogClose() {
      this.$refs.addCateFormRef.resetFields();
      this.selectedKeys = [];
      this.addCateForm.cat_pid = 0;
      this.addCateForm.cat_level = 0;
    },
  async  removeCateById(id){

      const confirmResult = await this.$confirm(
        "此操作将永久删除该用户, 是否继续?",
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
      const { data: res } = await this.$http.delete("categories/" + id);
      if (res.meta.status != 200) {
        return this.$message.error("删除用户失败");
      }
      this.$message.success("删除用户成功");
      this.getCateList();
    },
    editCateInfo(id){
      console.log(this.editCateForm);
 this.$refs.editCateFormRef.validate(async vaild => {
        if (!vaild) return;
        //发起修改用户请求
        const { data: res } = await this.$http.put(
          "categories/" + this.editCateForm.cat_id,
          { cat_name: this.editCateForm.cat_name }
        );
        if (res.meta.status != 200) {
          return this.$message.error("更新用户失败");
        }

        //  关闭对话框
        this.editCateDialogVisible = false;
        // 刷新数据
        this.getCateList();
        // 提示修改成功
        this.$message.success("更新用户成功");
      });
    },
   async showCateEditDialog(id){
 
      const { data: res } = await this.$http.get("categories/" + id);

      if (res.meta.status != 200) {
        return this.$message.error("查询用户失败");
      }
      this.$message.success("查询用户成功");
      this.editCateForm = res.data;
      this.editCateDialogVisible = true;
    },
  },
};
</script>

<style lang="less"  scoped>
.treetable {
  margin-top: 15px;
}
</style>
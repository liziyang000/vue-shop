<template>
  <div>
    <el-breadcrumb separator=">">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>商品管理</el-breadcrumb-item>
      <el-breadcrumb-item>商品分类</el-breadcrumb-item>
    </el-breadcrumb>
    <el-card>
      <!-- 添加分类按钮区 -->
      <el-row>
        <el-col><el-button type="primary" @click="showAddCateDialog">添加分类</el-button></el-col>
      </el-row>

      <!-- 商品分类表单区 -->
      <tree-table
        :data="cateList"
        :columns="columns"
        :selection-type="false"
        :expand-type="false"
        show-index
        index-text="#"
        :show-row-hover="false"
        border>
        <!-- 是否有效插槽 -->
        <template slot="isOK" slot-scope="scope">
          <i
            :class="[scope.row.cat_delete ? 'el-icon-error' : 'el-icon-success']"
            :style="scope.row.cat_delete ? 'color:red;' : 'color:green;'"></i>
        </template>
        <!-- 排序插槽 -->
        <template slot="Order" slot-scope="scope">
          <el-tag v-if="scope.row.cat_level === 0" size="mini">一级</el-tag>
          <el-tag v-else-if="scope.row.cat_level === 1" size="mini" type="success">二级</el-tag>
          <el-tag v-if="scope.row.cat_level === 2" size="mini" type="warning">三级</el-tag>
        </template>
        <!-- 操作插槽 -->
        <template slot="opt" slot-scope="scope">
          <!-- 修改按钮 -->
          <el-button type="primary" icon="el-icon-edit" size="mini" @click="showEditDialog(scope.row)">
            编辑
          </el-button>
          <!-- 删除按钮 -->
          <el-button type="danger" icon="el-icon-delete" size="mini" @click="reMoveCate(scope.row)">
            删除
          </el-button>
        </template>
      </tree-table>
      <!-- 分页区域 -->
      <el-pagination
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
        :current-page.sync="queryInfo.pagenum"
        :page-sizes="[3, 5, 10, 20]"
        :page-size="queryInfo.pagesize"
        layout="total, sizes, prev, pager, next, jumper"
        :total="total"></el-pagination>
    </el-card>

    <!-- 添加分类的对话框 -->
    <el-dialog title="添加分类" :visible.sync="addCateDialogVisible" width="50%" @close="addCateDialogClosed">
      <!-- 添加分类的表单 -->
      <el-form ref="addCateFormRef" :model="addCateForm" :rules="addCateFormRules" label-width="100px">
        <el-form-item label="分类名称：" prop="cat_name">
          <el-input v-model="addCateForm.cat_name" placeholder="请输入分类名称"></el-input>
        </el-form-item>

        <el-form-item label="父级分类：" prop="cat_pid">
          <el-cascader
            @change="parentCateChanged"
            v-model="selectedKeys"
            :options="cateParentList"
            :props="{
              expandTrigger: 'hover',
              checkStrictly: true,
              value: 'cat_id',
              label: 'cat_name',
              children: 'children'
            }"
            clearable
            placeholder="请选择分类"></el-cascader>
        </el-form-item>
      </el-form>

      <span slot="footer" class="dialog-footer">
        <el-button @click="addCateDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="addCate">添 加</el-button>
      </span>
    </el-dialog>

    <!-- 编辑分类的对话框 -->
    <el-dialog
      title="编辑分类"
      :visible.sync="editCateDialogVisible"
      width="50%"
      @close="editCateDialogClosed">
      <!-- 添加分类的表单 -->
      <el-form ref="editCateFormRef" :model="editCateForm" :rules="editCateFormRules" label-width="100px">
        <el-form-item label="分类名称：" prop="cat_name">
          <el-input v-model="editCateForm.cat_name" placeholder="请输入分类名称"></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="editCateDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="editCateInfo">修 改</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
export default {
  name: 'Categories',
  data() {
    return {
      // 商品分类的数据列表
      cateList: [],
      // 查询条件
      queryInfo: {
        type: 3,
        // 当前页码值
        pagenum: 1,
        // 每页显示多少数据
        pagesize: 5
      },
      // 商品分类总数
      total: 0,
      // 表格各列的配置
      columns: [
        {
          label: '分类名称',
          prop: 'cat_name'
        },
        {
          label: '是否有效',
          prop: 'cat_delete',
          // 表示将当前列定义为模板列
          type: 'template',
          template: 'isOK'
        },
        {
          label: '排序',
          prop: 'cat_level',
          // 表示将当前列定义为模板列
          type: 'template',
          template: 'Order'
        },
        {
          label: '操作',
          // 表示将当前列定义为模板列
          type: 'template',
          template: 'opt'
        }
      ],
      // 控制添加分类的对话框的显示
      addCateDialogVisible: false,
      // 添加分类的表单对象
      addCateForm: {
        // 分类名称
        cat_name: '',
        // 父级分类的id
        cat_pid: 0,
        // 分类层级
        cat_level: 0
      },
      // 添加分类的表单规则
      addCateFormRules: { cat_name: [{ required: true, message: '请输入分类名称', trigger: 'blur' }] },
      cateParentList: [],
      selectedKeys: [],

      // 编辑分类
      editCateDialogVisible: false,
      editCateForm: {},
      editCateFormRules: { cat_name: [{ required: true, message: '请输入分类名称', trigger: 'blur' }] }
    }
  },
  methods: {
    async getCateList() {
      const { data: res } = await this.$http.get('categories', { params: this.queryInfo })
      if (res.meta.status !== 200) return this.$message.error('获取商品分类数据失败！')
      this.cateList = res.data.result
      this.total = res.data.total
      this.$message.success('获取商品分类数据成功！')
    },
    // 监听pagesize值改变
    handleSizeChange(newSize) {
      this.queryInfo.pagesize = newSize
      this.getCateList()
    },
    // 监听pagenum的改变
    handleCurrentChange(newPage) {
      this.queryInfo.pagenum = newPage
      this.getCateList()
    },
    // 添加分类
    // 点击按钮，展示添加分类的对话框
    showAddCateDialog() {
      this.addCateDialogVisible = true
      this.getParentCateList()
    },
    // 添加分类对话框关闭时的处理函数
    addCateDialogClosed() {
      this.$refs.addCateFormRef.resetFields()
      this.selectedKeys = []
      this.addCateForm = {
        // 分类名称
        cat_name: '',
        // 父级分类的id
        cat_pid: 0,
        // 分类层级
        cat_level: 0
      }
    },
    // 获取父级分类的列表
    async getParentCateList() {
      const { data: res } = await this.$http.get('categories', { params: { type: 2 } })
      if (res.meta.status !== 200) return this.$message.error('获取父级分类数据失败！')
      this.cateParentList = res.data
    },
    // 选择父级分类之后
    parentCateChanged() {
      const l = this.selectedKeys.length
      this.addCateForm.cat_level = l
      this.addCateForm.cat_pid = this.selectedKeys[l - 1] ? this.selectedKeys[l - 1] : 0
    },
    addCate() {
      this.$refs.addCateFormRef.validate(async valid => {
        if (!valid) return
        const { data: res } = await this.$http.post('categories', this.addCateForm)
        if (res.meta.status !== 201) return this.$message.error('添加分类失败！')
        this.$message.success('添加分类成功！')
        this.addCateDialogVisible = false
        this.getCateList()
      })
    },

    // 修改分类
    // showEditDialog展示修改对话框
    showEditDialog(cate) {
      this.editCateForm = cate
      this.editCateDialogVisible = true
    },
    // 提交分类修改
    editCateInfo() {
      this.$refs.editCateFormRef.validate(async valid => {
        if (!valid) return
        const { data: res } = await this.$http.put(`categories/${this.editCateForm.cat_id}`, {
          cat_name: this.editCateForm.cat_name
        })
        if (res.meta.status !== 200) return this.$message.error('修改分类失败！')
        this.$message.success('修改分类成功！')
        this.editCateDialogVisible = false
        this.getCateList()
      })
    },
    // 关闭修改对话框
    editCateDialogClosed() {
      this.$refs.editCateFormRef.resetFields()
      this.editCateForm = {}
    },
    // 删除分类
    async reMoveCate(cate) {
      // this.delDialogVisible = true
      const confirmResult = await this.$confirm('此操作将永久删除该分类，是否继续？', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).catch(error => error)

      if (confirmResult !== 'confirm') {
        return this.$message.info('已取消删除！')
      }
      const { data: res } = await this.$http.delete(`categories/${cate.cat_id}`)
      if (res.meta.status !== 200) return this.$message.error('删除分类失败！')
      this.$message.success('删除分类成功！')
      this.getCateList()
    }
  },

  created() {
    this.getCateList()
  }
}
</script>

<style lang="less" scoped>
.zk-table {
  margin: 15px 0;
}
.el-cascader {
  width: 100%;
}
</style>

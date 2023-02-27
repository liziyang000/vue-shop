<template>
  <div>
    <el-breadcrumb separator=">">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>商品管理</el-breadcrumb-item>
      <el-breadcrumb-item>分类参数</el-breadcrumb-item>
    </el-breadcrumb>
    <el-card>
      <el-alert
        title="注意：只允许为第三级分类设置相关参数！"
        type="warning"
        :closable="false"
        show-icon></el-alert>
      <el-row class="cat_opt">
        <el-col>
          <span>选择商品分类：</span>
          <el-cascader
            @change="cateChanged"
            v-model="selectedCateKeys"
            :options="cateList"
            :props="{
              value: 'cat_id',
              label: 'cat_name',
              children: 'children'
            }"
            clearable
            placeholder="请选择分类"></el-cascader>
        </el-col>
      </el-row>
      <el-tabs v-model="activeName" @tab-click="cateChanged">
        <el-tab-pane label="动态参数" name="many"></el-tab-pane>
        <el-tab-pane label="静态属性" name="only"></el-tab-pane>
      </el-tabs>

      <!-- 添加按钮 -->
      <el-row>
        <el-col>
          <el-button
            type="primary"
            size="small"
            @click="addDialogVisible = true"
            :disabled="selectedCateKeys.length === 0 ? true : false">
            {{ activeName === 'many' ? '添加参数' : '添加属性' }}
          </el-button>
        </el-col>
      </el-row>

      <!-- 动态参数表格  -->
      <el-table :data="attrList" border stripe>
        <el-table-column type="expand">
          <template slot-scope="scope">
            <el-tag
              :key="tag"
              v-for="tag in scope.row.attr_vals"
              closable
              :disable-transitions="false"
              @close="reMoveTag(scope.row, tag)">
              {{ tag }}
            </el-tag>
            <el-input
              class="input-new-tag"
              v-if="inputVisible"
              v-model="inputValue"
              ref="saveTagInput"
              size="small"
              @keyup.enter.native="handleInputConfirm(scope.row)"
              @blur="handleInputConfirm(scope.row)"></el-input>
            <!-- 添加按钮 -->
            <el-button v-else class="button-new-tag" size="small" @click="showInput">+ New Tag</el-button>
          </template>
        </el-table-column>
        <el-table-column type="index" label="#"></el-table-column>
        <el-table-column
          prop="attr_name"
          :label="activeName === 'many' ? '参数名称' : '属性名称'"></el-table-column>
        <el-table-column label="操作">
          <template slot-scope="scope">
            <el-button type="primary" icon="el-icon-edit" size="mini" @click="showEditDialog(scope.row)">
              修改
            </el-button>
            <el-button type="danger" icon="el-icon-delete" size="mini" @click="delParams(scope.row)">
              删除
            </el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>

    <!-- 添加属性的对话框 -->
    <el-dialog
      :title="activeName === 'many' ? '添加动态参数' : '添加静态属性'"
      :visible.sync="addDialogVisible"
      width="50%"
      @close="addDialogClosed">
      <el-form ref="addFormRef" :model="addForm" :rules="addFormRules" label-width="140px">
        <el-form-item label="分类参数名称：" prop="attr_name">
          <el-input v-model="addForm.attr_name" placeholder="请输入分类参数名称"></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="addDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="addParams">确 认</el-button>
      </span>
    </el-dialog>

    <!-- 修改属性的对话框 -->
    <el-dialog
      :title="activeName === 'many' ? '修改动态参数' : '修改静态属性'"
      :visible.sync="editDialogVisible"
      width="50%"
      @close="editDialogClosed">
      <el-form ref="editFormRef" :model="editForm" :rules="editFormRules" label-width="140px">
        <el-form-item label="分类参数名称：" prop="attr_name">
          <el-input v-model="editForm.attr_name" placeholder="请输入分类参数名称"></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="editDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="editParams">确 认</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
export default {
  name: 'Params',
  data() {
    return {
      // Tabs栏切换
      activeName: 'many',
      // 商品分类数据
      cateList: [],
      selectedCateKeys: [],
      // 参数列表
      attrList: [],
      // 添加对话框
      addDialogVisible: false,
      addForm: {},
      addFormRules: {
        attr_name: [{ required: true, message: '请输入分类参数名称', trigger: 'blur' }],
        attr_vals: [{ required: true, message: '请输入分类参数值', trigger: 'blur' }]
      },
      // 修改对话框
      editDialogVisible: false,
      editForm: {},
      editFormRules: {
        attr_name: [{ required: true, message: '请输入分类参数名称', trigger: 'blur' }],
        attr_vals: [{ required: true, message: '请输入分类参数值', trigger: 'blur' }]
      },
      inputVisible: false,
      inputValue: ''
    }
  },
  methods: {
    // 获取商品分类数据
    async getCateList() {
      const { data: res } = await this.$http.get('categories')
      if (res.meta.status !== 200) return this.$message.error('获取商品分类数据失败！')
      this.cateList = res.data
    },
    // 选择的分类变化之后
    async cateChanged() {
      const l = this.selectedCateKeys.length
      if (l !== 0) {
        // 获取当前选择分类的分类等级
        const { data: level } = await this.$http.get(`categories/${this.cateId}`)
        if (level.data.cat_level !== 2) {
          // 当不是第三类时 清空选择器 清空参数列表
          this.selectedCateKeys = []
          this.attrList = []
          return this.$message.error('请选择第三级分类！')
        }
        // 获取分类参数并存储到cateList数组中
        const { data: res } = await this.$http.get(`categories/${this.cateId}/attributes`, {
          params: { sel: this.activeName }
        })
        if (res.meta.status !== 200) return this.$message.error('获取分类参数失败！')
        this.attrList = res.data
        res.data.forEach(item => {
          item.attr_vals = item.attr_vals.length !== 0 ? item.attr_vals.split(',') : []
          // 控制文本框的显示与隐藏
          item.inputVisible = false
          item.inputValue = ''
        })
      } else {
        this.attrList = []
      }
    },
    // 添加对话框关闭
    addDialogClosed() {
      this.$refs.addFormRef.resetFields()
    },
    // 添加动态参数或静态属性
    addParams() {
      this.$refs.addFormRef.validate(async valid => {
        if (!valid) return
        const { data: res } = await this.$http.post(`categories/${this.cateId}/attributes`, {
          attr_name: this.addForm.attr_name,
          attr_sel: this.activeName
        })
        if (res.meta.status !== 201) return this.$message.error('添加参数失败！')
        this.$message.success('添加参数成功！')
        this.addDialogVisible = false
        this.cateChanged()
      })
    },
    // 修改属性
    showEditDialog(attr) {
      this.editDialogVisible = true
      this.editForm = attr
    },
    editParams() {
      this.$refs.editFormRef.validate(async valid => {
        if (!valid) return
        const { data: res } = await this.$http.put(
          `categories/${this.cateId}/attributes/${this.editForm.attr_id}`,
          {
            attr_name: this.editForm.attr_name,
            attr_sel: this.activeName
          }
        )
        if (res.meta.status !== 200) return this.$message.error('修改失败！')
        this.$message.success('修改成功！')
        this.editDialogVisible = false
        this.cateChanged()
      })
    },
    editDialogClosed() {
      this.$refs.editFormRef.resetFields()
    },
    // 删除属性
    async delParams(attr) {
      const confirmResult = await this.$confirm('此操作将永久删除该属性，是否继续？', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).catch(error => error)

      if (confirmResult !== 'confirm') {
        return this.$message.info('已取消删除！')
      }
      const { data: res } = await this.$http.delete(`categories/${this.cateId}/attributes/${attr.attr_id}`)
      if (res.meta.status !== 200) return this.$message.error('删除分类参数失败！')
      this.$message.success('删除分类参数成功！')
      this.cateChanged()
    },

    // 删除标签
    async reMoveTag(attr, tag) {
      attr.attr_vals.splice(attr.attr_vals.indexOf(tag), 1)
      console.log(attr.attr_vals.join(','))
      // 上传删除后的标签内容
      const { data: res } = await this.$http.put(`categories/${this.cateId}/attributes/${attr.attr_id}`, {
        attr_name: attr.attr_name,
        attr_sel: this.activeName,
        attr_vals: attr.attr_vals.join(',')
      })
      console.log(res)
      if (res.meta.status !== 200) return this.$message.error('删除失败！')
      this.$message.success('修改成功！')
    },
    // 点击添加标签按钮
    showInput() {
      this.inputVisible = true
      this.$nextTick(_ => {
        this.$refs.saveTagInput.$refs.input.focus()
      })
    },

    // 当按下enter或输入框失去焦点
    async handleInputConfirm(attr) {
      const inputValue = this.inputValue.trim()
      if (inputValue.length !== 0) {
        attr.attr_vals.push(inputValue)
        const { data: res } = await this.$http.put(`categories/${this.cateId}/attributes/${attr.attr_id}`, {
          attr_name: attr.attr_name,
          attr_sel: this.activeName,
          attr_vals: attr.attr_vals.join(',')
        })
        if (res.meta.status !== 200) return this.$message.error('删除失败！')
        this.$message.success('修改成功！')
      }
      this.inputVisible = false
      this.inputValue = ''
    }
  },
  computed: {
    cateId() {
      const l = this.selectedCateKeys.length
      if (l !== 0) {
        return this.selectedCateKeys[l - 1]
      }
      return null
    }
  },
  created() {
    this.getCateList()
  }
}
</script>

<style lang="less" scoped>
.el-tag + .el-tag {
  margin-left: 10px;
}
.button-new-tag {
  margin-left: 10px;
  height: 32px;
  line-height: 30px;
  padding-top: 0;
  padding-bottom: 0;
}
.input-new-tag {
  width: 90px;
  margin-left: 10px;
  vertical-align: bottom;
}
.cat_opt {
  margin-top: 15px;
}
</style>

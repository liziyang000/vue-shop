<template>
  <div>
    <el-breadcrumb separator=">">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>商品管理</el-breadcrumb-item>
      <el-breadcrumb-item>添加分类</el-breadcrumb-item>
    </el-breadcrumb>
    <el-card>
      <el-alert title="添加商品信息" type="info" :closable="false" show-icon center></el-alert>
      <el-steps
        :space="200"
        :active="activeIndex - 0"
        align-center
        finish-status="success"
        simple
        style="margin-top: 20px">
        <el-step title="基本信息"></el-step>
        <el-step title="商品参数"></el-step>
        <el-step title="商品属性"></el-step>
        <el-step title="商品图片"></el-step>
        <el-step title="商品内容"></el-step>
        <el-step title="完成"></el-step>
      </el-steps>
      <el-form
        :model="addForm"
        :rules="addFormRules"
        ref="addFormRef"
        label-width="100px"
        label-position="top">
        <el-tabs
          tab-position="left"
          style="margin-top: 20px"
          v-model="activeIndex"
          :before-leave="beforeTabLeave"
          @tab-click="tabClicked">
          <el-tab-pane label="基本信息" name="0">
            <el-form-item label="商品名称" prop="goods_name">
              <el-input v-model="addForm.goods_name"></el-input>
            </el-form-item>
            <el-form-item label="商品价格" prop="goods_price">
              <el-input v-model.number="addForm.goods_price"></el-input>
            </el-form-item>
            <el-form-item label="商品重量" prop="goods_weight">
              <el-input v-model.number="addForm.goods_weight"></el-input>
            </el-form-item>
            <el-form-item label="商品数量" prop="goods_number">
              <el-input v-model.number="addForm.goods_number"></el-input>
            </el-form-item>
            <el-form-item label="商品分类">
              <el-cascader
                @change="handleChange"
                :options="cateList"
                :props="{
                  value: 'cat_id',
                  label: 'cat_name',
                  children: 'children'
                }"
                v-model="addForm.goods_cat"
                clearable
                placeholder="请选择分类"></el-cascader>
            </el-form-item>
          </el-tab-pane>
          <el-tab-pane label="商品参数" name="1">
            <el-form-item :label="item.attr_name" v-for="item in manyTableDate" :key="item.attr_id">
              <!-- 复选框组 -->
              <el-checkbox-group v-model="item.attr_vals">
                <el-checkbox
                  :label="item1"
                  v-for="(item1, index1) in item.attr_vals"
                  :key="index1"
                  border></el-checkbox>
              </el-checkbox-group>
            </el-form-item>
          </el-tab-pane>
          <el-tab-pane label="商品属性" name="2">
            <el-form-item :label="item.attr_name" v-for="item in onlyTableDate" :key="item.attr_id">
              <el-input v-model="item.attr_vals[0]"></el-input>
            </el-form-item>
          </el-tab-pane>
          <el-tab-pane label="商品图片" name="3">
            <el-upload
              action="http://127.0.0.1:8888/api/private/v1/upload"
              :headers="headerObj"
              :on-preview="handlePreview"
              :on-remove="handleRemove"
              :on-success="handleSuccess"
              multiple
              list-type="picture">
              <el-button size="medium" type="primary">点击上传</el-button>
            </el-upload>
          </el-tab-pane>
          <el-tab-pane label="商品内容" name="4">
            <!-- 富文本编辑器 -->
            <quill-editor ref="myQuillEditor" v-model="addForm.goods_introduce"></quill-editor>
            <el-button type="primary" class="btnAdd" @click="addGoods">添加商品</el-button>
          </el-tab-pane>
        </el-tabs>
      </el-form>
    </el-card>

    <!-- 图片对话框 -->
    <el-dialog title="图片预览" :visible.sync="picDialogVisible" width="50%">
      <el-image :src="picUrl">
        <div slot="error" class="image-slot">
          <i class="el-icon-picture-outline"></i>
        </div>
      </el-image>
    </el-dialog>
  </div>
</template>

<script>
import _ from 'lodash'
export default {
  name: 'Add',
  data() {
    return {
      cateList: [],
      manyTableDate: [],
      onlyTableDate: [],
      picDialogVisible: false,
      picUrl: '',
      activeIndex: '0',
      // 添加商品的表单
      addForm: {
        goods_name: '',
        goods_price: '',
        goods_number: '',
        goods_weight: '',
        goods_cat: [],
        pics: [],
        goods_introduce: '',
        attrs: []
      },
      addFormRules: {
        goods_name: [{ required: true, message: '请输入商品名称', trigger: 'blur' }],
        goods_price: [
          { required: true, message: '请输入商品价格', trigger: 'blur' },
          { type: 'number', message: '请输入数字格式！' }
        ],
        goods_number: [
          { required: true, message: '请输入商品数量', trigger: 'blur' },
          { type: 'number', message: '请输入数字格式！' }
        ],
        goods_weight: [
          { required: true, message: '请输入商品重量', trigger: 'blur' },
          { type: 'number', message: '请输入数字格式！' }
        ]
      },
      headerObj: { Authorization: window.sessionStorage.getItem('token') }
    }
  },
  methods: {
    // 获取商品分类数据
    async getCateList() {
      const { data: res } = await this.$http.get('categories')
      if (res.meta.status !== 200) return this.$message.error('获取商品分类数据失败！')
      this.cateList = res.data
    },
    async handleChange() {
      const l = this.addForm.goods_cat.length
      if (l !== 0) {
        // 获取当前选择分类的分类等级
        const { data: level } = await this.$http.get(
          `categories/${this.addForm.goods_cat[this.addForm.goods_cat.length - 1]}`
        )
        if (level.data.cat_level !== 2) {
          // 当不是第三类时 清空选择器 清空参数列表
          this.addForm.goods_cat = []
          return this.$message.error('请选择第三级分类！')
        }
      }
    },
    // 切换标签页判断
    beforeTabLeave(activeName, oldActiveName) {
      if (oldActiveName === '0' && this.addForm.goods_cat.length === 0) {
        this.$message.error('请选择分类！')
        return false
      }
    },
    async tabClicked() {
      if (this.activeIndex === '1') {
        // 获取分类参数并存储到cateList数组中
        const { data: res } = await this.$http.get(
          `categories/${this.addForm.goods_cat[this.addForm.goods_cat.length - 1]}/attributes`,
          {
            params: { sel: 'many' }
          }
        )
        if (res.meta.status !== 200) return this.$message.error('获取分类参数失败！')
        this.manyTableDate = res.data
        res.data.forEach(item => {
          item.attr_vals = item.attr_vals.length !== 0 ? item.attr_vals.split(',') : []
        })
      } else if (this.activeIndex === '2') {
        // 获取分类参数并存储到cateList数组中
        const { data: res } = await this.$http.get(
          `categories/${this.addForm.goods_cat[this.addForm.goods_cat.length - 1]}/attributes`,
          {
            params: { sel: 'only' }
          }
        )
        if (res.meta.status !== 200) return this.$message.error('获取分类参数失败！')
        this.onlyTableDate = res.data
        res.data.forEach(item => {
          item.attr_vals = item.attr_vals.length !== 0 ? item.attr_vals.split(',') : []
        })
      }
    },
    handleRemove(file, fileList) {
      const filePath = file.response.data.tmp_path
      const i = this.addForm.pics.findIndex(item => item.pic === filePath)
      this.addForm.pics.splice(i, 1)
    },
    handlePreview(file) {
      this.picDialogVisible = true
      this.picUrl = file.response.data.url
    },
    handleSuccess(response, file, fileList) {
      const picInfo = { pic: response.data.tmp_path }
      this.addForm.pics.push(picInfo)
    },
    // 点击添加商品按钮
    addGoods() {
      this.$refs.addFormRef.validate(async valid => {
        if (!valid) return this.$message.error('请填写必要的表单项！')
        const newAddForm = _.cloneDeep(this.addForm)
        // 处理动态参数和静态属性
        this.manyTableDate.forEach(item => {
          const newInfo = { attr_id: item.attr_id, attr_value: item.attr_vals.join(',') }
          this.addForm.attrs.push(newInfo)
        })
        this.onlyTableDate.forEach(item => {
          const newInfo = { attr_id: item.attr_id, attr_value: item.attr_vals.join(',') }
          this.addForm.attrs.push(newInfo)
        })
        newAddForm.attrs = this.addForm.attrs
        newAddForm.goods_cat = newAddForm.goods_cat.join(',')
        const { data: res } = await this.$http.post('goods', newAddForm)
        console.log(res)
        if (res.meta.status !== 201) return this.$message.error('添加商品失败！')
        this.$message.success('添加商品成功！')
        this.$refs.addFormRef.resetFields()
        this.$router.push('/goods')
      })
    }
  },
  created() {
    this.getCateList()
  }
}
</script>

<style lang="less" scoped>
.el-checkbox {
  margin: 0 10px 0 0 !important;
}
.btnAdd {
  margin-top: 15px;
}
</style>

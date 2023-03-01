<template>
  <div>
    <el-breadcrumb separator=">">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>商品管理</el-breadcrumb-item>
      <el-breadcrumb-item>商品列表</el-breadcrumb-item>
    </el-breadcrumb>
    <el-card>
      <!-- 查询区域 -->
      <el-row :gutter="20">
        <el-col :span="7">
          <el-input placeholder="请输入内容" v-model="queryInfo.query" clearable @clear="getGoodsList">
            <el-button slot="append" icon="el-icon-search" @click="getGoodsList"></el-button>
          </el-input>
        </el-col>
        <el-col :span="4">
          <el-button type="primary" @click="$router.push('goods/add')">添加商品</el-button>
        </el-col>
        <el-col :span="7"></el-col>
      </el-row>

      <!-- 表单区域 -->
      <el-table :data="goodsList" stripe border>
        <el-table-column type="index" label="#"></el-table-column>
        <el-table-column prop="goods_name" label="商品名称"></el-table-column>
        <el-table-column prop="goods_price" label="商品价格(元)" width="95px"></el-table-column>
        <el-table-column prop="goods_weight" label="商品重量" width="70px"></el-table-column>
        <el-table-column prop="add_time" label="创建时间" width="140px">
          <template slot-scope="scope">
            {{ scope.row.add_time | dateFormat }}
          </template>
        </el-table-column>
        <el-table-column label="操作" width="130px">
          <template slot-scope="scope">
            <el-button
              type="primary"
              icon="el-icon-edit"
              size="mini"
              @click="showEditDialog(scope.row)"></el-button>
            <el-button
              type="danger"
              icon="el-icon-delete"
              size="mini"
              @click="delGoods(scope.row)"></el-button>
          </template>
        </el-table-column>
      </el-table>
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

    <!-- 修改属性的对话框 -->
    <el-dialog title="编辑商品" :visible.sync="editDialogVisible" width="70%" @close="editDialogClosed">
      <el-form ref="editFormRef" :model="editGoodsForm" :rules="editFormRules" label-width="140px">
        <el-form-item label="商品名称：" prop="goods_name">
          <el-input v-model="editGoodsForm.goods_name" placeholder="请输入商品名称"></el-input>
        </el-form-item>
        <el-form-item label="价格：" prop="goods_price">
          <el-input v-model="editGoodsForm.goods_price" placeholder="请输入价格"></el-input>
        </el-form-item>
        <el-form-item label="数量：" prop="goods_number">
          <el-input v-model="editGoodsForm.goods_number" placeholder="请输入数量"></el-input>
        </el-form-item>
        <el-form-item label="重量：" prop="goods_weight">
          <el-input v-model="editGoodsForm.goods_weight" placeholder="请输入重量"></el-input>
        </el-form-item>
        <el-form-item label="介绍：" prop="goods_introduce">
          <el-input v-model="editGoodsForm.goods_introduce" placeholder="请输入介绍"></el-input>
        </el-form-item>
        <el-form-item label="上传的图片临时路径（对象）" prop="pics">
          <el-input v-model="editGoodsForm.pics" placeholder="上传的图片临时路径（对象）"></el-input>
        </el-form-item>
        <el-form-item label="商品的参数（数组）" prop="attrs">
          <el-input v-model="editGoodsForm.attrs" placeholder="商品的参数（数组）"></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="editDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="editGoods">确 认</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
export default {
  name: 'Lists',
  data() {
    return {
      total: 0,
      queryInfo: {
        query: '',
        pagenum: 1,
        pagesize: 10
      },
      goodsList: [],
      // 修改商品
      editDialogVisible: false,
      editGoodsForm: {},
      editFormRules: {
        goods_name: [{ required: true, message: '请输入商品名称', trigger: 'blur' }],
        goods_price: [{ required: true, message: '请输入价格', trigger: 'blur' }],
        goods_number: [{ required: true, message: '请输入数量', trigger: 'blur' }],
        goods_weight: [{ required: true, message: '请输入重量', trigger: 'blur' }]
      }
    }
  },
  methods: {
    // 监听pagesize值改变
    handleSizeChange(newSize) {
      this.queryInfo.pagesize = newSize
      this.getGoodsList()
    },
    // 监听pagenum的改变
    handleCurrentChange(newPage) {
      this.queryInfo.pagenum = newPage
      this.getGoodsList()
    },
    // 获取商品列表
    async getGoodsList() {
      const { data: res } = await this.$http.get('goods', {
        params: this.queryInfo
      })
      if (res.meta.status !== 200) return this.$message.error('获取商品列表失败！')
      this.goodsList = res.data.goods
      this.total = res.data.total
    },
    // 删除商品
    async delGoods(goods) {
      const confirmResult = await this.$confirm('此操作将永久删除该商品，是否继续？', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).catch(error => error)

      if (confirmResult !== 'confirm') {
        return this.$message.info('已取消删除！')
      }
      const { data: res } = await this.$http.delete(`goods/${goods.goods_id}`)
      if (res.meta.status !== 200) return this.$message.error('删除商品失败！')
      this.$message.success('删除商品成功！')
      this.getGoodsList()
    },
    // 修改商品
    // 展示修改商品对话框
    showEditDialog(goods) {
      this.editGoodsForm = goods
      this.editDialogVisible = true
    },
    // 提交修改的属性
    editGoods() {
      this.$refs.editFormRef.validate(async valid => {
        if (!valid) return
        const { data: res } = await this.$http.put(`goods/${this.editGoodsForm.goods_id}`, this.editGoodsForm)
        if (res.meta.status !== 201) return this.$message.error('修改失败！')
        this.$message.success('修改成功！')
        this.editDialogVisible = false
        this.getGoodsList()
      })
    },
    editDialogClosed() {
      this.editGoodsForm = {}
    }
  },
  created() {
    this.getGoodsList()
  }
}
</script>

<style lang="less" scoped></style>

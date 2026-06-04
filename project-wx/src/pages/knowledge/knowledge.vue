<template>
  <view class="knowledge-page">
    <view class="file-list" v-for="(item, index) in pinia.kbUploadFileItem" :key="index">
      <image mode="widthFix" :src="item.fileType === 'DOCX' ? '/static/docx-icon.png' : '/static/pdf.icon.png'"></image>
      <view class="file-title">
        <text>{{ item.fileName }}</text>
        <text>{{ item.fileSize }}</text>
      </view>
    </view>
    <!-- 上传 -->
    <view class="upload-file" @click="uploadFile">
      <text>上传文件</text>
    </view>
    <view style="height: 120rpx"></view>
  </view>
</template>

<script setup lang="ts">
import { ref } from "vue";
import { onLoad } from "@dcloudio/uni-app";
import { KbFileListApi, UploadkbApi } from "@/api/request";
import { projectStore } from "@/store/index";
const pinia = projectStore();
import { useFileUploader } from "@/api/useFileUploader";
// 获取知识库文件
onLoad(async () => {
  const res = await KbFileListApi();
  console.log(res);
  pinia.kbUploadFileItem = res.data;
});
// 上传文件
const uploadFile = async () => {
  await useFileUploader({ page: "knowledge", uploadApi: UploadkbApi });
};
</script>

<style scoped>
.knowledge-page {
  background-color: #0d1117;
  min-height: 100vh;
  padding-top: 20rpx;
}
.file-list {
  display: flex;
  align-items: center;
  margin: 0 20rpx;
  padding: 20rpx 0;
  border-bottom: 1rpx solid #30363d;
}
.file-list image {
  width: 100rpx;
}
.file-title {
  padding-left: 10rpx;
}
.file-title text:nth-child(1) {
  color: #c9d1d9;
  font-size: 30rpx;
}
.file-title text:nth-child(2) {
  font-size: 27rpx;
  color: #8b949e;
}
.upload-file {
  background-color: #161b22;
  border-top: 1px solid #30363d;
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  padding: 7rpx 20rpx 40rpx 20rpx;
}
.upload-file text {
  background: rgba(0, 212, 170, 0.1);
  border: 1px solid rgba(0, 212, 170, 0.3);
  font-size: 30rpx;
  text-align: center;
  border-radius: 10rpx;
  color: #00d4aa;
  height: 80rpx;
  line-height: 80rpx;
}
.upload-file text:active {
  background: rgba(0, 212, 170, 0.2);
}
</style>

<template>
  <view class="chat-message" v-for="(item, index) in pinia.messageList" :key="index">
    <!-- 用户消息 -->
    <template v-if="item.role == 'user'">
      <view class="user-message">
        <text>{{ item.displayContent || item.content }}</text>
      </view>
      <view class="file-view" v-if="item.uploadFileList && item.uploadFileList.length > 0">
        <view class="file-item" v-for="(itema, indexa) in item.uploadFileList" :key="indexa">
          <view class="file-icon"><image :src="itema.fileType == 'PDF' ? '/static/pdf-icon.png' : '/static/docx-icon.png'"></image></view>
          <view class="file-name">
            <text class="text-show">{{ itema.fileName }}</text>
            <text>{{ itema.fileSize }}</text>
          </view>
        </view>
      </view>
    </template>
    <!-- 模型消息 -->
    <view class="ai-message" v-if="item.role == 'assistant'">
      <view class="file-reading" @click="toggle(index)" v-if="item.readFileData" :key="item.readFileData.statusInfo">
        <view class="file-class">
          <text>{{ item.readFileData.promptInfo }}</text>
          <image src="/static/zhankai.png"></image>
        </view>
        <view class="file-list" v-show="item.isOpen">
          <text v-for="(itemb, indexb) in item.readFileData.fileList" :key="indexb">{{ indexb + 1 + "." }}{{ itemb }}</text>
        </view>
      </view>
      <towxml :nodes="appContext.$towxml(item.content, 'markdown')"></towxml>
      <!-- 联网搜索状态 -->
      <view class="web-search-status" v-if="item.webSearch">
        <text class="status-dot"></text>
        <text>联网搜索完成</text>
      </view>
      <!-- loading -->
      <view class="loading-circle" v-if="item.loadingCircle"></view>
    </view>
  </view>
  <!-- 高度 -->
  <view style="height: 300rpx"></view>
</template>

<script setup lang="ts">
import { ref, getCurrentInstance } from "vue";
import { projectStore } from "@/store/index";
const pinia = projectStore();
// const isOpen = ref(-1);
// 展开收起文件
const toggle = (index: number) => {
  pinia.messageList[index].isOpen = !pinia.messageList[index].isOpen;
};
// markdown渲染
const instance = getCurrentInstance();
const appContext = ref<any>(null);
appContext.value = instance?.appContext.config.globalProperties as any;
</script>

<style scoped>
.chat-message {
  display: flex;
  flex-direction: column;
  margin: 0 24rpx;
}

/* 用户消息气泡 - 青蓝玻璃风格 */
.user-message {
  margin-top: 30rpx;
  max-width: 70%;
  align-self: flex-end;
}
.user-message text {
  line-height: 1.6;
  background-color: rgba(0, 212, 170, 0.15);
  border: 1rpx solid rgba(0, 212, 170, 0.3);
  border-radius: 18rpx;
  color: #e6edf3;
  padding: 16rpx 22rpx;
  font-size: 30rpx;
  display: inline-block;
}

/* 文件列表 */
.file-view {
  display: flex;
  align-items: center;
  align-self: flex-end;
  flex-flow: wrap;
  margin-top: 15rpx;
  justify-content: flex-end;
}
.file-item {
  display: inline-flex;
  border: 1rpx solid #30363d;
  padding: 5rpx;
  border-radius: 10rpx;
  align-self: flex-end;
  background-color: #21262d;
  max-width: 270rpx;
  margin-left: 5rpx;
  margin-bottom: 5rpx;
}
.file-item image {
  width: 50rpx;
  height: 50rpx;
}
.file-icon {
  display: flex;
  align-self: center;
}
.file-name {
  display: flex;
  flex-direction: column;
  padding-left: 10rpx;
}
.file-name text:nth-child(1) {
  font-size: 25rpx;
  color: #c9d1d9;
  -webkit-line-clamp: 1;
}
.file-name text:nth-child(2) {
  font-size: 20rpx;
  color: #8b949e;
}

/* AI消息气泡 - 深色卡片 */
.ai-message {
  margin-top: 30rpx;
  background-color: #161b22;
  padding: 20rpx 24rpx;
  border-radius: 16rpx;
  border: 1rpx solid #30363d;
  /* towxml内容颜色 */
  color: #c9d1d9;
  font-size: 30rpx;
  line-height: 1.7;
}

/* 展开收起 */
.file-reading {
  margin-bottom: 10rpx;
  border-top: 1rpx solid #30363d;
  border-bottom: 1rpx solid #30363d;
  padding: 20rpx 0;
}
.file-class {
  display: flex;
  align-items: center;
  justify-content: space-between;
}
.file-class text {
  color: #00d4aa;
  font-weight: bold;
  font-size: 30rpx;
}
.file-class image {
  width: 25rpx;
  height: 25rpx;
}
.file-list {
  background: #21262d;
  border-radius: 8rpx;
  margin-top: 10rpx;
  font-size: 28rpx;
  padding: 0 10rpx 10rpx 10rpx;
  color: #c9d1d9;
}
.file-list text {
  padding-top: 10rpx;
}

/* 联网搜索状态 */
.web-search-status {
  display: flex;
  align-items: center;
  gap: 8rpx;
  margin-top: 12rpx;
  font-size: 24rpx;
  color: #00d4aa;
}
.status-dot {
  width: 8rpx;
  height: 8rpx;
  border-radius: 50%;
  background-color: #00d4aa;
}

/* Loading */
.loading-circle {
  width: 12px;
  height: 12px;
  background-color: #00d4aa;
  border-radius: 50%;
  margin: 8px 0;
  box-shadow: 0 0 8px rgba(0, 212, 170, 0.5);
  animation: pulse 2s ease-in-out infinite;
}
@keyframes pulse {
  0%, 100% {
    transform: scale(1);
    opacity: 1;
  }
  50% {
    transform: scale(1.5);
    opacity: 0.7;
  }
}
</style>

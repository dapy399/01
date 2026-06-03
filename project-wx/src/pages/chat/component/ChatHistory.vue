<template>
  <view class="modal-backdrop"></view>
  <view class="personal-center">
    <view class="user-info">
      <image v-if="pinia.userInfo?.avatar" :src="pinia.userInfo?.avatar" mode="aspectFill"></image>
      <text>{{ pinia.userInfo?.phoneNumber }}</text>
    </view>
    <view class="new-dialogue-btn" @click="createSession">+ 开启新对话</view>
    <text class="history-title">对话历史</text>
    <!-- 消息列表 -->
    <scroll-view scroll-y type="list" class="scroll-height" enhanced enable-passive>
      <view
        class="history-list"
        v-for="(item, index) in pinia.chatListData"
        :key="index"
        @click="handleSessionClick(index, item.sessionId)"
        :class="{ sessionStyle: index === pinia.sessionIndex }"
      >
        <text class="text-show">{{ item.content }}</text>
      </view>
    </scroll-view>
  </view>
</template>

<script setup lang="ts">
// 胶囊按钮坐标
import { buttonPosition } from "@/api/component-api.ts";
const { but_button } = buttonPosition();
import { projectStore } from "@/store/index";
import { ref } from "vue";
const pinia = projectStore();
import { SingleChatDataApi } from "@/api/request";
// 用户点击每个会话
const handleSessionClick = async (index: number, sessionId: string) => {
  pinia.sessionIndex = index;
  // 存储会话id
  pinia.sessionId = sessionId;
  // 请求当前会话数据
  const res = await SingleChatDataApi({ sessionId });
  console.log(res);
  pinia.messageList = res.data;
  pinia.switchChat = false;
  pinia.chatWelcome = false;
};
// 开启新会话
const createSession = () => {
  pinia.chatWelcome = true;
  pinia.sessionIndex = -1;
  pinia.sessionId = "null";
  pinia.messageList = [];
  pinia.switchChat = false;
};
</script>

<style scoped>
/* 遮罩层 */
.modal-backdrop {
  position: fixed;
  left: 0;
  top: v-bind("but_button");
  bottom: 0;
  right: 0;
  background: rgba(0, 0, 0, 0.7);
  z-index: 99;
}
.personal-center {
  background-color: #161b22;
  position: fixed;
  left: -80%;
  top: v-bind("but_button");
  bottom: 0;
  width: 80%;
  animation: slideInFromLeft 0.5s forwards;
  z-index: 99;
  border-right: 1rpx solid #30363d;
}
@keyframes slideInFromLeft {
  from {
    left: -80%;
  }
  to {
    left: 0;
  }
}
.user-info {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  padding: 30rpx 0;
}
.user-info image {
  width: 90rpx;
  height: 90rpx;
  border-radius: 50%;
  border: 2rpx solid #30363d;
}
.user-info text {
  font-size: 35rpx;
  font-weight: bold;
  padding-top: 10rpx;
  color: #e6edf3;
}
/* 开启新对话按钮 */
.new-dialogue-btn {
  margin: 20rpx 24rpx;
  padding: 20rpx;
  background-color: rgba(0, 212, 170, 0.15);
  border: 1rpx solid #00d4aa;
  border-radius: 12rpx;
  color: #00d4aa;
  font-size: 28rpx;
  font-weight: bold;
  text-align: center;
}
/* 对话历史标题 */
.history-title {
  display: block;
  margin: 30rpx 24rpx 20rpx 24rpx;
  border-bottom: 1rpx solid #30363d;
  padding-bottom: 20rpx;
  font-size: 24rpx;
  color: #8b949e;
  font-weight: bold;
  letter-spacing: 2rpx;
}
/* 消息列表 */
.scroll-height {
  height: 800rpx;
}
.history-list {
  background-color: #21262d;
  border-radius: 12rpx;
  margin: 12rpx 24rpx;
  padding: 20rpx 24rpx;
  display: flex;
  align-items: center;
  justify-content: space-between;
  border: 1rpx solid transparent;
}
.history-list text:nth-child(1) {
  flex: 1;
  -webkit-line-clamp: 1;
  color: #c9d1d9;
  font-size: 28rpx;
}
/* 点击之后每个会话样式 */
.sessionStyle {
  background-color: rgba(0, 212, 170, 0.15) !important;
  border-color: #00d4aa !important;
}
.sessionStyle text {
  color: #00d4aa !important;
}
</style>

<template>
  <view class="chat-window">
    <view class="chat-message">
      <text class="greeting-title">我是你的家庭医生助手，很高兴见到你！</text>
      <text class="greeting-desc">无论你想了解各种疾病的症状、治疗方法，还是关心日常养生，我都能为你提供科学的解答和贴心的建议。</text>
      <view class="feature-tags">
        <text class="tag" @click="selectTag('kb')">知识库问答</text>
        <text class="tag" @click="selectTag('search')">联网搜索</text>
        <text class="tag" @click="selectTag('report')">报告分析</text>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { projectStore } from "@/store/index";
const pinia = projectStore();

const selectTag = (type: string) => {
  // 根据类型设置不同的输入提示或触发不同功能
  if (type === 'kb') {
    pinia.homeAsk = "我想查询医学知识库";
  } else if (type === 'search') {
    pinia.homeAsk = "帮我搜索一下";
  } else if (type === 'report') {
    pinia.homeAsk = "帮我分析报告";
  }
};
</script>

<style scoped>
.chat-window {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 70vh;
  padding: 0 40rpx;
  background-color: #0d1117;
}
.chat-message {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  max-width: 700rpx;
}
.greeting-title {
  font-size: 36rpx;
  font-weight: 600;
  color: #e6edf3;
  letter-spacing: 2rpx;
  line-height: 1.4;
}
.greeting-desc {
  font-size: 28rpx;
  color: #8b949e;
  line-height: 1.6;
  margin-top: 20rpx;
  max-width: 600rpx;
}
.feature-tags {
  display: flex;
  flex-direction: row;
  gap: 16rpx;
  margin-top: 40rpx;
}
.tag {
  padding: 12rpx 24rpx;
  border-radius: 30rpx;
  background: rgba(0, 212, 170, 0.1);
  border: 1px solid rgba(0, 212, 170, 0.3);
  color: #00d4aa;
  font-size: 26rpx;
  transition: all 0.2s ease;
}
.tag:active {
  background: rgba(0, 212, 170, 0.2);
  border-color: rgba(0, 212, 170, 0.5);
}
</style>

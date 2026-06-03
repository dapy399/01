<template>
  <view class="chat-window">
    <view class="welcome-icon">AI</view>
    <text class="greeting-title">嗨！我是你的AI医生助手</text>
    <text class="greeting-desc">无论你想了解各种疾病的症状、治疗方法，还是关心日常养生，我都能为你提供科学的解答和贴心的建议。</text>
    <view class="feature-tags">
      <view class="tag">💬 智能问诊</view>
      <view class="tag">🔍 医学知识库</view>
      <view class="tag">🌐 联网搜索</view>
    </view>
  </view>
</template>

<script setup lang="ts">
</script>

<style scoped>
.chat-window {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 160rpx 50rpx 0 50rpx;
}
.welcome-icon {
  width: 100rpx;
  height: 100rpx;
  border-radius: 24rpx;
  background: linear-gradient(135deg, #00d4aa 0%, #00b894 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 36rpx;
  font-weight: bold;
  color: #0d1117;
  margin-bottom: 40rpx;
  box-shadow: 0 8rpx 32rpx rgba(0, 212, 170, 0.3);
}
.greeting-title {
  font-weight: bold;
  padding: 20rpx 0;
  font-size: 36rpx;
  color: #e6edf3;
  text-align: center;
}
.greeting-desc {
  font-size: 28rpx;
  color: #8b949e;
  text-align: center;
  line-height: 1.8;
  padding: 0 20rpx;
}
.feature-tags {
  display: flex;
  gap: 20rpx;
  margin-top: 50rpx;
  flex-wrap: wrap;
  justify-content: center;
}
.tag {
  padding: 12rpx 28rpx;
  border-radius: 50rpx;
  background-color: rgba(0, 212, 170, 0.1);
  border: 1rpx solid rgba(0, 212, 170, 0.3);
  color: #00d4aa;
  font-size: 24rpx;
}
</style>

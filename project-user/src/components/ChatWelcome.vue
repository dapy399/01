<template>
  <!-- 欢迎页面 -->
  <div class="chat-window">
    <div class="chat-message">
      <span class="greeting-title">我是你的家庭医生助手，很高兴见到你！</span>
      <span class="greeting-span">无论你想了解各种疾病的症状、治疗方法，还是关心日常养生，我都能为你提供科学的解答和贴心的建议。</span>
      <div class="feature-tags">
        <span class="tag">知识库问答</span>
        <span class="tag">联网搜索</span>
        <span class="tag">报告分析</span>
      </div>
    </div>
  </div>
</template>

<script>
// 逻辑层
</script>

<style scoped>
/* 样式层 - 暗色主题 */
.chat-window {
  width: 100%;
  margin-left: 230px;
  display: flex;
  background-color: #0d1117;
  min-height: 100vh;
}
.chat-message {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  max-width: 1000px;
  margin: 0 auto;
  padding-bottom: 90px;
  text-align: center;
}
.greeting-title {
  font-size: 28px;
  padding-top: 15px;
  color: #e6edf3;
  font-weight: 600;
  letter-spacing: 1px;
}
.greeting-span {
  padding-top: 15px;
  color: #8b949e;
  font-size: 15px;
  max-width: 500px;
  line-height: 1.6;
}
.feature-tags {
  display: flex;
  gap: 12px;
  margin-top: 30px;
}
.tag {
  padding: 8px 16px;
  border-radius: 20px;
  background: rgba(0, 212, 170, 0.1);
  border: 1px solid rgba(0, 212, 170, 0.3);
  color: #00d4aa;
  font-size: 13px;
}
</style>

<template>
  <!-- 消息界面 -->
  <div class="chat-window">
    <div class="chat-message" v-for="(item, index) in project.messageList" :key="index">
      <!-- 用户消息 -->
      <template v-if="item.role == 'user'">
        <div class="user-message">
          <p>{{ item.displayContent || item.content }}</p>
        </div>
        <!-- 展示文件 -->
        <div class="file-view" v-if="item.uploadFileList && item.uploadFileList.length > 0">
          <div class="file-item" v-for="(itema, indexa) in item.uploadFileList" :key="indexa">
            <div class="file-icon"><img :src="itema.fileType == 'PDF' ? pdfIcon : docxIcon" alt="" /></div>
            <div class="file-name">
              <span class="hidden-text hidden-text">{{ itema.fileName }}</span>
              <span>{{ itema.fileSize }}</span>
            </div>
          </div>
        </div>
        <!-- 展示图片 -->
        <div class="file-view" v-if="item.uploadImageList && Object.keys(item.uploadImageList).length > 0">
          <el-image :src="item.uploadImageList?.imageUrl" :preview-src-list="[item.uploadImageList?.imageUrl]" style="width: 15%; margin-left: auto">
          </el-image>
        </div>
      </template>
      <!-- 模型消息 -->
      <div class="ai-message" v-if="item.role == 'assistant'">
        <div class="ai-avatar">AI</div>
        <div class="ai-content">
          <el-collapse v-if="item.readFileData" :key="item.readFileData.statusInfo">
            <el-collapse-item :title="item.readFileData.promptInfo">
              <div v-for="(itemb, indexb) in item.readFileData.fileList" :key="indexb">{{ indexb + 1 + "." }}{{ itemb }}</div>
            </el-collapse-item>
          </el-collapse>
          <div v-html="marked(item.content)"></div>
          <!-- loading -->
          <div class="loading-circle" v-if="item.loadingCircle"></div>
        </div>
      </div>
    </div>
    <div style="height: 280px"></div>
  </div>
</template>

<script setup lang="ts">
// 逻辑层
// import { ref } from "vue";
import { projectStore } from "@/store/index";
const project = projectStore();
// 引入图标
import docxIcon from "@/assets/docx-icon.png";
import pdfIcon from "@/assets/pdf-icon.png";
import { marked } from "marked";
</script>

<style scoped>
/* 样式层 - 暗色主题 */
.chat-window {
  margin-left: 230px;
  width: 100%;
  background-color: #0d1117;
  min-height: 100vh;
}
.chat-message {
  display: flex;
  flex-direction: column;
  max-width: 1000px;
  margin: 0 auto;
  overflow: hidden;
  padding: 0 20px;
}
.user-message {
  margin-top: 20px;
  max-width: 70%;
  align-self: flex-end;
}
.user-message p {
  line-height: 1.6;
  background-color: rgba(0, 212, 170, 0.15);
  border: 1px solid rgba(0, 212, 170, 0.3);
  border-radius: 12px;
  color: #e6edf3;
  padding: 12px 16px;
  font-size: 14px;
}
.file-view {
  display: flex;
  align-items: center;
  align-self: flex-end;
  flex-flow: wrap;
  margin-top: 10px;
}
.file-item {
  display: inline-flex;
  border: 1px solid #30363d;
  padding: 8px;
  border-radius: 10px;
  align-self: flex-end;
  background-color: #161b22;
  max-width: 270px;
  margin-left: 5px;
  transition: all 0.2s ease;
}
.file-item:hover {
  border-color: #00d4aa;
}
.file-item img {
  width: 30px;
  height: 30px;
}
.file-icon {
  display: flex;
  align-self: center;
}
.file-name {
  display: flex;
  flex-direction: column;
  padding-left: 10px;
}
.file-name span:nth-child(1) {
  font-size: 14px;
  color: #c9d1d9;
}
.file-name span:nth-child(2) {
  font-size: 12px;
  color: #8b949e;
}
.ai-message {
  margin-top: 20px;
  display: flex;
  gap: 12px;
  align-items: flex-start;
}
.ai-avatar {
  width: 32px;
  height: 32px;
  border-radius: 8px;
  background: #00d4aa;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 12px;
  color: #0d1117;
  font-weight: bold;
  flex-shrink: 0;
}
.ai-content {
  background-color: #161b22;
  border: 1px solid #30363d;
  border-radius: 12px;
  padding: 16px;
  flex: 1;
  color: #c9d1d9;
  font-size: 14px;
  line-height: 1.7;
}
.ai-content >>> .el-collapse-item__header {
  color: #00d4aa;
  font-size: 14px;
  background: transparent;
  border-bottom: 1px solid #30363d;
}
.ai-content >>> .el-collapse-item__content {
  background-color: #0d1117;
  padding: 12px;
  border-radius: 8px;
  color: #c9d1d9;
}
.ai-content >>> .el-collapse {
  margin-bottom: 12px;
  border: none;
}
.ai-content >>> .el-collapse-item__wrap {
  background: transparent;
  border: none;
}
/* Markdown 内容样式 */
.ai-content :deep(h1),
.ai-content :deep(h2),
.ai-content :deep(h3) {
  color: #e6edf3;
  margin-top: 16px;
  margin-bottom: 8px;
}
.ai-content :deep(p) {
  color: #c9d1d9;
  margin-bottom: 8px;
}
.ai-content :deep(code) {
  background: #21262d;
  padding: 2px 6px;
  border-radius: 4px;
  color: #00d4aa;
  font-family: 'Courier New', monospace;
}
.ai-content :deep(pre) {
  background: #21262d;
  padding: 16px;
  border-radius: 8px;
  overflow-x: auto;
  border: 1px solid #30363d;
}
.ai-content :deep(ul),
.ai-content :deep(ol) {
  padding-left: 20px;
  color: #c9d1d9;
}
.ai-content :deep(li) {
  margin-bottom: 4px;
}
.ai-content :deep(a) {
  color: #00d4aa;
  text-decoration: none;
}
.ai-content :deep(a:hover) {
  text-decoration: underline;
}
.ai-content :deep(blockquote) {
  border-left: 3px solid #00d4aa;
  padding-left: 12px;
  margin-left: 0;
  color: #8b949e;
}
.loading-circle {
  width: 12px;
  height: 12px;
  background-color: #00d4aa;
  border-radius: 50%;
  margin: 10px 0 0 0;
  box-shadow: 0 0 10px rgba(0, 212, 170, 0.5);
  animation: pulse 2s ease-in-out infinite;
}
@keyframes pulse {
  0%,
  100% {
    transform: scale(1);
    opacity: 1;
  }
  50% {
    transform: scale(1.5);
    opacity: 0.7;
  }
}
</style>

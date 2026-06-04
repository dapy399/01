<template>
  <view class="chat-input">
    <!-- 快捷标签 -->
    <view class="quick-tags" v-if="pinia.chatWelcome">
      <text class="quick-tag" @click="setQuickMessage('知识库问答')">知识库问答</text>
      <text class="quick-tag" @click="setQuickMessage('联网搜索')">联网搜索</text>
      <text class="quick-tag" @click="setQuickMessage('上传报告/药品/CT')">上传报告/药品/CT</text>
    </view>
    <!-- 上传的文件列表 -->
    <scroll-view scroll-x enable-flex style="white-space: nowrap" enhanced :show-scrollbar="false" v-if="pinia.uploadFileItem.length > 0">
      <view class="file-item" v-for="(item, index) in pinia.uploadFileItem" :key="index">
        <view class="file-icon"><image :src="item.fileType == 'PDF' ? '/static/pdf-icon.png' : '/static/docx-icon.png'"></image></view>
        <view class="file-name">
          <text>{{ item.fileName }}</text>
          <text>{{ item.fileSize }}</text>
        </view>
        <image class="delete-file" src="/static/shanchu.png" @click="deleteFile(item.docId, index)"></image>
      </view>
    </scroll-view>
    <!-- 输入框 -->
    <view class="user-input">
      <textarea
        placeholder="任何健康问题都可以问我"
        placeholder-style="color: #6e7681;"
        maxlength="500"
        :auto-height="autoHeight"
        style="width: 100%; color: #e6edf3;"
        confirm-type="next"
        :show-confirm-bar="false"
        @linechange="lineChange"
        v-model="userMessage"
      ></textarea>
    </view>
    <!-- 按钮区域 -->
    <view class="action-button">
      <view @click="uploadFile" class="upload-btn">
        <image src="/static/select.png" mode="widthFix"></image>
      </view>
      <view class="kb-button">
        <button plain @click="queryKb" :class="{'kb-active': isKnowledgeBased}">知识库问答</button>
      </view>
      <view class="web-search-button">
        <button plain @click="toggleWebSearch" :class="{'search-active': pinia.isWebSearch}">
          {{ pinia.isWebSearch ? '联网搜索：开' : '联网搜索' }}
        </button>
      </view>
      <view>
        <button plain class="user-send" @click="sendMessage" v-if="!pinia.disabledStatus">
          <view class="send-arrow"></view>
        </button>
        <button plain class="user-send stop-btn" v-if="pinia.disabledStatus" @click="stopOutput">
          <view class="stop-square"></view>
        </button>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { reactive, ref } from "vue";
import { useFileUploader } from "@/api/useFileUploader";
import { UploadDialogApi, DeleteFileApi, SendMessageApi, StopOutputApi } from "@/api/request";
import { projectStore } from "@/store/index";
import { validators } from "@/utils/validators";
const pinia = projectStore();
import { onShow } from "@dcloudio/uni-app";
// 输入框自动增高
const autoHeight = ref(true);
// 输入框行数变化
const lineChange = (event: { detail: { lineCount: number } }) => {
  // console.log(event);
  autoHeight.value = event.detail.lineCount >= 4 ? false : true;
};
// 上传文件
const uploadFile = async () => {
  await useFileUploader({ page: "chatinput", uploadApi: UploadDialogApi });
};
// 删除指定文件
const deleteFile = async (docId: string, index: number) => {
  try {
    uni.showLoading({ title: "删除中" });
    await DeleteFileApi({ docId });
    uni.hideLoading();
    pinia.uploadFileItem.splice(index, 1);
  } catch (error) {
    uni.showToast({ title: "删除出错", icon: "none" });
  }
};
// 控制知识库选择
const isKnowledgeBased = ref(false);
// 点击知识库按钮
const queryKb = () => {
  isKnowledgeBased.value = !isKnowledgeBased.value;
};
// 切换联网搜索
const toggleWebSearch = () => {
  pinia.isWebSearch = !pinia.isWebSearch;
};
// 快捷标签点击
const setQuickMessage = (text: string) => {
  if (text === '知识库问答') {
    isKnowledgeBased.value = true;
    pinia.isWebSearch = false;
    userMessage.value = "";
  } else if (text === '联网搜索') {
    pinia.isWebSearch = true;
    isKnowledgeBased.value = false;
    userMessage.value = "帮我搜索一下";
  } else if (text === '上传报告/药品/CT') {
    pinia.isWebSearch = false;
    isKnowledgeBased.value = false;
    uploadFile();
  }
};
// 发送消息
const userMessage = ref("");
const sendMessage = () => {
  validators.isNotEmpty(userMessage.value, "请输入内容");
  pinia.messageList.push(
    {
      role: "user",
      content: userMessage.value.trim(),
      ...(pinia.uploadFileItem.length > 0 && { uploadFileList: pinia.uploadFileItem }),
      ...(pinia.uploadFileItem.length > 0 && { displayContent: userMessage.value.trim() }),
    },
    {
      role: "assistant",
      content: "",
      loadingCircle: true,
    }
  );
  console.log(pinia.messageList);

  // 禁用按钮
  pinia.disabledStatus = true;
  pinia.chatWelcome = false;
  // 如果是新建对话，需要把问题加入对话列表的第一项里
  if (pinia.sessionId == "null") {
    pinia.chatListData.unshift({ sessionId: pinia.sessionId, content: userMessage.value.trim() });
    pinia.sessionIndex = 0;
  }
  // 发送消息
  SendMessageApi({
    content: userMessage.value.trim(),
    sessionId: pinia.sessionId,
    uploadFileList: pinia.uploadFileItem,
    isKnowledgeBased: isKnowledgeBased.value,
    isWebSearch: pinia.isWebSearch,
  });
  // 清空输入框和临时文件还有首页的问一问
  userMessage.value = "";
  pinia.uploadFileItem = [];
  pinia.homeAsk = "null";
};
// 终止模型输出
const stopOutput = () => {
  console.log("终止");
  StopOutputApi({ sessionId: pinia.sessionId });
};
// 首页点击问一问触发
onShow(() => {
  console.log(pinia.homeAsk);
  if (pinia.homeAsk !== "null") {
    userMessage.value = pinia.homeAsk;
    sendMessage();
  }
});
</script>

<style scoped>
.chat-input {
  background-color: #161b22;
  border-top: 1px solid #30363d;
  position: fixed;
  left: 0;
  bottom: 0;
  right: 0;
  padding: 0 20rpx 40rpx 20rpx;
}
/* 快捷标签 */
.quick-tags {
  display: flex;
  flex-direction: row;
  gap: 16rpx;
  padding: 20rpx 0 10rpx 0;
}
.quick-tag {
  padding: 8rpx 16rpx;
  border-radius: 20rpx;
  background: rgba(0, 212, 170, 0.1);
  border: 1px solid rgba(0, 212, 170, 0.3);
  color: #00d4aa;
  font-size: 24rpx;
  transition: all 0.2s ease;
}
.quick-tag:active {
  background: rgba(0, 212, 170, 0.2);
  border-color: rgba(0, 212, 170, 0.5);
}
/* 文件列表 */
.file-item {
  display: inline-flex;
  border: 1rpx solid #30363d;
  background: #0d1117;
  padding: 7rpx 10rpx;
  border-radius: 10rpx;
  width: 270rpx;
  margin-right: 10rpx;
  position: relative;
  margin-top: 10rpx;
}
.file-icon image {
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
  overflow: hidden;
}
.file-name text:nth-child(1) {
  font-size: 25rpx;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  color: #c9d1d9;
}
.file-name text:nth-child(2) {
  font-size: 20rpx;
  color: #8b949e;
}
.delete-file {
  width: 27rpx;
  height: 27rpx;
  position: absolute;
  bottom: 3rpx;
  right: 5rpx;
}
/* 输入框 */
.user-input {
  padding: 20rpx 0;
}
.user-input textarea {
  color: #e6edf3;
  background: #0d1117;
  border-radius: 12rpx;
  padding: 16rpx;
  min-height: 80rpx;
}
/* 按钮区域 */
.action-button {
  display: flex;
  align-items: center;
}
.action-button image {
  width: 63rpx;
}
.upload-btn {
  display: flex;
  align-items: center;
}
button {
  padding: inherit !important;
  margin: inherit !important;
  line-height: inherit !important;
  border: none !important;
  background: none !important;
}
.kb-button button {
  padding: 10rpx 20rpx !important;
  color: #8b949e;
  background-color: rgba(139, 148, 158, 0.1) !important;
  font-size: 26rpx;
  border-radius: 50rpx;
  border: 1px solid rgba(139, 148, 158, 0.3) !important;
}
.kb-button button.kb-active {
  color: #00d4aa;
  background-color: rgba(0, 212, 170, 0.1) !important;
  border: 1px solid rgba(0, 212, 170, 0.3) !important;
}
/* 联网搜索按钮 */
.web-search-button button {
  padding: 10rpx 20rpx !important;
  color: #8b949e;
  background-color: rgba(139, 148, 158, 0.1) !important;
  font-size: 24rpx;
  border-radius: 50rpx;
  border: 1px solid rgba(139, 148, 158, 0.3) !important;
}
.web-search-button button.search-active {
  color: #00d4aa;
  background-color: rgba(0, 212, 170, 0.1) !important;
  border: 1px solid rgba(0, 212, 170, 0.3) !important;
}
/* 自定义边框 */
.kb-button wx-button:after {
  border: none !important;
}
.user-send {
  width: 63rpx;
  height: 63rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #00d4aa, #00b894) !important;
  border-radius: 50% !important;
  box-shadow: 0 4rpx 16rpx rgba(0, 212, 170, 0.4);
}
.user-send:active {
  transform: scale(0.92);
  box-shadow: 0 2rpx 8rpx rgba(0, 212, 170, 0.3);
}
/* 发送箭头 - 用CSS画白色三角形 */
.send-arrow {
  width: 0;
  height: 0;
  border-top: 14rpx solid transparent;
  border-bottom: 14rpx solid transparent;
  border-left: 22rpx solid #ffffff;
  margin-left: 6rpx;
}
/* 停止按钮 - 红色背景 */
.stop-btn {
  background: linear-gradient(135deg, #ff6b6b, #ee5a5a) !important;
  box-shadow: 0 4rpx 16rpx rgba(255, 107, 107, 0.4);
}
.stop-btn:active {
  box-shadow: 0 2rpx 8rpx rgba(255, 107, 107, 0.3);
}
/* 停止方块 */
.stop-square {
  width: 20rpx;
  height: 20rpx;
  background: #ffffff;
  border-radius: 4rpx;
}
.kb-button {
  display: flex;
  padding: 0 8rpx;
}
.web-search-button {
  display: flex;
  padding: 0 8rpx;
}
</style>

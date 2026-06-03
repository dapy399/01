<template>
  <view class="chat-input">
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
        placeholder="请输入内容..."
        maxlength="500"
        :auto-height="autoHeight"
        style="width: 100%"
        confirm-type="next"
        :show-confirm-bar="false"
        @linechange="lineChange"
        v-model="userMessage"
        placeholder-class="input-placeholder"
      ></textarea>
    </view>
    <!-- 功能按钮栏 -->
    <view class="action-bar">
      <!-- 左侧功能按钮 -->
      <view class="action-left">
        <!-- 上传文件 -->
        <view class="action-icon-btn" @click="uploadFile">
          <image src="/static/select.png" mode="widthFix"></image>
        </view>
        <!-- 知识库按钮 -->
        <view class="toggle-btn" :class="{ active: isKnowledgeBased }" @click="toggleKnowledge">
          <text>知识库</text>
        </view>
        <!-- 联网搜索按钮 -->
        <view class="toggle-btn web-search-btn" :class="{ active: pinia.isWebSearch }" @click="toggleWebSearch">
          <text>联网搜索</text>
        </view>
      </view>
      <!-- 发送按钮 -->
      <view class="send-btn-wrap">
        <button plain class="send-btn" @click="sendMessage" v-if="!pinia.disabledStatus">
          <image src="/static/send-icon.png" mode="widthFix"></image>
        </button>
        <button plain class="send-btn stop-btn" v-if="pinia.disabledStatus" @click="stopOutput">
          <image src="/static/stop-icon.png" mode="widthFix"></image>
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

// 知识库切换
const isKnowledgeBased = ref(false);
const toggleKnowledge = () => {
  isKnowledgeBased.value = !isKnowledgeBased.value;
  pinia.isKnowledgeBased = isKnowledgeBased.value;
};

// 联网搜索切换（与store同步）
const toggleWebSearch = () => {
  pinia.isWebSearch = !pinia.isWebSearch;
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

  // 禁用按钮
  pinia.disabledStatus = true;
  pinia.chatWelcome = false;
  // 如果是新建对话，需要把问题加入对话列表的第一项里
  if (pinia.sessionId == "null") {
    pinia.chatListData.unshift({ sessionId: pinia.sessionId, content: userMessage.value.trim() });
    pinia.sessionIndex = 0;
  }
  // 发送消息（带上联网搜索参数）
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
  position: fixed;
  left: 0;
  bottom: 0;
  right: 0;
  padding: 0 24rpx 30rpx 24rpx;
  border-top: 1rpx solid #30363d;
}

/* 文件列表 */
.file-item {
  display: inline-flex;
  border: 1rpx solid #30363d;
  padding: 7rpx 10rpx;
  border-radius: 10rpx;
  width: 270rpx;
  margin-right: 10rpx;
  position: relative;
  margin-top: 10rpx;
  background-color: #21262d;
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
  color: #c9d1d9;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
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
  padding: 24rpx 0;
}
.user-input textarea {
  background-color: #21262d !important;
  border: 1rpx solid #30363d !important;
  border-radius: 16rpx !important;
  padding: 20rpx 24rpx !important;
  color: #e6edf3 !important;
  font-size: 30rpx !important;
  line-height: 1.6 !important;
}
:deep(.input-placeholder) {
  color: #8b949e !important;
}

/* 功能按钮栏 */
.action-bar {
  display: flex;
  align-items: center;
  justify-content: space-between;
}
.action-left {
  display: flex;
  align-items: center;
  gap: 16rpx;
  flex: 1;
}
.action-icon-btn image {
  width: 56rpx;
  height: 56rpx;
}
.toggle-btn {
  display: flex;
  align-items: center;
  padding: 10rpx 20rpx;
  border-radius: 50rpx;
  font-size: 24rpx;
  border: 1rpx solid #30363d;
  background-color: #21262d;
  color: #8b949e;
  transition: all 0.2s ease;
}
.toggle-btn.active {
  background-color: rgba(0, 212, 170, 0.15);
  border-color: #00d4aa;
  color: #00d4aa;
}
.send-btn-wrap {
  flex-shrink: 0;
}
.send-btn image,
.stop-btn image {
  width: 63rpx;
  height: 63rpx;
}

/* 全局按钮样式重置 */
button {
  padding: inherit !important;
  margin: inherit !important;
  line-height: inherit !important;
  border: none !important;
  background: none !important;
}
</style>

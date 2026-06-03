<template>
  <!-- 底部输入框 -->
  <div class="chat-input">
    <div class="chat-input-flex">
      <div class="function-select" v-if="uploadFileItem.length <= 0 && uploadImageItem.length <= 0">
        <!-- 查询知识库的按钮 -->
        <el-button class="query-kb-button" @click="queryKb" v-if="uploadFileItem.length <= 0">
          <div class="query-kb">
            <img src="../assets/zhishiku.png" alt="" />
            <span>知识库问答</span>
          </div>
        </el-button>
        <!-- 联网搜索按钮 -->
        <el-button class="query-kb-button web-search-button" @click="toggleWebSearch">
          <div class="query-kb">
            <img src="../assets/zhishiku.png" alt="" />
            <span>{{ project.isWebSearch ? '联网搜索：已开启' : '联网搜索' }}</span>
          </div>
        </el-button>
        <!-- 图片上传 -->
        <el-button class="query-kb-button check-report-button">
          <input type="file" multiple :accept="uploadImageType" style="display: none" @change="handleImageChange" ref="imageInputRef" />
          <el-tooltip content="上传不超过一张10MB的JPG/PNG/JPEG/WEBP的图片" effect="customized" placement="top">
            <div class="query-kb" @click="triggerImageInput">
              <img src="../assets/baogaodan.png" alt="" />
              <span>上传报告单/药品/CT</span>
            </div>
          </el-tooltip>
        </el-button>
      </div>
      <!-- 文件上传的列表 -->
      <div class="upload-file-list" v-if="uploadFileItem.length > 0">
        <div class="upload-file-item" v-for="(item, index) in uploadFileItem" :key="index">
          <img :src="item.fileType == 'PDF' ? pdfIcon : docxIcon" alt="" />
          <div>
            <span class="hidden-text">{{ item.fileName }}</span>
            <span>{{ item.fileSize }}</span>
          </div>
          <el-icon :size="11" class="delete-file" @click="deleteFile(item.docId, index)"><CloseBold /></el-icon>
        </div>
      </div>
      <!-- 上传的图片展示 -->
      <div class="upload-file-list" v-if="uploadImageItem.length > 0">
        <div class="upload-image-item" v-for="(item, index) in uploadImageItem" :key="index">
          <img :src="item.imageUrl" alt="" />
          <el-icon :size="11" class="delete-image" @click="deleteImage(item.imagePath)"><CloseBold /></el-icon>
        </div>
      </div>
      <!-- 输入框 -->
      <div class="chat-input-content">
        <input
          type="file"
          multiple
          :accept="uploadFileType"
          style="display: none"
          @change="handleFileChange"
          ref="fileInputRef"
          :disabled="uploadImageItem.length > 0"
        />
        <el-tooltip
          :content="uploadImageItem.length > 0 ? '已存在图片,请先删除图片才可以上传文档' : '每次最多上传3个文件(每个5MB),仅支持PDF,DOCX文件类型'"
          effect="customized"
          placement="top"
        >
          <div class="upload-icon">
            <img src="../assets//upload-icon.png" alt="" @click="triggerFileInput" />
          </div>
        </el-tooltip>
        <el-input
          v-model="userMessage"
          type="textarea"
          placeholder="任何健康问题都可以问我,Shift + Enter可换行"
          :autosize="{ minRows: 1, maxRows: 4 }"
          resize="none"
          @keydown="handleKeyDown"
        />
        <el-button v-if="!project.disabledStatus" class="send-btn">
          <img src="../assets//send-icon.png" alt="" class="send-icon" @click="sendMessage" />
        </el-button>
        <el-button v-if="project.disabledStatus" class="stop-btn">
          <img src="../assets/stop-icon.png" alt="" class="send-icon" @click="stopOutput" />
        </el-button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
// 逻辑层
import { CloseBold } from "@element-plus/icons-vue";
import { reactive, ref } from "vue";
// 文件上传的类型
const uploadFileType = "application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document";
// 图片上传的类型
const uploadImageType = "image/jpg,image/jpeg,image/png,image/webp";

// 输入的内容
const userMessage = ref("");
//#region
// 键盘事件
const handleKeyDown = (event: KeyboardEvent) => {
  // 阻止换行
  if (event.key === "Enter" && !event.shiftKey) {
    event.preventDefault();
    sendMessage();
  }
};
const queryKbStyle = reactive({
  border: "#30363d",
  backgroundColor: "#161b22",
  color: "#8b949e",
});
const webSearchStyle = reactive({
  border: "#30363d",
  backgroundColor: "#161b22",
  color: "#8b949e",
});
// 点击知识库按钮
const queryKb = () => {
  project.isKnowledgeBased = !project.isKnowledgeBased;
  if (project.isKnowledgeBased) {
    // 选中
    queryKbStyle.backgroundColor = "rgba(0, 212, 170, 0.15)";
    queryKbStyle.border = "#00d4aa";
    queryKbStyle.color = "#00d4aa";
  } else {
    queryKbStyle.backgroundColor = "#161b22";
    queryKbStyle.border = "#30363d";
    queryKbStyle.color = "#8b949e";
  }
};
// 切换联网搜索
const toggleWebSearch = () => {
  project.isWebSearch = !project.isWebSearch;
  if (project.isWebSearch) {
    webSearchStyle.backgroundColor = "rgba(0, 212, 170, 0.15)";
    webSearchStyle.border = "#00d4aa";
    webSearchStyle.color = "#00d4aa";
  } else {
    webSearchStyle.backgroundColor = "#161b22";
    webSearchStyle.border = "#30363d";
    webSearchStyle.color = "#8b949e";
  }
};
//#endregion
// 文件上传
import { UploadDialogApi, DeleteFileApi, SendMessageApi, StopOutputApi, UploadImageApi, DeleteIamgeApi } from "@/api/request";
import { useFileUploader, useImageUploader } from "@/api/useFileUploader";
const { uploadFileItem, fileInputRef, triggerFileInput, handleFileChange } = useFileUploader({ page: "chatinput", uploadApi: UploadDialogApi });
import { validators } from "@/utils/validators";
// 图片上传的逻辑
const { uploadImageItem, imageInputRef, triggerImageInput, handleImageChange } = useImageUploader({ uploadApi: UploadImageApi });
// 引入图标
import docxIcon from "@/assets/docx-icon.png";
import pdfIcon from "@/assets/pdf-icon.png";
import { projectStore } from "@/store/index";
const project = projectStore();
// 删除文件
const deleteFile = async (docId: string, index: number) => {
  // loading加载提示
  const loading = ElLoading.service({
    lock: true,
    text: "删除中...",
    background: "rgba(13, 17, 23, 0.9)",
  });
  try {
    await DeleteFileApi({ docId });
    loading.close();
    uploadFileItem.value.splice(index, 1);
  } catch (error) {
    loading.close();
  }
};
// 删除图片
const deleteImage = async (imagePath: string) => {
  // loading加载提示
  const loading = ElLoading.service({
    lock: true,
    text: "删除中...",
    background: "rgba(13, 17, 23, 0.9)",
  });
  try {
    await DeleteIamgeApi({ imagePath });
    loading.close();
    uploadImageItem.value = [];
  } catch (error) {
    loading.close();
  }
};
// 发送消息
const sendMessage = () => {
  // 校验
  validators.isNotEmpty(userMessage.value, "请输入内容");
  project.messageList.push(
    {
      role: "user",
      content: userMessage.value.trim(),
      ...(uploadFileItem.value.length > 0 && { uploadFileList: uploadFileItem.value }),
      ...(uploadFileItem.value.length > 0 && { displayContent: userMessage.value.trim() }),
      ...(uploadImageItem.value.length > 0 && { uploadImageList: uploadImageItem.value[0] }),
    },
    {
      role: "assistant",
      content: "",
      loadingCircle: true,
    }
  );
  project.disabledStatus = true;
  project.chatWelcome = false;
  // 如果是新建对话，需要把问题加入对话列表的第一项里
  if (project.sessionId == "null") {
    project.chatListData.unshift({ sessionId: project.sessionId, content: userMessage.value.trim() });
    project.getSessIonIndex(0);
  }
  window.scrollTo({
    top: document.body.scrollHeight,
    behavior: "smooth", // 可选：平滑滚动
  });
  SendMessageApi({
    content: userMessage.value.trim(),
    sessionId: project.sessionId,
    uploadFileList: uploadFileItem.value,
    isKnowledgeBased: project.isKnowledgeBased,
    isWebSearch: project.isWebSearch,
    uploadImageList: uploadImageItem.value[0],
  });
  // 清空输入框和临时文件和图片
  userMessage.value = "";
  uploadFileItem.value = [];
  uploadImageItem.value = [];
};
// 终止模型输出
const stopOutput = () => {
  StopOutputApi({ sessionId: project.sessionId });
};
</script>

<style scoped>
/* 样式层 - 暗色主题 */
.chat-input {
  background: transparent;
  position: fixed;
  left: 230px;
  bottom: 0;
  right: 0;
  padding: 0 40px 30px 40px;
  z-index: 100;
}
.chat-input-flex {
  display: flex;
  flex-direction: column;
  max-width: 968px;
  margin: 0 auto;
  background: rgba(22, 27, 34, 0.85);
  backdrop-filter: blur(20px);
  border: 1px solid #30363d;
  padding: 16px 20px;
  border-radius: 16px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.4);
  overflow: hidden;
}
/* 功能选择按钮 */
.function-select {
  display: flex;
  align-items: center;
  margin-bottom: 12px;
  gap: 8px;
}
.query-kb-button {
  width: fit-content;
  padding: initial;
  height: auto;
  border: 1px solid v-bind("queryKbStyle.border");
  border-radius: 20px;
  background-color: v-bind("queryKbStyle.backgroundColor");
  transition: all 0.2s ease;
}
.query-kb-button:hover {
  border-color: #00d4aa;
}
/* 检查报告 */
.check-report-button {
  border: 1px solid #30363d;
  background-color: #161b22;
}
.check-report-button:hover {
  border-color: #00d4aa;
}
/* 联网搜索按钮 */
.web-search-button {
  border: 1px solid v-bind("webSearchStyle.border");
  background-color: v-bind("webSearchStyle.backgroundColor");
}
.web-search-button span {
  color: v-bind("webSearchStyle.color");
}
.query-kb {
  display: flex;
  align-items: center;
  padding: 7px;
}
.query-kb span {
  font-size: 13px;
  padding-left: 6px;
  color: v-bind("queryKbStyle.color");
}
.query-kb img {
  width: 15px;
  height: 15px;
  filter: brightness(0.8);
}
.upload-file-list {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  padding-bottom: 12px;
  gap: 8px;
}
.upload-file-item img {
  width: 30px;
  height: 30px;
  margin-right: 5px;
}
.upload-file-item {
  display: inline-flex;
  align-items: center;
  border: 1px solid #30363d;
  border-radius: 10px;
  max-width: 200px;
  padding: 6px 8px;
  position: relative;
  background: #0d1117;
}
.upload-file-item:hover {
  border-color: #00d4aa;
}
.delete-file {
  position: absolute;
  bottom: 2px;
  right: 4px;
  color: #8b949e;
  cursor: pointer;
}
.delete-file:hover {
  color: #f85149;
}
.upload-file-item span:nth-child(1) {
  font-size: 13px;
  color: #c9d1d9;
}
.upload-file-item span:nth-child(2) {
  font-size: 11px;
  color: #8b949e;
}
.chat-input-content {
  display: flex;
  align-items: flex-end;
  gap: 12px;
}
.upload-icon {
  width: 34px;
  height: 34px;
  display: flex;
  align-items: center;
  cursor: pointer;
  flex-shrink: 0;
}
.upload-icon img {
  width: 20px;
  height: 20px;
  filter: brightness(0.7);
  transition: filter 0.2s;
}
.upload-icon:hover img {
  filter: brightness(1);
}
/* 强制更改input样式 */
.chat-input-content >>> .el-textarea__inner:focus {
  box-shadow: none;
  border: none;
}
.chat-input-content >>> .el-textarea__inner {
  box-shadow: none;
  background: transparent;
  font-size: 14px;
  color: #e6edf3;
  resize: none;
}
.chat-input-content >>> .el-textarea__inner::placeholder {
  color: #8b949e;
}
.send-icon {
  width: 28px;
  height: auto;
}
.send-btn,
.stop-btn {
  width: 36px;
  height: 36px;
  border-radius: 8px;
  margin-left: 8px;
  background: #00d4aa;
  border: none;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  padding: 0;
  transition: all 0.2s ease;
}
.send-btn:hover {
  background: #00b894;
  transform: scale(1.05);
}
.stop-btn {
  background: #f85149;
}
.stop-btn:hover {
  background: #da3633;
  transform: scale(1.05);
}
.chat-input-content >>> .el-button {
  padding: 0;
}
/* 上传图片的样式 */
.upload-image-item {
  width: 50px;
  height: 50px;
  position: relative;
  border: 1px solid #30363d;
  border-radius: 10px;
  overflow: hidden;
  padding: 3px;
  background: #0d1117;
}
.upload-image-item img {
  width: 50px;
  height: 50px;
  object-fit: cover;
}
.delete-image {
  position: absolute;
  right: 3px;
  top: 3px;
  color: #8b949e;
  cursor: pointer;
  background: rgba(13, 17, 23, 0.8);
  border-radius: 50%;
}
.delete-image:hover {
  color: #f85149;
}
</style>

<template>
  <!-- 左侧边栏：消息列表 -->
  <div class="chat-history-view">
    <div class="new-dialog">
      <el-button class="new-chat-btn" :icon="Plus" :disabled="project.disabledStatus" @click="createSession">新建对话</el-button>
    </div>
    <div style="height: 80px"></div>
    <div
      class="dialog-list"
      v-for="(item, index) in project.chatListData"
      :key="index"
      @click="handleSessionClick(index, item.sessionId)"
      :class="{ active: index === project.sessionIndex }"
    >
      <div class="dialog-list-item hidden-text">{{ item.content }}</div>
      <el-icon class="delete-icon" @click.stop="delteChat(item.sessionId, item.content, index)"><CloseBold /></el-icon>
    </div>
    <div style="height: 120px"></div>
    <!-- 个人信息 -->
    <div class="user-profile">
      <div class="avatar-username" v-if="project.userInfo">
        <img :src="project.userInfo.avatar" alt="" />
        <span>{{ project.userInfo.phoneNumber }}</span>
      </div>
      <el-button v-else class="login-btn" size="default" @click="project.showLoginPopup = true">登录</el-button>
      <el-button class="kb-btn" size="default" v-if="project.userInfo" @click="project.knowledgePopup = true">知识库管理</el-button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { Plus, CloseBold } from "@element-plus/icons-vue";
import { projectStore } from "@/store/index";
const project = projectStore();
import { GetChatListApi, DeleteChatApi } from "@/api/request";
import { onMounted } from "vue";
import { getItemChat } from "@/api/getItemChat";
import { showValidateMessage } from "@/utils/validateMessage";
// 逻辑层
onMounted(async () => {
  const res = await GetChatListApi();
  console.log(res);
  project.chatListData = res.data;
  // 获取当前对话下的数据
  if (project.sessionId !== "null") {
    await getItemChat(project.sessionIndex, project.sessionId);
  }
});
// 点击每个会话
const handleSessionClick = async (index: number, sessionId: string) => {
  if (project.disabledStatus) return false;
  await getItemChat(index, sessionId);
};
// 新建对话
const createSession = () => {
  project.chatWelcome = true;
  project.getSessIonIndex(-1);
  project.getSessionId("null");
  project.messageList = [];
};
// 删除会话
const delteChat = (sessionId: string, content: string, index: number) => {
  console.log("会话id----" + sessionId);
  ElMessageBox.confirm(`删除：${content}`, "删除对话后不可恢复", {
    confirmButtonText: "确定",
    cancelButtonText: "取消",
    type: "warning",
  })
    .then(async () => {
      console.log("删除");
      try {
        await DeleteChatApi({ sessionId });
        project.chatListData.splice(index, 1);
        showValidateMessage("删除成功", "success", "no");
        createSession();
      } catch (error) {
        console.log(error);
        showValidateMessage("删除失败", "warning");
      }
    })
    .catch(() => {
      console.log("取消");
    });
};
</script>

<style scoped>
/* 样式层 - 暗色主题 */
.chat-history-view {
  background-color: #161b22;
  width: 230px;
  position: fixed;
  left: 0;
  top: 0;
  bottom: 0;
  overflow-y: auto;
  border-right: 1px solid #30363d;
}
.new-dialog {
  position: fixed;
  top: 0;
  left: 0;
  width: 230px;
  height: 80px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #161b22;
  border-bottom: 1px solid #30363d;
}
.new-chat-btn {
  background: #00d4aa;
  border: none;
  color: #0d1117;
  font-weight: 600;
  border-radius: 8px;
  width: 85%;
}
.new-chat-btn:hover {
  background: #00b894;
}
.dialog-list {
  margin: 8px 10px;
  padding: 10px;
  border-radius: 8px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  color: #8b949e;
  font-size: 13px;
  transition: all 0.2s ease;
}
.dialog-list:hover {
  background-color: #21262d;
  cursor: v-bind("project.disabledStatus ? 'not-allowed' : 'pointer'");
  color: #c9d1d9;
}
.dialog-list.active {
  background-color: rgba(0, 212, 170, 0.15);
  border: 1px solid rgba(0, 212, 170, 0.3);
  color: #00d4aa;
}
.dialog-list:hover .dialog-list-item {
  color: #c9d1d9;
}
.dialog-list.active .dialog-list-item {
  color: #00d4aa;
}
.delete-icon {
  display: none;
  color: #8b949e;
}
.dialog-list:hover .delete-icon {
  display: block !important;
}
.dialog-list:hover .delete-icon:hover {
  color: #f85149;
}
.dialog-list-item {
  margin-right: 5px;
}
.user-profile {
  position: fixed;
  bottom: 0;
  left: 0;
  width: 230px;
  height: 120px;
  background-color: #161b22;
  border-top: 1px solid #30363d;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}
.avatar-username {
  display: flex;
  align-items: center;
  padding-bottom: 12px;
}
.avatar-username img {
  width: 30px;
  height: 30px;
  object-fit: cover;
  border-radius: 50%;
  margin-right: 7px;
}
.avatar-username span {
  color: #c9d1d9;
  font-size: 14px;
}
.login-btn {
  background: #21262d;
  border: 1px solid #30363d;
  color: #00d4aa;
  margin-bottom: 8px;
}
.login-btn:hover {
  background: #30363d;
  border-color: #00d4aa;
}
.kb-btn {
  background: #21262d;
  border: 1px solid #30363d;
  color: #8b949e;
}
.kb-btn:hover {
  background: #30363d;
  border-color: #00d4aa;
  color: #00d4aa;
}
</style>

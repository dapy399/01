import { defineStore } from "pinia";
import type { UserInfoResType, MessageListType, GetChatListType, KbFileListType } from "@/types/index";
export const projectStore = defineStore("app", {
  state: () => ({
    // 临时储存，暂存状态，刷新小程序就会丢失
    userInfo: null as UserInfoResType | null, // 用户信息
    showLoginPopup: false, // 登录弹窗
    knowledgePopup: false, // 知识库弹窗展示
    sessionId: "null", // 会话id
    sessionIndex: -1, // 会话下标
    messageList: [] as MessageListType[], // 用户和模型的对话列表
    disabledStatus: false, // 发送消息时禁止点击其他按钮
    chatListData: [] as GetChatListType[], // 对话列表数据
    chatWelcome: true, // 新建对话展示的界面
    loginLoading: false, // 登录时出现的login
    switchChat: false, // 对话和对话历史切换
    uploadFileItem: [] as KbFileListType, // 对话框临时上传的文件
    kbUploadFileItem: [] as KbFileListType, // 知识库上传的文件
    homeAsk: "null", // 点击首页的问一问触发
    isKnowledgeBased: false, // 是否基于知识库回答
    isWebSearch: false, // 是否开启联网搜索（与web端对齐）
  }),
  actions: {
    // 登录之后获取用户信息
    userLogin(userInfo: UserInfoResType) {
      this.userInfo = userInfo;
      uni.setStorageSync("userInfo", JSON.stringify(userInfo));
    },
    // 模型返回的会话id需要本地缓存
    getSessionId(sessionId: string) {
      this.sessionId = sessionId;
      uni.setStorageSync("sessionId", sessionId);
    },
    // 选择会话，存储会话下标
    getSessionIndex(sessionIndex: number) {
      this.sessionIndex = sessionIndex;
      uni.setStorageSync("sessionIndex", JSON.stringify(sessionIndex));
    },
    // 页面刷新后初始化
    initUserFromStorage() {
      // 用户信息
      const userInfo = uni.getStorageSync("userInfo");
      // 会话id
      const sessionId = uni.getStorageSync("sessionId");
      // 会话下标
      const sessionIndex = uni.getStorageSync("sessionIndex");
      if (userInfo) {
        this.userInfo = JSON.parse(userInfo);
        this.sessionId = sessionId || "null";
        this.sessionIndex = sessionIndex ? Number(sessionIndex) : -1;
      }
      // 如果没有会话id，展示新建对话界面
      if (!this.sessionId || this.sessionId == "null") {
        this.chatWelcome = true;
      } else {
        this.chatWelcome = false;
      }
    },
  },
});

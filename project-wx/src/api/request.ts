const requestUrl = "http://121.43.149.193/api";
import { projectStore } from "@/store/index";
const project = projectStore();
import type {
  UserRegisterType,
  UserLoginType,
  ApiResponse,
  UserInfoResType,
  KbFileListType,
  SendMessageType,
  AiMessageType,
  GetChatListType,
  MessageListType,
  WxAppHomeType,
} from "@/types/index";
import { TextDecoder } from "text-encoding-shim";

// http请求
const request = <T>(url: string, method: "GET" | "POST", data?: any): Promise<T> => {
  return new Promise((resolve, reject) => {
    uni.request({
      url: requestUrl + url,
      method,
      data,
      header: { Authorization: "Bearer " + project.userInfo?.token || "" },
      success: (res) => {
        const status = res.statusCode;
        // 取消登录注册时出现的loading
        project.loginLoading = false;
        switch (status) {
          case 200:
            resolve(res.data as T);
            break;
          case 404:
            console.error("404异常");
            reject("404");
            break;
          case 401:
            console.error("401没有访问权限");
            reject("401");
            uni.navigateTo({ url: "/pages/userlogin/userlogin" });
            break;
          case 500:
          case 501:
          case 502:
          case 503:
            console.log(res.data);
            uni.showToast({
              icon: "none",
              title: "出现异常",
            });
            reject("出现异常");
            break;
          case 400:
            console.error(res);
            reject("400");
            break;
          case 422:
            console.error(res.data);
            uni.showToast({
              icon: "none",
              title: "参数不对",
            });
            reject("422");
            break;
        }
      },
      fail: (err: any) => {
        console.log(err);
        uni.showToast({
          icon: "none",
          title: "出现异常",
        });
        // 取消登录注册时出现的loading
        project.loginLoading = false;
      },
    });
  });
};

// 对话接口，流式输�?
const status = [500, 501, 502, 503, 504];
export const SendMessageApi = (data: SendMessageType) => {
  const requestTask = uni.request({
    url: requestUrl + "/chat/sendmessage",
    method: "POST",
    data: data,
    enableChunked: true,
    header: { Authorization: "Bearer " + project.userInfo?.token || "" },
    complete: (data: any) => {
      console.log(data);
      console.log("大模型回复完�?);
      aiMessageObj.loadingCircle = false;
      project.disabledStatus = false;
      if (data.statusCode == 401) {
        uni.navigateTo({ url: "/pages/userlogin/userlogin" });
      } else if (data.statusCode == 400) {
        uni.showToast({ icon: "none", title: "缺少必传参数" });
      } else if (status.includes(data.statusCode)) {
        uni.showToast({ icon: "none", title: "出现异常" });
      }
    },
  });
  const aiMessageObj = project.messageList[project.messageList.length - 1];
  (requestTask as any).onChunkReceived((response: { data: Uint8Array }) => {
    const chunk = new TextDecoder("utf-8").decode(new Uint8Array(response.data));
    let parts = chunk.split("###ABC###");
    for (const part of parts) {
      if (part.trim() === "") continue;
      const aiMessage = JSON.parse(part) as AiMessageType;
      console.log(aiMessage);
      // 取会话id
      if (aiMessage.role === "sessionId") {
        project.sessionId = aiMessage.content;
        project.chatListData[0].sessionId = aiMessage.content;
      }
      // 取文档或知识库的提示
      if (aiMessage.type) {
        aiMessageObj.readFileData = aiMessage;
      }
      // 取模型回复的数据
      if (aiMessage.role === "assistant") {
        aiMessageObj.loadingCircle = false;
        if (aiMessage.content && aiMessage.content.trim() !== "") {
          aiMessageObj.content += aiMessage.content;
        }
      }
      // 模型回复出错
      if (aiMessage.role === "error") {
        aiMessageObj.content = "服务器繁�?请稍后再�?;
      }
    }
  });
};

// 注册接口
export const UserRegisterApi = (params: UserRegisterType): Promise<ApiResponse<[]>> => {
  return request("/userinfo/registeruser", "POST", params);
};
// 登录接口
export const UserLoginApi = (params: UserLoginType): Promise<ApiResponse<UserInfoResType>> => {
  return request("/userinfo/loginuser", "POST", params);
};
// 获取对话列表数据
export const GetChatListApi = (): Promise<ApiResponse<GetChatListType[]>> => {
  return request("/chat/getchatlist", "GET");
};
// 获取某个会话的对话数�?
export const SingleChatDataApi = (params: { sessionId: string }): Promise<ApiResponse<MessageListType[]>> => {
  return request("/chat/singlechatdata", "GET", params);
};
// 对话框文件上�?
export const UploadDialogApi = requestUrl + "/fileanagement/uploaddialog";
// 知识库文件上�?
export const UploadkbApi = requestUrl + "/fileanagement/uploadkb";
// 对话框删除指定文�?
export const DeleteFileApi = (params: { docId: string }): Promise<ApiResponse<[]>> => {
  return request("/fileanagement/deletefile", "POST", params);
};
// 终止模型输出
export const StopOutputApi = (params: { sessionId: string }): Promise<ApiResponse<[]>> => {
  return request("/chat/stopoutput", "GET", params);
};
// 获取知识库文件列�?
export const KbFileListApi = (): Promise<ApiResponse<KbFileListType>> => {
  return request("/fileanagement/kbfilelist", "GET");
};
// 获取首页数据
export const WxAppHomeApi = (): Promise<ApiResponse<WxAppHomeType>> => {
  return request("/wxapp/wxfrontpagedata", "GET");
};

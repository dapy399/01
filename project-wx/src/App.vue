<script setup lang="ts">
import { onLaunch } from "@dcloudio/uni-app";
import { projectStore } from "@/store/index";
onLaunch(() => {
  // 获取胶囊按钮的位置
  const buttonPosition = uni.getStorageSync("buttonPosition");
  if (!buttonPosition) {
    const res = uni.getMenuButtonBoundingClientRect();
    console.log(res);
    uni.setStorageSync("buttonPosition", res);
  }
  // 初始化获取用户数据
  projectStore().initUserFromStorage();
});
</script>
<style>
/* 全局暗色主题 */
page {
  background-color: #0d1117;
  color: #e6edf3;
}
view,
text,
image {
  display: block;
  box-sizing: border-box;
}
.text-show {
  display: -webkit-box;
  text-overflow: ellipsis;
  overflow: hidden;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
}
/* 暗色滚动条 */
::-webkit-scrollbar {
  display: none;
}
/* 暗色输入框 */
input,
textarea {
  background-color: #21262d !important;
  color: #e6edf3 !important;
}
/* 暗色toast */
uni-toast .uni-toast {
  background-color: #21262d !important;
  color: #e6edf3 !important;
}
/* 强制 towxml / rich-text 文字颜色 - 覆盖 markdown 渲染默认色 */
towxml,
.towxml,
rich-text,
.ai-markdown rich-text {
  color: #e6edf3 !important;
}
/* towxml 内部所有文本元素 */
towxml text,
towxml view,
.towxml text,
.towxml view,
.ai-markdown text,
.ai-markdown view {
  color: #e6edf3 !important;
}
</style>

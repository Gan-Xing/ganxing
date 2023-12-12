import { components } from "./getItems";

/**
 * 注册所有定义的自定义元素。
 * 此函数将遍历 `components` 数组中的所有组件，并将它们注册为自定义元素。
 * 该函数只在浏览器环境中执行，以确保自定义元素的注册只发生在客户端。
 */
export const GXUI = () => {
  if (typeof window !== "undefined") {
    // 检查是否在浏览器环境中
    components.forEach(({ tagName, element }) => {
      // 遍历所有组件
      if (element && !customElements.get(tagName)) {
        // 如果组件尚未注册
        customElements.define(tagName, element); // 注册组件为自定义元素
      }
    });
  }
};

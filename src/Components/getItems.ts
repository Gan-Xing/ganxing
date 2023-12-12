/**
 * 定义组件模块接口，用于表示导入的组件模块。
 */
interface ComponentModule {
  default: typeof HTMLElement; // 默认导出应是 HTMLElement 的类型
}

/**
 * 从 ".\/GX*\/index.ts" 路径动态导入所有组件模块。
 * 使用 `import.meta.globEager` 方法立即并同步地导入匹配的模块。
 */
const componentFiles = import.meta.globEager("./GX*/index.ts");

/**
 * 创建并返回一个组件数组，每个组件包含标签名和元素类。
 *
 * @returns 组件对象数组，每个对象包含 `tagName` 和 `element`。
 *          - `tagName` 是基于组件名称的自定义元素标签名。
 *          - `element` 是组件模块的默认导出，应为 HTMLElement 类型。
 */
export const components = Object.entries(componentFiles).map(([path, mod]) => {
  const module = mod as ComponentModule; // 类型断言，确保模块符合 ComponentModule 接口
  const componentName = path.split("/")[2]; // 从文件路径中提取组件名称
  const tagName = `gx-${componentName.toLowerCase()}`; // 创建自定义元素的标签名
  return { tagName, element: module.default }; // 返回包含标签名和元素类的对象
});

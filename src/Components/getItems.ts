// 定义组件模块接口
interface ComponentModule {
  default: typeof HTMLElement;
}

const componentFiles = import.meta.globEager("./GX*/index.ts");

export const components = Object.entries(componentFiles).map(([path, mod]) => {
  const module = mod as ComponentModule; // 类型断言
  const componentName = path.split("/")[2];
  const tagName = `gx-${componentName.toLowerCase()}`;
  return { tagName, element: module.default };
});

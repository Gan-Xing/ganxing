/**
 * MyClass 是一个示例类，用于演示如何创建和使用 SDK.
 *
 * @remarks
 * 这个类包含一个简单的方法，用于向控制台打印一条消息.
 *
 * @example
 * ```typescript
 * const myClass = new MyClass();
 * myClass.printMessage("Hello, World!");
 * ```
 */
export class MyClass {
  /**
   * 构造函数.
   */
  constructor() {
    // 构造函数代码
  }

  /**
   * 打印一条消息到控制台.
   *
   * @param message - 要打印的消息.
   */
  printMessage(message: string): void {
    console.log(message);
  }
}

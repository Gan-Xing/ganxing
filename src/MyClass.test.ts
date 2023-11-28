import { MyClass } from "./MyClass";

test("MyClass should print a message", () => {
  const myClass = new MyClass();

  // 创建一个 spy 来监听 console.log 的调用
  const logSpy = jest.spyOn(console, "log");

  // 定义要打印的消息
  const message = "Hello, World!";

  // 调用 printMessage 方法
  myClass.printMessage(message);

  // 验证 console.log 是否被正确调用
  expect(logSpy).toHaveBeenCalledWith(message);

  // 清理 spy，以便它不会影响其他测试
  logSpy.mockRestore();
});

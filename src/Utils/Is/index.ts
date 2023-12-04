/**
 * 检查一个值是否为 undefined。
 * @param value 任意值。
 * @returns 如果值为 undefined，则返回 true，否则返回 false。
 */
export const isUndefined = (value: unknown): boolean =>
  Object.prototype.toString.call(value) === "[object Undefined]";

/**
 * 检查一个值是否为 null。
 * @param value 任意值。
 * @returns 如果值为 null，则返回 true，否则返回 false。
 */
export const isNull = (value: unknown): boolean =>
  Object.prototype.toString.call(value) === "[object Null]";

/**
 * 检查一个值是否为布尔类型。
 * @param value 任意值。
 * @returns 如果值为布尔类型，则返回 true，否则返回 false。
 */
export const isBoolean = (value: unknown): boolean =>
  Object.prototype.toString.call(value) === "[object Boolean]";

/**
 * 检查一个值是否为数字。
 * @param value 任意值。
 * @returns 如果值为数字，则返回 true，否则返回 false。
 */
export const isNumber = (value: unknown): boolean =>
  Object.prototype.toString.call(value) === "[object Number]";

/**
 * 检查一个值是否为字符串。
 * @param value 任意值。
 * @returns 如果值为字符串，则返回 true，否则返回 false。
 */
export const isString = (value: unknown): boolean =>
  Object.prototype.toString.call(value) === "[object String]";

/**
 * 检查一个值是否为对象。
 * @param value 任意值。
 * @returns 如果值为对象，则返回 true，否则返回 false。
 */
export const isObject = (value: unknown): boolean =>
  Object.prototype.toString.call(value) === "[object Object]";

/**
 * 检查一个值是否为数组。
 * @param value 任意值。
 * @returns 如果值为数组，则返回 true，否则返回 false。
 */
export const isArray = (value: unknown): boolean =>
  Object.prototype.toString.call(value) === "[object Array]";

/**
 * 检查一个值是否为 NaN。
 * @param value 任意值。
 * @returns 如果值为 NaN，则返回 true，否则返回 false。
 */
export const isNaN = (value: unknown): boolean =>
  typeof value === "number" && Number.isNaN(value);

/**
 * 检查一个值是否为函数。
 * @param value 任意值。
 * @returns 如果值为函数，则返回 true，否则返回 false。
 */
export const isFunction = (value: unknown): boolean =>
  typeof value === "function";

/**
 * 检查一个值是否为 Symbol。
 * @param value 任意值。
 * @returns 如果值为 Symbol，则返回 true，否则返回 false。
 */
export const isSymbol = (value: unknown): boolean => typeof value === "symbol";

/**
 * 检查一个值是否为 BigInt。
 * @param value 任意值。
 * @returns 如果值为 BigInt，则返回 true，否则返回 false。
 */
export const isBigInt = (value: unknown): boolean => typeof value === "bigint";

/**
 * 检查一个值是否为 Promise。
 * @param value 任意值。
 * @returns 如果值为 Promise，则返回 true，否则返回 false。
 */
export const isPromise = (value: unknown): boolean =>
  Object.prototype.toString.call(value) === "[object Promise]";

/**
 * 检查一个值是否为 Date。
 * @param value 任意值。
 * @returns 如果值为 Date，则返回 true，否则返回 false。
 */
export const isDate = (value: unknown): boolean =>
  Object.prototype.toString.call(value) === "[object Date]";

/**
 * 检查一个值是否为正则表达式。
 * @param value 任意值。
 * @returns 如果值为正则表达式，则返回 true，否则返回 false。
 */
export const isRegExp = (value: unknown): boolean =>
  Object.prototype.toString.call(value) === "[object RegExp]";

/**
 * 检查一个值是否为 Error 对象。
 * @param value 任意值。
 * @returns 如果值为 Error 对象，则返回 true，否则返回 false。
 */
export const isError = (value: unknown): boolean =>
  Object.prototype.toString.call(value) === "[object Error]";

/**
 * 检查一个值是否为 Map。
 * @param value 任意值。
 * @returns 如果值为 Map，则返回 true，否则返回 false。
 */
export const isMap = (value: unknown): boolean =>
  Object.prototype.toString.call(value) === "[object Map]";

/**
 * 检查一个值是否为 Set。
 * @param value 任意值。
 * @returns 如果值为 Set，则返回 true，否则返回 false。
 */
export const isSet = (value: unknown): boolean =>
  Object.prototype.toString.call(value) === "[object Set]";

/**
 * 获取一个值的类型。
 * @param value 任意值。
 * @param detailed 是否返回详细类型信息。
 * @param checkPrototype 是否检查原型链以确定类型。
 * @param checkCustomToStringTag 是否检查 Symbol.toStringTag 自定义标签。
 * @returns 返回值的类型，如果无法确定则返回 "unknown"。
 */
export const getType = (
  value: unknown,
  detailed: boolean = false,
  checkPrototype: boolean = false,
  checkCustomToStringTag: boolean = false,
): string => {
  // 处理 Symbol.toStringTag 自定义
  if (
    checkCustomToStringTag &&
    typeof value === "object" &&
    value !== null &&
    Symbol.toStringTag in value
  ) {
    return Reflect.get(value as object, Symbol.toStringTag) as string;
  }

  const regex = /\[object (\w+)\]/;
  const match = Object.prototype.toString.call(value).match(regex);
  let type = match ? match[1] : "unknown";

  // 特殊处理 NaN
  if (type === "Number" && Number.isNaN(value)) {
    return "NaN";
  }

  // 如果 detail 为 false，则只处理基本类型和 NaN
  if (!detailed) {
    if (
      type === "Number" ||
      type === "String" ||
      type === "Boolean" ||
      type === "Undefined" ||
      type === "Symbol" ||
      type === "BigInt" ||
      type === "Null"
    ) {
      return type;
    }
    return type === "unknown" ? "unknown" : "Object"; // 未知类型保持未知，其余都归为 Object
  }

  // 如果是普通对象且需要详细类型，尝试获取构造函数名
  if (
    detailed &&
    type === "Object" &&
    value !== null &&
    typeof value === "object"
  ) {
    const constructorName =
      (value as object).constructor && (value as object).constructor.name;
    if (constructorName) {
      type = constructorName;
    }
  }

  // 安全获取特定类型的函数
  const safeGetType = (typeName: string) => {
    try {
      return eval(typeName);
    } catch (e) {
      return undefined;
    }
  };

  // 完整的类型到构造函数映射
  const typeToConstructorMap = {
    Array: Array,
    ArrayBuffer: ArrayBuffer,
    Boolean: Boolean,
    DataView: DataView,
    Date: Date,
    Error: Error,
    Float32Array: Float32Array,
    Float64Array: Float64Array,
    Function: Function,
    Int8Array: Int8Array,
    Int16Array: Int16Array,
    Int32Array: Int32Array,
    Map: Map,
    Number: Number,
    Object: Object,
    Promise: Promise,
    Proxy: Proxy, // 特殊处理
    RegExp: RegExp,
    Set: Set,
    String: String,
    Uint8Array: Uint8Array,
    Uint8ClampedArray: Uint8ClampedArray,
    Uint16Array: Uint16Array,
    Uint32Array: Uint32Array,
    WeakMap: WeakMap,
    WeakSet: WeakSet,
    Generator: safeGetType("Generator"),
    GeneratorFunction: safeGetType("GeneratorFunction"),
    Symbol: safeGetType("Symbol"),
  } as const;

  // 处理原型链修改
  // 检测类型
  if (checkPrototype && value !== null && typeof value === "object") {
    const typeKey = type as keyof typeof typeToConstructorMap;
    if (
      typeKey in typeToConstructorMap &&
      value instanceof typeToConstructorMap[typeKey]
    ) {
      return type;
    } else {
      return "Object";
    }
  }

  // 检测 Proxy 对象
  if (
    type === "Object" &&
    typeof value === "object" &&
    value !== null &&
    typeof Proxy === "function" &&
    Proxy.revocable
  ) {
    try {
      const { proxy, revoke } = Proxy.revocable(value, {});
      revoke();
      if (value === proxy) {
        return "Proxy";
      }
    } catch (e) {
      // 如果发生错误，继续执行
    }
  }

  return type;
};

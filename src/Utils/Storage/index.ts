/**
 * 代表具有值和可选过期时间的存储项的接口。
 * @template T 存储的值的类型。
 */
export interface StorageItem<T> {
  /**
   * 存储在项中的值。
   */
  value: T;

  /**
   * 项的过期时间戳，如果不过期则为 null。
   */
  expiresAt: number | null;
}

/**
 * 代表一个通用存储工具的类。
 * @template T 存储的值的类型。
 */
export class GXStorage<T> {
  /**
   * 创建 GXStorage 的实例。
   * @param {Storage} storage 底层的存储对象（sessionStorage 或 localStorage）。
   */
  constructor(private storage: Storage) {}

  /**
   * 设置单个项。
   * @param {string} key 用来存储项的键。
   * @param {T} value 要存储的值。
   * @param {number | null} expiration 过期时间。如果为 null，则表示永不过期。如果为数字，则根据 isExactTime 参数决定是相对时间还是确切时间戳。
   * @param {boolean} isExactTime 如果为 true，则 expiration 被视为具体的过期时间戳（毫秒）；否则，视为从现在开始的毫秒数。
   * @param {boolean} warn 当接近存储限制时，如果设置为 true，则启用警告。
   */
  setItem(
    key: string,
    value: T,
    expiration: number | null = null,
    isExactTime: boolean = false,
    warn: boolean = false,
  ): void {
    if (expiration === null) {
      // 如果没有过期时间，直接存储值
      this.storage.setItem(key, JSON.stringify(value));
    } else {
      // 如果有过期时间，存储带有过期时间的对象
      const expiresAt: number | null = isExactTime
        ? expiration
        : Date.now() + expiration;
      const item: StorageItem<T> = { value, expiresAt };
      this.storage.setItem(key, JSON.stringify(item));
    }
    this.checkSpace(warn);
  }

  /**
   * 从存储中检索一个项。
   * @param {string} key 要检索的项的键。
   * @param {() => void} [callback] 如果项已过期，则执行的可选回调函数。
   * @return {T | null} 检索到的项的值，如果项不存在或已过期，则为 null。
   */
  getItem(key: string, callback?: () => void): T | null {
    const itemStr = this.storage.getItem(key);
    if (!itemStr) return null;

    try {
      const item = JSON.parse(itemStr);
      if (typeof item === "object" && item !== null && "expiresAt" in item) {
        // 处理带有过期时间的对象
        if (item.expiresAt && Date.now() > item.expiresAt) {
          this.storage.removeItem(key);
          if (callback) callback();
          return null;
        }
        return item.value;
      } else {
        // 处理直接存储的值
        return item;
      }
    } catch (e) {
      console.error("Error parsing storage item:", e);
      return null;
    }
  }

  /**
   * 从存储中移除一个项。
   * @param {string} key 要移除的项的键。
   */
  removeItem(key: string): void {
    this.storage.removeItem(key);
  }

  /**
   * 清除存储中的所有项。
   */
  clear(): void {
    this.storage.clear();
  }

  /**
   * 在存储中设置多个项。
   * @param {Array<{ key: string; value: T; expiration?: number | null; isExactTime?: boolean; warn?: boolean }>} items 要在存储中设置的项的数组。
   *
   * @remarks
   * 每个项可以包含以下属性：
   * - `key`: 存储项的键。
   * - `value`: 要存储的值。
   * - `expiration`: 过期时间。如果为 `null`，则表示永不过期。如果为数字，根据 `isExactTime` 参数决定是相对时间还是确切时间戳。
   * - `isExactTime`: 如果为 `true`，则 `expiration` 被视为具体的过期时间戳（毫秒）；否则，视为从现在开始的毫秒数。
   * - `warn`: 当接近存储限制时，如果设置为 `true`，则启用警告。
   */
  setItems(
    items: Array<{
      key: string;
      value: T;
      expiration?: number | null;
      isExactTime?: boolean;
      warn?: boolean;
    }>,
  ): void {
    items.forEach(
      ({
        key,
        value,
        expiration = null,
        isExactTime = false,
        warn = false,
      }) => {
        this.setItem(key, value, expiration, isExactTime, warn);
      },
    );
  }

  /**
   * 从存储中检索多个项。
   * @param {string[]} keys 要检索的项的键数组。
   * @param {() => void} [callback] 如果某个项已过期，则执行的可选回调函数。
   * @return {(T | null)[]} 检索到的项的值的数组。对于每个键，如果项不存在或已过期，则为 null。
   */
  getItems(keys: string[], callback?: () => void): (T | null)[] {
    return keys.map((key) => this.getItem(key, callback));
  }

  /**
   * 从存储中移除多个项。
   * @param {string[]} keys 要移除的项的键的数组。
   */
  removeItems(keys: string[]): void {
    keys.forEach((key) => {
      this.removeItem(key);
    });
  }

  /**
   * 获取存储中剩余的空间。
   * @param {boolean} warn 当接近存储限制时，如果设置为 true，则启用警告。
   * @return {number} 存储中剩余的空间。
   */
  getRemainingSpace(warn: boolean = false): number {
    const allData = JSON.stringify(this.storage);
    const remainingSpace = 5120 - new Blob([allData]).size;
    if (warn && remainingSpace < 1024) {
      console.warn("警告：接近存储限制");
    }
    return remainingSpace;
  }

  /**
   * 检查存储空间并在空间低时记录警告。
   * @param {boolean} warn 当接近存储限制时，如果设置为 true，则启用警告。
   */
  checkSpace(warn: boolean = false): void {
    this.getRemainingSpace(warn);
  }
}

let LocalStorage: GXStorage<unknown> | null = null;
let SessionStorage: GXStorage<unknown> | null = null;

/**
 * 获取本地存储 (`localStorage`) 的 `GXStorage` 实例。
 * 如果实例尚未创建且处于客户端环境（即 `window` 对象存在），则会创建并返回该实例。
 * @return {GXStorage<unknown> | null} 返回 `GXStorage` 实例或者在非客户端环境下返回 `null`。
 */
const getLocalStorage = () => {
  if (!LocalStorage && typeof window !== "undefined") {
    LocalStorage = new GXStorage(window.localStorage);
  }
  return LocalStorage;
};

/**
 * 获取会话存储 (`sessionStorage`) 的 `GXStorage` 实例。
 * 如果实例尚未创建且处于客户端环境（即 `window` 对象存在），则会创建并返回该实例。
 * @return {GXStorage<unknown> | null} 返回 `GXStorage` 实例或者在非客户端环境下返回 `null`。
 */
const getSessionStorage = () => {
  if (!SessionStorage && typeof window !== "undefined") {
    SessionStorage = new GXStorage(window.sessionStorage);
  }
  return SessionStorage;
};

/**
 * 设置单个项。
 * @param {string} key 用来存储项的键。
 * @param {unknown} value 要存储的值。
 * @param {number | null} expiration 过期时间。如果为 null，则表示永不过期。如果为数字，则根据 isExactTime 参数决定是相对时间还是确切时间戳。
 * @param {boolean} isExactTime 如果为 true，则 expiration 被视为具体的过期时间戳（毫秒）；否则，视为从现在开始的毫秒数。
 * @param {boolean} warn 当接近存储限制时，如果设置为 true，则启用警告。
 */
const setLocal = (
  key: string,
  value: unknown,
  expiration: number | null = null,
  isExactTime: boolean = false,
  warn: boolean = false,
) => {
  const storage = getLocalStorage();
  if (storage) {
    storage.setItem(key, value, expiration, isExactTime, warn);
  }
};

/**
 * 从本地存储中检索一个项。
 * @param {string} key 要检索的项的键。
 * @param {() => void} [callback] 如果项已过期，则执行的可选回调函数。
 * @return {unknown | null} 检索到的项的值，如果项不存在或已过期，则为 null。
 */
const getLocal = (key: string, callback?: () => void) => {
  const storage = getLocalStorage();
  return storage ? storage.getItem(key, callback) : null;
};

/**
 * 从本地存储中检索多个项。
 * @param {string[]} keys 要检索的项的键数组。
 * @param {() => void} [callback] 如果某个项已过期，则执行的可选回调函数。
 * @return {(unknown | null)[]} 检索到的项的值的数组。对于每个键，如果项不存在或已过期，则为 null。
 */
const getLocals = (
  keys: string[],
  callback?: () => void,
): (unknown | null)[] => {
  const storage = getLocalStorage();
  return storage ? storage.getItems(keys, callback) : keys.map(() => null);
};

/**
 * 从本地存储中移除一个项。
 * @param {string} key 要移除的项的键。
 */
const removeLocal = (key: string) => {
  const storage = getLocalStorage();
  if (storage) {
    storage.removeItem(key);
  }
};

/**
 * 清除本地存储中的所有项。
 */
const clearLocal = () => {
  const storage = getLocalStorage();
  if (storage) {
    storage.clear();
  }
};

/**
 * 在本地存储中设置多个项。
 * @param {Array<{ key: string; value: unknown; expiration?: number | null; isExactTime?: boolean; warn?: boolean }>} items 要在存储中设置的项的数组。
 */
const setLocals = (
  items: Array<{
    key: string;
    value: unknown;
    expiration?: number | null;
    isExactTime?: boolean;
    warn?: boolean;
  }>,
) => {
  const storage = getLocalStorage();
  if (storage) {
    storage.setItems(items);
  }
};

/**
 * 从本地存储中移除多个项。
 * @param {string[]} keys 要移除的项的键的数组。
 */
const removeLocals = (keys: string[]) => {
  const storage = getLocalStorage();
  if (storage) {
    storage.removeItems(keys);
  }
};

/**
 * 获取本地存储中剩余的空间。
 * @param {boolean} warn 当接近存储限制时，如果设置为 true，则启用警告。
 * @return {number} 存储中剩余的空间。
 */
const getRemainingLocalSpace = (warn: boolean = false): number => {
  const storage = getLocalStorage();
  return storage ? storage.getRemainingSpace(warn) : 0;
};

/**
 * 检查本地存储空间并在空间低时记录警告。
 * @param {boolean} warn 当接近存储限制时，如果设置为 true，则启用警告。
 */
const checkLocalSpace = (warn: boolean = false) => {
  const storage = getLocalStorage();
  if (storage) {
    storage.checkSpace(warn);
  }
};

/**
 * 设置单个会话存储项。
 * @param {string} key 用来存储项的键。
 * @param {unknown} value 要存储的值。
 * @param {number | null} expiration 过期时间。如果为 null，则表示永不过期。如果为数字，则根据 isExactTime 参数决定是相对时间还是确切时间戳。
 * @param {boolean} isExactTime 如果为 true，则 expiration 被视为具体的过期时间戳（毫秒）；否则，视为从现在开始的毫秒数。
 * @param {boolean} warn 当接近存储限制时，如果设置为 true，则启用警告。
 */
const setSession = (
  key: string,
  value: unknown,
  expiration: number | null = null,
  isExactTime: boolean = false,
  warn: boolean = false,
) => {
  const storage = getSessionStorage();
  if (storage) {
    storage.setItem(key, value, expiration, isExactTime, warn);
  }
};

/**
 * 从会话存储中检索一个项。
 * @param {string} key 要检索的项的键。
 * @param {() => void} [callback] 如果项已过期，则执行的可选回调函数。
 * @return {unknown | null} 检索到的项的值，如果项不存在或已过期，则为 null。
 */
const getSession = (key: string, callback?: () => void) => {
  const storage = getSessionStorage();
  return storage ? storage.getItem(key, callback) : null;
};

/**
 * 从会话存储中检索多个项。
 * @param {string[]} keys 要检索的项的键数组。
 * @param {() => void} [callback] 如果某个项已过期，则执行的可选回调函数。
 * @return {(unknown | null)[]} 检索到的项的值的数组。对于每个键，如果项不存在或已过期，则为 null。
 */
const getSessions = (
  keys: string[],
  callback?: () => void,
): (unknown | null)[] => {
  const storage = getSessionStorage();
  return storage ? storage.getItems(keys, callback) : keys.map(() => null);
};

/**
 * 从会话存储中移除一个项。
 * @param {string} key 要移除的项的键。
 */
const removeSession = (key: string) => {
  const storage = getSessionStorage();
  if (storage) {
    storage.removeItem(key);
  }
};

/**
 * 清除会话存储中的所有项。
 */
const clearSession = () => {
  const storage = getSessionStorage();
  if (storage) {
    storage.clear();
  }
};

/**
 * 在会话存储中设置多个项。
 * @param {Array<{ key: string; value: unknown; expiration?: number | null; isExactTime?: boolean; warn?: boolean }>} items 要在存储中设置的项的数组。
 */
const setSessions = (
  items: Array<{
    key: string;
    value: unknown;
    expiration?: number | null;
    isExactTime?: boolean;
    warn?: boolean;
  }>,
) => {
  const storage = getSessionStorage();
  if (storage) {
    storage.setItems(items);
  }
};

/**
 * 从会话存储中移除多个项。
 * @param {string[]} keys 要移除的项的键的数组。
 */
const removeSessions = (keys: string[]) => {
  const storage = getSessionStorage();
  if (storage) {
    storage.removeItems(keys);
  }
};

/**
 * 获取会话存储中剩余的空间。
 * @param {boolean} warn 当接近存储限制时，如果设置为 true，则启用警告。
 * @return {number} 存储中剩余的空间。
 */
const getRemainingSessionSpace = (warn: boolean = false): number => {
  const storage = getSessionStorage();
  return storage ? storage.getRemainingSpace(warn) : 0;
};

/**
 * 检查会话存储空间并在空间低时记录警告。
 * @param {boolean} warn 当接近存储限制时，如果设置为 true，则启用警告。
 */
const checkSessionSpace = (warn: boolean = false) => {
  const storage = getSessionStorage();
  if (storage) {
    storage.checkSpace(warn);
  }
};

// 导出这些方法
export {
  setLocal,
  removeLocal,
  getLocal,
  getLocals,
  clearLocal,
  setLocals,
  removeLocals,
  getRemainingLocalSpace,
  checkLocalSpace,
  setSession,
  removeSession,
  getSession,
  getSessions,
  clearSession,
  setSessions,
  removeSessions,
  getRemainingSessionSpace,
  checkSessionSpace,
  getLocalStorage,
  getSessionStorage,
  GXStorage as Storage,
};

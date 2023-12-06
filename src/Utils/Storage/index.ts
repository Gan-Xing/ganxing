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

// 创建 gxStorage 类的实例
const LocalStorage = new GXStorage(window.localStorage);
const SessionStorage = new GXStorage(window.sessionStorage);

// 使用解构赋值将方法赋给新的变量
// 对于LocalStorage的操作，重命名方法
const {
  setItem: setLocal,
  removeItem: removeLocal,
  getItem: getLocal,
  clear: clearLocal,
  setItems: setLocals,
  getItems: getLocals,
  removeItems: removeLocals,
  getRemainingSpace: getRemainingLocalSpace,
  checkSpace: checkLocalSpace,
} = LocalStorage;

// 对于SessionStorage的操作，重命名方法
const {
  setItem: setSession,
  removeItem: removeSession,
  getItem: getSession,
  clear: clearSession,
  setItems: setSessions,
  getItems: getSessions,
  removeItems: removeSessions,
  getRemainingSpace: getRemainingSessionSpace,
  checkSpace: checkSessionSpace,
} = SessionStorage;

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
  LocalStorage,
  SessionStorage,
  GXStorage as Storage,
};

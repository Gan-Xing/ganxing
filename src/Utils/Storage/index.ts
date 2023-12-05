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
   * 在存储中设置一个项。
   * @param {string} key 用来存储项的键。
   * @param {T} value 要存储的值。
   * @param {number | null} expiresInOrExactTime 项过期的毫秒数，或者是具体的过期时间戳。如果不过期，则传入 null。
   * @param {boolean} isExactTime 如果 expiresInOrExactTime 是一个具体的时间戳，则设置为 true。
   * @param {boolean} warn 当接近存储限制时，如果设置为 true，则启用警告。
   */
  setItem(
    key: string,
    value: T,
    expiresInOrExactTime: number | null = null,
    isExactTime: boolean = false,
    warn: boolean = false,
  ): void {
    let expiresAt = expiresInOrExactTime;
    if (expiresInOrExactTime !== null && !isExactTime) {
      expiresAt = Date.now() + expiresInOrExactTime;
    }

    const item: StorageItem<T> = {
      value,
      expiresAt,
    };
    this.storage.setItem(key, JSON.stringify(item));
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

    const item: StorageItem<T> = JSON.parse(itemStr);
    if (item.expiresAt && Date.now() > item.expiresAt) {
      this.storage.removeItem(key);
      if (callback) callback();
      return null;
    }
    return item.value;
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
   * @param {Array<{ key: string; value: T; expiresAt?: number | null }>} items 要在存储中设置的项的数组。
   */
  setItems(
    items: Array<{ key: string; value: T; expiresAt?: number | null }>,
  ): void {
    items.forEach((item) => {
      this.setItem(item.key, item.value, item.expiresAt);
    });
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
  removeItems: removeSessions,
  getRemainingSpace: getRemainingSessionSpace,
  checkSpace: checkSessionSpace,
} = SessionStorage;

// 导出这些方法
export {
  setLocal,
  removeLocal,
  getLocal,
  clearLocal,
  setLocals,
  removeLocals,
  getRemainingLocalSpace,
  checkLocalSpace,
  setSession,
  removeSession,
  getSession,
  clearSession,
  setSessions,
  removeSessions,
  getRemainingSessionSpace,
  checkSessionSpace,
  LocalStorage,
  SessionStorage,
  GXStorage as Storage,
};

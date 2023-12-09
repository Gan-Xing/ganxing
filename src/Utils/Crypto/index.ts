/**
 * 二进制类似对象。
 * 可以是 Buffer, NodeJS.TypedArray, DataView 或字符串。
 */
export type BinaryLike = Buffer | NodeJS.TypedArray | DataView | string;

/**
 * 加密密钥。
 * 可以是 Buffer, NodeJS.TypedArray, DataView 或字符串。
 */
export type CipherKey = Buffer | NodeJS.TypedArray | DataView | string;

/**
 * 散列算法枚举。
 */
export enum HashAlgorithm {
  SHA256 = "SHA-256",
  SHA384 = "SHA-384",
  SHA512 = "SHA-512",
  SHA3_224 = "SHA3-224",
  SHA3_256 = "SHA3-256",
  SHA3_384 = "SHA3-384",
  SHA3_512 = "SHA3-512",
}

/**
 * 对称加密算法枚举。
 */
export enum SymmetricEncryptionAlgorithm {
  AES_CBC = "AES-CBC",
  AES_GCM = "AES-GCM",
  AES_CTR = "AES-CTR",
  AES_CFB = "AES-CFB",
  AES_OFB = "AES-OFB",
  AES_KW = "AES-KW",
  CHACHA20_POLY1305 = "CHACHA20-POLY1305", // 在某些环境中支持
}

import crypto from "crypto";

/**
 * 将 ArrayBuffer 转换为十六进制字符串。
 * 这个函数通过创建一个 Uint8Array 视图，并将每个字节转换为相应的十六进制表示，来实现 ArrayBuffer 到字符串的转换。
 *
 * @param buffer - ArrayBuffer 对象，包含要转换的二进制数据。
 * @returns 转换后的十六进制字符串。
 */
export const arrayBufferToHex = (buffer: ArrayBuffer): string => {
  return Array.from(new Uint8Array(buffer))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
};

/**
 * 将 Base64 编码的字符串转换为 ArrayBuffer。
 * 这个函数首先将 Base64 编码的字符串解码为二进制字符串，然后将每个字符的字符代码转换为字节，并存储在 Uint8Array 中，最后返回 ArrayBuffer。
 *
 * @param base64 - Base64 编码的字符串。
 * @returns 对应的 ArrayBuffer 对象。
 */
export const base64ToArrayBuffer = (base64: string): ArrayBuffer => {
  const binaryString = window.atob(base64);
  const len = binaryString.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes.buffer;
};

/**
 * 将 ArrayBuffer 转换为 Base64 编码的字符串。
 * 这个函数通过遍历 ArrayBuffer 中的每个字节，并将其转换为相应的字符，来构建一个二进制字符串，然后使用 window.btoa 方法将此二进制字符串转换为 Base64 编码的字符串。
 *
 * @param buffer - ArrayBuffer 对象，包含要转换的二进制数据。
 * @returns 转换后的 Base64 编码的字符串。
 */
export const arrayBufferToBase64 = (buffer: ArrayBuffer): string => {
  let binary = "";
  const bytes = new Uint8Array(buffer);
  const len = bytes.byteLength;
  for (let i = 0; i < len; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return window.btoa(binary);
};

/**
 * 同步填充一个 Uint8Array 数组以生成随机值。
 * 在 Node.js 环境中，使用 Node 的 crypto 模块的 `randomFillSync` 方法。
 * 在 Web 环境中，使用 Web Crypto API 的 `getRandomValues` 方法。
 *
 * @param array - Uint8Array 类型的数组，将被填充随机值。
 * @returns 填充了随机值的 Uint8Array 数组。
 * @throws 如果环境中没有可用的加密模块，则会抛出错误。
 */
export const randomFillSync = (array: Uint8Array): Uint8Array => {
  if (
    typeof process !== "undefined" &&
    process.versions &&
    process.versions.node
  ) {
    return crypto.randomFillSync(array);
  } else if (typeof window !== "undefined" && window.crypto) {
    return window.crypto.getRandomValues(array);
  } else {
    throw new Error("Unsupported environment");
  }
};

/**
 * 生成指定大小的随机字节序列。
 * 在 Node.js 环境中，使用 Node 的 crypto 模块的 `randomBytes` 方法。
 * 在 Web 环境中，创建一个 Uint8Array 数组并使用 Web Crypto API 的 `getRandomValues` 方法填充。
 *
 * @param size - 要生成的随机字节序列的大小（单位：字节）。
 * @returns 生成的随机字节序列，以十六进制字符串的形式返回。
 * @throws 如果环境中没有可用的加密模块，则会抛出错误。
 */
export const randomBytes = (size: number): string => {
  if (
    typeof process !== "undefined" &&
    process.versions &&
    process.versions.node
  ) {
    return crypto.randomBytes(size).toString("hex");
  } else if (typeof window !== "undefined" && window.crypto) {
    const array = new Uint8Array(size);
    window.crypto.getRandomValues(array);
    return arrayBufferToHex(array.buffer);
  } else {
    throw new Error("Unsupported environment");
  }
};

/**
 * 生成加密密钥。
 *
 * @param {number} [keySize=32] - 密钥的大小（单位：字节），默认为 32 字节（256 位）。
 * @param {string} [algorithm="AES-GCM"] - 加密算法，默认为 "AES-GCM"。
 * @returns {Promise<CryptoKey | undefined>} - 返回一个 Promise，解析为生成的 CryptoKey，如果不在 Web 环境中则返回 undefined。
 */
export const generateCryptoKey = async (
  keySize = 32,
  algorithm = "AES-GCM",
): Promise<CryptoKey | undefined> => {
  if (typeof window !== "undefined" && window.crypto) {
    const keyBuffer = window.crypto.getRandomValues(new Uint8Array(keySize));
    return window.crypto.subtle.importKey(
      "raw",
      keyBuffer,
      { name: algorithm, length: keySize * 8 },
      false,
      ["encrypt", "decrypt"],
    );
  }
  return undefined;
};

/**
 * 生成初始化向量（IV）。
 *
 * @param {number} [ivSize=12] - 初始化向量的大小（单位：字节），默认为 12 字节。
 * @returns {Uint8Array} - 返回填充了随机字节的 Uint8Array，用作初始化向量。
 */
export const generateIV = (ivSize = 12): Uint8Array => {
  return randomFillSync(new Uint8Array(ivSize));
};

/**
 * 对任意类型的数据进行散列处理。
 * 此函数根据提供的算法生成数据的散列值。支持多种数据类型，包括 null、undefined、布尔值、数字、符号和对象。
 * 在 Node.js 环境中，使用 Node 的 crypto 模块进行散列计算。
 * 在 Web 环境中，使用 Web Crypto API 进行散列计算。
 *
 * @param data - 要进行散列处理的数据。可以是任意类型。
 * @param algorithm - 使用的散列算法，默认为 SHA-256。
 * @returns 返回一个 promise，解析为数据的散列值，表示为十六进制字符串。
 * @throws 如果环境中没有可用的加密模块，则会抛出错误。
 *
 * 特殊值处理规则：
 * - 对于 null 和 undefined，分别转换为字符串 "null" 和 "undefined"。
 * - 布尔值转换为字符串 "true" 或 "false"。
 * - 数字和大整数（bigint）转换为其字符串表示形式。
 * - 符号（symbol）转换为使用 Symbol.keyFor 获取的键名，如果不存在，则转换为字符串 "Symbol"。
 * - 对象使用 JSON.stringify 转换为字符串。
 * - 其他类型的数据直接转换为字符串。
 */
export const hash = async (
  data: unknown,
  algorithm: HashAlgorithm = HashAlgorithm.SHA256,
): Promise<string> => {
  // 特殊值的处理
  let dataString;
  if (data === null) {
    dataString = "null";
  } else if (data === undefined) {
    dataString = "undefined";
  } else if (typeof data === "boolean") {
    dataString = data ? "true" : "false";
  } else if (typeof data === "number" || typeof data === "bigint") {
    dataString = data.toString();
  } else if (typeof data === "symbol") {
    dataString = Symbol.keyFor(data) || "Symbol";
  } else if (typeof data === "object") {
    dataString = JSON.stringify(data);
  } else {
    dataString = String(data);
  }

  if (
    typeof process !== "undefined" &&
    process.versions &&
    process.versions.node
  ) {
    const hash = crypto.createHash(algorithm);
    return hash.update(dataString).digest("hex");
  } else if (typeof window !== "undefined" && window.crypto) {
    const buffer = new TextEncoder().encode(dataString);
    const digest = await window.crypto.subtle.digest(algorithm, buffer);
    return arrayBufferToHex(digest);
  } else {
    throw new Error("Crypto module is not available.");
  }
};

/**
 * Encrypts data in Node.js environment.
 * @param data {string} - Data to encrypt.
 * @param key {CipherKey} - Encryption key.
 * @param iv {BinaryLike} - Initialization vector.
 * @param algorithm {string} - Encryption algorithm.
 * @returns {Promise<string>} - Encrypted data.
 * @private
 */
export const nodeEncrypt = async (
  data: string,
  key: CipherKey,
  iv: BinaryLike,
  algorithm: string,
): Promise<string> => {
  if (
    typeof process !== "undefined" &&
    process.versions &&
    process.versions.node
  ) {
    const cipher = crypto.createCipheriv(algorithm, key, iv);
    let encrypted = cipher.update(data, "utf8", "hex");
    encrypted += cipher.final("hex");
    return encrypted;
  } else {
    throw new Error("Unsupported environment");
  }
};

/**
 * Encrypts data in Web environment.
 * @param data {string} - Data to encrypt.
 * @param key {CryptoKey} - Encryption key.
 * @param iv {Uint8Array} - Initialization vector.
 * @param algorithm {string} - Encryption algorithm.
 * @returns {Promise<string>} - Encrypted data.
 * @private
 */
export const webEncrypt = async (
  data: string,
  key: CryptoKey,
  iv: Uint8Array,
  algorithm: string,
): Promise<string> => {
  if (typeof window !== "undefined" && window.crypto) {
    const buffer = new TextEncoder().encode(data);
    const cryptoKey = key;
    const ivArray = iv;
    const encrypted = await window.crypto.subtle.encrypt(
      { name: algorithm, iv: ivArray },
      cryptoKey,
      buffer,
    );
    return arrayBufferToHex(encrypted);
  } else {
    throw new Error("Unsupported environment");
  }
};

/**
 * 根据环境使用适当的方法加密数据。
 * 在 Node.js 环境中，使用 `nodeEncrypt` 方法。在 Web 环境中，使用 `webEncrypt` 方法。
 *
 * @param data - 要加密的数据，以字符串形式。
 * @param key - 加密密钥。在 Node.js 中为 `CipherKey`，在 Web 中为 `CryptoKey`。
 * @param iv - 初始化向量，在 Node.js 中为 `BinaryLike`，在 Web 中为 `Uint8Array`。
 * @param algorithm - 使用的对称加密算法，默认为 AES-GCM。
 * @returns 返回一个 promise，解析为加密后的数据，为十六进制字符串。
 * @throws 如果环境中没有可用的加密模块，则会抛出错误。
 */
export const encrypt = (
  data: string,
  key: CipherKey | CryptoKey,
  iv: BinaryLike | Uint8Array,
  algorithm: string = SymmetricEncryptionAlgorithm.AES_GCM,
): Promise<string> => {
  if (typeof window !== "undefined" && window.crypto) {
    return webEncrypt(data, key as CryptoKey, iv as Uint8Array, algorithm);
  } else if (
    typeof process !== "undefined" &&
    process.versions &&
    process.versions.node
  ) {
    return nodeEncrypt(data, key as CipherKey, iv as BinaryLike, algorithm);
  } else {
    throw new Error("Unsupported environment");
  }
};

/**
 * Encrypts data in Node.js environment.
 * @param data {string} - Data to encrypt.
 * @param key {CipherKey} - Encryption key.
 * @param iv {BinaryLike} - Initialization vector.
 * @param algorithm {string} - Encryption algorithm.
 * @returns {Promise<string>} - Encrypted data.
 * @private
 */
export const nodeDecrypt = async (
  data: string,
  key: CipherKey,
  iv: BinaryLike,
  algorithm: string,
): Promise<string> => {
  if (
    typeof process !== "undefined" &&
    process.versions &&
    process.versions.node
  ) {
    const decipher = crypto.createDecipheriv(algorithm, key, iv);
    let decrypted = decipher.update(data, "hex", "utf8");
    decrypted += decipher.final("utf8");
    return decrypted;
  } else {
    throw new Error("Unsupported environment");
  }
};

/**
 * Decrypts data in Web environment.
 * @param algorithm {string} - Decryption algorithm.
 * @param key {CryptoKey} - Decryption key.
 * @param iv {Uint8Array} - Initialization vector.
 * @param data {string} - Data to decrypt.
 * @returns {Promise<string>} - Decrypted data.
 * @private
 */
export const webDecrypt = async (
  data: string,
  key: CryptoKey,
  iv: Uint8Array,
  algorithm: string,
): Promise<string> => {
  if (typeof window !== "undefined" && window.crypto) {
    const matches = data.match(/.{1,2}/g);
    if (!matches) throw new Error("Invalid encrypted data format.");
    const buffer = new Uint8Array(matches.map((byte) => parseInt(byte, 16)));
    const decrypted = await window.crypto.subtle.decrypt(
      { name: algorithm, iv: iv },
      key,
      buffer,
    );
    return new TextDecoder().decode(decrypted);
  } else {
    throw new Error("Unsupported environment");
  }
};

/**
 * 根据环境使用适当的方法解密数据。
 * 在 Node.js 环境中，使用 `nodeDecrypt` 方法。在 Web 环境中，使用 `webDecrypt` 方法。
 *
 * @param algorithm - 用于解密的对称加密算法。
 * @param key - 解密密钥。在 Node.js 中为 `CipherKey`，在 Web 中为 `CryptoKey`。
 * @param iv - 初始化向量，在 Node.js 中为 `BinaryLike`，在 Web 中为 `Uint8Array`。
 * @param data - 要解密的加密数据，为十六进制字符串。
 * @returns 返回一个 promise，解析为解密后的数据，为字符串。
 * @throws 如果环境中没有可用的加密模块，则会抛出错误。
 */
export const decrypt = (
  data: string,
  key: CipherKey | CryptoKey,
  iv: BinaryLike | Uint8Array,
  algorithm: string = SymmetricEncryptionAlgorithm.AES_GCM,
): Promise<string> => {
  if (typeof window !== "undefined" && window.crypto) {
    return webDecrypt(data, key as CryptoKey, iv as Uint8Array, algorithm);
  } else if (
    typeof process !== "undefined" &&
    process.versions &&
    process.versions.node
  ) {
    return nodeDecrypt(data, key as CipherKey, iv as BinaryLike, algorithm);
  } else {
    throw new Error("Unsupported environment");
  }
};

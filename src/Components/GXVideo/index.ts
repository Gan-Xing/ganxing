/**
 * 自定义HTML元素，用于创建并控制视频播放。
 * @template T 指定视频元素属性的类型。
 */
export class GXVideo extends HTMLElement {
  private videoElement: HTMLVideoElement;

  /**
   * 构造函数，创建 GXVideo 实例并初始化 shadow DOM 和 video 元素。
   */
  constructor() {
    super();
    this.attachShadow({ mode: "open" });
    this.shadowRoot!.innerHTML = `<video width="100%"></video>`; // 使用 '!' 断言 shadowRoot 非 null
    this.videoElement = this.shadowRoot!.querySelector(
      "video",
    ) as HTMLVideoElement;
  }

  /**
   * 组件连接到 DOM 时调用，用于设置视频属性和加载视频。
   */
  connectedCallback() {
    this.updateVideoAttributes();
    this.loadVideo(this.getAttribute("src"), this.getAttribute("type"));
    this.forwardEvents(); // 在连接时设置事件转发
  }

  /**
   * 定义需要观察的属性名称数组。
   */
  static get observedAttributes() {
    return [
      "src",
      "type",
      "class",
      "autoplay",
      "controls",
      "crossorigin",
      "loop",
      "muted",
      "preload",
      "volume",
      "playbackrate",
    ];
  }

  /**
   * 当观察的属性变化时调用。
   * @param {string} name 属性名称。
   * @param {string} oldValue 旧属性值。
   * @param {string} newValue 新属性值。
   */
  attributeChangedCallback(name: string, oldValue: string, newValue: string) {
    if (name === "class") {
      this.videoElement.className = newValue;
    } else if (name === "src" || name === "type") {
      this.loadVideo(this.getAttribute("src"), this.getAttribute("type"));
    } else {
      this.updateVideoAttributes();
    }
  }

  /**
   * 更新 video 元素的属性以匹配自定义元素的属性。
   */
  updateVideoAttributes() {
    Array.from(this.attributes).forEach((attr) => {
      if (attr.name !== "src" && attr.name !== "type") {
        if (attr.name === "autoplay" || attr.name === "controls") {
          // 对于布尔属性，使用存在性来决定真假
          this.videoElement[attr.name] = this.hasAttribute(attr.name);
        } else {
          this.videoElement.setAttribute(attr.name, attr.value);
        }
      }
    });
  }

  /**
   * 根据提供的 URL 和类型加载视频。
   * @param {string | null} url 视频的 URL。
   * @param {string | null} type 视频的 MIME 类型。
   */

  async loadVideo(url: string | null, type: string | null) {
    if (!url) return;

    // HLS
    if (
      type === "application/vnd.apple.mpegurl" ||
      (type === null && url.includes(".m3u8")) ||
      (type === null && url.includes(".ts"))
    ) {
      const { default: Hls } = await import("hls.js");
      if (Hls.isSupported()) {
        const hls = new Hls();
        hls.loadSource(url);
        hls.attachMedia(this.videoElement);
      } else if (
        this.videoElement.canPlayType("application/vnd.apple.mpegurl")
      ) {
        this.videoElement.src = url;
      }
      // FLV
    } else if (
      type === "video/x-flv" ||
      (type === null && url.includes(".flv"))
    ) {
      const { default: flvjs } = await import("flv.js");
      if (flvjs.isSupported()) {
        const flvPlayer = flvjs.createPlayer({ type: "flv", url });
        flvPlayer.attachMediaElement(this.videoElement);
        flvPlayer.load();
      }
      // 其他
    } else {
      this.videoElement.src = url;
    }
  }

  /**
   * 获取当前播放时间。
   */
  get currentTime() {
    return this.videoElement.currentTime;
  }

  /**
   * 设置当前播放时间。
   * @param {number} value 要设置的播放时间。
   */
  set currentTime(value) {
    this.videoElement.currentTime = value;
  }

  /**
   * 获取视频总时长。
   */
  get duration() {
    return this.videoElement.duration;
  }

  /**
   * 获取视频是否已结束。
   */
  get ended() {
    return this.videoElement.ended;
  }

  /**
   * 获取视频是否暂停。
   */
  get paused() {
    return this.videoElement.paused;
  }

  /**
   * 加载视频源。
   */
  load() {
    this.videoElement.load();
  }

  /**
   * 播放视频。
   */
  play() {
    return this.videoElement.play();
  }

  /**
   * 暂停视频。
   */
  pause() {
    this.videoElement.pause();
  }

  /**
   * 添加文字轨道。
   * @param {TextTrackKind} kind 文字轨道的类型。
   * @param {string} [label] 文字轨道的标签。
   * @param {string} [language] 文字轨道的语言。
   */
  addTextTrack(kind: TextTrackKind, label?: string, language?: string) {
    return this.videoElement.addTextTrack(kind, label, language);
  }

  /**
   * 转发 video 元素的事件。
   */
  private forwardEvents() {
    const events = [
      "play",
      "pause",
      "ended",
      "loadedmetadata",
      "loadstart",
      "error",
    ];
    events.forEach((event) => {
      this.videoElement.addEventListener(event, (e) => {
        this.dispatchEvent(new Event(e.type));
      });
    });
  }
}

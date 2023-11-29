// src/components/GXVideo/GXVideo.ts
export class GXVideo extends HTMLElement {
  private videoElement: HTMLVideoElement;
  constructor() {
    super();
    this.attachShadow({ mode: "open" });
    this.shadowRoot!.innerHTML = `<video width="100%"></video>`; // 使用 '!' 断言 shadowRoot 非 null
    this.videoElement = this.shadowRoot!.querySelector(
      "video",
    ) as HTMLVideoElement;
  }

  connectedCallback() {
    this.updateVideoAttributes();
    this.loadVideo(this.getAttribute("src"), this.getAttribute("type"));
    this.forwardEvents(); // 在连接时设置事件转发
  }

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

  attributeChangedCallback(name: string, oldValue: string, newValue: string) {
    if (name === "class") {
      this.videoElement.className = newValue;
    } else if (name === "src" || name === "type") {
      this.loadVideo(this.getAttribute("src"), this.getAttribute("type"));
    } else {
      this.updateVideoAttributes();
    }
  }

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

  // 对外暴露 video 元素的属性
  get currentTime() {
    return this.videoElement.currentTime;
  }
  set currentTime(value) {
    this.videoElement.currentTime = value;
  }

  get duration() {
    return this.videoElement.duration;
  }

  get ended() {
    return this.videoElement.ended;
  }

  get paused() {
    return this.videoElement.paused;
  }

  load() {
    this.videoElement.load();
  }

  play() {
    return this.videoElement.play(); // 返回 Promise 对象
  }

  pause() {
    this.videoElement.pause();
  }

  addTextTrack(kind: TextTrackKind, label?: string, language?: string) {
    return this.videoElement.addTextTrack(
      kind as TextTrackKind,
      label,
      language,
    );
  }

  // 转发 video 元素的事件
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
if (!customElements.get("gx-video")) {
  customElements.define("gx-video", GXVideo);
}

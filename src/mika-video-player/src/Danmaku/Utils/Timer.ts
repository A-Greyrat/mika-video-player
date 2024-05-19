export class Timer {
  start: number = 0;

  paused: boolean = true;

  pauseTime: number = 0;

  loop?: number;

  callbackList: {
    callback: () => void;
    delay: number;
  }[] = [];

  constructor() {
    this.start = performance.now();
    this.pauseTime = this.start;

    const loop = () => {
      if (!this.paused) {
        this.callbackList = this.callbackList.filter(({ callback, delay }) => {
          if (this.now >= delay) {
            callback();
            return false;
          }
          return true;
        });
      }
      this.loop = requestAnimationFrame(loop);
    };

    this.loop = requestAnimationFrame(loop);
  }

  public destroy() {
    cancelAnimationFrame(this.loop!);
  }

  // 获取当前时间, 单位: ms
  get now(): number {
    return this.paused ? this.pauseTime - this.start : performance.now() - this.start;
  }

  get nowSeconds(): number {
    return this.now / 1000;
  }

  public pause() {
    if (this.paused) return;
    this.paused = true;
    this.pauseTime = performance.now();
  }

  public reset() {
    this.start = performance.now();
    this.pauseTime = this.start;
    this.callbackList = [];
  }

  public resume() {
    if (!this.paused) return;
    this.paused = false;
    this.start += performance.now() - this.pauseTime;
  }

  public setTimeout(callback: () => void, delay: number) {
    if (Number.isNaN(delay) || delay < 0 || delay === Infinity) {
      callback();
      return;
    }

    this.callbackList.push({ callback, delay: delay + this.now });
  }
}

import { DanmakuAlloc } from '../Alloc/DanmakuAlloc.ts';
import { DanmakuOption } from '../Manager/DanmakuManager.ts';
import { Timer } from '../Utils/Timer.ts';
import { NormalDanmakuRenderer } from './NormalDanmakuRenderer.ts';
import { BottomDanmakuRenderer } from './BottomDanmakuRenderer.ts';
import { TopDanmakuRenderer } from './TopDanmakuRenderer.ts';
import { AdvancedDanmakuRenderer } from './AdvancedDanmakuRenderer.ts';
import { ReverseDanmakuRenderer } from './ReverseDanmakuRenderer.ts';

export interface DanmakuAttr {
  // 弹幕出现的时间, 单位: 秒
  begin: number;
  // 1 2 3：普通弹幕
  // 4：底部弹幕
  // 5：顶部弹幕
  // 6：逆向弹幕
  // 7：高级弹幕
  // 8：代码弹幕
  // 9：BAS 弹幕（仅限于特殊弹幕专包）
  mode: number;
  // 18：小, 25：标准, 36：大
  size: number;
  // 弹幕颜色
  color: string;
  // 弹幕内容
  text: string;

  // extra
  style?: Partial<CSSStyleDeclaration>;
  render?: (element: HTMLElement) => void;
}

export interface DanmakuExtraData {
  containerWidth: number;
  containerHeight: number;
  danmakuWidth: number;
  danmakuHeight: number;
  danmakuSpeed: number;
  alloc: DanmakuAlloc;
  delay: number;
  fontSize: number;
  danmakuOption: DanmakuOption;
  timer: Timer;
  hideDanmaku: (e: HTMLDivElement) => void;
}

export interface IDanmakuRenderer {
  render(e: HTMLDivElement, danmaku: DanmakuAttr, extraData: DanmakuExtraData): void;
}

export const danmakuRendererMap = new Map<number, IDanmakuRenderer>([
  [1, new NormalDanmakuRenderer()],
  [4, new BottomDanmakuRenderer()],
  [5, new TopDanmakuRenderer()],
  [6, new ReverseDanmakuRenderer()],
  [7, new AdvancedDanmakuRenderer()],
]);

export const getDanmakuRenderer = (type: number): IDanmakuRenderer =>
  danmakuRendererMap.get(type) || danmakuRendererMap.get(1)!;

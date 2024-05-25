import React from 'react';
import { Shortcut } from './Controller';
import { DanmakuAttr } from './Danmaku';
import { DanmakuScheduler } from './Danmaku/Scheduler/DanmakuScheduler.ts';

export type ToolbarArea = {
  left: React.ComponentType[];
  middle: React.ComponentType[];
  right: React.ComponentType[];
};

export interface VideoSrc {
  srcs: {
    // 视频源地址, 或者传一个Callback函数，用于动态获取视频地址
    url: string | (() => string);
    type: string;
  }[];

  default?: number;
}

export interface VideoPlayerProps extends Omit<React.VideoHTMLAttributes<HTMLVideoElement>, 'src'> {
  src?: string | VideoSrc;
  loader?: (videoElement: HTMLVideoElement, videoSrc: string | VideoSrc) => void;
  toolbar?: ToolbarArea;
  shortcut?: Shortcut[];
  danmaku?: DanmakuAttr[];

  children?: React.ReactNode;
  enableDanmaku?: boolean;
  autoPlayNext?: 'replay' | 'next' | 'none';
  autoPlayNextSrc?: string | VideoSrc;
  videoRatio?: string;

  // 初始化弹幕配置
  danmakuOptions?: {
    // 弹幕字体大小
    fontSizeScale?: 0.75 | 1 | 1.25;
    // 弹幕透明度
    opacity?: number;
    // 弹幕滚动速度
    speed?: number;
    // 弹幕显示区域比例
    displayAreaRate?: 0.25 | 0.5 | 0.75 | 1;
    // 是否允许弹幕重叠
    enableMultiTrack?: boolean;
  };

  // 弹幕配置变更时触发，可用于持久化配置
  onChangeDanmakuOptions?: (options: VideoPlayerProps['danmakuOptions']) => void;

  // TODO: make it async
  // 发送弹幕时触发，返回false则不发送
  onSendDanmaku?: (danmaku: DanmakuAttr) => boolean;

  // 用于传递额外信息
  extra?: unknown;
  // eslint-disable-next-line no-use-before-define
  plugins?: VideoPlayerPlugin[];
}

export interface VideoPlayerExtraData {
  videoElement?: HTMLVideoElement | null;
  controllerElement?: HTMLDivElement | null;
  containerElement?: HTMLDivElement | null;
  danmaku?: DanmakuAttr[];
  controls?: boolean;
  shortcut?: Shortcut[];
  enableDanmaku?: boolean;
  toolbar?: ToolbarArea;
  children?: React.ReactNode;
  src?: VideoSrc | string;
  autoPlayNext?: 'replay' | 'next' | 'none';
  autoPlayNextSrc?: string | VideoSrc;
  videoRatio?: string;
  overlay?: Map<string, React.ReactNode>;

  danmakuOptions?: {
    fontSizeScale?: 0.75 | 1 | 1.25;
    opacity?: number;
    speed?: number;
    displayAreaRate?: 0.25 | 0.5 | 0.75 | 1;
    enableMultiTrack?: boolean;
  };

  onChangeDanmakuOptions?: (options: VideoPlayerProps['danmakuOptions']) => void;

  onSendDanmaku?: (danmaku: DanmakuAttr) => boolean;

  danmakuScheduler?: DanmakuScheduler;
  extra?: unknown;
}

export interface VideoPlayerPlugin {
  install?: (
    extraData: VideoPlayerExtraData,
    setExtraData: React.Dispatch<React.SetStateAction<VideoPlayerExtraData>>,
  ) => void;
}

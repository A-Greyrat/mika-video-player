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

export interface VideoPlayerPlugin {
  install?: (
    extraData: VideoPlayerExtraData,
    setExtraData: React.Dispatch<React.SetStateAction<VideoPlayerExtraData>>,
  ) => void;
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

  danmakuScheduler?: DanmakuScheduler;
  extra?: unknown;
}

export interface VideoPlayerProps extends Omit<React.VideoHTMLAttributes<HTMLVideoElement>, 'src'> {
  src?: string | VideoSrc;
  loader?: (videoElement: HTMLVideoElement) => void;
  toolbar?: ToolbarArea;
  shortcut?: Shortcut[];
  danmaku?: DanmakuAttr[];

  children?: React.ReactNode;
  enableDanmaku?: boolean;
  autoPlayNext?: 'replay' | 'next' | 'none';
  autoPlayNextSrc?: string | VideoSrc;
  videoRatio?: string;

  // 用于传递额外信息
  extra?: unknown;
  plugins?: VideoPlayerPlugin[];
}

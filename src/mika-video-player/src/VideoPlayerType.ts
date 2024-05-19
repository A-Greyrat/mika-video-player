import React from 'react';
import { Shortcut } from './Controller';
import { DanmakuAttr } from './Danmaku';

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
  loader?: (videoElement: HTMLVideoElement) => void;
  toolbar?: ToolbarArea;
  shortcut?: Shortcut[];
  danmaku?: DanmakuAttr[];

  children?: React.ReactNode;
  enableDanmaku?: boolean;

  // 用于传递额外信息
  extra?: unknown;
}

export interface VideoPlayerContextType {
  props: VideoPlayerProps;
  videoElement: HTMLVideoElement | null;
  containerElement: HTMLDivElement | null;
}

export const VideoPlayerContext = React.createContext<VideoPlayerContextType | null>(null);

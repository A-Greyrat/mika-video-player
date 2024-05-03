import React from "react";
import {Shortcut} from "./Controller";
import {DanmakuAttr} from "./Danmaku";

export type ToolbarArea = {
    left: React.ComponentType[];
    middle: React.ComponentType[];
    right: React.ComponentType[];
};

export interface VideoPlayerProps extends React.VideoHTMLAttributes<HTMLVideoElement> {
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

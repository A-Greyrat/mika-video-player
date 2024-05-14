import React from "react";
import {VideoPlayerProps} from "./VideoPlayerType.ts";

export * from './Controller';
export * from './Danmaku';
export * from './VideoPlayerType.ts';

export declare const VideoPlayer: React.ForwardRefExoticComponent<VideoPlayerProps & React.RefAttributes<HTMLVideoElement>>;
export default VideoPlayer;

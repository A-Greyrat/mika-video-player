import { VideoPlayerExtraData, VideoPlayerPlugin } from '../../VideoPlayerType.ts';
import React from 'react';
import { Shortcut } from '../../Controller';
import ForwardInfo from './ForwardInfo.tsx';

let arrowRightTimer: number | undefined;
let inForward: boolean = false;
let originalPlaybackRate: number | undefined;

const revertPlaybackRate = (
  videoElement: HTMLVideoElement,
  setExtraData: React.Dispatch<React.SetStateAction<VideoPlayerExtraData>>,
) => {
  if (videoElement) {
    !inForward && (videoElement.currentTime += 5);
    videoElement.playbackRate = originalPlaybackRate || 1;
  }

  arrowRightTimer && clearTimeout(arrowRightTimer);
  arrowRightTimer = undefined;
  inForward = false;

  setExtraData((e) => {
    if (e.overlay?.has('forwardInfo')) {
      e.overlay?.delete('forwardInfo');
    }

    return { ...e };
  });
};

const forwardShortcuts: Shortcut[] = [
  {
    key: 'ArrowRight',
    type: 'keydown',
    root: 'document',
    callback: (extraData, setExtraData, e) => {
      e?.preventDefault();
      const { videoElement, containerElement } = extraData;
      if (!videoElement || !containerElement) return;

      if (inForward) {
        clearTimeout(arrowRightTimer);
        arrowRightTimer = setTimeout(() => {
          revertPlaybackRate(videoElement, setExtraData);
        }, 300);
        return;
      }

      arrowRightTimer = setTimeout(() => {
        originalPlaybackRate = videoElement?.playbackRate;
        if (videoElement) videoElement.playbackRate = 3;
        arrowRightTimer = undefined;
        inForward = true;
        setExtraData((e) => {
          if (!e.overlay?.has('forwardInfo')) {
            e.overlay?.set('forwardInfo', <ForwardInfo />);
          }

          return { ...e };
        });
      }, 300);
    },
  },
  {
    key: 'ArrowRight',
    type: 'keyup',
    root: 'document',
    callback: (extraData, setExtraData, e) => {
      e?.preventDefault();
      const { videoElement } = extraData;

      if (videoElement) revertPlaybackRate(videoElement, setExtraData);
    },
  },
];

const TripleSpeedForward: VideoPlayerPlugin = {
  install(_extraData: VideoPlayerExtraData, setExtraData: React.Dispatch<React.SetStateAction<VideoPlayerExtraData>>) {
    setExtraData((e) => {
      const newShortcuts = e.shortcut?.filter((s) => s.key !== 'ArrowRight') || [];
      newShortcuts.push(...forwardShortcuts);

      return { ...e, shortcut: newShortcuts };
    });
  },
};

export default TripleSpeedForward;

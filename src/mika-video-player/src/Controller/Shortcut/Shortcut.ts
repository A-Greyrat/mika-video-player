import React, { useCallback, useEffect, useRef } from 'react';
import { isMobile } from '../../Utils';
import { useStore } from 'mika-store';
import { showPanel } from '../../Hooks';

export type ShortcutCallback = (
  extraData?: any,
  setExtraData?: React.Dispatch<React.SetStateAction<any>>,
  e?: Event | React.PointerEvent | React.MouseEvent | React.KeyboardEvent | React.TouchEvent,
) => void;

export type Shortcut = {
  key: string | number;
  type:
    | 'keydown'
    | 'keyup'
    | 'pointerdown'
    | 'pointerup'
    | 'mousedown'
    | 'mouseup'
    | 'touchstart'
    | 'touchend'
    | 'touchcancel'
    | 'touchmove';
  callback: ShortcutCallback;

  root?: 'document' | 'video';
};

let showControllerTimer: number | undefined;
let doubleClickTimer: number | undefined;

let volumePanelElement: HTMLDivElement | null = null;
let volumePanelTimer: number | undefined;

let arrowRightTimer: number | undefined;
let inForward: boolean = false;
let originalPlaybackRate: number | undefined;
let arrowRightPanelElement: HTMLDivElement | null = null;

const showVolumeChangePanel = (containerElement: HTMLDivElement, videoElement: HTMLVideoElement) => {
  if (volumePanelTimer) {
    clearTimeout(volumePanelTimer);

    volumePanelTimer = setTimeout(() => {
      volumePanelElement?.remove();
      volumePanelTimer = undefined;
    }, 1500);

    volumePanelElement!.textContent = '音量 ' + Math.round(videoElement.volume * 100).toString() + '%';
    return;
  }

  volumePanelElement?.remove();
  volumePanelElement = showPanel(
    containerElement,
    {
      width: '120px',
      height: '30px',
      backgroundColor: 'rgba(0, 0, 0, 0.65)',
      color: 'white',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      borderRadius: '5px',
      lineHeight: '1',
      fontSize: '1.2rem',
      padding: '0.4rem',
    },
    (e) => {
      e.textContent = '音量 ' + Math.round(videoElement.volume * 100).toString() + '%';
    },
  );

  volumePanelTimer = setTimeout(() => {
    volumePanelElement?.remove();
    volumePanelTimer = undefined;
  }, 1500);
};

const revertPlaybackRate = (videoElement: HTMLVideoElement) => {
  if (videoElement) {
    !inForward && (videoElement.currentTime += 5);
    videoElement.playbackRate = originalPlaybackRate || 1;
  }

  arrowRightTimer && clearTimeout(arrowRightTimer);
  arrowRightTimer = undefined;
  inForward = false;
  arrowRightPanelElement?.remove();
  arrowRightPanelElement = null;
};

export const defaultShortcuts: Shortcut[] = [
  {
    key: ' ',
    type: 'keydown',
    root: 'document',
    callback: (extraData, _setExtraData, e) => {
      e?.preventDefault();
      const { videoElement } = extraData;

      if (videoElement && videoElement.readyState > 2) {
        if (videoElement.paused) videoElement.play().catch(undefined);
        else videoElement.pause();
      }
    },
  },
  {
    key: 'f',
    type: 'keydown',
    root: 'document',
    callback: (extraData) => {
      const { containerElement } = extraData;

      if (containerElement) {
        if (document.fullscreenElement !== null) document.exitFullscreen().catch(undefined);
        else containerElement.requestFullscreen().catch(undefined);
      }
    },
  },
  {
    key: 'ArrowLeft',
    type: 'keydown',
    root: 'document',
    callback: (extraData, _setExtraData, e) => {
      e?.preventDefault();
      const { videoElement } = extraData;
      if (videoElement) videoElement.currentTime -= 5;
    },
  },
  {
    key: 'ArrowRight',
    type: 'keydown',
    root: 'document',
    callback: (extraData, _setExtraData, e) => {
      e?.preventDefault();
      const { videoElement, containerElement } = extraData;
      if (inForward) {
        clearTimeout(arrowRightTimer);
        arrowRightTimer = setTimeout(() => {
          revertPlaybackRate(videoElement);
        }, 300);
        return;
      }

      // TODO: Fix this, when keyup event is not triggered, it occurs a bug
      arrowRightTimer = setTimeout(() => {
        originalPlaybackRate = videoElement?.playbackRate;
        if (videoElement) videoElement.playbackRate = 3;
        arrowRightTimer = undefined;
        inForward = true;
        arrowRightPanelElement = showPanel(
          containerElement,
          {
            width: '5.5rem',
            height: '1.5rem',
            backgroundColor: 'rgba(0, 0, 0, 0.65)',
            color: 'white',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            borderRadius: '5px',
            fontSize: '1.2rem',
            padding: '0.4rem',
            top: '15%',
            transform: 'translate(-50%, 0)',
          },
          (e) => {
            e.textContent = '快进 3x';
          },
        );
      }, 300);
    },
  },
  {
    key: 'ArrowRight',
    type: 'keyup',
    root: 'document',
    callback: (extraData, _setExtraData, e) => {
      e?.preventDefault();
      const { videoElement } = extraData;

      revertPlaybackRate(videoElement);
    },
  },
  {
    key: 'm',
    type: 'keydown',
    root: 'document',
    callback: (extraData) => {
      const { videoElement } = extraData;
      if (videoElement) videoElement.muted = !videoElement.muted;
    },
  },
  {
    key: 'ArrowUp',
    type: 'keydown',
    root: 'video',
    callback: (extraData, _setExtraData, e) => {
      e?.preventDefault();
      const { videoElement, containerElement } = extraData;

      if (videoElement) {
        videoElement.volume = Math.min(1, videoElement.volume + 0.1);
        showVolumeChangePanel(containerElement, videoElement);
      }
    },
  },
  {
    key: 'ArrowDown',
    type: 'keydown',
    root: 'video',
    callback: (extraData, _setExtraData, e) => {
      e?.preventDefault();
      const { videoElement, containerElement } = extraData;

      if (videoElement) {
        videoElement.volume = Math.max(0, videoElement.volume - 0.1);
        showVolumeChangePanel(containerElement, videoElement);
      }
    },
  },
  {
    key: 0,
    type: 'mousedown',
    root: 'video',
    callback: (extraData) => {
      const defaultHideTime = 6000;
      const { videoElement, controllerElement } = extraData;

      if (isMobile()) {
        if (doubleClickTimer) {
          clearTimeout(doubleClickTimer);
          doubleClickTimer = undefined;

          if (videoElement) {
            if (videoElement.readyState >= 2) {
              if (videoElement.paused) videoElement.play().catch(undefined);
              else videoElement.pause();
            }
          }
        } else {
          let flag = true;
          if (showControllerTimer) {
            clearTimeout(showControllerTimer);
            showControllerTimer = undefined;
            controllerElement && controllerElement.classList.add('mika-video-player-controller-hidden');
            flag = false;
          }

          doubleClickTimer = setTimeout(() => {
            doubleClickTimer = undefined;

            if (flag) {
              controllerElement && controllerElement.classList.remove('mika-video-player-controller-hidden');
              showControllerTimer = setTimeout(() => {
                controllerElement && controllerElement.classList.add('mika-video-player-controller-hidden');
                showControllerTimer = undefined;
              }, defaultHideTime);
            }
          }, 200);
        }
      } else if (videoElement && videoElement.readyState >= 2) {
        if (videoElement.paused) videoElement.play().catch(undefined);
        else videoElement.pause();
      }
    },
  },
];

export const useShortcut = (
  shortcuts: Shortcut[],
  videoElement?: HTMLVideoElement | null,
  containerElement?: HTMLDivElement | null,
  controllerElement?: HTMLDivElement | null,
) => {
  const videoEventMapRef = useRef<
    Map<string, (e: Event | React.PointerEvent | React.MouseEvent | React.KeyboardEvent | React.TouchEvent) => void>
  >(new Map());

  const [extraData, setExtraData] = useStore<any>('mika-video-extra-data');

  useEffect(() => {
    const shortcutMap = new Map<string, Map<string, Map<string | number, Shortcut>>>();
    const uninstallList: (() => void)[] = [];
    videoEventMapRef.current.clear();

    shortcuts.forEach((shortcut) => {
      if (!shortcutMap.has(shortcut.root || 'document')) shortcutMap.set(shortcut.root || 'document', new Map());

      const shortcutList = shortcutMap.get(shortcut.root || 'document')!;
      if (!shortcutList.has(shortcut.type)) shortcutList.set(shortcut.type, new Map());

      const shortcutType = shortcutList.get(shortcut.type)!;
      shortcutType.set(shortcut.key, shortcut);
    });

    for (const [root, shortcutList] of shortcutMap) {
      const rootElement = root === 'document' ? document : root === 'video' ? containerElement : undefined;
      for (const [type, map] of shortcutList) {
        const callback = (
          e: Event | React.PointerEvent | React.MouseEvent | React.KeyboardEvent | React.TouchEvent,
        ) => {
          if (
            rootElement === document &&
            e.target !== document.body &&
            e.target !== controllerElement &&
            e.target !== containerElement
          )
            return;

          const key = 'key' in e ? e.key : 'button' in e ? e.button : undefined;
          const isTouchEvent = 'touches' in e;
          const isKeyEvent = key !== undefined && (typeof key === 'string' || typeof key === 'number');

          if (isTouchEvent && map.has('touch')) {
            e.stopPropagation();
            map.get('touch')!.callback(extraData, setExtraData, e);
          } else if (isKeyEvent && map.has(key)) {
            e.stopPropagation();
            map.get(key)!.callback(extraData, setExtraData, e);
          }
        };

        if (root === 'document') rootElement && rootElement.addEventListener(type, callback);
        else videoEventMapRef.current.set(type, callback);

        uninstallList.push(() => rootElement && rootElement.removeEventListener(type, callback));
      }
    }

    return () => {
      uninstallList.forEach((uninstall) => uninstall());
    };
  }, [shortcuts, videoElement, containerElement, controllerElement]);

  useEffect(() => {
    // 阻止使用空格键以及方向键时的默认滚动行为
    const handlePreventDefault = (e: KeyboardEvent) => {
      if (
        (e.target === containerElement || e.target === controllerElement) &&
        (e.key === ' ' ||
          e.key === 'ArrowUp' ||
          e.key === 'ArrowDown' ||
          e.key === 'ArrowLeft' ||
          e.key === 'ArrowRight')
      ) {
        e.preventDefault();
      }
    };

    document.addEventListener('keydown', handlePreventDefault, { capture: true });

    return () => {
      document.removeEventListener('keydown', handlePreventDefault);
    };
  }, [containerElement, controllerElement]);

  const onPointerDown = useCallback((e: React.PointerEvent) => {
    const pointerdown = videoEventMapRef.current.get('pointerdown');
    pointerdown && pointerdown(e);
  }, []);

  const onPointerUp = useCallback((e: React.PointerEvent) => {
    const pointerup = videoEventMapRef.current.get('pointerup');
    pointerup && pointerup(e);
  }, []);

  const onKeyDown = useCallback((e: React.KeyboardEvent) => {
    const keydown = videoEventMapRef.current.get('keydown');
    keydown && keydown(e);
  }, []);

  const onKeyUp = useCallback((e: React.KeyboardEvent) => {
    const keyup = videoEventMapRef.current.get('keyup');
    keyup && keyup(e);
  }, []);

  const onMouseDown = useCallback((e: React.MouseEvent) => {
    const mousedown = videoEventMapRef.current.get('mousedown');
    mousedown && mousedown(e);
  }, []);

  const onMouseUp = useCallback((e: React.MouseEvent) => {
    const mouseup = videoEventMapRef.current.get('mouseup');
    mouseup && mouseup(e);
  }, []);

  const onTouchStart = useCallback((e: React.TouchEvent) => {
    const touchstart = videoEventMapRef.current.get('touchstart');
    touchstart && touchstart(e);
  }, []);

  const onTouchEnd = useCallback((e: React.TouchEvent) => {
    const touchend = videoEventMapRef.current.get('touchend');
    touchend && touchend(e);
  }, []);

  const onTouchCancel = useCallback((e: React.TouchEvent) => {
    const touchcancel = videoEventMapRef.current.get('touchcancel');
    touchcancel && touchcancel(e);
  }, []);

  const onTouchMove = useCallback((e: React.TouchEvent) => {
    const touchmove = videoEventMapRef.current.get('touchmove');
    touchmove && touchmove(e);
  }, []);

  return {
    onPointerDown,
    onKeyDown,
    onPointerUp,
    onKeyUp,
    onMouseDown,
    onMouseUp,
    onTouchStart,
    onTouchEnd,
    onTouchCancel,
    onTouchMove,
  } as const;
};

export const useStopPropagation = () => {
  const onPointerDown = useCallback((e: React.PointerEvent) => {
    e.stopPropagation();
  }, []);

  const onPointerUp = useCallback((e: React.PointerEvent) => {
    e.stopPropagation();
  }, []);

  const onKeyDown = useCallback((e: React.KeyboardEvent) => {
    e.stopPropagation();
  }, []);

  const onKeyUp = useCallback((e: React.KeyboardEvent) => {
    e.stopPropagation();
  }, []);

  const onMouseDown = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
  }, []);

  const onMouseUp = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
  }, []);

  const onTouchStart = useCallback((e: React.TouchEvent) => {
    e.stopPropagation();
  }, []);

  const onTouchEnd = useCallback((e: React.TouchEvent) => {
    e.stopPropagation();
  }, []);

  const onTouchCancel = useCallback((e: React.TouchEvent) => {
    e.stopPropagation();
  }, []);

  const onTouchMove = useCallback((e: React.TouchEvent) => {
    e.stopPropagation();
  }, []);

  return {
    onPointerDown,
    onKeyDown,
    onPointerUp,
    onKeyUp,
    onMouseDown,
    onMouseUp,
    onTouchStart,
    onTouchEnd,
    onTouchCancel,
    onTouchMove,
  } as const;
};

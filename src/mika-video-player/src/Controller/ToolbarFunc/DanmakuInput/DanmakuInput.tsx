import React, { memo, useEffect } from 'react';
import { VideoPlayerExtraData } from '../../../VideoPlayerType.ts';
import { useStore } from 'mika-store';

import './DanmakuInput.less';

const DanmakuInput = memo(() => {
  const [{ danmakuScheduler, onSendDanmaku, videoElement, containerElement }] =
    useStore<VideoPlayerExtraData>('mika-video-extra-data');
  const containerRef = React.useRef<HTMLDivElement>(null);
  const resizeObserver = React.useRef<ResizeObserver | null>(null);
  const inputRef = React.useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (containerRef.current && containerElement) {
      resizeObserver.current = new ResizeObserver(() => {
        containerRef.current!.style.setProperty(
          '--mika-video-player-danmaku-input-display',
          containerElement.clientWidth > 768 ? 'flex' : 'none',
        );
      });
      resizeObserver.current.observe(containerElement);
      return () => {
        resizeObserver.current?.disconnect();
      };
    }
  }, [containerElement]);

  return (
    <div className='mika-video-player-danmaku-input' ref={containerRef}>
      <input
        ref={inputRef}
        type='text'
        placeholder='输入弹幕'
        onKeyDown={(e: React.KeyboardEvent<HTMLInputElement>) => {
          if (e.key === 'Enter') {
            e.preventDefault();
            const currentTime = videoElement?.currentTime || 0;
            // 延迟0.1秒发送弹幕，防止弹幕被发送后Scheduler的指针超过当前时间
            const delay: number = 0.1;
            const danmaku = {
              begin: currentTime + delay,
              mode: 1,
              size: 25,
              color: '#fff',
              text: e.currentTarget.value,
              style: {
                border: '1px solid black',
              },
            };

            if (!onSendDanmaku || onSendDanmaku(danmaku)) {
              danmakuScheduler?.addDanmaku([danmaku]);
              e.currentTarget.value = '';
            }
          }
        }}
      />
      <button
        onClick={() => {
          const currentTime = videoElement?.currentTime || 0;
          const danmaku = {
            begin: currentTime,
            mode: 1,
            size: 25,
            color: '#fff',
            text: inputRef.current?.value || '',
            style: {
              border: '1px solid black',
            },
          };

          if (!onSendDanmaku || onSendDanmaku(danmaku)) {
            danmakuScheduler?.addDanmaku([danmaku]);
            inputRef.current!.value = '';
          }
        }}
      >
        发送
      </button>
    </div>
  );
});

DanmakuInput.displayName = 'DanmakuInput';
export default DanmakuInput;

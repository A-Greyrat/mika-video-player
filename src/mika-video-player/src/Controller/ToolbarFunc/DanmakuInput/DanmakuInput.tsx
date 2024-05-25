import React, { memo, useEffect } from 'react';
import { VideoPlayerExtraData } from '../../../VideoPlayerType.ts';
import { useStore } from 'mika-store';

import './DanmakuInput.less';

const DanmakuInput = memo(() => {
  const [{ danmakuScheduler, onSendDanmaku, videoElement, containerElement }] =
    useStore<VideoPlayerExtraData>('mika-video-extra-data');
  const containerRef = React.useRef<HTMLDivElement>(null);
  const resizeObserver = React.useRef<ResizeObserver | null>(null);
  const [value, setValue] = React.useState('');

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
        value={value}
        type='text'
        placeholder='输入弹幕'
        onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
          setValue(e.currentTarget.value);
        }}
        onKeyDown={(e: React.KeyboardEvent<HTMLInputElement>) => {
          if (e.key === 'Enter') {
            const currentTime = videoElement?.currentTime || 0;
            // 延迟0.5秒发送弹幕，防止弹幕被发送后Scheduler的指针超过当前时间
            const delay: number = 0.5;
            const danmaku = {
              begin: currentTime + delay,
              mode: 1,
              size: 25,
              color: '#fff',
              text: value,
              ignoreAllocCheck: true,
              style: {
                border: '1px solid black',
              },
            };

            if (!onSendDanmaku || onSendDanmaku(danmaku)) {
              danmakuScheduler?.addDanmaku([danmaku]);
            }

            setValue('');
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
            ignoreAllocCheck: true,
            color: '#fff',
            text: value,
            style: {
              border: '1px solid black',
            },
          };

          if (!onSendDanmaku || onSendDanmaku(danmaku)) {
            danmakuScheduler?.addDanmaku([danmaku]);
          }

          setValue('');
        }}
      >
        发送
      </button>
    </div>
  );
});

DanmakuInput.displayName = 'DanmakuInput';
export default DanmakuInput;

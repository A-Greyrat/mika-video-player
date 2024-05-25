import { memo, useCallback, useEffect, useState } from 'react';
import FuncButton from '../FuncButton/FuncButton.tsx';
import SettingIcon from '../Icon/SettingIcon.tsx';

import { useStore } from 'mika-store';
import { VideoPlayerExtraData } from '../../../VideoPlayerType.ts';
import { Range } from '../../../Component';

import './SettingButton.less';

const danmakuSpeedOptions = [0.5, 1, 1.5, 2, 2.5];

const SettingPanel = memo(() => {
  const [{ danmakuScheduler, enableDanmaku, danmakuOptions, onChangeDanmakuOptions }, setExtraData] =
    useStore<VideoPlayerExtraData>('mika-video-extra-data');
  const [opacity, setOpacity] = useState(100);
  const [danmakuCount, setDanmakuCount] = useState(0);
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [_, forceUpdate] = useState(0);

  const handleOpacityChange = useCallback(
    (value: number) => {
      setOpacity(Math.floor(value));
      onChangeDanmakuOptions?.({
        fontSizeScale: (danmakuScheduler?.danmakuManager?.getFontSizeScale() as 0.75 | 1 | 1.25) || 1,
        displayAreaRate: (danmakuScheduler?.danmakuManager?.getDisplayAreaRate() as 0.25 | 0.5 | 0.75 | 1) || 1,
        enableMultiTrack: danmakuScheduler?.danmakuManager?.getEnableMultiTrack() || false,
        opacity: Math.floor(value),
        speed: parseFloat(danmakuScheduler?.danmakuManager?.getDanmakuSpeed().toString() || '1'),
      });

      danmakuScheduler?.danmakuManager?.setDanmakuOption({
        opacity: `${Math.floor(value)}%`,
      });
    },
    [setOpacity, danmakuScheduler],
  );

  useEffect(() => {
    const interval = setInterval(() => {
      setDanmakuCount(danmakuScheduler?.getCurrentDanmakuCount() || 0);
    }, 200);

    return () => {
      clearInterval(interval);
    };
  }, [danmakuScheduler]);

  useEffect(() => {
    if (danmakuScheduler?.danmakuManager) {
      danmakuScheduler.danmakuManager.setDanmakuOption({
        opacity: `${Math.floor((danmakuOptions?.opacity || 1) * 100)}%`,
      });

      danmakuScheduler.danmakuManager.setDanmakuSpeed(danmakuOptions?.speed || 1);
      danmakuScheduler.danmakuManager.setFontSizeScale(danmakuOptions?.fontSizeScale || 1);
      danmakuScheduler.danmakuManager.setDisplayAreaRate(danmakuOptions?.displayAreaRate || 1);
      danmakuScheduler.danmakuManager.setEnableMultiTrack(danmakuOptions?.enableMultiTrack || false);

      setOpacity(parseFloat(danmakuScheduler?.danmakuManager?.getDanmakuOption().opacity));
    }
  }, [danmakuScheduler]);

  return (
    <div className='mika-video-player-setting-panel-wrapper'>
      <div className='mika-video-player-setting-panel-title'>
        <p>设置</p>
        <div
          className='mika-video-player-setting-panel-close'
          onClick={() => {
            setExtraData((e) => {
              const overlay = e?.overlay;
              overlay?.delete('setting');
              return { ...e, overlay };
            });
          }}
        >
          x
        </div>
      </div>
      <div className='mika-video-player-setting-panel-item'>
        <p>弹幕开关</p>
        <input type='checkbox' checked={enableDanmaku} onChange={() => {}} />
        <div
          className='mika-video-player-setting-panel-checkmark'
          onClick={() => {
            setExtraData((data) => {
              data.enableDanmaku = !enableDanmaku;
              return { ...data };
            });
          }}
        >
          <div className='mika-video-player-setting-panel-checkmark-inner' />
        </div>
      </div>
      <div className='mika-video-player-setting-panel-item'>
        <p>弹幕速度</p>
        <select
          defaultValue={danmakuOptions?.speed || 1}
          onChange={(e) => {
            onChangeDanmakuOptions?.({
              fontSizeScale: (danmakuScheduler?.danmakuManager?.getFontSizeScale() as 0.75 | 1 | 1.25) || 1,
              displayAreaRate: (danmakuScheduler?.danmakuManager?.getDisplayAreaRate() as 0.25 | 0.5 | 0.75 | 1) || 1,
              enableMultiTrack: danmakuScheduler?.danmakuManager?.getEnableMultiTrack() || false,
              opacity: parseFloat(danmakuScheduler?.danmakuManager?.getDanmakuOption().opacity || '1'),
              speed: parseFloat(e.target.value),
            });
            danmakuScheduler?.danmakuManager?.setDanmakuSpeed(parseFloat(e.target.value));
          }}
        >
          {danmakuSpeedOptions.map((option) => (
            <option key={option} value={option}>
              {option}x
            </option>
          ))}
        </select>
      </div>
      <div className='mika-video-player-setting-panel-item'>
        <p>弹幕透明度</p>
        <Range
          style={{
            width: '50%',
            height: '4px',
          }}
          min={0}
          max={100}
          value={opacity}
          onChange={handleOpacityChange}
          step={1}
        />
        <p
          style={{
            width: '4rem',
            textAlign: 'right',
          }}
        >
          {Math.floor(opacity)}%
        </p>
      </div>
      <div className='mika-video-player-setting-panel-item'>
        <p>弹幕字体大小</p>
        <select
          defaultValue={danmakuOptions?.fontSizeScale || 1}
          onChange={(e) => {
            onChangeDanmakuOptions?.({
              fontSizeScale: parseFloat(e.target.value) as unknown as 0.75 | 1 | 1.25,
              displayAreaRate: (danmakuScheduler?.danmakuManager?.getDisplayAreaRate() as 0.25 | 0.5 | 0.75 | 1) || 1,
              enableMultiTrack: danmakuScheduler?.danmakuManager?.getEnableMultiTrack() || false,
              opacity: parseFloat(danmakuScheduler?.danmakuManager?.getDanmakuOption().opacity || '1'),
              speed: parseFloat(danmakuScheduler?.danmakuManager?.getDanmakuSpeed().toString() || '1'),
            });
            danmakuScheduler?.danmakuManager?.setFontSizeScale(parseFloat(e.target.value));
          }}
        >
          <option value={0.75}>小</option>
          <option value={1}>中</option>
          <option value={1.25}>大</option>
        </select>
      </div>
      <div className='mika-video-player-setting-panel-item'>
        <p>弹幕显示区域</p>
        <select
          defaultValue={danmakuOptions?.displayAreaRate || 1}
          onChange={(e) => {
            onChangeDanmakuOptions?.({
              fontSizeScale: (danmakuScheduler?.danmakuManager?.getFontSizeScale() as 0.75 | 1 | 1.25) || 1,
              displayAreaRate: parseFloat(e.target.value) as 0.25 | 0.5 | 0.75 | 1,
              enableMultiTrack: danmakuScheduler?.danmakuManager?.getEnableMultiTrack() || false,
              opacity: parseFloat(danmakuScheduler?.danmakuManager?.getDanmakuOption().opacity || '1'),
              speed: parseFloat(danmakuScheduler?.danmakuManager?.getDanmakuSpeed().toString() || '1'),
            });
            danmakuScheduler?.danmakuManager?.setDisplayAreaRate(parseFloat(e.target.value) as 0.25 | 0.5 | 0.75 | 1);
          }}
        >
          <option value={0.25}>小</option>
          <option value={0.5}>中</option>
          <option value={0.75}>大</option>
          <option value={1}>全屏</option>
        </select>
      </div>
      <div className='mika-video-player-setting-panel-item'>
        <p>允许弹幕重叠</p>
        <input type='checkbox' checked={danmakuScheduler?.danmakuManager?.getEnableMultiTrack()} onChange={() => {}} />
        <div
          className='mika-video-player-setting-panel-checkmark'
          onClick={() => {
            onChangeDanmakuOptions?.({
              fontSizeScale: (danmakuScheduler?.danmakuManager?.getFontSizeScale() as 0.75 | 1 | 1.25) || 1,
              displayAreaRate: (danmakuScheduler?.danmakuManager?.getDisplayAreaRate() as 0.25 | 0.5 | 0.75 | 1) || 1,
              enableMultiTrack: !danmakuScheduler?.danmakuManager?.getEnableMultiTrack(),
              opacity: parseFloat(danmakuScheduler?.danmakuManager?.getDanmakuOption().opacity || '1'),
              speed: parseFloat(danmakuScheduler?.danmakuManager?.getDanmakuSpeed().toString() || '1'),
            });
            danmakuScheduler?.danmakuManager?.setEnableMultiTrack(
              !danmakuScheduler?.danmakuManager?.getEnableMultiTrack(),
            );
            forceUpdate((v) => v + 1);
          }}
        >
          <div className='mika-video-player-setting-panel-checkmark-inner' />
        </div>
      </div>
      <div className='mika-video-player-setting-panel-item'>
        <p>当前弹幕数：</p>
        <p>{danmakuCount}</p>
      </div>
    </div>
  );
});

const SettingButton = memo(() => {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [_, setExtraData] = useStore<VideoPlayerExtraData>('mika-video-extra-data');

  return (
    <div className='mika-video-player-toolbar-function-Setting-button-container'>
      <FuncButton
        icon={<SettingIcon />}
        onClick={() => {
          setExtraData((e) => {
            const overlay = e?.overlay;
            if (overlay?.has('setting')) {
              overlay.delete('setting');
            } else {
              overlay?.set('setting', <SettingPanel />);
            }
            return { ...e, overlay };
          });
        }}
      />
    </div>
  );
});

SettingButton.displayName = 'SettingButton';
export default SettingButton;

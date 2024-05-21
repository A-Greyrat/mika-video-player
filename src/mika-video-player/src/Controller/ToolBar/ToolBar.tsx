import React, { forwardRef, memo, useImperativeHandle } from 'react';
import ProgressBar from '../ProgressBar/ProgressBar';
import {
  QualityButton,
  FullScreenButton,
  PlayButton,
  SpeedButton,
  ToolbarTimer,
  VolumeButton,
  SettingButton,
} from '../ToolbarFunc';
import { useStopPropagation } from '../Shortcut/Shortcut.tsx';
import { useStore } from 'mika-store';
import { VideoPlayerExtraData } from '../../VideoPlayerType.ts';
import DanmakuInput from '../ToolbarFunc/DanmakuInput/DanmakuInput.tsx';

import './ToolBar.less';

export const DefaultToolbarArea = {
  left: [PlayButton, ToolbarTimer],
  middle: [DanmakuInput],
  right: [SettingButton, QualityButton, SpeedButton, VolumeButton, FullScreenButton],
};

const ToolBar = memo(
  forwardRef((_props: NonNullable<unknown>, ref: React.Ref<HTMLDivElement>) => {
    const [{ toolbar }] = useStore<VideoPlayerExtraData>('mika-video-extra-data');
    const toolbarRef = React.useRef<HTMLDivElement>(null);
    useImperativeHandle(ref, () => toolbarRef.current!);

    const { left: leftArea, middle: middleArea, right: rightArea } = toolbar || DefaultToolbarArea;

    const stopPropagation = useStopPropagation();

    return (
      <>
        <div className='mika-video-player-toolbar-mask' />
        <div ref={toolbarRef} className='mika-video-player-toolbar' {...stopPropagation}>
          <ProgressBar />
          <div className='mika-video-player-toolbar-function-container'>
            <div className='mika-video-player-toolbar-function-container-left-area'>
              {leftArea?.map((item: any, index: React.Key | null | undefined) => (
                <React.Fragment key={index}>{React.createElement(item)}</React.Fragment>
              ))}
            </div>
            <div className='mika-video-player-toolbar-function-container-middle-area'>
              {middleArea?.map((item: any, index: React.Key | null | undefined) => (
                <React.Fragment key={index}>{React.createElement(item)}</React.Fragment>
              ))}
            </div>
            <div className='mika-video-player-toolbar-function-container-right-area'>
              {rightArea?.map((item: any, index: React.Key | null | undefined) => (
                <React.Fragment key={index}>{React.createElement(item)}</React.Fragment>
              ))}
            </div>
          </div>
        </div>
      </>
    );
  }),
);

ToolBar.displayName = 'ToolBar';
export default ToolBar;

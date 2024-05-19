import { memo, useCallback, useEffect, useState } from 'react';
import VolumeIcon from '../Icon/VolumeIcon';
import FuncButton from '../FuncButton/FuncButton';
import { Dropdown, Range } from '../../../Component';

import './VolumeButton.less';
import { useStore } from 'mika-store';

const VolumeButton = memo(() => {
  const [isMuted, setIsMuted] = useState(false);
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [_, forceUpdate] = useState(0);
  const [{ videoElement }] = useStore<any>('mika-video-extra-data');

  useEffect(() => {
    if (!videoElement) return;

    const handleVolumeChange = () => {
      setIsMuted(videoElement.volume === 0 || videoElement.muted);
      forceUpdate((value) => value + 1);
    };

    videoElement.addEventListener('volumechange', handleVolumeChange);
    return () => {
      videoElement.removeEventListener('volumechange', handleVolumeChange);
    };
  }, [videoElement]);

  const onClick = useCallback(() => {
    if (!videoElement) return;

    videoElement.muted = !videoElement.muted;
    setIsMuted(videoElement.muted || videoElement.volume === 0);
  }, [videoElement]);

  const onChange = useCallback(
    (value: number) => {
      if (!videoElement) return;

      forceUpdate((value) => value + 1);
      videoElement.volume = value / 100;
      videoElement.muted = false;
    },
    [videoElement],
  );

  return (
    <Dropdown
      menu={
        <div className='mika-video-player-toolbar-func-volume-dropdown'>
          <div className='mika-video-player-toolbar-func-volume-value'>
            {isMuted ? 0 : Math.round((videoElement?.volume ?? 0) * 100)}
          </div>
          <Range
            className='mika-video-player-toolbar-func-volume-slider'
            value={isMuted ? 0 : (videoElement?.volume ?? 0) * 100}
            max={100}
            onChange={onChange}
            width='3px'
            height='65px'
            thumbSize={12}
            orient='vertical'
          />
        </div>
      }
      className='mika-video-player-toolbar-func-volume'
      type='hover'
      direction='up'
      paddingTrigger={5}
    >
      <FuncButton
        icon={<VolumeIcon isMuted={isMuted} />}
        onClick={onClick}
        className='mika-video-player-toolbar-func-volume-button'
      />
    </Dropdown>
  );
});

VolumeButton.displayName = 'VolumeButton';
export default VolumeButton;

import React, { memo, useCallback, useContext, useEffect } from 'react';
import PlayIcon from '../Icon/PlayIcon';
import FuncButton from '../FuncButton/FuncButton';

import './PlayButton.less';
import { VideoPlayerContext } from '../../../VideoPlayerType';

const PlayButton = memo(() => {
  const videoElement = useContext(VideoPlayerContext)?.videoElement;
  const [isPlaying, setIsPlaying] = React.useState(false);

  const onClick = useCallback(() => {
    if (videoElement && videoElement.readyState > 2) {
      if (videoElement.paused) videoElement.play().catch(undefined);
      else videoElement.pause();
    }
  }, [videoElement]);

  useEffect(() => {
    if (videoElement) {
      const handlePlay = () => setIsPlaying(!videoElement?.paused);
      videoElement.addEventListener('play', handlePlay);
      videoElement.addEventListener('pause', handlePlay);

      return () => {
        videoElement.removeEventListener('play', handlePlay);
        videoElement.removeEventListener('pause', handlePlay);
      };
    }
  }, [videoElement]);

  return (
    <FuncButton
      icon={<PlayIcon isPlaying={isPlaying} />}
      onClick={onClick}
      className='mika-video-player-toolbar-func-play-button'
    />
  );
});

PlayButton.displayName = 'PlayButton';
export default PlayButton;

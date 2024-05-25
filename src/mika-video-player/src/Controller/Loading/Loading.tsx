import { memo, useEffect, useState } from 'react';

import './Loading.less';
import { useStore } from 'mika-store';
import { VideoPlayerExtraData, VideoSrc } from '../../VideoPlayerType.ts';

const Loading = memo(() => {
  const [{ videoElement, src }] = useStore<VideoPlayerExtraData>('mika-video-extra-data');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let timer: number | undefined;

    const handleCanPlay = () => {
      timer && clearTimeout(timer);
      setLoading(false);
    };

    const handleWaiting = () => {
      timer && clearTimeout(timer);
      timer = setTimeout(() => {
        setLoading(true);
      }, 300);
    };

    videoElement?.addEventListener('canplay', handleCanPlay);
    videoElement?.addEventListener('waiting', handleWaiting);
    videoElement?.addEventListener('seeking', handleWaiting);
    videoElement?.addEventListener('seeked', handleCanPlay);
    videoElement?.addEventListener('loadeddata', handleCanPlay);

    return () => {
      videoElement?.removeEventListener('canplay', handleCanPlay);
      videoElement?.removeEventListener('waiting', handleWaiting);
      videoElement?.removeEventListener('loadeddata', handleCanPlay);
      videoElement?.removeEventListener('seeking', handleWaiting);
      videoElement?.removeEventListener('seeked', handleCanPlay);
    };
  }, [videoElement]);

  if (!loading || !src || !(src as VideoSrc).srcs?.[(src as VideoSrc)?.default ?? 0]?.url) {
    return null;
  }

  return (
    <div className='mika-video-player-loading'>
      <div className='mika-video-player-loading-spinner' />
      <p>少女祈祷中</p>
    </div>
  );
});

Loading.displayName = 'Loading';
export default Loading;

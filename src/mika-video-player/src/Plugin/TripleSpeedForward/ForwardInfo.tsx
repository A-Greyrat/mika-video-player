import { memo } from 'react';
import { useStore } from 'mika-store';
import { VideoPlayerExtraData } from '../../VideoPlayerType.ts';

const ForwardInfo = memo(() => {
  const [{ extra }] = useStore<VideoPlayerExtraData>('mika-video-extra-data');

  if (!(extra as { showForwardInfo: boolean })?.showForwardInfo) return null;

  return (
    <div
      style={{
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
        position: 'absolute',
        top: '15%',
        left: '50%',
        transform: 'translate(-50%, 0)',
      }}
    >
      快进 3x
    </div>
  );
});

export default ForwardInfo;

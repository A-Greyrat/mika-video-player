import { memo, useEffect, useRef, useState } from 'react';

const VolumeChangeInfo = memo(({videoElement}: { videoElement?: HTMLVideoElement | null }) => {
  const [volume, setVolume] = useState(videoElement?.volume || 0);
  const [show, setShow] = useState(false);
  const timerRef = useRef<number | undefined>(undefined);

  useEffect(() => {
    let volumePanelTimer = timerRef.current;

    const handleVolumeChange = () => {
      setVolume(videoElement?.volume || 0);
      setShow(true);

      volumePanelTimer && clearTimeout(volumePanelTimer);
      volumePanelTimer = setTimeout(() => {
        setShow(false);
      }, 1500);
    };

    videoElement?.addEventListener('volumechange', handleVolumeChange);

    return () => {
      videoElement?.removeEventListener('volumechange', handleVolumeChange);
    };
  }, [videoElement]);

  if (!show) return null;

  return (
    <div
      style={{
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
        position: 'absolute',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
      }}
    >
      音量 {Math.round(volume * 100)}%
    </div>
  );
});

export default VolumeChangeInfo;

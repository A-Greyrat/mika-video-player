import React, { memo, useEffect, useRef } from 'react';
import { generateUniqueID } from '../../../Utils';
import lottie, { AnimationItem } from 'lottie-web';
import play from './playIcon.json';

const PlayIcon = memo((props: { isPlaying: boolean; style?: React.CSSProperties }) => {
  const iconId = useRef<string>(generateUniqueID());
  const [lottieItem, setLottieItem] = React.useState<AnimationItem>();

  useEffect(() => {
    const item = lottie.loadAnimation({
      container: document.querySelector(`#mika-video-player-play-icon-${iconId.current}`)!,
      renderer: 'svg',
      loop: false,
      autoplay: false,
      animationData: play,
      name: 'play',
    });
    item.setSpeed(2);
    item.playSegments([23, 24], true);

    const icon = document.querySelector(`#mika-video-player-play-icon-${iconId.current}`)?.querySelector('svg');
    icon?.setAttribute('viewBox', '350 350 800 800');

    setLottieItem(item);

    return () => {
      item?.destroy();
    };
  }, []);

  useEffect(() => {
    if (!lottieItem) return;

    if (!props.isPlaying) {
      lottieItem.playSegments([1, 24], true);
    } else {
      lottieItem.playSegments([32, 54], true);
    }
  }, [lottieItem, props.isPlaying]);

  return <div id={`mika-video-player-play-icon-${iconId.current}`} style={props.style} />;
});

PlayIcon.displayName = 'PlayIcon';
export default PlayIcon;

import React, { memo, useCallback, useEffect, useRef } from 'react';
import { generateUniqueID } from '../../../Utils';
import lottie, { AnimationItem } from 'lottie-web';
import settingIcon from './settingIcon.json';

const SettingIcon = memo((props: { style?: React.CSSProperties }) => {
  const iconId = useRef<string>(generateUniqueID());
  const [lottieItem, setLottieItem] = React.useState<AnimationItem>();
  const ref = useRef<HTMLDivElement>(null);

  const handleMouseEnter = useCallback(() => {
    lottieItem?.play();
  }, [lottieItem]);

  useEffect(() => {
    if (!ref.current) return;

    const item = lottie.loadAnimation({
      container: ref.current,
      renderer: 'svg',
      loop: true,
      autoplay: true,
      animationData: settingIcon,
      name: 'setting',
    });

    setLottieItem(item);

    return () => {
      item?.destroy();
    };
  }, []);

  return (
    <div
      id={`mika-video-player-setting-icon-${iconId.current}`}
      onMouseEnter={handleMouseEnter}
      style={props.style}
      ref={ref}
    />
  );
});

export default SettingIcon;

import { memo, useCallback, useContext } from 'react';
import FullScreenIcon from '../Icon/FullScreenIcon';
import FuncButton from '../FuncButton/FuncButton';
import { VideoPlayerContext } from '../../../VideoPlayerType';

const requestFullscreen = (element: Element) => {
  if (element.requestFullscreen) {
    element.requestFullscreen().catch(undefined);
  } else if ('webkitRequestFullscreen' in element) {
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-expect-error
    element.webkitRequestFullscreen().catch(undefined);
  } else if ('mozRequestFullScreen' in element) {
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-expect-error
    element.mozRequestFullScreen().catch(undefined);
  } else if ('msRequestFullscreen' in element) {
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-expect-error
    element.msRequestFullscreen().catch(undefined);
  }

  if ('lock' in window.screen.orientation) {
    try {
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-expect-error
      window.screen.orientation.lock('landscape').catch(() => {});
    } catch (e) {
      /* empty */
    }
  }
};

const FullScreenButton = memo(() => {
  const containerElement = useContext(VideoPlayerContext)?.containerElement;

  const fullscreen = useCallback(
    (e: { stopPropagation: () => void }) => {
      e.stopPropagation();

      if (containerElement) {
        if (document.fullscreenElement !== null) {
          window.screen.orientation.unlock();
          document.exitFullscreen().catch(undefined);
        } else requestFullscreen(containerElement);
      }
    },
    [containerElement],
  );

  return (
    <>
      <FuncButton icon={<FullScreenIcon />} onClick={fullscreen} />
    </>
  );
});

FullScreenButton.displayName = 'FullScreenButton';
export default FullScreenButton;

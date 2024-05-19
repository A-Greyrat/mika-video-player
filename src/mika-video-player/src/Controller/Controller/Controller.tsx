import React, { forwardRef, memo, useCallback, useImperativeHandle } from 'react';
import ToolBar from '../ToolBar/ToolBar';
import Loading from '../Loading/Loading';
import { isMobile } from '../../Utils';

import './Controller.less';

const Controller = memo(
  forwardRef((_props: NonNullable<unknown>, ref: React.Ref<HTMLDivElement>) => {
    const controllerRef = React.useRef<HTMLDivElement>(null);
    useImperativeHandle(ref, () => controllerRef.current!);

    const hideController = useCallback(() => {
      if (isMobile()) return;
      controllerRef.current && controllerRef.current.classList.add('mika-video-player-controller-hidden');
    }, []);

    const showController = useCallback(() => {
      if (isMobile()) return;
      controllerRef.current && controllerRef.current.classList.remove('mika-video-player-controller-hidden');
    }, []);

    const handleMouseMove = useCallback(() => {
      let timer: number;
      const remainingTime = 3000;

      return () => {
        clearTimeout(timer);
        showController();
        timer = setTimeout(hideController, remainingTime);
      };
    }, [hideController, showController]);

    return (
      <>
        <div
          className='mika-video-player-controller mika-video-player-controller-hidden'
          ref={controllerRef}
          onMouseMove={handleMouseMove()}
          onMouseLeave={hideController}
          onMouseEnter={showController}
        >
          <ToolBar />
        </div>
        <Loading />
      </>
    );
  }),
);

Controller.displayName = 'Controller';
export default Controller;

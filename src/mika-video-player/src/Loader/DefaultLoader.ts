import { VideoSrc } from '../VideoPlayerType.ts';

const Loader = (video: HTMLVideoElement, src: VideoSrc | string) => {
  if (!video || video.src || !src) return;

  let url;
  if (typeof src === 'string') {
    url = src;
  } else {
    url = src?.srcs?.[src.default ?? 0]?.url;
    if (typeof url === 'function') {
      url = url();
    }
  }

  if (url === undefined) {
    return;
  }

  video.src = url;
  video.load();
};

export default Loader;

const Loader = (video: HTMLVideoElement, src: string) => {
  if (!video || !src || video.src) return;

  video.src = src;
  video.load();
};

export default Loader;

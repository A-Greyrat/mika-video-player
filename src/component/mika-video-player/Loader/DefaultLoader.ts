
const Loader = (video: HTMLVideoElement, src: string) => {
    if (!video || !src || video.src) return;

    video.src = src;
    video.load();
    video.muted = true;
    video.play().catch(undefined);
}

export default Loader;

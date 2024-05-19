import './App.css';
import React, { useEffect } from 'react';

import VideoPlayer, { DanmakuAttr, VideoSrc } from './mika-video-player/src';

let sess_data = '';
const default_bv = 'BV1qm421s7MR';
// const proxy_url = 'https://fast.abdecd.xyz/proxy?pReferer=https://www.bilibili.com';

const getUrl = (bv: string) => `https://b.erisu.moe/api/playurl/dash?bvid=${bv}&SESSDATA=${sess_data}`;

const App: React.FC = () => {
  const [danmakus, setDanmakus] = React.useState<DanmakuAttr[]>([]);
  const [srcs, setSrcs] = React.useState<VideoSrc>();
  useEffect(() => {
    const url = new URL(window.location.href);
    const bv = url.searchParams.get('bv');
    sess_data = url.searchParams.get('SESSDATA') || '';

    const c = getUrl(bv || default_bv);

    fetch(c)
      .then((res) => res.json())
      .then((data) => {
        let { video } = data.data.dash;
        video = video.filter((v: { codecs: string }) => v.codecs.includes('av01'));

        const s: VideoSrc = {
          srcs: [],
          default: 0,
        };

        // id: 16, 32, 64, 80 (1080p, 720p, 480p, 360p)
        const m: { [key: number]: string } = {
          80: '1080P FHD',
          64: '720P HD',
          32: '480P SD',
          16: '360P',
        };

        const _getBaseUrl = (baseUrl: string) => {
          let proxy_url = 'https://fast.abdecd.xyz/proxy?pReferer=https://www.bilibili.com';
          const host = baseUrl.split('/')[2];
          proxy_url += `&pHost=${host}&pUrl=${encodeURIComponent(baseUrl)}`;
          return proxy_url;
        };

        for (const v of video) {
          s.srcs.push({
            url: _getBaseUrl(v.baseUrl),
            type: m[v.id],
          });
        }

        setSrcs(s);
        console.log(s);
      });

    fetch(`https://b.erisu.moe/api/danmaku?bvid=${bv || default_bv}&SESSDATA=${sess_data}`)
      .then((res) => res.json())
      .then((data) => {
        const newDanmakus: DanmakuAttr[] = [];
        for (const d of data) {
          if (d.color === 0) d.color = 0xffffff;
          newDanmakus.push({
            begin: (parseFloat(d.progress) ?? 0) / 1000,
            text: d.content,
            color: `#${parseInt(d.color, 10).toString(16).padStart(6, '0')}`,
            mode: d.mode,
            size: d.fontsize,
          });
        }

        setDanmakus(newDanmakus);
      });
  }, []);

  return (
    <div
      style={{
        width: '100vw',
        height: '100vh',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
      }}
    >
      <VideoPlayer
        style={{
          width: '100%',
          height: '100%',
          background: '#000',
        }}
        controls
        loop
        danmaku={danmakus}
        src={srcs}
      ></VideoPlayer>
    </div>
  );
};

export default App;

import './App.css';
import React, {useEffect} from "react";

import VideoPlayer, {DanmakuAttr} from "./mika-video-player/src";

let sess_data = "";
const default_bv = 'BV1qm421s7MR';
let proxy_url = 'https://fast.abdecd.xyz/proxy?pReferer=https://www.bilibili.com';

const getUrl = (bv: string) => {
    return 'https://b.erisu.moe/api/playurl/flv?bvid=' + bv + '&SESSDATA=' + sess_data;
};

const App: React.FC = () => {
    const [url, setUrl] = React.useState<string | undefined>(undefined);
    const [danmakus, setDanmakus] = React.useState<DanmakuAttr[]>([]);

    useEffect(() => {
        const url = new URL(window.location.href);
        const bv = url.searchParams.get('bv');
        sess_data = url.searchParams.get('SESSDATA') || "";

        const c = getUrl(bv || default_bv);

        fetch(c).then(res => res.json()).then(data => {
            const host = data.data.durl[0].url.split('/')[2];
            proxy_url += '&pHost=' + host + '&pUrl=';
            setUrl(encodeURIComponent(data.data.durl[0].url));
        });

        fetch('https://b.erisu.moe/api/danmaku?bvid=' + (bv || default_bv) + '&SESSDATA=' + sess_data).then(res => res.json()).then(data => {
            const newDanmakus: DanmakuAttr[] = [];
            for (const d of data) {
                if (d.color === 0) d.color = 0xffffff;
                newDanmakus.push({
                    begin: (parseFloat(d.progress) ?? 0) / 1000,
                    text: d.content,
                    color: '#' + parseInt(d.color).toString(16).padStart(6, '0'),
                    mode: d.mode,
                    size: d.fontsize,
                });
            }

            setDanmakus(newDanmakus);
        });
    }, []);

    return (
        <div style={{
            width: '100vw',
            height: '100vh',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'center',
        }}>

            <VideoPlayer
                style={{
                    width: '80%'
                }}
                controls
                loop
                danmaku={danmakus}
                src={url ? proxy_url + url : undefined}
            >
            </VideoPlayer>

        </div>
    )
};

export default App;

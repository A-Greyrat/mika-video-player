import './App.css';
import React, {useEffect} from "react";

import VideoPlayer, {FullScreenButton, PlayButton, ToolbarTimer, VolumeButton} from "./component/mika-video-player";
import SpeedButton from "./component/mika-video-player/Controller/ToolbarFunc/SpeedButton/SpeedButton.tsx";
import {DanmakuType} from "./component/mika-video-player/Danmaku/Danmaku.ts";
import Debugger from "./component/mika-video-player/Debugger";

const sessdata = "1443a408%2C1719124214%2Cb72e6%2Ac1CjDvyCp9vILksJqy6P2bYiAFgSgqe5SNZAZqtgODbz0Tw5PRo5uv9ZlLW5Sngurv7GMSVnpiSFE0X1pZQWE0Z2l2aHUzWFVVRzBvZm1Ma28zTmw3SDJLNkFzYWtKTkU4eHlXZlhNTDRLQl9XOTdOQ0NTZ3Y5SW41YXdaUnNZWXlwdkNzalZhU2V3IIEC";
const _bv = 'BV1EE421M7zP';
let proxy = 'https://118.31.42.183/proxy?pReferer=https://www.bilibili.com';

const getUrl = (bv: string) => {
    return 'https://b.erisu.moe/api/playurl/flv?bvid=' + bv + '&SESSDATA=' + sessdata;
};

const App: React.FC = () => {
    const [url, setUrl] = React.useState<string | undefined>(undefined);
    const [danmakus, setDanmakus] = React.useState<DanmakuType[]>([]);
    const ref = React.useRef<HTMLVideoElement>(null);
    const audioRef = React.useRef<HTMLAudioElement>(null);
    useEffect(() => {
        const url = new URL(window.location.href);
        const bv = url.searchParams.get('bv');
        const c = getUrl(bv || _bv);

        fetch(c).then(res => res.json()).then(data => {
            const host = data.data.durl[0].url.split('/')[2];
            proxy += '&pHost=' + host + '&pUrl=';
            setUrl(encodeURIComponent(data.data.durl[0].url));
        });

        fetch('https://b.erisu.moe/api/danmaku?bvid=' + (bv || _bv)).then(res => res.json()).then(data => {
            const newDanmakus: DanmakuType[] = [];
            for (const d of data) {
                d.begin = parseFloat(d.begin);
                newDanmakus.push(d);
            }

            setDanmakus(newDanmakus);
        });
    }, []);

    useEffect(() => {
        Debugger.setEnable(true);
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
                width='80%'
                style={{
                    margin: "auto",
                    borderRadius: '20px',
                    overflow: 'hidden'
                }}
                controls
                toolbar={{
                    left: [PlayButton, ToolbarTimer],
                    middle: [],
                    right: [SpeedButton, VolumeButton, FullScreenButton],
                }}
                loop
                danmaku={danmakus}
                ref={ref}
                src={url ? proxy + url : url}
            >
            </VideoPlayer>
            <audio ref={audioRef}/>
        </div>
    )
};

export default App;

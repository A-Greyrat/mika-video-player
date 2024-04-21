import './App.css'
import React, {useState} from "react";

import play from './component/mika-video-player/Icon/playIcon.json';
import VideoPlayer from "./component/mika-video-player";

// const c = 'https://b.erisu.moe/api/playurl/flv?bvid=BV1fK4y1s7Qf';

const App: React.FC = () => {
    // const [url, setUrl] = React.useState<string | undefined>(undefined);
    //
    // useEffect(() => {
    //     fetch(c).then(res => res.json()).then(data => {
    //         setUrl(data.data.durl[0].url);
    //     });
    // }, []);
    // 动画播放完成时的回调函数

    return (
        <div style={{
            width: '100vw',
            height: '100vh',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center'
        }}>
            <VideoPlayer width='600px' style={{
                margin: "auto"
            }} controls autoPlay src={'/lagtrain.flv'}/>


        </div>
    )
};

export default App;

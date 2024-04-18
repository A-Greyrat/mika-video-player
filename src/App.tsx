import './App.css'
import React from "react";
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


    return (
        <>
            <VideoPlayer width={1000} controls autoPlay src={'/lagtrain.flv'}/>
        </>
    )
};

export default App;

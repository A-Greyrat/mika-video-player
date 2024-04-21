import './App.css'
import React, {useEffect} from "react";

import VideoPlayer from "./component/mika-video-player";

const c = 'https://b.erisu.moe/api/playurl/flv?bvid=BV1EE421M7zP';

const App: React.FC = () => {
    const [_url, setUrl] = React.useState<string | undefined>(undefined);

    useEffect(() => {
        fetch(c).then(res => res.json()).then(data => {
            setUrl(data.data.durl[0].url);
            console.log(data.data.durl[0].url)
        });
    }, []);

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
            }} controls autoPlay src="https://upos-hz-mirrorakam.akamaized.net/upgcxcode/15/22/1512652215/1512652215-1-100109.m4s?e=ig8euxZM2rNcNbdlhoNvNC8BqJIzNbfqXBvEqxTEto8BTrNvN0GvT90W5JZMkX_YN0MvXg8gNEV4NC8xNEV4N03eN0B5tZlqNxTEto8BTrNvNeZVuJ10Kj_g2UB02J0mN0B5tZlqNCNEto8BTrNvNC7MTX502C8f2jmMQJ6mqF2fka1mqx6gqj0eN0B599M=&uipk=5&nbs=1&deadline=1713722985&gen=playurlv2&os=akam&oi=598727457&trid=dce1816db6b04876839cddd2c76ed474u&mid=0&platform=pc&upsig=e3dc921caba430289bfeefd861606bd3&uparams=e,uipk,nbs,deadline,gen,os,oi,trid,mid,platform&hdnts=exp=1713722985~hmac=01806240c6fe51a6644cf8ac4876fe6a20dfefd0af8dd741114da3e2c4ef4e2b&bvc=vod&nettype=0&orderid=0,1&buvid=&build=0&f=u_0_0&agrr=0&bw=5913&logo=80000000"/>

        </div>


    )
};

export default App;

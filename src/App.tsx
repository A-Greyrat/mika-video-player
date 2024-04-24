import './App.css';
import React, {useEffect} from "react";

import VideoPlayer from "./component/mika-video-player";

const sessdata = "1443a408%2C1719124214%2Cb72e6%2Ac1CjDvyCp9vILksJqy6P2bYiAFgSgqe5SNZAZqtgODbz0Tw5PRo5uv9ZlLW5Sngurv7GMSVnpiSFE0X1pZQWE0Z2l2aHUzWFVVRzBvZm1Ma28zTmw3SDJLNkFzYWtKTkU4eHlXZlhNTDRLQl9XOTdOQ0NTZ3Y5SW41YXdaUnNZWXlwdkNzalZhU2V3IIEC";
const _bv = 'BV1EE421M7zP';

const getUrl = (bv: string) => {
    return 'https://b.erisu.moe/api/playurl/flv?bvid=' + bv + '&SESSDATA=' + sessdata;
};

const App: React.FC = () => {
    const [url, setUrl] = React.useState<string | undefined>(undefined);

    useEffect(() => {
        const url = new URL(window.location.href);
        const bv = url.searchParams.get('bv');
        const c = getUrl(bv || _bv);

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
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'center',
        }}>
            <VideoPlayer
                width='1200px'
                style={{
                    margin: "auto",
                    borderRadius: '20px',
                    overflow: 'hidden'
                }}
                controls
                loop
                src={url}
            >
            </VideoPlayer>

        </div>
    )
};

export default App;

import './App.css'
import React, {useCallback, useEffect} from "react";

import VideoPlayer from "./component/mika-video-player";
import Range from "./component/mika-ui/Range/Range.tsx";

const sessdata = "1443a408%2C1719124214%2Cb72e6%2Ac1CjDvyCp9vILksJqy6P2bYiAFgSgqe5SNZAZqtgODbz0Tw5PRo5uv9ZlLW5Sngurv7GMSVnpiSFE0X1pZQWE0Z2l2aHUzWFVVRzBvZm1Ma28zTmw3SDJLNkFzYWtKTkU4eHlXZlhNTDRLQl9XOTdOQ0NTZ3Y5SW41YXdaUnNZWXlwdkNzalZhU2V3IIEC";
const bv = 'BV1EE421M7zP';
const c = 'https://b.erisu.moe/api/playurl/flv?bvid=' + bv + '&SESSDATA=' + sessdata;

const App: React.FC = () => {
    const [url, setUrl] = React.useState<string | undefined>(undefined);

    useEffect(() => {
        fetch(c).then(res => res.json()).then(data => {
            setUrl(data.data.durl[0].url);
            console.log(data.data.durl[0].url)
        });
    }, []);

    const [rangeValue, setRangeValue] = React.useState<number>(0);
    const onChange = useCallback((value: number) => {
        setRangeValue(value);
    }, []);

    return (
        <div style={{
            width: '100vw',
            height: '100vh',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'center'
        }}>
            <VideoPlayer width='1200px' style={{
                margin: "auto"
            }} controls src={url}>
            </VideoPlayer>

            <Range value={rangeValue} onChange={onChange} height='3px' width="400px" orient='horizontal'/>
        </div>
    )
};

export default App;

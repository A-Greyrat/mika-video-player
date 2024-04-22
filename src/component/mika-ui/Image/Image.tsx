import React, {forwardRef, memo, useCallback, useEffect, useImperativeHandle, useMemo} from "react";
import "./Image.less";

interface ImageProps extends React.HTMLAttributes<HTMLImageElement> {
    src?: string | null;

    width?: number | string;
    height?: number | string;
    alt?: string;

    loading?: React.ReactElement;
    error?: React.ReactElement | string;
    lazy?: boolean;
    // TODO: Add support for preview
    preview?: boolean;

    onLoaded?: () => unknown;
    onError?: () => unknown;

    occupyStyle?: React.CSSProperties;
}

interface OccupyImageProps extends React.HTMLAttributes<HTMLDivElement> {
    width?: number | string;
    height?: number | string;

    occupyStyle?: React.CSSProperties;
}


const DefaultLoading = forwardRef(({width, height, occupyStyle}: OccupyImageProps, ref: React.Ref<HTMLDivElement>) => {
    return (
        <div className='mika-image-loading' style={{
            "--width": width ? (typeof width === "number" ? width + "px" : width) : "auto",
            "--height": height ? (typeof height === "number" ? height + "px" : height) : "auto",
            ...occupyStyle
        } as React.CSSProperties} ref={ref}>
            <svg viewBox="0 0 1024 1024" version="1.1"
                 xmlns="http://www.w3.org/2000/svg">
                <path
                    d="M842.688 128 181.312 128C116.64 128 64 180.64 64 245.312l0 533.376C64 843.36 116.64 896 181.312 896l661.376 0C907.36 896 960 843.36 960 778.688L960 245.312C960 180.64 907.36 128 842.688 128zM288 288c35.36 0 64 28.64 64 64s-28.64 64-64 64c-35.328 0-64-28.64-64-64S252.672 288 288 288zM832 736c0 17.696-14.304 31.488-32 31.488L225.92 768c-0.128 0-0.224 0-0.352 0-10.08 0-19.616-4.288-25.664-12.384-6.112-8.192-7.936-18.56-4.896-28.352 2.304-7.488 58.272-183.552 180.064-183.552 38.08 0.896 67.424 9.824 95.776 18.336 35.712 10.72 70.528 19.936 109.664 13.76 20.448-3.296 28.896-23.808 43.328-69.952 19.04-60.8 47.808-152.736 174.656-152.736 17.536 0 31.776 14.08 32 31.616L832 511.616 832 736z"
                    fill="#ffffff"></path>
            </svg>
        </div>
    );
});

const DefaultError = forwardRef(({width, height, occupyStyle}: OccupyImageProps, ref: React.Ref<HTMLDivElement>) => {
    return (
        <div className='mika-image-error' style={{
            "--width": width ? (typeof width === "number" ? width + "px" : width) : "auto",
            "--height": height ? (typeof height === "number" ? height + "px" : height) : "auto",
            ...occupyStyle
        } as React.CSSProperties} ref={ref}>
            <svg viewBox="0 0 1024 1024" version="1.1"
                 xmlns="http://www.w3.org/2000/svg">
                <path
                    d="M842.688 128 181.312 128C116.64 128 64 180.64 64 245.312l0 533.376C64 843.36 116.64 896 181.312 896l661.376 0C907.36 896 960 843.36 960 778.688L960 245.312C960 180.64 907.36 128 842.688 128zM288 288c35.36 0 64 28.64 64 64s-28.64 64-64 64c-35.328 0-64-28.64-64-64S252.672 288 288 288zM832 736c0 17.696-14.304 31.488-32 31.488L225.92 768c-0.128 0-0.224 0-0.352 0-10.08 0-19.616-4.288-25.664-12.384-6.112-8.192-7.936-18.56-4.896-28.352 2.304-7.488 58.272-183.552 180.064-183.552 38.08 0.896 67.424 9.824 95.776 18.336 35.712 10.72 70.528 19.936 109.664 13.76 20.448-3.296 28.896-23.808 43.328-69.952 19.04-60.8 47.808-152.736 174.656-152.736 17.536 0 31.776 14.08 32 31.616L832 511.616 832 736z"
                    fill="#ffffff"></path>
            </svg>
        </div>
    );
});

const useLoad = (_src?: string | null, onLoaded?: () => void, onError?: () => void, lazy?: boolean) => {
    const loading = React.useRef(true);
    const error = React.useRef(false);
    const elementRef = React.useRef<HTMLImageElement | null>(null);
    const [src, setSrc] = React.useState<string | undefined>(undefined);

    const setError = useCallback(() => {
        loading.current = false;
        error.current = true;
        setSrc('error');

        if (onError) {
            onError();
        }
    }, [onError]);
    const setLoaded = useCallback((src: string) => {
        loading.current = false;
        error.current = false;
        setSrc(src);

        if (onLoaded) {
            onLoaded();
        }
    }, [onLoaded]);
    const setLoading = useCallback(() => {
        loading.current = true;
        error.current = false;
        setSrc(undefined);
    }, []);

    const loadImage = useCallback((src?: string | null) => {
        if (typeof _src === 'undefined') {
            setLoading();
            return;
        }

        if (_src === null) {
            setError();
            return;
        }

        if (_src.startsWith("data:") || _src.startsWith("blob:")) {
            setLoaded(_src);
            return;
        }

        setLoading();
        fetch(src!, {
            cache: "default",
        }).then((res) => {
            if (res.ok) {
                return res.blob();
            }
            throw new Error("[Mika UI] Image: Fetch failed");
        }).then((blob) => {
            if (!blob.type.startsWith("image")) {
                throw new Error("[Mika UI] Image: Not an image");
            }
            setLoaded(URL.createObjectURL(blob));
        }).catch(e => {
            console.error(e);
            setError();
        });
    }, [_src, setError, setLoaded, setLoading]);

    const observer = useMemo(() => new IntersectionObserver((entries) => {
        if (entries[0].isIntersecting) {
            loadImage(_src);
            observer.disconnect();
        }
    }, {
        threshold: 0.1
    }), [_src, loadImage]);

    useEffect(() => {
        if (lazy) {
            const element = elementRef.current!;
            observer.observe(element);
        } else {
            loadImage(_src);
        }

        return () => {
            observer.disconnect();
        };
    }, [_src, lazy, loadImage, observer]);

    return {loading: loading.current, error: error.current, src: src, elementRef: elementRef};
};

const Image = memo(React.forwardRef((props: ImageProps, ref: React.Ref<HTMLImageElement>) => {
    const {
        alt,
        src,
        loading,
        error,
        onLoaded,
        onError,
        lazy,
        height,
        width,
        occupyStyle,
        ...rest
    } = props;

    const {
        loading: _loading,
        error: _error,
        src: _src,
        elementRef,
    } = useLoad(src, onLoaded, onError, lazy);

    useImperativeHandle(ref, () => elementRef.current!, [elementRef]);
    if (_loading) {
        return (<>{loading ?? <DefaultLoading ref={elementRef} width={width} height={height} occupyStyle={occupyStyle}/>}</>);
    }

    if (_error) {
        if (typeof error === 'string') {
            return <img src={error} alt={alt} ref={elementRef} width={width} height={height} {...rest} />;
        }

        return (<>{error ?? <DefaultError ref={elementRef} width={width} height={height} occupyStyle={occupyStyle}/>}</>);
    }

    return (
        <img src={_src} alt={alt} ref={elementRef} width={width} height={height} {...rest} />
    );
}), (prev, next) => {
    return prev.src === next.src
        && prev.width === next.width
        && prev.height === next.height
        && prev.alt === next.alt
        && prev.loading === next.loading
        && prev.error === next.error
        && prev.onLoaded === next.onLoaded
        && prev.onError === next.onError
        && prev.lazy === next.lazy;
});


Image.displayName = 'Image';
export default Image;

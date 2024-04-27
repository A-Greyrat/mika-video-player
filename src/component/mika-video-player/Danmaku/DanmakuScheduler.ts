import Debugger from "../Debugger";
import {DanmakuType} from "./Danmaku.ts";

export interface Interval {
    // 区间左端点
    left: number;
    // 区间右端点
    right: number;

    /* 区间额外信息 */
    // 开始时间
    start: number;
    // 持续时间，受到视频播放速度影响
    duration: number;
    // 长度
    width: number;
}

export class DanmakuScheduler {
    #trackList: Interval[][] = [];
    #enableMultiTrack = false;

    #containerHeight: number;
    #videoSpeed = 1;

    constructor(height: number) {
        this.#containerHeight = height;
    }

    set ContainerHeight(height: number) {
        this.#containerHeight = height;

        // 重新计算轨道, 如果轨道超出容器高度则回收
        this.#trackList.forEach((trackList, _trackListIndex) => {
            for (let i = 0; i < trackList.length; i++) {
                if (trackList[i].right > this.#containerHeight) {
                    trackList.splice(i, 1);
                    i--;
                }
            }
        });
    }

    set EnableMultiTrack(enable: boolean) {
        this.#enableMultiTrack = enable;
    }

    set VideoSpeed(speed: number) {
        this.#videoSpeed = speed;
    }

    // 判断轨道是否空闲可用
    #isFree(track: Interval, danmaku: DanmakuType): boolean {
        return track.start + track.duration * this.#videoSpeed <= danmaku.begin;
    }

    #combineTrack(index: number, danmaku: DanmakuType, trackListIndex: number, compare: (a: Interval, danmaku: DanmakuType) => boolean) {
        if (index + 1 < this.#trackList[trackListIndex].length && compare(this.#trackList[trackListIndex][index + 1], danmaku)) {
            this.#trackList[trackListIndex][index].right = this.#trackList[trackListIndex][index + 1].right;
            this.#trackList[trackListIndex].splice(index + 1, 1);
            Debugger.log(`合并${index}号轨道和${index + 1}号轨道, end: ${this.#trackList[trackListIndex][index].start + this.#trackList[trackListIndex][index].duration}`);
            return true;
        }
        return false;
    }

    #size = (danmaku: Interval) => danmaku.right - danmaku.left;

    #useTrack = (track: Interval, danmaku: DanmakuType, width: number, height: number, duration: number) => {
        track.right = track.left + height;
        track.start = danmaku.begin;
        track.duration = duration;
        track.width = width;
    }

    // 返回距离零点的距离，并把轨道新增到轨道列表中
    public getAvailableTrack(danmaku: DanmakuType, duration: number, width: number, height: number, comparer?: (a: Interval, danmaku: DanmakuType) => boolean): number {
        const _getAvailableTrack = (danmaku: DanmakuType, duration: number, trackListIndex: number, comparer: (a: Interval, danmaku: DanmakuType) => boolean): number => {
            if (trackListIndex >= this.#trackList.length) {
                this.#trackList.push([]);
            }

            const list = this.#trackList[trackListIndex];

            // 首次适应算法
            for (let i = 0; i < list.length; i++) {
                if (!comparer(list[i], danmaku)) continue;

                if (this.#size(list[i]) === height) {
                    Debugger.log(`找到${i}号轨道满足弹幕‘${danmaku.text}’的需求’，duration: ${duration}`, danmaku, JSON.parse(JSON.stringify(list)));
                    this.#useTrack(list[i], danmaku, width, height, duration);
                    return list[i].left;
                }

                if (this.#size(list[i]) > height) {
                    Debugger.log(`找到${i}号轨道满足弹幕‘${danmaku.text}’的需求，但需要拆分成${i}号和${i + 1}号轨道’，duration: ${duration}`, danmaku,  JSON.parse(JSON.stringify(list)));
                    const right = list[i].right;
                    this.#useTrack(list[i], danmaku, width, height, duration);

                    list.splice(i + 1, 0, {
                        left: list[i].right,
                        right: right,
                        start: 0,
                        duration: 0,
                        width: width,
                    });

                    return list[i].left;
                }

                // 尝试合并轨道，合并成功则回退一步判断合并后的轨道是否满足需求
                if (this.#combineTrack(i, danmaku, trackListIndex, comparer)) i--;
            }

            // 如果开启多轨道列表模式，且当前轨道已满，则尝试下一个轨道列表
            const right = list.length > 0 ? list[list.length - 1].right : 0;
            if (right + height > this.#containerHeight) {
                if (this.#enableMultiTrack) {
                    return _getAvailableTrack(danmaku, duration, trackListIndex + 1, comparer);
                }
                return -1;
            }
            Debugger.log(`为弹幕‘${danmaku.text}’新增${list.length - 1}号轨道，duration：${duration}`, danmaku, JSON.parse(JSON.stringify(list)));

            list.push({
                left: right,
                right: right + height,
                start: danmaku.begin,
                duration: duration,
                width: width,
            });

            return right;
        }

        return _getAvailableTrack(danmaku, duration, 0, comparer || this.#isFree.bind(this));
    }

    public clear() {
        this.#trackList = [];
    }
}
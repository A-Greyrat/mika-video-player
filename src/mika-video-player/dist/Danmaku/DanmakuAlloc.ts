import {Debugger} from "../Debugger";
import {DanmakuAttr} from "./Danmaku.ts";

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

export class DanmakuAlloc {
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
    #isFree(track: Interval, danmaku: DanmakuAttr): boolean {
        return track.start + track.duration * this.#videoSpeed <= danmaku.begin;
    }

    #combineTrack(index: number, danmaku: DanmakuAttr, trackListIndex: number, width: number, height: number, duration: number, compare: (a: Interval, danmaku: DanmakuAttr) => boolean) {
        // 持续尝试合并轨道，直到满足height的需求
        let cur = index, right = this.#trackList[trackListIndex][index].right;
        while (cur + 1 < this.#trackList[trackListIndex].length
            && compare(this.#trackList[trackListIndex][cur + 1], danmaku)
            && right - this.#trackList[trackListIndex][index].left < height
            ) {
            cur++;
            right = this.#trackList[trackListIndex][cur].right;
        }

        if (right - this.#trackList[trackListIndex][index].left < height) return -1;

        Debugger.log(`合并${index} - ${cur}号轨道`);
        const lastTrack = JSON.parse(JSON.stringify(this.#trackList[trackListIndex][cur]));
        const i = index + 1;
        while (i <= cur) {
            right = this.#trackList[trackListIndex][i].right;
            this.#trackList[trackListIndex].splice(i, 1);
            cur--;
        }

        if (right - this.#trackList[trackListIndex][index].left > height) {
            this.#trackList[trackListIndex].splice(index + 1, 0, {
                left: this.#trackList[trackListIndex][index].left + height,
                right: right,
                start: lastTrack.start,
                duration: lastTrack.duration,
                width: lastTrack.width,
            });

            Debugger.log(`合并后拆分为${index}号和${index + 1}号轨道`, danmaku, JSON.parse(JSON.stringify(this.#trackList[trackListIndex])));
        }

        this.#useTrack(this.#trackList[trackListIndex][index], danmaku, width, height, duration);
        return this.#trackList[trackListIndex][index].left;
    }

    #size = (danmaku: Interval) => danmaku.right - danmaku.left;

    #useTrack = (track: Interval, danmaku: DanmakuAttr, width: number, height: number, duration: number) => {
        track.right = track.left + height;
        track.start = danmaku.begin;
        track.duration = duration;
        track.width = width;
    }

    /**
     * Tries to allocate a track for a given danmaku.
     *
     * @param {DanmakuAttr} danmaku - The danmaku for which a track needs to be allocated.
     * @param {number} duration - The duration for which the danmaku needs to be displayed, in seconds.
     * @param {number} width - The width of the danmaku.
     * @param {number} height - The height of the danmaku.
     * @param {(track: Interval, danmaku: DanmakuAttr) => boolean} [comparer] - An optional comparison function to determine if a track is suitable for the danmaku. It's no need to consider the height of the track.
     *
     * @returns {number} - The left endpoint of the allocated track. If allocation fails, returns -1.
     */
    public tryAllocTrack(danmaku: DanmakuAttr, duration: number, width: number, height: number, comparer?: (track: Interval, danmaku: DanmakuAttr) => boolean): number {
        const _getAvailableTrack = (danmaku: DanmakuAttr, duration: number, trackListIndex: number, comparer: (i: Interval, danmaku: DanmakuAttr) => boolean): number => {
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
                    Debugger.log(`找到${i}号轨道满足弹幕‘${danmaku.text}’的需求，但需要拆分成${i}号和${i + 1}号轨道’，duration: ${duration}`, danmaku, JSON.parse(JSON.stringify(list)));
                    const right = list[i].right;

                    list.splice(i + 1, 0, {
                        left: list[i].right,
                        right: right,
                        start: list[i].start,
                        duration: list[i].duration,
                        width: list[i].width,
                    });

                    this.#useTrack(list[i], danmaku, width, height, duration);
                    return list[i].left;
                }

                // 尝试合并轨道，合并成功则回退一步判断合并后的轨道是否满足需求
                const ret = this.#combineTrack(i, danmaku, trackListIndex, width, height, duration, comparer);
                if (ret !== -1) return ret;
            }

            // 如果开启多轨道列表模式，且当前轨道已满，则尝试下一个轨道列表
            const right = list.length > 0 ? list[list.length - 1].right : 0;
            if (right + height > this.#containerHeight) {
                if (this.#enableMultiTrack) {
                    return _getAvailableTrack(danmaku, duration, trackListIndex + 1, comparer);
                }
                return -1;
            }
            Debugger.log(`为弹幕‘${danmaku.text}’新增${list.length}号轨道，duration：${duration}`, danmaku, JSON.parse(JSON.stringify(list)));

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

"use client"

import React, { useState, useRef, useEffect, useCallback } from 'react'
// @ts-ignore
import { LuckyGrid } from '@lucky-canvas/react'
import { useSearchParams } from 'next/navigation' // ✅ 使用 Next.js Hook
import { draw, queryRaffleAwardList } from "@/apis";
import { RaffleAwardVO } from "@/types/RaffleAwardVO";

interface LuckyGridPageProps {
    handleRefresh: () => void;
}

export function LuckyGridPage({ handleRefresh }: LuckyGridPageProps) {
    const [prizes, setPrizes] = useState<any[]>([])
    const myLucky = useRef<any>(null)
    const isMounted = useRef(true) // ✅ 挂载状态追踪
    const searchParams = useSearchParams()

    // 提取公共参数获取逻辑
    const getParams = useCallback(() => {
        return {
            userId: searchParams.get('userId') || '',
            activityId: Number(searchParams.get('activityId')) || 0
        }
    }, [searchParams])

    useEffect(() => {
        isMounted.current = true;
        return () => { isMounted.current = false; };
    }, []);

    // 1. 获取奖品列表
    const fetchAwardList = useCallback(async () => {
        const { userId, activityId } = getParams();
        if (!userId || !activityId) return;

        try {
            const result = await queryRaffleAwardList(userId, activityId);
            const { code, info, data }: { code: string; info: string; data: RaffleAwardVO[] } = await result.json();

            if (code !== "0000") {
                console.error("获取奖品失败:", info);
                return;
            }

            // ✅ 安全检查：确保数据长度足够
            if (!data || data.length < 8) {
                console.error("奖品配置不足8个");
                return;
            }

            if (!isMounted.current) return;

            // 构造奖品数据，增加 Optional Chaining 防止崩溃
            const newPrizes = [
                { x: 0, y: 0, index: 0 },
                { x: 1, y: 0, index: 1 },
                { x: 2, y: 0, index: 2 },
                { x: 2, y: 1, index: 3 },
                { x: 2, y: 2, index: 4 }, // 右下
                { x: 1, y: 2, index: 5 }, // 下中
                { x: 0, y: 2, index: 6 }, // 左下
                { x: 0, y: 1, index: 7 }, // 左中
            ].map((pos) => {
                const item = data[pos.index];
                return {
                    x: pos.x,
                    y: pos.y,
                    fonts: [{
                        text: item.isAwardUnlock ? item.awardTitle : `再抽${item.waitUnLockCount}次解锁`,
                        top: '80%',
                        fontSize: '10px',
                        fontWeight: '800',
                        wordWrap: true,
                        lengthLimit: '90%'
                    }],
                    imgs: [{
                        // 这里你需要根据实际逻辑处理图片路径，防止索引错误
                        src: item.isAwardUnlock
                            ? `/raffle-award-${getImageSuffix(pos.index)}.png`
                            : `/raffle-award-${getImageSuffix(pos.index)}-lock.png`,
                        width: "100%",
                        height: "100%",
                        defaultImg: "/raffle-award.png" // 假如库支持
                    }]
                };
            });

            setPrizes(newPrizes);

        } catch (error) {
            console.error("加载奖品异常", error);
        }
    }, [getParams]);

    // 辅助函数：根据索引映射原来的图片文件名后缀 (为了兼容你原来的图片命名逻辑)
    const getImageSuffix = (index: number) => {
        const mapping = ["00", "01", "02", "12", "22", "21", "20", "10"];
        return mapping[index] || "00";
    };

    useEffect(() => {
        fetchAwardList();
    }, [fetchAwardList]);


    // 2. 抽奖逻辑
    const handleStartGame = async () => {
        if (!myLucky.current) return;

        // 开始转动
        myLucky.current.play();

        const { userId, activityId } = getParams();

        try {
            // ✅ 立即请求，不使用 setTimeout 延迟请求，减少用户等待
            // LuckyGrid 内部机制会保证至少转够一定时间才停
            let result = await draw(userId, activityId);
            const { code, info, data } = await result.json();

            if (!isMounted.current) return;

            if (code !== "0000") {
                window.alert(`抽奖失败: ${info}`);
                myLucky.current.stop(); // 🔴 即使失败，也要调用 stop 让转盘停下来
                return;
            }

            // ✅ 计算索引 (后端返回 1-8，前端需要 0-7)
            const prizeIndex = data.awardIndex - 1;

            // 调用 stop 停止在指定位置
            myLucky.current.stop(prizeIndex);

            // 此时可以刷新次数，或者等到 onEnd 再刷新
            handleRefresh();

        } catch (error) {
            console.error("抽奖接口异常", error);
            window.alert("网络异常，请重试");
            if (myLucky.current) myLucky.current.stop(); // 🔴 异常停止
        }
    };

    // 静态配置使用 useRef 或外部常量，避免重复渲染
    const buttons = useRef([
        {
            x: 1, y: 1,
            background: "rgba(0,0,0,0)",
            imgs: [{ src: "/raffle-button.png", width: "100%", height: "100%" }]
        }
    ]).current;

    const defaultStyle = useRef([{ background: "#b8c5f2" }]).current;

    return (
        <LuckyGrid
            ref={myLucky}
            width="300px"
            height="300px"
            rows="3"
            cols="3"
            prizes={prizes}
            defaultStyle={defaultStyle}
            buttons={buttons}
            onStart={handleStartGame}
            onEnd={(prize: any) => {
                // 动画完全结束后的回调
                // 1. 刷新奖品锁定状态
                fetchAwardList();
                // 2. 提示用户
                alert('恭喜抽中奖品💐【' + prize.fonts[0].text + '】');
            }}
        />
    );
}
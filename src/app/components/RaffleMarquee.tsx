"use client";
import React, { useEffect, useState, useRef } from "react";

interface RaffleUser {
    userId: string;
    awardId: number;
    awardTitle: string;
    awardTime: string; // 后端 Date -> 前端 string
}

// 请求地址
const apiHostUrl = process.env.API_HOST_URL ? process.env.API_HOST_URL : "https://console-mock.apipost.cn/mock/6afa907d-6678-45e2-b867-032a11090abd";

function formatTimeAgo(timeString: string) {

    if (!timeString) return "";

    const date = new Date(timeString);
    const now = new Date();

    const diffMs = now.getTime() - date.getTime();
    // 防止客户端时间比服务端时间慢导致的负数
    if (diffMs < 0) return "刚刚";

    const diffSec = Math.floor(diffMs / 1000);
    const diffMin = Math.floor(diffSec / 60);
    const diffHour = Math.floor(diffMin / 60);

    if (diffSec < 60) return "刚刚";
    if (diffMin < 60) return `${diffMin} 分钟前`;
    return `${diffHour} 小时前`;
}

export default function RaffleMarquee({ activityId }: { activityId: number }) {
    const [list, setList] = useState<RaffleUser[]>([]);
    // 3. 增加 mounted 状态解决 Hydration Mismatch
    const [isMounted, setIsMounted] = useState(false);

    useEffect(() => {
        setIsMounted(true);
        const fetchData = async () => {
            try {
                const res = await fetch(`${apiHostUrl}/api/v1/raffle/activity/queryRecentRaffleUsers?activityId=${activityId}`);
                const data = await res.json();
                if (data.code === "0000") {
                    setList(data.data || []);
                }
            } catch (e) {
                console.error("拉取中奖列表错误:", e);
            }
        };

        fetchData();
        // 修正注释逻辑，改为 30s
        const timer = setInterval(fetchData, 30000);
        return () => clearInterval(timer);
    }, [activityId]);

    // 防止 SSR 水合错误，且无数据时不渲染
    if (!isMounted || list.length === 0) {
        return null;
    }

    return (
        <div className="w-full overflow-hidden my-6 select-none pointer-events-none">
            {/*
               注意：animation-play-state:paused 需要 pointer-events-auto 配合使用
               如果你希望鼠标放上去暂停，可以移除外层的 pointer-events-none 并给内部加 auto
            */}
            <div className="animate-marquee whitespace-nowrap flex gap-8">
                {[...list, ...list].map((item, index) => (
                    <div
                        // 使用组合 key 避免潜在的 reconcile 问题，虽然 index 在这里也够用
                        key={`${item.userId}-${index}`}
                        className="px-4 py-2 bg-white/20 backdrop-blur-md rounded-xl shadow-md text-white text-sm flex items-center gap-2"
                    >
                        <span className="font-bold">{item.userId}</span>
                        <span className="opacity-70">在</span>
                        <span className="opacity-70">{formatTimeAgo(item.awardTime)}</span>
                        <span className="opacity-70">抽中了</span>
                        <span className="font-semibold text-yellow-300">{item.awardTitle}</span>
                    </div>
                ))}
            </div>

            <style jsx>{`
                .animate-marquee {
                    display: inline-flex;
                    /* 动态根据列表长度调整速度，或者保持固定时间 */
                    animation: scroll-left ${list.length * 3}s linear infinite; 
                }
                .animate-marquee:hover {
                    animation-play-state: paused;
                }
                @keyframes scroll-left {
                    0% {
                        transform: translateX(0);
                    }
                    100% {
                        /* 列表被复制了一份，所以移动 50% 刚好无缝衔接 */
                        transform: translateX(-50%);
                    }
                }
            `}</style>
        </div>
    );
}
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


export default function RaffleMarquee({ activityId }: { activityId: number }) {

    const [list, setList] = useState<RaffleUser[]>([]);
    const containerRef = useRef<HTMLDivElement | null>(null);

    // 轮询获取最新中奖列表（每 5 秒刷新一次）
    useEffect(() => {
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
        const timer = setInterval(fetchData, 30000); // 30s自动刷新
        return () => clearInterval(timer);
    }, [activityId]);

    return (
        <div className="w-full overflow-hidden my-6">
            <div
                ref={containerRef}
                className="animate-marquee whitespace-nowrap flex gap-8 hover:[animation-play-state:paused]"
            >
                {/* 让数据循环滚动（两份数据无缝衔接） */}
                {[...list, ...list].map((item, index) => (
                    <div
                        key={index}
                        className="px-4 py-2 bg-white/20 backdrop-blur-md rounded-xl shadow-md text-white text-sm flex items-center gap-2"
                    >
                        <span className="font-bold">{item.userId}</span>
                        <span className="opacity-70">抽中了</span>
                        <span className="font-semibold text-yellow-300">{item.awardTitle}</span>
                    </div>
                ))}
            </div>

            {/* Tailwind 动画（自定义） */}
            <style jsx>{`
        .animate-marquee {
          display: inline-flex;
          animation: scroll-left 18s linear infinite;
        }
        @keyframes scroll-left {
          0% {
            transform: translateX(0);
          }
          100% {
            transform: translateX(-50%);
          }
        }
      `}</style>
        </div>
    );
}

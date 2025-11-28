"use client";

import React, { useState, useRef, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { drawTen } from "@/apis";

// 定义奖品类型 (根据你的后端返回结构调整)
interface AwardDTO {
    awardId: number;
    awardTitle: string;
    awardIndex: number; // 用于显示图片
    sort?: number;
}

interface DrawTenProps {
    handleRefresh: () => void; // 用于刷新父组件数据
}

export const DrawTenComponent: React.FC<DrawTenProps> = ({ handleRefresh }) => {
    const [loading, setLoading] = useState(false);
    const [showResult, setShowResult] = useState(false);
    const [prizeList, setPrizeList] = useState<AwardDTO[]>([]);

    const searchParams = useSearchParams();
    const isMounted = useRef(true);

    useEffect(() => {
        isMounted.current = true;
        return () => { isMounted.current = false; };
    }, []);

    // 映射图片后缀 (复用你 LuckyGridPage 的逻辑)
    const getImageSuffix = (index: number) => {
        // 注意：后端通常返回 1-8，前端图片索引可能是 0-7 或对应字符串
        // 这里假设 awardIndex 直接对应图片后缀，你需要根据实际调整
        const mapping = ["00", "01", "02", "12", "22", "21", "20", "10"];
        return mapping[index - 1] || "00";
    };

    const handleDrawTen = async () => {
        if (loading) return;

        const userId = searchParams.get("userId");
        const activityId = Number(searchParams.get("activityId"));

        if (!userId || !activityId) {
            alert("参数缺失，请刷新重试");
            return;
        }

        setLoading(true);

        try {
            const res = await drawTen(userId, activityId);
            const { code, info, data } = await res.json();

            if (!isMounted.current) return;

            if (code === "0000") {
                setPrizeList(data || []); // 假设 data 是数组
                setShowResult(true);      // 打开弹窗
                handleRefresh();          // 刷新积分和次数
            } else {
                alert(`十连抽失败: ${info}`);
            }
        } catch (error) {
            console.error(error);
            alert("网络异常");
        } finally {
            if (isMounted.current) setLoading(false);
        }
    };

    return (
        <>
            {/* 1. 抽奖入口按钮 */}
        <div className="w-full flex justify-center my-4">
    <button
        onClick={handleDrawTen}
    disabled={loading}
    className={`
                        relative px-8 py-3 rounded-full text-xl font-black text-white shadow-xl 
                        transform transition-all duration-200 active:scale-95
                        bg-gradient-to-r from-purple-500 via-pink-500 to-red-500
                        border-4 border-yellow-300
                        ${loading ? "opacity-70 cursor-wait" : "hover:shadow-2xl hover:-translate-y-1 cursor-pointer"}
                    `}
>
    {loading ? (
        <span className="flex items-center gap-2">
        <svg className="animate-spin h-5 w-5 text-white" viewBox="0 0 24 24">
    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"/>
    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
        </svg>
        正在祈福...
        </span>
    ) : (
        "🔥 暴走十连抽 🔥"
    )}

    {/* 装饰性光效 */}
    {!loading && (
        <span className="absolute -top-1 -right-1 flex h-4 w-4">
        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-yellow-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-4 w-4 bg-yellow-500"></span>
        </span>
    )}
    </button>
    </div>

    {/* 2. 结果展示弹窗 (Modal) */}
    {showResult && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fadeIn">
        <div className="bg-white rounded-2xl w-full max-w-2xl overflow-hidden shadow-2xl transform transition-all scale-100">
            {/* 弹窗标题 */}
            <div className="bg-gradient-to-r from-red-500 to-pink-600 p-4 text-center">
    <h3 className="text-2xl font-bold text-white tracking-wider">🎉 恭喜获得 🎉</h3>
    </div>

        {/* 奖品列表 Grid */}
        <div className="p-6 grid grid-cols-2 md:grid-cols-5 gap-4 bg-yellow-50">
            {prizeList.map((item, index) => (
                    <div key={index} className="flex flex-col items-center p-2 bg-white rounded-lg shadow-md border border-yellow-100 animate-slideUp" style={{ animationDelay: `${index * 50}ms` }}>
        <div className="w-16 h-16 mb-2 relative">
            {/* 这里复用你的图片逻辑 */}
            <img
        src={`/raffle-award-${getImageSuffix(item.awardIndex)}.png`}
        alt={item.awardTitle}
        className="w-full h-full object-contain"
        onError={(e) => {
        // 图片加载失败兜底
        (e.target as HTMLImageElement).src = "/raffle-award.png"
    }}
        />
        </div>
        <span className="text-xs font-bold text-gray-700 text-center line-clamp-2">
        {item.awardTitle}
        </span>
        </div>
    ))}
        </div>

        {/* 弹窗底部 */}
        <div className="p-4 bg-gray-50 flex justify-center">
        <button
            onClick={() => setShowResult(false)}
        className="px-8 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-full font-bold transition-colors shadow-lg"
            >
            收下奖励 🎁
                            </button>
                            </div>
                            </div>
                            </div>
    )}
    </>
);
};
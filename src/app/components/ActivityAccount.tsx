"use client"; // 1. 必须标记为客户端组件

import React, { useEffect, useState, useRef, useCallback } from "react";
import { useSearchParams } from "next/navigation"; // 2. 使用 Next.js 标准 Hook
import { queryUserActivityAccount } from "@/apis";
import { UserActivityAccountVO } from "@/types/UserActivityAccountVO";

interface ActivityAccountProps {
    refresh: number;
}

export const ActivityAccount: React.FC<ActivityAccountProps> = ({ refresh }) => {
    const [dayCount, setDayCount] = useState<number>(0);
    const [loading, setLoading] = useState<boolean>(false);

    // 3. 获取 URL 参数 (SSR 安全)
    const searchParams = useSearchParams();
    const userId = searchParams.get("userId");
    const activityId = Number(searchParams.get("activityId"));

    // 4. 组件挂载状态追踪 (解决卸载后更新 State 问题)
    const isMounted = useRef(true);
    useEffect(() => {
        isMounted.current = true;
        return () => { isMounted.current = false; };
    }, []);

    const fetchUserActivityAccount = useCallback(async () => {
        // 参数校验
        if (!userId || !activityId) return;
        // 防止重复点击 loading 中不处理
        if (loading) return;

        try {
            if (isMounted.current) setLoading(true);

            const response = await queryUserActivityAccount(userId, activityId);
            const { code, info, data }: { code: string; info: string; data: UserActivityAccountVO } = await response.json();

            // 组件已卸载，直接返回，不更新状态
            if (!isMounted.current) return;

            if (code === "0000") {
                setDayCount(data.dayCountSurplus);
            } else {
                console.warn(`查询活动账户失败: code=${code} info=${info}`);
                // 5. 去除 window.alert，改为 console 或 toast，避免打断用户
            }
        } catch (error) {
            console.error("查询活动账户异常：", error);
        } finally {
            if (isMounted.current) setLoading(false);
        }
    }, [userId, activityId, loading]); // 依赖项明确

    // 监听外部刷新信号
    useEffect(() => {
        fetchUserActivityAccount();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [refresh]); // 这里特意不把 fetchUserActivityAccount 放进去，防止死循环，或者使用 useRef 解决

    return (
        <div
            className={`px-6 py-2 mb-8 rounded-full shadow-lg text-white transition-colors duration-200 select-none ${
                loading
                    ? "bg-yellow-300 cursor-wait"
                    : "bg-yellow-500 hover:bg-yellow-600 cursor-pointer active:scale-95"
            }`}
            // 点击手动刷新
            onClick={() => !loading && fetchUserActivityAccount()}
        >
            <div className="flex items-center gap-2">
                {loading && (
                    // 简单的 Loading 转圈动画
                    <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path>
                    </svg>
                )}
                <span>{loading ? "更新中..." : `今日可抽奖 ${dayCount} 次`}</span>
            </div>
        </div>
    );
};
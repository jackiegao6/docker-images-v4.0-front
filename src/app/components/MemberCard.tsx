'use client'; // 👈 必须添加这一行，标记为客户端组件

import React, { useEffect, useState, useRef, useCallback } from "react";
import { useSearchParams } from "next/navigation"; // 👈 引入 Next.js 专用 Hook
import {
    calendarSignRebate,
    isCalendarSignRebate,
    queryUserActivityAccount,
    queryUserCreditAccount,
} from "@/apis";

const Clock: React.FC = React.memo(function ClockComponent() {
    const [now, setNow] = useState<string>("");

    useEffect(() => {
        const updateTime = () => {
            const d = new Date();
            setNow(
                `${String(d.getHours()).padStart(2, "0")}:${String(
                    d.getMinutes()
                ).padStart(2, "0")}:${String(d.getSeconds()).padStart(2, "0")}`
            );
        };
        updateTime();
        const timer = setInterval(updateTime, 1000);
        return () => clearInterval(timer);
    }, []);

    return (
        <span className="font-bold text-gray-100 ml-1 bg-red-300 bg-opacity-20 rounded-full px-2 py-1">
            {now}
        </span>
    );
});


interface MemberCardProps {
    allRefresh?: number;
}

export const MemberCard: React.FC<MemberCardProps> = ({ allRefresh = 0 }) => {
    // 1. 获取 URL 参数 (Next.js 方式，SSR 安全)
    const searchParams = useSearchParams();
    const userId = searchParams.get("userId") || "";
    const activityId = Number(searchParams.get("activityId")) || 0;

    // 状态定义
    const [dayCount, setDayCount] = useState<number>(0);
    const [creditAmount, setCreditAmount] = useState<number>(0);
    const [isSigned, setIsSigned] = useState<boolean>(false);
    const [loading, setLoading] = useState<boolean>(false);

    const isMounted = useRef(true);

    useEffect(() => {
        isMounted.current = true;
        return () => { isMounted.current = false; };
    }, []);

    // ----------------------------------------------------------------------
    // 数据获取逻辑
    // ----------------------------------------------------------------------
    const fetchData = useCallback(async () => {
        // 如果没有 userId，暂不请求 (避免无效调用)
        if (!userId) return;

        try {
            const [accountRes, creditRes, signRes] = await Promise.all([
                queryUserActivityAccount(userId, activityId),
                queryUserCreditAccount(userId),
                isCalendarSignRebate(userId)
            ]);

            // ... 解析 JSON ...
            const accountData = await accountRes.json();
            const creditData = await creditRes.json();
            const signData = await signRes.json();

            if (!isMounted.current) return;

            if (accountData.code === "0000") setDayCount(accountData.data.dayCountSurplus);
            if (creditData.code === "0000") setCreditAmount(creditData.data);
            if (signData.code === "0000") setIsSigned(signData.data);

        } catch (error) {
            console.error("数据加载异常:", error);
        }
    }, [userId, activityId]);

    // ----------------------------------------------------------------------
    // 签到逻辑
    // ----------------------------------------------------------------------
    const handleSign = useCallback(async () => {
        if (isSigned) {
            window.alert("今日已签到！");
            return;
        }
        if (!userId) return;

        setLoading(true);
        try {
            const result = await calendarSignRebate(userId);
            const { code, info } = await result.json();

            if (!isMounted.current) return;

            if (code === "0000" || code === "0003") {
                setIsSigned(true);
                window.alert("签到成功！");
                fetchData(); // 刷新数据
            } else {
                window.alert(`签到失败: ${info}`);
            }
        } catch (error) {
            console.error("签到异常:", error);
            window.alert("网络异常");
        } finally {
            if (isMounted.current) setLoading(false);
        }
    }, [isSigned, userId, fetchData]);

    // 监听刷新
    useEffect(() => {
        fetchData();
    }, [fetchData, allRefresh]);

    // 渲染部分保持不变 ...
    return (
        <div className="relative max-w-sm mx-auto bg-gradient-to-r from-blue-400 to-red-300 rounded-xl shadow-xl overflow-hidden md:max-w-2xl mb-5">
            <div className="md:flex">
                <div className="p-8 flex-1">
                    <div className="block mt-1 text-2xl leading-tight font-semibold text-yellow-400 hover:text-yellow-300 transition duration-300 ease-in-out">
                        抽奖账户
                    </div>

                    <div className="mt-4 space-y-2">
                        <p className="text-lg text-gray-100 flex items-center">
                            <span className="material-icons mr-1">👤</span>
                            用户ID：
                            <span className="font-bold text-gray-100 ml-1 bg-red-300 bg-opacity-20 rounded-full px-2 py-1 truncate max-w-[150px]">
                                {userId || "未获取"}
                            </span>
                        </p>
                        <p className="text-lg text-gray-100 flex items-center">
                            <span className="material-icons mr-1">💰</span>
                            账户积分：
                            <span className="font-bold text-gray-100 ml-1 bg-red-300 bg-opacity-20 rounded-full px-2 py-1">
                                {creditAmount}
                            </span>
                        </p>
                        <p className="text-lg text-gray-100 flex items-center">
                            <span className="material-icons mr-1">🥃</span>
                            抽奖次数：
                            <span className="font-bold text-gray-100 ml-1 bg-red-300 bg-opacity-20 rounded-full px-2 py-1">
                                {dayCount}
                            </span>
                        </p>
                        <p className="text-lg text-gray-100 flex items-center">
                            <span className="material-icons mr-1">⏱️</span>
                            当前时间：
                            <Clock />
                        </p>
                    </div>
                </div>
            </div>
            <div className="flex justify-center gap-4 pb-6">
                <button
                    onClick={handleSign}
                    disabled={loading || isSigned}
                    className={`${
                        isSigned ? 'bg-gray-400 cursor-not-allowed' : 'bg-yellow-500 hover:bg-yellow-600'
                    } text-white font-bold py-2 px-6 rounded-full shadow-md transition duration-300 ease-in-out flex items-center`}
                >
                    {loading ? "处理中..." : (isSigned ? "📅 已签到" : "📅 签到")}
                </button>

                <button
                    onClick={() => fetchData()}
                    disabled={loading}
                    className="bg-white hover:bg-gray-200 text-black font-bold py-2 px-6 rounded-full shadow-md transition duration-300 ease-in-out"
                >
                    刷新 ⌛️
                </button>
            </div>
        </div>
    );
};
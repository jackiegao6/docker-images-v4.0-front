import React, { useEffect, useState, useRef, useCallback } from "react";
import {
    calendarSignRebate,
    isCalendarSignRebate,
    queryUserActivityAccount,
    queryUserCreditAccount,
} from "@/apis";
import { UserActivityAccountVO } from "@/types/UserActivityAccountVO";

interface MemberCardProps {
    allRefresh?: number;
}

export const MemberCard: React.FC<MemberCardProps> = ({ allRefresh = 0 }) => {
    const [now, setNow] = useState<string>("");
    const [dayCount, setDayCount] = useState<number>(0);
    const [creditAmount, setCreditAmount] = useState<number>(0);
    const [sign, setSign] = useState<boolean>(false);
    const [userId, setUserId] = useState<string>("");

    const refreshCount = useRef(0);
    const isMounted = useRef(true);

    useEffect(() => {
        return () => {
            isMounted.current = false;
        };
    }, []);

    useEffect(() => {
        const updateTime = () => {
            const d = new Date();
            const formatted = ` ${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}:${String(d.getSeconds()).padStart(2, '0')}`;
            setNow(formatted);
        };

        updateTime(); // 初始化
        const timer = setInterval(updateTime, 1000); // 每秒更新时间

        return () => clearInterval(timer);
    }, []);


    const getUserId = useCallback(() => {
        const id = new URLSearchParams(window.location.search).get("userId");
        if (id) setUserId(id);
        return id || "";
    }, []);

    const fetchActivityAccount = useCallback(async (uid: string) => {
        try {
            const activityId = Number(new URLSearchParams(window.location.search).get("activityId"));
            const result = await queryUserActivityAccount(uid, activityId);
            const { code, info, data }: { code: string; info: string; data: UserActivityAccountVO } = await result.json();
            if (code !== "0000") {
                window.alert(`查询活动账户失败 code:${code} info:${info}`);
                return;
            }
            if (isMounted.current) setDayCount(data.dayCountSurplus);
        } catch (error) {
            console.error("查询活动账户异常：", error);
        }
    }, []);

    const fetchCreditAccount = useCallback(async (uid: string) => {
        try {
            const result = await queryUserCreditAccount(uid);
            const { code, info, data }: { code: string; info: string; data: number } = await result.json();
            if (code !== "0000") {
                window.alert(`查询积分账户失败 code:${code} info:${info}`);
                return;
            }
            if (isMounted.current) setCreditAmount(data);
        } catch (error) {
            console.error("查询积分账户异常：", error);
        }
    }, []);

    const fetchSignStatus = useCallback(async (uid: string) => {
        try {
            const result = await isCalendarSignRebate(uid);
            const { code, info, data }: { code: string; info: string; data: boolean } = await result.json();
            if (code !== "0000") {
                window.alert(`查询签到状态失败 code:${code} info:${info}`);
                return;
            }
            if (isMounted.current) setSign(data);
        } catch (error) {
            console.error("查询签到状态异常：", error);
        }
    }, []);

    const handleSign = useCallback(async () => {
        if (sign) {
            window.alert("今日已签到！");
            return;
        }

        const uid = getUserId();
        if (!uid) return;

        try {
            const result = await calendarSignRebate(uid);
            const { code, info }: { code: string; info: string } = await result.json();
            if (code !== "0000" && code !== "0003") {
                window.alert(`签到失败 code:${code} info:${info}`);
                return;
            }
            handleRefresh();
            if (isMounted.current) setSign(true);
            handleRefresh();
        } catch (error) {
            console.error("签到异常：", error);
        }
    }, [sign]);

    const handleRefresh = useCallback(() => {
        refreshCount.current += 1;
        const uid = getUserId();
        if (!uid) return;
        fetchActivityAccount(uid);
        fetchCreditAccount(uid);
        fetchSignStatus(uid);
    }, [fetchActivityAccount, fetchCreditAccount, fetchSignStatus, getUserId]);

    useEffect(() => {
        handleRefresh();
    }, [handleRefresh, allRefresh]);

    const currentDate = new Date();
    // const formattedDate = `${currentDate.getFullYear()}年${('0' + (currentDate.getMonth() + 1)).slice(-2)}月${('0' + currentDate.getDate()).slice(-2)}日`;

    return (

        <div
            className="relative max-w-sm mx-auto bg-gradient-to-r from-blue-400 to-red-300 rounded-xl shadow-xl overflow-hidden md:max-w-2xl mb-5">
            <div className="md:flex">
                <div className="p-8 flex-1">
                    <a
                        href="#"
                        className="block mt-1 text-2xl leading-tight font-semibold text-white hover:text-gray-300 transition duration-300 ease-in-out"
                    >
                        抽奖账户：
                    </a>

                    <div className="mt-4">
                        <p className="text-lg text-gray-100 flex items-center">
                            <span className="material-icons mr-1">👤</span>
                            用户id：
                            <span
                                className="font-bold text-gray-100 ml-1 bg-white bg-opacity-20 rounded-full px-2 py-1">{userId}</span>
                        </p>

                        <p className="text-lg text-gray-100 flex items-center">
                            <span className="material-icons mr-2">💲</span>
                            账户积分：
                            <span
                                className="font-bold text-gray-100 ml-1 bg-white bg-opacity-20 rounded-full px-2 py-1">{creditAmount}</span>
                        </p>

                        <p className="text-lg text-gray-100 flex items-center">
                            <span className="material-icons mr-1">🥃</span>
                            抽奖次数：
                            <span
                                className="font-bold text-gray-100 ml-1 bg-white bg-opacity-20 rounded-full px-2 py-1">{dayCount}</span>
                        </p>

                        <p className="text-lg text-gray-100 flex items-center">
                            <span className="material-icons mr-1">⏱️</span>
                            当前时间：
                            <span
                                className="font-bold text-gray-100 ml-1 bg-white bg-opacity-20 rounded-full px-2 py-1">{now}</span>
                        </p>
                    </div>
                </div>
            </div>

            {/* ⭐ 底部按钮区域 */}
            <div className="flex justify-center gap-4 pb-6">
                <button
                    onClick={handleSign}
                    className="bg-yellow-500 hover:bg-yellow-600 text-white font-bold py-2 px-4 rounded-full shadow-md transition duration-300 ease-in-out"
                >
                    {sign ? "已签" : "签到"}
                </button>

                <button
                    onClick={handleRefresh}
                    className="bg-white hover:bg-gray-200 text-black font-bold py-2 px-4 rounded-full shadow-md transition duration-300 ease-in-out"
                >
                    刷新⌛️
                </button>
            </div>
        </div>


    );
};

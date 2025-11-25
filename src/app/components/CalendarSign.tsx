import React, { useEffect, useState, useRef } from "react";
import { calendarSignRebate, isCalendarSignRebate } from "@/apis";

interface CalendarSignProps {
    handleRefresh: () => void;
}

export const CalendarSign: React.FC<CalendarSignProps> = ({ handleRefresh }) => {
    const [sign, setSign] = useState<boolean>(false);
    const [loading, setLoading] = useState<boolean>(false);
    const isMounted = useRef(true);

    // 检查组件是否已卸载，防止异步更新报错
    useEffect(() => {
        return () => {
            isMounted.current = false;
        };
    }, []);

    // 查询用户是否已签到
    const checkSignStatus = async () => {
        try {
            const queryParams = new URLSearchParams(window.location.search);
            const userId = String(queryParams.get("userId"));
            const result = await isCalendarSignRebate(userId);
            const { code, info, data }: { code: string; info: string; data: boolean } = await result.json();

            if (code !== "0000") {
                window.alert(`判断是否签到接口失败：code=${code} info=${info}`);
                return;
            }

            if (isMounted.current) setSign(data);
        } catch (error) {
            console.error("查询签到状态异常：", error);
        }
    };

    // 执行签到
    const handleSign = async () => {
        if (sign) {
            window.alert("今日已签到！");
            return;
        }

        if (loading) return; // 防止重复点击

        try {
            setLoading(true);
            const queryParams = new URLSearchParams(window.location.search);
            const userId = String(queryParams.get("userId"));
            const result = await calendarSignRebate(userId);
            const { code, info }: { code: string; info: string } = await result.json();

            if (code !== "0000" && code !== "0003") {
                window.alert(`日历签到返利接口失败：code=${code} info=${info}`);
                return;
            }

            if (isMounted.current) {
                setSign(true);
                window.alert("🎉签到成功！")
            }

            // 刷新父组件数据
            handleRefresh();
        } catch (error) {
            console.error("签到异常：", error);
        } finally {
            if (isMounted.current) setLoading(false);
        }
    };

    useEffect(() => {
        checkSignStatus();
    }, []);

    return (
        <div
            className={`px-6 py-2 mb-8 rounded-full shadow-lg text-white ${
                sign ? "bg-green-400 cursor-not-allowed" : "bg-green-600 hover:bg-green-800 cursor-pointer"
            }`}
            onClick={handleSign}
        >
            {loading ? "签到中..." : sign ? "今日已签到" : "点击签到「获得抽奖次数」"}
        </div>
    );
};

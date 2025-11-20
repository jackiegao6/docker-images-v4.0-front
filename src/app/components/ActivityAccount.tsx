import React, { useEffect, useState } from "react";
import { queryUserActivityAccount } from "@/apis";
import { UserActivityAccountVO } from "@/types/UserActivityAccountVO";

interface ActivityAccountProps {
    refresh: number;
}

export const ActivityAccount: React.FC<ActivityAccountProps> = ({ refresh }) => {
    const [dayCount, setDayCount] = useState<number>(0);
    const [loading, setLoading] = useState<boolean>(false);

    const fetchUserActivityAccount = async () => {
        try {
            setLoading(true);

            const queryParams = new URLSearchParams(window.location.search);
            const userId = queryParams.get("userId") || "";
            const activityId = Number(queryParams.get("activityId") || 0);

            if (!userId || !activityId) {
                console.warn("缺少 userId 或 activityId 参数");
                return;
            }

            const response = await queryUserActivityAccount(userId, activityId);
            const { code, info, data }: { code: string; info: string; data: UserActivityAccountVO } = await response.json();

            if (code !== "0000") {
                window.alert(`查询活动账户额度失败：code=${code} info=${info}`);
                return;
            }

            setDayCount(data.dayCountSurplus);
        } catch (error) {
            console.error("查询活动账户异常：", error);
            window.alert("查询活动账户异常，请稍后重试");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchUserActivityAccount();
    }, [refresh]);

    return (
        <div
            className={`px-6 py-2 mb-8 rounded-full shadow-lg text-white ${
                loading ? "bg-yellow-300 cursor-not-allowed" : "bg-yellow-500 hover:bg-yellow-600 cursor-pointer"
            }`}
            onClick={() => !loading && fetchUserActivityAccount()}
        >
            {loading ? "加载中..." : `今日可抽奖 ${dayCount} 次`}
        </div>
    );
};

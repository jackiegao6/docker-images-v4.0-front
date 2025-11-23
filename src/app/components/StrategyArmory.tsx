import { useState, useCallback } from "react";
import { activityStrategyArmory } from "@/apis";

export const StrategyArmory: React.FC = () => {
    const [loading, setLoading] = useState(false);

    const getActivityId = useCallback((): number | null => {
        const queryParams = new URLSearchParams(window.location.search);
        const activityId = Number(queryParams.get("activityId"));
        return activityId || null;
    }, []);

    const strategyArmoryHandle = useCallback(async () => {
        const activityId = getActivityId();
        if (!activityId) {
            window.alert(
                "确认访问地址正确如：http://182.61.31.173/?userId=gzc&activityId=100401"
            );
            return;
        }

        if (loading) return; // 防止重复点击
        setLoading(true);

        try {
            const res = await activityStrategyArmory(activityId);
            const { code, info }: { code: string; info: string } = await res.json();

            if (code !== "0000") {
                window.alert(`抽奖活动策略装配失败 code:${code} info:${info}`);
                return;
            }

            window.alert("装配完成啦!");
        } catch (error) {
            console.error("策略装配异常:", error);
            window.alert("策略装配异常，请查看控制台日志！");
        } finally {
            setLoading(false);
        }
    }, [getActivityId, loading]);

    return (
        <div
            className={`mt-8 px-6 py-2 mb-8 text-white rounded-full shadow-lg focus:outline-none focus:ring-2 focus:ring-blue-300 ${
                loading ? "bg-yellow-400 cursor-not-allowed" : "bg-yellow-600 hover:bg-yellow-800"
            }`}
            style={{cursor: loading ? "not-allowed" : "pointer"}}
            onClick={strategyArmoryHandle}
        >
            {loading ? "装配中..." : "🔥装配抽奖「抽奖前点击数据预热」"}
        </div>

    );
};

"use client"; // 1. 必须添加

import React, { useEffect, useState, useRef, useCallback } from "react";
import { useSearchParams } from "next/navigation"; // 2. 使用官方 Hook
import { queryRaffleStrategyRuleWeight } from "@/apis";
import { StrategyRuleWeightVO } from "@/types/StrategyRuleWeightVO";

interface StrategyRuleWeightProps {
    refresh?: number;
}

interface ProgressBarProps {
    index: number;
    total: number;
    completed: number;
    awards?: { awardId: number; awardTitle: string }[];
}

// 3. 将子组件移到外部定义，避免重复销毁重建
const ProgressBar: React.FC<ProgressBarProps> = React.memo(({ index, total, completed, awards }) => {
    // 保护除数为0的情况
    const safeTotal = total > 0 ? total : 1;
    const percentage = Math.min((completed / safeTotal) * 100, 100);

    return (
        <div className="flex flex-col items-center w-48 p-4 bg-gradient-to-tr from-purple-600 to-indigo-500 rounded-xl shadow-lg hover:scale-105 transform transition-transform duration-300">
            <div className="text-sm font-bold text-white mb-2">幸运值阶梯 {index + 1}</div>
            <div className="w-full h-6 bg-gray-200 rounded-full overflow-hidden relative">
                <div
                    className="h-6 rounded-full bg-gradient-to-r from-yellow-400 via-red-300 to-red-700 transition-all duration-700"
                    style={{ width: `${percentage}%` }}
                />

                <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-xs font-bold text-black">{completed}/{total}</span>
                </div>
            </div>

            {awards && awards.length > 0 && (
                <div className="mt-2 text-xs text-white text-center">
                    {awards.map((award, idx) => (
                        <div key={award.awardId}>
                            {idx + 1}. {award.awardTitle}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
});
// 显式设置 displayName 便于调试
ProgressBar.displayName = "ProgressBar";

export const StrategyRuleWeight: React.FC<StrategyRuleWeightProps> = ({ refresh }) => {
    const [strategyRuleWeightVOList, setStrategyRuleWeightVOList] = useState<StrategyRuleWeightVO[]>([]);

    // 4. SSR 安全的参数获取
    const searchParams = useSearchParams();
    const userId = searchParams.get("userId") || "";
    const activityId = Number(searchParams.get("activityId")) || 0;

    // 5. 挂载状态检查
    const isMounted = useRef(true);
    useEffect(() => {
        isMounted.current = true;
        return () => { isMounted.current = false; };
    }, []);

    const fetchRuleWeight = useCallback(async () => {
        if (!userId || !activityId) return;

        try {
            const result = await queryRaffleStrategyRuleWeight(userId, activityId);
            const { code, info, data }: { code: string; info: string; data: StrategyRuleWeightVO[] } = await result.json();

            if (!isMounted.current) return;

            if (code !== "0000") {
                // 建议改为 console.error，不要弹窗打断用户
                console.error(`查询活动规则权重失败 code:${code} info:${info}`);
                return;
            }

            setStrategyRuleWeightVOList(data || []);
        } catch (error) {
            console.error("查询异常：", error);
        }
    }, [userId, activityId]);

    useEffect(() => {
        fetchRuleWeight();
    }, [fetchRuleWeight, refresh]);

    // 如果没有数据，不渲染或渲染空状态，避免布局塌陷
    if (strategyRuleWeightVOList.length === 0) {
        return <div className="mt-6 text-center text-gray-200 text-sm">暂无规则配置</div>;
    }

    return (
        <div className="flex flex-row flex-wrap justify-center gap-6 mt-6">
            {strategyRuleWeightVOList.map((ruleWeight, index) => (
                <ProgressBar
                    // 如果 ruleWeight 有唯一ID最好用 ID，没有则用 index
                    key={index}
                    index={index}
                    total={ruleWeight.ruleWeightCount}
                    completed={ruleWeight.userActivityAccountTotalUseCount}
                    awards={ruleWeight.strategyAwards}
                />
            ))}
        </div>
    );
};
import { useEffect, useState } from "react";
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

export const StrategyRuleWeight: React.FC<StrategyRuleWeightProps> = ({ refresh }) => {
    const [strategyRuleWeightVOList, setStrategyRuleWeightVOList] = useState<StrategyRuleWeightVO[]>([]);

    const queryRaffleStrategyRuleWeightHandle = async () => {
        const queryParams = new URLSearchParams(window.location.search);
        const userId = String(queryParams.get("userId"));
        const activityId = Number(queryParams.get("activityId"));

        const result = await queryRaffleStrategyRuleWeight(userId, activityId);
        const { code, info, data }: { code: string; info: string; data: StrategyRuleWeightVO[] } = await result.json();

        if (code !== "0000") {
            window.alert(`查询活动账户额度失败 code:${code} info:${info}`);
            return;
        }

        setStrategyRuleWeightVOList(data);
    };

    useEffect(() => {
        queryRaffleStrategyRuleWeightHandle();
    }, [refresh]);

    const ProgressBar: React.FC<ProgressBarProps> = ({ index, total, completed, awards }) => {
        const percentage = Math.min((completed / total) * 100, 100);

        return (
            <div className="flex flex-col items-center w-48 p-4 bg-gradient-to-tr from-purple-600 to-indigo-500 rounded-xl shadow-lg hover:scale-105 transform transition-transform duration-300">
                <div className="text-sm font-bold text-white mb-2">抽奖阶梯 {index + 1}</div>
                <div className="w-full h-6 bg-gray-200 rounded-full overflow-hidden relative">
                    <div
                        className="h-6 rounded-full bg-gradient-to-r from-yellow-400 via-red-500 to-pink-500 transition-all duration-700"
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
    };

    return (
        <div className="flex flex-row flex-wrap justify-center gap-6 mt-6">
            {strategyRuleWeightVOList.map((ruleWeight, index) => (
                <ProgressBar
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

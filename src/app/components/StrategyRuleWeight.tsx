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
            <div className="w-full max-w-md mb-6">
                <div className="flex items-center mb-1">
                    <span className="text-sm font-semibold text-white mr-2">抽奖阶梯 {index + 1}</span>
                    <div className="flex-1 h-4 bg-gray-300 rounded-full relative overflow-hidden">
                        <div
                            className="h-4 rounded-full bg-gradient-to-r from-blue-600 to-blue-400 transition-all duration-500"
                            style={{ width: `${percentage}%` }}
                        />
                        <div className="absolute inset-0 flex items-center justify-end pr-2">
              <span className="text-xs font-bold text-black">
                {completed > total ? total : completed}/{total}
              </span>
                        </div>
                    </div>
                </div>
                {awards && awards.length > 0 && (
                    <div className="ml-4 mt-1">
                        <div className="text-xs text-gray-200 font-semibold mb-1">必中奖品范围：</div>
                        {awards.map((award, idx) => (
                            <div key={award.awardId} className="text-xs text-white ml-2">
                                {idx + 1}. {award.awardTitle}
                            </div>
                        ))}
                    </div>
                )}
            </div>
        );
    };

    return (
        <div className="flex flex-col items-center">
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

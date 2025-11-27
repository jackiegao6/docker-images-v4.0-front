"use client";

import {LuckyGridPage} from "@/app/pages/lucky/lucky-grid-page";
import dynamic from "next/dynamic";
import {useState} from "react";
import RaffleMarquee from "@/app/components/RaffleMarquee";

// 1. 引入新组件 (使用 dynamic 动态加载)
const StrategyArmoryButton = dynamic(async () => (await import("./components/StrategyArmory")).StrategyArmory)
const StrategyRuleWeightButton = dynamic(async () => (await import("./components/StrategyRuleWeight")).StrategyRuleWeight)
const MemberCardButton = dynamic(async () => (await import("./components/MemberCard")).MemberCard)
const SkuProductButton = dynamic(async () => (await import("./components/SkuProduct")).SkuProduct)
// 👇 新增这一行
const DrawTenButton = dynamic(async () => (await import("./components/DrawTenComponent")).DrawTenComponent)

export default function Home() {

    const [refresh, setRefresh] = useState(0);

    const handleRefresh = () => {
        setRefresh(refresh + 1)
    };

    return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-[#1472c7]"
             style={{backgroundImage: "url('/background.svg')"}}>

            {/* 头部文案 */}
            <header className="text-6xl font-bold text-center my-8 text-white">
                🏆超级大奖福利
                <span className="text-yellow-300">限量抽</span>
                🎉
            </header>

            {/* 商品兑换列表 */}
            <SkuProductButton handleRefresh={handleRefresh}/>

            {/* 中间核心区域：转盘 + 会员卡 */}
            <div className="flex flex-col md:flex-row gap-4 mb-4 w-full max-w-3xl px-4">
                {/* 左侧：九宫格转盘 */}
                <div className="w-full md:w-1/2 p-6 bg-white/10 backdrop-blur-md shadow-xl rounded-2xl flex justify-center border border-white/20">
                    <LuckyGridPage handleRefresh={handleRefresh}/>
                </div>

                {/* 右侧：会员信息卡 */}
                <div className="w-full md:w-1/2">
                    <MemberCardButton allRefresh={refresh}/>
                </div>
            </div>

            {/* ⭐⭐⭐ 放置十连抽组件的位置 ⭐⭐⭐ */}
            {/* 放在这里非常醒目，引导用户在看完积分后进行大额抽奖 */}
            <div className="w-full max-w-6xl px-4 mb-8">
                <DrawTenButton handleRefresh={handleRefresh} />
            </div>

            {/* 规则权重进度条 */}
            <div className="flex items-center space-x-4 mb-6">
                <StrategyRuleWeightButton refresh={refresh}/>
            </div>

            {/* 跑马灯 */}
            <div className="flex items-center space-x-4 w-full max-w-4xl">
                <RaffleMarquee activityId={100401}/>
            </div>

            {/* 装配抽奖 (仅供测试或管理员使用?) */}
            <div className="mt-8 opacity-50 hover:opacity-100 transition-opacity">
                <StrategyArmoryButton/>
            </div>

            <footer className="text-gray-300 text-center my-8 text-sm">
                Credit Market Raffle Platform ©gzc 2025-12
            </footer>
        </div>
    );
}
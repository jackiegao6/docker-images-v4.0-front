"use client";

import {LuckyWheelPage} from "@/app/pages/lucky/lucky-wheel-page";
import {LuckyGridPage} from "@/app/pages/lucky/lucky-grid-page";
import dynamic from "next/dynamic";
import {useState} from "react";


// dynamic 动态导入组件 避免一次性加载全部组件
const StrategyArmoryButton = dynamic(async () => (await import("./components/StrategyArmory")).StrategyArmory)
const StrategyRuleWeightButton = dynamic(async () => (await import("./components/StrategyRuleWeight")).StrategyRuleWeight)
const MemberCardButton = dynamic(async () => (await import("./components/MemberCard")).MemberCard)
const SkuProductButton = dynamic(async () => (await import("./components/SkuProduct")).SkuProduct)


export default function Home() {

    const [refresh, setRefresh] = useState(0);

    const handleRefresh = () => {
        setRefresh(refresh + 1)
    };

    return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-[#9fabb9]"
             style={{backgroundImage: "url('/background.svg')"}}>
            {/* 头部文案 */}
            <header className="text-6xl font-bold text-center my-8 text-white">
                🏆超级大奖福利
                <span className="text-yellow-300">限量抽</span>
                🎉
            </header>

            {/* 商品 */}
            <SkuProductButton handleRefresh={handleRefresh}/>

            {/* 转盘组件 + 会员卡 */}
            <div className="flex flex-col md:flex-row gap-4 mb-8"> {/* flex布局*/}

                {/* 转盘组件 */}
                <div className="w-full md:w-1/2 p-6 bg-red shadow-lg rounded-lg">
                    <LuckyGridPage handleRefresh={handleRefresh} />
                </div>

                {/* 会员卡 */}
                <div className="w-full md:w-1/2">
                    <MemberCardButton allRefresh={refresh} />
                </div>

            </div>

            <div className="flex items-center space-x-4">
                <StrategyRuleWeightButton refresh={refresh}/>
            </div>

            {/* 装配抽奖 */}
            <StrategyArmoryButton/>

            {/* 底部文案 */}
            {/*<footer className="text-gray-600 text-center my-8" style={{color: "white"}}>*/}
            {/*    本项目为 星球「码农会锁」第8个实战项目 <a href='https://gaga.plus'*/}
            {/*                                            target='_blank' color={"#0092ff"}>https://gaga.plus</a> @小傅哥*/}
            {/*</footer>*/}
        </div>
    );
}

'use client'; // 👈 标记为客户端组件，避免 SSR window 报错

import React, { useEffect, useState, useRef, useCallback } from "react";
import { useSearchParams } from "next/navigation"; // 👈 使用官方 Hook 获取参数
import { SkuProductResponseDTO } from "@/types/SkuProductResponseDTO";
import { creditPayExchangeSku, querySkuProductListByActivityId } from "@/apis";

interface SkuProductProps {
    handleRefresh: () => void;
}

export const SkuProduct: React.FC<SkuProductProps> = ({ handleRefresh }) => {
    // 1. 状态定义
    const [skuList, setSkuList] = useState<SkuProductResponseDTO[]>([]);
    // 使用 exchangingSkuId 来记录当前正在兑换哪个商品，实现局部 loading
    const [exchangingSkuId, setExchangingSkuId] = useState<number | null>(null);

    // 2. 获取 URL 参数 (SSR 安全)
    const searchParams = useSearchParams();
    const activityId = Number(searchParams.get("activityId")) || 0;
    const userId = searchParams.get("userId") || "";

    // 3. 挂载状态追踪
    const isMounted = useRef(true);
    useEffect(() => {
        isMounted.current = true;
        return () => { isMounted.current = false; };
    }, []);

    // 4. 获取商品列表
    const fetchSkuList = useCallback(async () => {
        if (!activityId) return;

        try {
            const result = await querySkuProductListByActivityId(activityId);
            const { code, info, data }: { code: string; info: string; data: SkuProductResponseDTO[] } = await result.json();

            if (!isMounted.current) return;

            if (code === "0000") {
                setSkuList(data || []);
            } else {
                console.error(`查询产品列表失败: ${info}`);
            }
        } catch (error) {
            console.error("查询产品列表异常：", error);
        }
    }, [activityId]);

    // 5. 初始化加载
    useEffect(() => {
        fetchSkuList();
    }, [fetchSkuList]);

    // 6. 兑换处理 (增加防抖和 Loading)
    const handleExchange = async (sku: number) => {
        // 防止没有 ID 或 正在交互中
        if (!userId || exchangingSkuId !== null) return;

        setExchangingSkuId(sku); // 开启 Loading

        try {
            const result = await creditPayExchangeSku(userId, sku);
            const { code, info } = await result.json();

            if (!isMounted.current) return;

            if (code === "0000") {
                window.alert("兑换成功！");
                // 接口成功后立即刷新父组件数据
                handleRefresh();
            } else {
                window.alert(`兑换失败: ${info}`);
            }
        } catch (error) {
            console.error("兑换异常：", error);
            window.alert("网络异常，请重试");
        } finally {
            if (isMounted.current) {
                setExchangingSkuId(null); // 关闭 Loading
            }
        }
    };

    return (
        <div className="container mx-auto p-4">
            <div className="flex flex-wrap justify-center gap-4">
                {skuList.map((skuProduct) => {
                    // 判断当前卡片是否正在加载
                    const isLoading = exchangingSkuId === skuProduct.sku;

                    return (
                        <div key={skuProduct.sku}>
                            <div className="max-w-xs rounded overflow-hidden shadow-lg p-4 bg-gradient-to-r from-blue-500 to-red-500 transform hover:scale-105 transition-transform duration-300">
                                <div className="px-4 py-2">
                                    <div className="font-bold text-2xl mb-2 text-center text-white">
                                        {skuProduct.activityCount?.dayCount || 0}次抽奖
                                    </div>
                                </div>
                                <div className="px-4 pt-2 pb-2 text-center">
                                    <div className="flex items-center justify-center gap-2">
                                        <div className="bg-blue-700 text-white font-bold py-1 px-4 rounded-full cursor-default">
                                            {skuProduct.productAmount}￥
                                        </div>

                                        <button
                                            onClick={() => handleExchange(skuProduct.sku)}
                                            disabled={isLoading || exchangingSkuId !== null} // 如果有任意一个在兑换，都禁用，或者只禁用当前的
                                            className={`
                                                font-bold py-1 px-4 rounded-full flex items-center 
                                                ${isLoading || exchangingSkuId !== null
                                                ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                                                : "bg-white text-blue-700 hover:bg-gray-200 cursor-pointer"
                                            }
                                            `}
                                        >
                                            {isLoading ? (
                                                <span className="animate-spin mr-1 h-5 w-5 border-2 border-blue-600 border-t-transparent rounded-full"></span>
                                            ) : (
                                                <svg
                                                    className="w-5 h-5 mr-1"
                                                    fill="none"
                                                    stroke="currentColor"
                                                    viewBox="0 0 24 24"
                                                    xmlns="http://www.w3.org/2000/svg"
                                                >
                                                    <path
                                                        strokeLinecap="round"
                                                        strokeLinejoin="round"
                                                        strokeWidth="2"
                                                        d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-1.4 7M17 13l1.4 7M9 21h6"
                                                    ></path>
                                                </svg>
                                            )}
                                            {isLoading ? "兑换中" : "兑换"}
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};
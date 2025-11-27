import { useEffect, useState, useRef, useCallback } from "react";
import { SkuProductResponseDTO } from "@/types/SkuProductResponseDTO";
import { creditPayExchangeSku, querySkuProductListByActivityId } from "@/apis";

interface SkuProductProps {
    handleRefresh: () => void;
}

export const SkuProduct: React.FC<SkuProductProps> = ({ handleRefresh }) => {
    const [skuList, setSkuList] = useState<SkuProductResponseDTO[]>([]);
    const isMounted = useRef(true);

    useEffect(() => {
        return () => {
            isMounted.current = false;
        };
    }, []);

    const getActivityId = useCallback((): number => {
        return Number(new URLSearchParams(window.location.search).get("activityId"));
    }, []);

    const getUserId = useCallback((): string => {
        return String(new URLSearchParams(window.location.search).get("userId") || "");
    }, []);

    const fetchSkuList = useCallback(async () => {
        try {
            const result = await querySkuProductListByActivityId(getActivityId());
            const { code, info, data }: { code: string; info: string; data: SkuProductResponseDTO[] } =
                await result.json();

            if (code !== "0000") {
                window.alert(`查询产品列表失败 code:${code} info:${info}`);
                return;
            }

            if (isMounted.current) setSkuList(data);
        } catch (error) {
            console.error("查询产品列表异常：", error);
        }
    }, [getActivityId]);

    const handleExchange = useCallback(
        async (sku: number) => {
            try {
                const result = await creditPayExchangeSku(getUserId(), sku);
                const { code, info }: { code: string; info: string } = await result.json();

                if (code !== "0000") {
                    window.alert(`兑换失败 code:${code} info:${info}`);
                    return;
                }

                // 延迟刷新
                setTimeout(() => {
                    handleRefresh();
                }, 300);
            } catch (error) {
                console.error("兑换异常：", error);
            }
        },
        [getUserId, handleRefresh]
    );

    useEffect(() => {
        fetchSkuList();
    }, [fetchSkuList]);

    return (
        <div className="container mx-auto p-4">
            <div className="flex flex-wrap justify-center gap-4">
                {skuList.map((skuProduct, index) => (
                    <div key={skuProduct.sku || index}>
                        <div className="max-w-xs rounded overflow-hidden shadow-lg p-4 bg-gradient-to-r from-blue-500 to-red-500 transform hover:scale-105 transition-transform duration-300">
                            <div className="px-4 py-2">
                                <div className="font-bold text-2xl mb-2 text-center text-white">
                                    {skuProduct.activityCount.dayCount}次抽奖
                                </div>
                            </div>
                            <div className="px-4 pt-2 pb-2 text-center">
                                <div className="flex items-center justify-center gap-2">
                                    <button className="bg-blue-700 hover:bg-blue-800 text-white font-bold py-1 px-4 rounded-full">
                                        {skuProduct.productAmount}￥
                                    </button>
                                    <button
                                        onClick={() => handleExchange(skuProduct.sku)}
                                        className="bg-white text-blue-700 font-bold py-1 px-4 rounded-full hover:bg-gray-200 flex items-center cursor-pointer"
                                    >
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
                                        兑换
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

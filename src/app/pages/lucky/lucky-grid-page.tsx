"use client";

import React, { useState, useRef, useEffect } from "react";
// @ts-ignore
import { LuckyGrid } from "@lucky-canvas/react";
import { draw, queryRaffleAwardList } from "@/apis";
import { RaffleAwardVO } from "@/types/RaffleAwardVO";

export function LuckyGridPage({ handleRefresh }) {
    const myLucky = useRef();

    const [prizes, setPrizes] = useState<any[]>([]);
    const [defaultStyle] = useState([{ background: "#b8c5f2" }]);

    /* ------------------ 工具函数：获取 URL 参数 ------------------ */
    const getUrlParams = () => {
        const query = new URLSearchParams(window.location.search);
        return {
            userId: String(query.get("userId")),
            activityId: Number(query.get("activityId")),
        };
    };

    /* ------------------ 工具函数：构建奖品格子 ------------------ */
    const buildPrizeItem = (award: RaffleAwardVO, x: number, y: number, img: string) => ({
        x,
        y,
        fonts: [
            {
                text: award.isAwardUnlock
                    ? award.awardTitle
                    : `再抽奖${award.waitUnLockCount}次解锁`,
                top: "80%",
                fontSize: "12px",
                fontWeight: "800",
            },
        ],
        imgs: [
            {
                src: award.isAwardUnlock ? img : img.replace(".png", "-lock.png"),
                width: "80%",
                height: "auto",
                activeSrc: "/raffle-award.png",
            },
        ],
    });

    /* ------------------ 查询奖品列表 ------------------ */
    const queryAwardList = async () => {
        const { userId, activityId } = getUrlParams();
        const res = await queryRaffleAwardList(userId, activityId);
        const { code, info, data } = await res.json();

        if (code !== "0000") {
            alert("获取奖品失败：" + info);
            return;
        }

        const newPrizes = [
            buildPrizeItem(data[0], 0, 0, "/raffle-award-00.png"),
            buildPrizeItem(data[1], 1, 0, "/raffle-award-01.png"),
            buildPrizeItem(data[2], 2, 0, "/raffle-award-02.png"),
            buildPrizeItem(data[3], 2, 1, "/raffle-award-12.png"),
            buildPrizeItem(data[4], 2, 2, "/raffle-award-22.png"),
            buildPrizeItem(data[5], 1, 2, "/raffle-award-21.png"),
            buildPrizeItem(data[6], 0, 2, "/raffle-award-20.png"),
            buildPrizeItem(data[7], 0, 1, "/raffle-award-10.png"),
        ];

        setPrizes(newPrizes);
    };

    /* ------------------ 随机抽奖 ------------------ */
    const doDraw = async () => {
        const { userId, activityId } = getUrlParams();
        const result = await draw(userId, activityId);
        const { code, info, data } = await result.json();

        if (code !== "0000") {
            alert("抽奖失败：" + info);
            return;
        }

        handleRefresh();
        return data.awardIndex - 1;
    };

    /* ------------------ 抽奖按钮配置（中间按钮） ------------------ */
    const [buttons] = useState([
        {
            x: 1,
            y: 1,
            background: "#b8c5f2",
            shadow: "3",
            imgs: [{ src: "/raffle-button.png", width: "90%", height: "90%" }],
        },
    ]);

    /* ------------------ 初始化加载 ------------------ */
    useEffect(() => {
        queryAwardList();
    }, []);

    return (
        <div className="flex justify-center items-center">
            <LuckyGrid
                ref={myLucky}
                width="320px"
                height="320px"
                rows="3"
                cols="3"
                prizes={prizes}
                buttons={buttons}
                defaultStyle={defaultStyle}
                onStart={() => {
                    myLucky.current.play();
                    setTimeout(() => {
                        doDraw().then((prizeIndex) => {
                            myLucky.current.stop(prizeIndex);
                        });
                    }, 2000);
                }}
                onEnd={(prize: any) => {
                    queryAwardList();
                    alert(`🎉 恭喜抽中：${prize?.fonts?.[0]?.text}`);
                }}
            />
        </div>
    );
}

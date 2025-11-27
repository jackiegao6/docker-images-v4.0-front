// 请求地址
const apiHostUrl = process.env.API_HOST_URL ? process.env.API_HOST_URL : "https://console-mock.apipost.cn/mock/6afa907d-6678-45e2-b867-032a11090abd";
/**
 * 统一的请求处理函数
 * 1. 自动处理 fetch 异常
 * 2. 统一兜底错误返回
 */
const request = async (url: string | URL | Request, options: RequestInit | undefined) => {
    try {
        const response = await fetch(url, options);
        // 如果 fetch 成功但不代表业务成功，这里暂不拦截，由业务层处理 status
        return response;
    } catch (error) {
        console.error("API Request Failed:", error);
        // 3. 构造一个假的 Response 对象返回，而不是发起新的 fetch
        return new Response(JSON.stringify({
            code: "0001",
            info: "网络异常或调用失败",
            data: null // 修正 JSON 格式
        }), {
            status: 200,
            headers: { 'Content-Type': 'application/json' }
        });
    }
};

/**
 * 装配抽奖
 */
export const activityStrategyArmory = (activityId: number) => {
    return request(`${apiHostUrl}/api/v1/raffle/activity/armory?activityId=${activityId}`, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' }
    });
}

/**
 * 查询抽奖奖品列表
 */
export const queryRaffleAwardList = (userId: string, activityId: number) => {
    return request(`${apiHostUrl}/api/v1/raffle/strategy/query_raffle_award_list`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, activityId })
    });
}

/**
 * 抽奖接口
 */
export const draw = (userId: string, activityId: number) => {
    return request(`${apiHostUrl}/api/v1/raffle/activity/draw`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json;charset=utf-8' },
        body: JSON.stringify({ userId, activityId })
    });
}

/**
 * 抽奖接口 (10连抽)
 */
export const drawTen = (userId: any, activityId: any) => {
    return request(`${apiHostUrl}/api/v1/raffle/activity/drawTen`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json;charset=utf-8' },
        body: JSON.stringify({ userId, activityId })
    });
}

/**
 * 查询账户额度
 */
export const queryUserActivityAccount = (userId: string, activityId: number) => {
    return request(`${apiHostUrl}/api/v1/raffle/activity/query_user_activity_account`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json;charset=utf-8' },
        body: JSON.stringify({ userId, activityId })
    });
}

/**
 * 日历签到返利接口
 */
export const calendarSignRebate = (userId: string) => {
    return request(`${apiHostUrl}/api/v1/raffle/activity/calendar_sign_rebate?userId=${userId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
    });
}

/**
 * 判断是否签到接口
 */
export const isCalendarSignRebate = (userId: string) => {
    return request(`${apiHostUrl}/api/v1/raffle/activity/is_calendar_sign_rebate?userId=${userId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
    });
}

/**
 * 查询权重规则
 */
export const queryRaffleStrategyRuleWeight = (userId: string, activityId: number) => {
    return request(`${apiHostUrl}/api/v1/raffle/strategy/query_raffle_strategy_rule_weight`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json;charset=utf-8' },
        body: JSON.stringify({ userId, activityId })
    });
}

export const queryUserCreditAccount = (userId: string) => {
    return request(`${apiHostUrl}/api/v1/raffle/activity/query_user_credit_account?userId=${userId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
    });
}

export const querySkuProductListByActivityId = (activityId: number) => {
    return request(`${apiHostUrl}/api/v1/raffle/activity/query_sku_product_list_by_activity_id?activityId=${activityId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
    });
}

export const creditPayExchangeSku = (userId: string, sku: number) => {
    return request(`${apiHostUrl}/api/v1/raffle/activity/credit_pay_exchange_sku`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json;charset=utf-8' },
        body: JSON.stringify({ userId, sku })
    });
}
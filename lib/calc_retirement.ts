import { addMonths, addYears, differenceInDays } from 'date-fns';

export interface RetirementInfo {
    yob: number; // 出生年
    mob: number; // 出生月
    type: string; // 性别和人员类型
    orig_ret_age: number; // 原退休年龄
    orig_ret_time: Date; // 原退休日期
    orig_ret_days_between: number; // 当前日期到原退休日期之间的天数差
    ret_age: number; // 改革后新的退休年龄
    ret_time: Date; // 改革后新的退休日期
    ret_days_between: number; // 当前日期到改革后新的退休日期之间的天数差
    delay: number; // 延迟的月数
}

// 计算延迟月数
function calculateDelayMonths(origRetAge: number, monthsBetween: number): number {
    const delayRules: { [key: number]: { maxDelay: number; interval: number } } = {
        60: { maxDelay: 36, interval: 4 }, // 60岁退休，每4个月延迟1个月，最多延迟36个月
        55: { maxDelay: 36, interval: 4 }, // 55岁退休，每4个月延迟1个月，最多延迟36个月
        50: { maxDelay: 60, interval: 2 }, // 50岁退休，每2个月延迟1个月，最多延迟60个月
    };

    const rule = delayRules[origRetAge];
    return rule ? Math.min(rule.maxDelay, Math.ceil(monthsBetween / rule.interval)) : 0;
}

// 封装的日期计算逻辑
function calculateDateDifference(targetDate: Date, currentDate: Date): number {
    return differenceInDays(targetDate, currentDate);
}

export function calc_retirement(yob: number, mob: number, type: string): RetirementInfo {
    const birthDate = new Date(yob, mob - 1, 1); // Date 的月份从0开始

    // 原退休年龄映射
    const origRetAgeMap: { [key: string]: number } = { male: 60, female50: 50, female55: 55 };
    const origRetAge = origRetAgeMap[type];

    if (origRetAge === undefined) {
        console.warn("无效的性别及人员类型。预期值为'male'、'female50'或'female55'。");
        throw new Error("Invalid type");
    }

    // 政策开始日期
    const policyStartDate = new Date(2025, 0, 1); // 2025-01-01

    // 计算原退休日期
    const origRetTime = addYears(birthDate, origRetAge);
    const currentDate = new Date();

    // 计算原退休日期与当前日期之间的天数差
    const origRetDaysBetween = calculateDateDifference(origRetTime, currentDate);

    if (origRetDaysBetween < 0) {
        // 已过退休年龄，直接返回当前信息
        return {
            yob,
            mob,
            type,
            orig_ret_age: origRetAge,
            orig_ret_time: origRetTime,
            orig_ret_days_between: origRetDaysBetween,
            ret_age: origRetAge,
            ret_time: origRetTime,
            ret_days_between: origRetDaysBetween,
            delay: 0
        };
    }

    // 计算从政策开始日期到原退休日期的月数差
    const monthsBetween = (origRetTime.getFullYear() - policyStartDate.getFullYear()) * 12 +
        (origRetTime.getMonth() - policyStartDate.getMonth()) + 1;

    // 计算延迟月数
    const delay = calculateDelayMonths(origRetAge, monthsBetween);

    // 计算新的退休日期
    const retTime = addMonths(origRetTime, delay);
    const retDaysBetween = calculateDateDifference(retTime, currentDate);

    // 计算新的退休年龄（精确到月）
    const newRetAge = origRetAge + delay / 12;

    return {
        yob,
        mob,
        type,
        orig_ret_age: parseFloat(origRetAge.toFixed(2)),
        orig_ret_time: origRetTime,
        orig_ret_days_between: origRetDaysBetween,
        ret_age: parseFloat(newRetAge.toFixed(2)),
        ret_time: retTime,
        ret_days_between: retDaysBetween,
        delay,
    };
}

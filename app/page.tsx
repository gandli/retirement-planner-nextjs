"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import prompts from "@/lib/prompts.json";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { calc_retirement, RetirementInfo } from "@/lib/calc_retirement";

const formatDate = (date: Date | undefined) => {
  if (!date) return "未知日期";
  const year = date.getFullYear();
  const month = (date.getMonth() + 1).toString().padStart(2, "0");
  return `${year}年${month}月`;
};

export default function Home() {
  const [response, setResponse] = useState("");
  const [formData, setFormData] = useState({
    birthYear: "1970",
    birthMonth: "1",
    type: "male",
  });
  const [retirementInfo, setRetirementInfo] = useState<RetirementInfo | null>(null);
  const controllerRef = useRef<AbortController | null>(null);

  // 计算退休信息
  useEffect(() => {
    const retirementData = calc_retirement(
      Number(formData.birthYear),
      Number(formData.birthMonth),
      formData.type
    );
    setRetirementInfo(retirementData);
  }, [formData]);

  // 用于请求 API
  const submitRequest = useCallback(async () => {
    if (controllerRef.current) {
      controllerRef.current.abort();
    }

    const controller = new AbortController();
    controllerRef.current = controller;
    setResponse("");

    try {
      const res = await fetch("/api/openai", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: [
            prompts.messages[0],
            {
              role: "user",
              content: `TOPIC:延迟退休，BACKGROUND：出生年份：${formData.birthYear}，出生月份：${formData.birthMonth}，性别：${formData.type === "male" ? "男性" : "女性"}，原退休年龄：${retirementInfo?.orig_ret_age}，原退休时间：${formatDate(retirementInfo?.orig_ret_time)}，延迟月数：${retirementInfo?.delay}个月，距离退休还有：${retirementInfo?.ret_days_between}天`,
            },
          ],
        }),
        signal: controller.signal,
      });

      const reader = res.body?.getReader();
      const decoder = new TextDecoder("utf-8");

      if (reader) {
        let done = false;
        while (!done) {
          const { value, done: isDone } = await reader.read();
          done = isDone;
          if (value) {
            const chunk = decoder.decode(value, { stream: true });
            chunk.split("\n").forEach((message) => {
              if (message) {
                try {
                  const { choices } = JSON.parse(message);
                  const content = choices[0]?.delta?.content;
                  if (content) {
                    setResponse((prev) => prev + content);
                  }
                } catch (error) {
                  console.error("JSON 解析错误:", error);
                }
              }
            });
          }
        }
      }
    } catch (error: unknown) {
      if (error instanceof Error && error.name !== "AbortError") {
        console.error("请求错误:", error);
      }
    }
  }, [formData, retirementInfo]);

  useEffect(() => {
    if (retirementInfo) {
      submitRequest();
    }
  }, [retirementInfo, submitRequest]);

  return (
    <div className="flex flex-col items-center min-h-screen p-8 w-full lg:max-w-2xl mx-auto">
      <h1 className="text-3xl font-bold text-center">悠享退休</h1>
      <p className="text-sm text-muted-foreground mt-4 text-left w-full max-w-lg">
        说明：按照
        <a
          href="https://www.mohrss.gov.cn/SYrlzyhshbzb/ztzl/zt202409/qwfb/202409/t20240913_525781.html"
          target="_blank"
          rel="noopener noreferrer"
          className="underline text-blue-600"
        >
          《关于实施渐进式延迟法定退休年龄的决定》
        </a>
        附表对照关系，选择出生年月、性别及人员类型，即可计算出对应的改革后法定退休年龄及退休信息。
      </p>

      <div className="flex flex-row gap-4 mt-6 w-full max-w-lg">
        <div className="relative w-full sm:w-1/2">
          <Input
            type="number"
            placeholder="出生年份"
            value={formData.birthYear}
            onChange={(e) => setFormData({ ...formData, birthYear: e.target.value })}
            className="pr-8 w-full"
          />
          <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500">年</span>
        </div>

        <div className="relative w-full sm:w-1/2">
          <Input
            type="number"
            placeholder="出生月份"
            value={formData.birthMonth}
            onChange={(e) => setFormData({ ...formData, birthMonth: e.target.value })}
            className="pr-8 w-full"
          />
          <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500">月</span>
        </div>
        
        <Select value={formData.type} onValueChange={(value) => setFormData({ ...formData, type: value })}>
          <SelectTrigger>
            <SelectValue placeholder="选择类型" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="male">男职工</SelectItem>
            <SelectItem value="female50">原法定退休年龄50周岁女职工</SelectItem>
            <SelectItem value="female55">原法定退休年龄55周岁女职工</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <Separator className="my-6" />

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4 w-full max-w-lg">
        <div>
          <h2 className="text-xl font-semibold mb-4">原始退休信息</h2>
          <p className="line-through">
            <strong>原退休年龄： </strong>
            {retirementInfo?.orig_ret_age}岁
          </p>
          <p className="line-through">
            <strong>原退休时间： </strong> {formatDate(retirementInfo?.orig_ret_time)}
          </p>
        </div>
        <div>
          <h2 className="text-xl font-semibold mb-4">改革后退休信息</h2>
          <p>
            <strong>退休年龄： </strong> {retirementInfo?.ret_age}岁
          </p>
          <p>
            <strong>退休时间： </strong> {formatDate(retirementInfo?.ret_time)}
          </p>
          <p>
            <strong>延迟月数： </strong> {retirementInfo?.delay}个月
          </p>
          {retirementInfo?.ret_days_between != null && (
            <p>
              <strong>{retirementInfo.ret_days_between > 0 ? "距离退休还有：" : "已退休："} </strong>
              {Math.abs(retirementInfo.ret_days_between)}天
            </p>
          )}
        </div>
      </div>

      {response && (
        <>
          <Separator className="my-6" />
          <div className="w-full max-w-lg mt-6">
            <h2 className="text-xl font-semibold mb-4">调侃一下</h2>
            <p>{response}</p>
          </div>
        </>
      )}
    </div>
  );
}

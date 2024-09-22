import OpenAI from 'openai';
import type { NextRequest } from 'next/server';

export const runtime = 'edge';

export async function POST(req: NextRequest) {
    const openai = new OpenAI({
        apiKey: process.env.ZHIPUAI_API_KEY,
        baseURL: process.env.ZHIPUAI_API_BASEURL
    });

    const body = await req.json();
    const messages = body.messages || [
        { role: "system", content: "你是一个AI助手，你可以回答任何问题。" },
        { role: 'user', content: '你好，OpenAI！' }
    ]; // 默认消息

    const stream = openai.beta.chat.completions.stream({
        model: process.env.ZHIPUAI_MODEL_ID || 'gpt-3.5-turbo',
        stream: true,
        messages,
    });

    // 返回流式响应
    return new Response(stream.toReadableStream());
}

import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(request: NextRequest) {
  try {
    const { topic } = await request.json();

    if (!topic || topic.trim().length === 0) {
      return NextResponse.json(
        { error: 'お題を入力してください' }, 
        { status: 400 }
      );
    }

    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [{
        role: "system",
        content: `あなたは「あるある」生成の専門家です。与えられたお題から3つのあるあるを生成してください。

ルール：
- 各あるあるは1〜2文、30〜60字程度
- 必ず語尾に「〜しがち」「〜がち」を含める
- 具体的な名詞（場所/時刻/物）を1つ以上含める
- 全て現実から離れた突拍子もない回答にする

出力形式：
JSON配列形式で3つのあるあるを返してください。
["あるある1", "あるある2", "あるある3"]

余計な説明や前置きは不要です。配列のみを返してください。`
      }, {
        role: "user", 
        content: `お題: ${topic}`
      }],
      max_tokens: 400,
      temperature: 0.8
    });

    const content = completion.choices[0].message.content;
    
    // JSONパースを試行
    let texts: string[];
    try {
      texts = JSON.parse(content || '[]');
      if (!Array.isArray(texts)) {
        throw new Error('配列形式ではありません');
      }
    } catch {
      // JSONパースに失敗した場合、改行で分割して処理
      texts = content?.split('\n')
        .filter(line => line.trim().length > 0)
        .map(line => line.replace(/^\d+\.\s*/, '').replace(/^[「"『]/, '').replace(/[」"』]$/, '').trim())
        .filter(line => line.length > 10) // 短すぎる行を除外
        .slice(0, 3) || [];
    }

    // 3つに満たない場合はエラー
    if (texts.length < 3) {
      return NextResponse.json(
        { error: '十分なあるあるが生成されませんでした。別のお題でお試しください。' }, 
        { status: 500 }
      );
    }

    return NextResponse.json({ texts: texts.slice(0, 3) });

  } catch (error: any) {
    console.error('OpenAI API Error:', error);
    
    if (error.code === 'insufficient_quota') {
      return NextResponse.json(
        { error: 'APIの利用制限に達しました。しばらくしてからお試しください。' }, 
        { status: 429 }
      );
    }
    
    return NextResponse.json(
      { error: '生成に失敗しました。しばらくしてから再試行してください。' }, 
      { status: 500 }
    );
  }
}
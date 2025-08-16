'use client';

import React, { useState } from 'react';
import { Share2, Shuffle, Zap, ArrowRight, Sparkles } from 'lucide-react';

// 型定義
interface AruaruResult {
  id: number;
  text: string;
  topic: string;
  timestamp: string;
}

export default function Home() {
  const [topic, setTopic] = useState('');
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<AruaruResult[]>([]);
  const [error, setError] = useState('');

  // ランダムお題のサンプル
  const randomTopics = [
    'リモートワーク', 'コンビニ', '電車通勤', 'スマホ', 'カフェ',
    '休日', 'SNS', 'オンライン会議', '深夜', 'ダイエット'
  ];

  // あるあるテキスト生成（実際のAPI呼び出し）
  const generateAruaruTexts = async (inputTopic: string) => {
    const response = await fetch('/api/generate-texts', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ topic: inputTopic }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || '生成に失敗しました');
    }

    const data = await response.json();
    return data.texts;
  };

  // メイン生成処理
  const handleGenerate = async () => {
    if (!topic.trim()) {
      setError('キーワードを入力してください');
      return;
    }

    setLoading(true);
    setError('');
    setResults([]);

    try {
      const texts = await generateAruaruTexts(topic);
      
      const newResults = texts.map((text: string, index: number) => ({
        id: Date.now() + index,
        text,
        topic,
        timestamp: new Date().toLocaleTimeString()
      }));
      
      setResults(newResults);
      
    } catch (err: any) {
      setError(err.message || '生成に失敗しました。再試行してください。');
      console.error('Generation error:', err);
    } finally {
      setLoading(false);
    }
  };

  // ランダムお題選択
  const handleRandomTopic = () => {
    const randomTopic = randomTopics[Math.floor(Math.random() * randomTopics.length)];
    setTopic(randomTopic);
  };

  // 共有機能
  const handleShare = (resultItem: AruaruResult) => {
    if (navigator.share) {
      navigator.share({
        title: 'AIあるある生成',
        text: resultItem.text,
        url: window.location.href
      });
    } else {
      navigator.clipboard.writeText(resultItem.text);
      alert('クリップボードにコピーしました');
    }
  };

  // 通報機能は削除

  return (
    <div className="min-h-screen bg-white text-gray-900 relative overflow-hidden">
      {/* 背景装飾 */}
      <div className="absolute inset-0 bg-[linear-gradient(rgba(0,0,0,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(0,0,0,0.02)_1px,transparent_1px)] bg-[size:60px_60px]"></div>
      
      {/* グラデーションオーバーレイ */}
      <div className="absolute inset-0 bg-gradient-to-br from-gray-50/50 via-white to-gray-100/50"></div>

      {/* ヘッダー */}
      <header className="relative z-10 border-b border-gray-200 bg-white/80 backdrop-blur-md">
        <div className="max-w-5xl mx-auto px-6 py-12">
          <div className="text-center">
            <h1 className="text-5xl md:text-6xl font-light mb-6 tracking-tight text-gray-900">
              あるある
            </h1>
            <p className="text-gray-600 text-xl font-light">
              ありふれた日常に潜む、小さな共感を紡ぐ
            </p>
          </div>
        </div>
      </header>

      <main className="relative z-10 max-w-4xl mx-auto px-6 py-16">
        {/* 入力エリア */}
        <div className="mb-16">
          <div className="bg-white/90 backdrop-blur-xl rounded-3xl border border-gray-200 shadow-xl p-10">
            <div className="space-y-8">
              <div className="text-center mb-10">
                <h2 className="text-3xl font-light mb-4 text-gray-900">想いを込めて</h2>
              </div>
              
              <div className="flex gap-4">
                <div className="flex-1 relative">
                  <input
                    type="text"
                    value={topic}
                    onChange={(e) => setTopic(e.target.value)}
                    placeholder="例：小学生、お母さん、夏..."
                    className="w-full px-8 py-5 bg-gray-50 border border-gray-300 rounded-2xl focus:border-gray-900 focus:ring-2 focus:ring-gray-900/10 outline-none text-gray-900 placeholder-gray-400 transition-all text-lg"
                    disabled={loading}
                  />
                </div>
                <button
                  onClick={handleRandomTopic}
                  disabled={loading}
                  className="px-8 py-5 bg-gray-100 border border-gray-300 rounded-2xl hover:bg-gray-200 transition-colors disabled:opacity-50 flex items-center gap-3 text-gray-700 font-medium"
                >
                  <Shuffle size={22} />
                  <span className="hidden sm:inline">ランダム</span>
                </button>
              </div>
              
              {error && (
                <div className="text-red-600 text-center bg-red-50 border border-red-200 p-5 rounded-2xl font-medium">
                  {error}
                </div>
              )}
              
              <button
                onClick={handleGenerate}
                disabled={loading || !topic.trim()}
                className="w-full bg-gray-900 hover:bg-gray-800 text-white py-6 px-10 rounded-2xl font-medium text-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-4 shadow-lg"
              >
                {loading ? (
                  <>
                    <div className="animate-spin rounded-full h-6 w-6 border-2 border-white border-t-transparent"></div>
                    生成中...
                  </>
                ) : (
                  <>
                    あるある生成
                    <ArrowRight size={24} />
                  </>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* 結果表示エリア */}
        {results.length > 0 && (
          <div className="space-y-8">
            {/* 結果ヘッダー */}
            <div className="text-center">
              <h3 className="text-3xl font-light mb-3 text-gray-900">お題：{results[0]?.topic}</h3>
            </div>
            
            {/* あるあるカード一覧 */}
            <div className="grid gap-6">
              {results.map((resultItem: AruaruResult, index: number) => (
                <div key={resultItem.id} className="bg-white/90 backdrop-blur-xl rounded-3xl border border-gray-200 shadow-lg hover:shadow-xl transition-all p-8">
                  <div className="flex items-start justify-between mb-6">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-gray-900 text-white rounded-full flex items-center justify-center font-bold text-lg">
                        {index + 1}
                      </div>
                    </div>
                    
                    {/* アクションボタン */}
                    <div className="flex gap-3">
                      <button
                        onClick={() => handleShare(resultItem)}
                        className="p-3 bg-gray-100 hover:bg-gray-200 rounded-xl transition-colors border border-gray-200 text-gray-700"
                        title="共有"
                      >
                        <Share2 size={20} />
                      </button>
                    </div>
                  </div>
                  
                  {/* テキスト部分 */}
                  <div className="bg-gray-50 p-8 rounded-2xl border border-gray-100">
                    <p className="text-xl leading-relaxed font-medium text-gray-800">
                      {resultItem.text}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 再生成ボタン（結果がある時のみ） */}
        {results.length > 0 && !loading && (
          <div className="text-center mt-12">
            <button
              onClick={handleGenerate}
              className="bg-white border border-gray-300 hover:border-gray-400 text-gray-700 hover:text-gray-900 px-10 py-4 rounded-2xl transition-colors flex items-center gap-3 mx-auto font-medium shadow-md hover:shadow-lg"
            >
              <Zap size={20} />
              もう一度生成
            </button>
          </div>
        )}
      </main>

      {/* フッター */}
      <footer className="relative z-10 border-t border-gray-200 mt-24 bg-white/80 backdrop-blur-md">
        <div className="max-w-5xl mx-auto px-6 py-16">
          <div className="grid md:grid-cols-3 gap-12 text-sm text-gray-600">
            <div>
              <h4 className="text-gray-900 font-semibold mb-4 text-base">利用ガイドライン</h4>
              <p className="leading-relaxed">著名人、商標、差別的表現は生成されません。不適切な内容が生成された場合はご連絡ください。</p>
            </div>
            <div>
              <h4 className="text-gray-900 font-semibold mb-4 text-base">コンテンツポリシー</h4>
              <p className="leading-relaxed">生成されたコンテンツの利用については利用規約をご確認ください。すべてのコンテンツはAIによって生成されています。</p>
            </div>
            <div>
              <h4 className="text-gray-900 font-semibold mb-4 text-base">テクノロジー</h4>
              <p className="leading-relaxed">本システムはOpenAI GPT-4o-miniによるリアルタイム生成のみを行います。</p>
            </div>
          </div>
          <div className="border-t border-gray-200 mt-12 pt-8 text-center text-gray-500 text-sm">
            © 2025 AIあるある生成システム. AI-powered content generation platform.
          </div>
        </div>
      </footer>
    </div>
  );
}
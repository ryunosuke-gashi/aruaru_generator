'use client';

import React, { useState } from 'react';
import { Share2, Shuffle, Zap, ArrowRight } from 'lucide-react';

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
      
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : '生成に失敗しました。再試行してください。';
      setError(errorMessage);
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

  return (
    <div className="min-h-screen bg-white text-gray-900 relative overflow-hidden">
      {/* 背景装飾 */}
      <div className="absolute inset-0 bg-[linear-gradient(rgba(0,0,0,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(0,0,0,0.02)_1px,transparent_1px)] bg-[size:60px_60px]"></div>
      
      {/* グラデーションオーバーレイ */}
      <div className="absolute inset-0 bg-gradient-to-br from-gray-50/50 via-white to-gray-100/50"></div>

      {/* ヘッダー - スマホ対応改善 */}
      <header className="relative z-10 border-b border-gray-200 bg-white/80 backdrop-blur-md">
        <div className="max-w-5xl mx-auto px-4 md:px-6 py-8 md:py-12">
          <div className="text-center">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-light mb-4 md:mb-6 tracking-tight text-gray-900">
              あるある
            </h1>
            <p className="text-gray-600 text-lg md:text-xl font-light px-4">
              ありふれた日常に潜む、小さな共感を紡ぐ
            </p>
          </div>
        </div>
      </header>

      <main className="relative z-10 max-w-4xl mx-auto px-4 md:px-6 py-8 md:py-16">
        {/* 入力エリア - スマホ対応改善 */}
        <div className="mb-12 md:mb-16">
          <div className="bg-white/90 backdrop-blur-xl rounded-2xl md:rounded-3xl border border-gray-200 shadow-xl p-6 md:p-10">
            <div className="space-y-6 md:space-y-8">
              <div className="text-center mb-6 md:mb-10">
                <h2 className="text-2xl md:text-3xl font-light mb-3 md:mb-4 text-gray-900">想いを込めて</h2>
                <p className="text-gray-500 text-base md:text-lg px-2">あなたが普段見過ごしているかもしれない日常はなんですか？</p>
              </div>
              
              {/* スマホでは縦並び、タブレット以上で横並び */}
              <div className="flex flex-col sm:flex-row gap-3 md:gap-4">
                <div className="flex-1 relative">
                  <input
                    type="text"
                    value={topic}
                    onChange={(e) => setTopic(e.target.value)}
                    placeholder="例：小学生、お母さん、夏..."
                    className="w-full px-6 md:px-8 py-4 md:py-5 bg-gray-50 border border-gray-300 rounded-xl md:rounded-2xl focus:border-gray-900 focus:ring-2 focus:ring-gray-900/10 outline-none text-gray-900 placeholder-gray-400 transition-all text-base md:text-lg"
                    disabled={loading}
                  />
                </div>
                <button
                  onClick={handleRandomTopic}
                  disabled={loading}
                  className="px-6 md:px-8 py-4 md:py-5 bg-gray-100 border border-gray-300 rounded-xl md:rounded-2xl hover:bg-gray-200 transition-colors disabled:opacity-50 flex items-center justify-center gap-2 md:gap-3 text-gray-700 font-medium min-w-[120px] sm:min-w-auto"
                >
                  <Shuffle size={20} />
                  <span>ランダム</span>
                </button>
              </div>
              
              {error && (
                <div className="text-red-600 text-center bg-red-50 border border-red-200 p-4 md:p-5 rounded-xl md:rounded-2xl font-medium text-sm md:text-base">
                  {error}
                </div>
              )}
              
              <button
                onClick={handleGenerate}
                disabled={loading || !topic.trim()}
                className="w-full bg-gray-900 hover:bg-gray-800 text-white py-5 md:py-6 px-8 md:px-10 rounded-xl md:rounded-2xl font-medium text-lg md:text-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3 md:gap-4 shadow-lg"
              >
                {loading ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 md:h-6 md:w-6 border-2 border-white border-t-transparent"></div>
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

        {/* 結果表示エリア - スマホ対応改善 */}
        {results.length > 0 && (
          <div className="space-y-6 md:space-y-8">
            {/* 結果ヘッダー */}
            <div className="text-center">
              <h3 className="text-2xl md:text-3xl font-light mb-2 md:mb-3 text-gray-900">生成結果</h3>
              <p className="text-gray-500 text-base md:text-lg">お題：{results[0]?.topic}</p>
            </div>
            
            {/* あるあるカード一覧 */}
            <div className="grid gap-4 md:gap-6">
              {results.map((resultItem: AruaruResult, index: number) => (
                <div key={resultItem.id} className="bg-white/90 backdrop-blur-xl rounded-2xl md:rounded-3xl border border-gray-200 shadow-lg hover:shadow-xl transition-all p-6 md:p-8">
                  <div className="flex items-start justify-between mb-4 md:mb-6">
                    <div className="flex items-center gap-3 md:gap-4">
                      <div className="w-10 h-10 md:w-12 md:h-12 bg-gray-900 text-white rounded-full flex items-center justify-center font-bold text-base md:text-lg">
                        {index + 1}
                      </div>
                    </div>
                    
                    {/* アクションボタン */}
                    <div className="flex gap-2 md:gap-3">
                      <button
                        onClick={() => handleShare(resultItem)}
                        className="p-2 md:p-3 bg-gray-100 hover:bg-gray-200 rounded-lg md:rounded-xl transition-colors border border-gray-200 text-gray-700"
                        title="共有"
                      >
                        <Share2 size={20} />
                      </button>
                    </div>
                  </div>
                  
                  {/* テキスト部分 */}
                  <div className="bg-gray-50 p-6 md:p-8 rounded-xl md:rounded-2xl border border-gray-100">
                    <p className="text-lg md:text-xl leading-relaxed font-medium text-gray-800">
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
          <div className="text-center mt-8 md:mt-12">
            <button
              onClick={handleGenerate}
              className="bg-white border border-gray-300 hover:border-gray-400 text-gray-700 hover:text-gray-900 px-8 md:px-10 py-3 md:py-4 rounded-xl md:rounded-2xl transition-colors flex items-center gap-2 md:gap-3 mx-auto font-medium shadow-md hover:shadow-lg"
            >
              <Zap size={20} />
              もう一度生成
            </button>
          </div>
        )}
      </main>

      {/* フッター - スマホ対応改善 */}
      <footer className="relative z-10 border-t border-gray-200 mt-16 md:mt-24 bg-white/80 backdrop-blur-md">
        <div className="max-w-5xl mx-auto px-4 md:px-6 py-12 md:py-16">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-12 text-sm text-gray-600">
            <div>
              <h4 className="text-gray-900 font-semibold mb-3 md:mb-4 text-base">利用ガイドライン</h4>
              <p className="leading-relaxed">著名人、商標、差別的表現は生成されません。不適切な内容が生成された場合はご連絡ください。</p>
            </div>
            <div>
              <h4 className="text-gray-900 font-semibold mb-3 md:mb-4 text-base">コンテンツポリシー</h4>
              <p className="leading-relaxed">生成されたコンテンツの利用については利用規約をご確認ください。すべてのコンテンツはAIによって生成されています。</p>
            </div>
            <div>
              <h4 className="text-gray-900 font-semibold mb-3 md:mb-4 text-base">テクノロジー</h4>
              <p className="leading-relaxed">本システムは学習機能を持たず、リアルタイム生成のみを行います。OpenAI GPT-4o-miniを使用しています。</p>
            </div>
          </div>
          <div className="border-t border-gray-200 mt-8 md:mt-12 pt-6 md:pt-8 text-center text-gray-500 text-xs md:text-sm">
            © 2025 AIあるある生成システム. AI-powered content generation platform.
          </div>
        </div>
      </footer>
    </div>
  );
}
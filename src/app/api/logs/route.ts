import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function GET() {
  try {
    // 最新100件のログを取得
    const { data: logs, error } = await supabase
      .from('aruaru_logs')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(100);

    if (error) {
      throw error;
    }

    // 統計情報も計算
    const totalCount = logs?.length || 0;
    const uniqueTopics = new Set(logs?.map(log => log.topic)).size;
    const todayCount = logs?.filter(log => 
      new Date(log.created_at).toDateString() === new Date().toDateString()
    ).length || 0;

    return NextResponse.json({
      logs,
      stats: {
        total: totalCount,
        uniqueTopics,
        today: todayCount
      }
    });

  } catch (error) {
    console.error('ログ取得エラー:', error);
    return NextResponse.json(
      { error: 'データの取得に失敗しました' },
      { status: 500 }
    );
  }
}
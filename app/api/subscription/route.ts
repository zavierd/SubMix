// 订阅配置API端点
// 支持Vercel等云平台部署，自动适配域名

import { NextRequest, NextResponse } from 'next/server';

// 存储配置的临时缓存 (生产环境建议使用Redis等持久化存储)
const configCache = new Map<string, { config: string; timestamp: number }>();

// 清理过期配置的函数
function cleanExpiredConfigs() {
  const now = Date.now();
  const expireTime = 30 * 60 * 1000; // 30分钟过期
  
  for (const [key, value] of configCache.entries()) {
    if (now - value.timestamp > expireTime) {
      configCache.delete(key);
    }
  }
}

// 生成唯一ID
function generateId(): string {
  return Math.random().toString(36).substring(2, 15) + 
         Math.random().toString(36).substring(2, 15);
}

// POST: 存储配置并返回订阅ID
export async function POST(request: NextRequest) {
  try {
    const { config } = await request.json();
    
    if (!config || typeof config !== 'string') {
      return NextResponse.json(
        { error: '配置内容不能为空' },
        { status: 400 }
      );
    }

    // 清理过期配置
    cleanExpiredConfigs();
    
    // 生成唯一ID并存储配置
    const id = generateId();
    configCache.set(id, {
      config,
      timestamp: Date.now()
    });

    return NextResponse.json({ id });
  } catch (error) {
    console.error('存储配置失败:', error);
    return NextResponse.json(
      { error: '服务器内部错误' },
      { status: 500 }
    );
  }
}

// GET: 根据ID获取配置
export async function GET(request: NextRequest) {
  try {
    const url = new URL(request.url);
    const id = url.searchParams.get('id');
    
    if (!id) {
      return NextResponse.json(
        { error: '缺少配置ID' },
        { status: 400 }
      );
    }

    // 清理过期配置
    cleanExpiredConfigs();
    
    const configData = configCache.get(id);
    
    if (!configData) {
      return NextResponse.json(
        { error: '配置不存在或已过期' },
        { status: 404 }
      );
    }

    // 返回配置文件，设置正确的Content-Type和CORS头
    return new NextResponse(configData.config, {
      status: 200,
      headers: {
        'Content-Type': 'text/yaml; charset=utf-8',
        'Content-Disposition': 'attachment; filename="config.yaml"',
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET',
        'Access-Control-Allow-Headers': 'Content-Type'
      }
    });
  } catch (error) {
    console.error('获取配置失败:', error);
    return NextResponse.json(
      { error: '服务器内部错误' },
      { status: 500 }
    );
  }
}

/**
 * 协议配置 API 路由
 * 使用模块化架构提供协议编辑配置
 */

import { NextResponse } from 'next/server';
import type { EditConfigResponse } from '@/types/proxy';
import { 
  getAllProtocolConfigs, 
  fieldGroups, 
  validateProtocolConfigs 
} from '@/lib/protocol-configs';

/**
 * 获取协议配置
 */
export async function GET() {
  try {
    // 验证配置完整性（开发时检查）
    if (process.env.NODE_ENV === 'development') {
      const validation = validateProtocolConfigs();
      if (!validation.valid) {
        console.warn('协议配置验证失败:', validation.errors);
      }
    }
    
    // 获取所有协议配置
    const protocolConfigs = getAllProtocolConfigs();
    
    const response: EditConfigResponse = {
      success: true,
      protocols: protocolConfigs
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error('获取协议配置失败:', error);
    
    const errorResponse: EditConfigResponse = {
      success: false,
      protocols: [],
      error: '获取协议配置失败'
    };
    
    return NextResponse.json(errorResponse, { status: 500 });
  }
}

// 导出字段分组配置供前端使用
export const FIELD_GROUPS = fieldGroups;

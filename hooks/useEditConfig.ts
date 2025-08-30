// 编辑配置相关的 hooks

import { useState, useEffect } from 'react';
import type { EditConfigResponse, ProtocolEditConfig } from '@/types/proxy';

export function useEditConfig() {
  const [configs, setConfigs] = useState<ProtocolEditConfig[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchConfigs = async () => {
      try {
        setLoading(true);
        const response = await fetch('/api/proxy-config');
        const data: EditConfigResponse = await response.json();
        
        if (data.success) {
          setConfigs(data.protocols);
          setError(null);
        } else {
          setError(data.error || '获取配置失败');
        }
      } catch (err) {
        console.error('获取编辑配置失败:', err);
        setError('网络错误，无法获取配置');
      } finally {
        setLoading(false);
      }
    };

    fetchConfigs();
  }, []);

  // 根据协议类型获取配置
  const getConfigByType = (type: string): ProtocolEditConfig | null => {
    return configs.find(config => config.type === type) || null;
  };

  return {
    configs,
    loading,
    error,
    getConfigByType
  };
}


// 配置生成相关的 hooks

import { useState, useEffect, useCallback } from 'react';
import { toast } from 'sonner';
import { MihomoConfigGenerator } from '@/lib/mihomo-config';
import type { ParsedProxy, RuleMode } from '@/types/proxy';

export function useConfigGeneration(proxies: ParsedProxy[], ruleMode: RuleMode) {
  const [outputYaml, setOutputYaml] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);

  // 生成配置的核心方法
  const generateConfig = useCallback((proxiesList: ParsedProxy[], showSuccessToast = true) => {
    if (proxiesList.length === 0) {
      setOutputYaml("");
      return;
    }

    try {
      const config = MihomoConfigGenerator.generateConfig(proxiesList, ruleMode);
      const yamlOutput = MihomoConfigGenerator.configToYaml(config);
      setOutputYaml(yamlOutput);
      if (showSuccessToast) {
        toast.success(`成功生成配置文件，包含 ${proxiesList.length} 个节点`);
      }
    } catch (error) {
      console.error("生成配置失败:", error);
      toast.error("生成配置失败");
    }
  }, [ruleMode]);

  // 监听变化自动重新生成配置
  useEffect(() => {
    if (proxies.length > 0) {
      generateConfig(proxies, false);
    } else {
      setOutputYaml("");
    }
  }, [ruleMode, proxies, generateConfig]);

  // 手动生成配置
  const handleGenerateConfig = useCallback(() => {
    if (proxies.length === 0) {
      toast.error("请先添加至少一个代理节点");
      return;
    }

    setIsProcessing(true);
    generateConfig(proxies, true);
    setIsProcessing(false);
  }, [proxies, generateConfig]);

  // 下载配置文件
  const downloadConfig = useCallback(() => {
    if (!outputYaml) return;

    const blob = new Blob([outputYaml], { type: "text/yaml" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "config.yaml";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    toast.success("配置文件下载成功");
  }, [outputYaml]);

  // 复制配置到剪贴板
  const copyConfig = useCallback(async () => {
    if (!outputYaml) return;
    
    try {
      await navigator.clipboard.writeText(outputYaml);
      toast.success("配置已复制到剪贴板");
    } catch (error) {
      console.error("复制失败:", error);
      toast.error("复制失败，请手动复制");
    }
  }, [outputYaml]);

  return {
    outputYaml,
    isProcessing,
    handleGenerateConfig,
    downloadConfig,
    copyConfig,
  };
}


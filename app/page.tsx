"use client";

import { useState, useEffect, useCallback } from "react";
import { ProxyParser, ProxyNode } from "@/lib/proxy-parser";
import { MihomoConfigGenerator } from "@/lib/mihomo-config";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { 
  Download, 
  Copy, 
  Plus, 
  Trash2, 
  Edit, 
  ChevronUp, 
  ChevronDown, 
  Rocket, 
  Settings,
  Server,
  Network,
  Shield,
  AlertCircle
} from "lucide-react";
import { toast } from "sonner";

interface ParsedProxy extends ProxyNode {
  id: string;
}

export default function Home() {
  const [singleLink, setSingleLink] = useState("");
  const [parsedProxies, setParsedProxies] = useState<ParsedProxy[]>([]);

  const [ruleMode, setRuleMode] = useState<"whitelist" | "blacklist">("whitelist");
  const [outputYaml, setOutputYaml] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [editingProxy, setEditingProxy] = useState<ParsedProxy | null>(null);
  const [editDialogOpen, setEditDialogOpen] = useState(false);

  // 生成唯一ID
  const generateId = () => Math.random().toString(36).substr(2, 9);

  // 生成YAML配置（内部调用）
  const generateConfig = useCallback((proxies: ParsedProxy[], showSuccessToast = true) => {
    if (proxies.length === 0) {
      setOutputYaml("");
      return;
    }

    try {
      const config = MihomoConfigGenerator.generateConfig(proxies, ruleMode);

      const yamlOutput = MihomoConfigGenerator.configToYaml(config);
      setOutputYaml(yamlOutput);
      if (showSuccessToast) {
        toast.success(`成功生成配置文件，包含 ${proxies.length} 个节点`);
      }
    } catch (error) {
      console.error("生成配置失败:", error);
      toast.error("生成配置失败");
    }
  }, [ruleMode]);

  // 监听路由模式和节点列表变化，自动重新生成配置
  useEffect(() => {
    if (parsedProxies.length > 0) {
      generateConfig(parsedProxies, false);
    } else {
      // 当没有节点时，清空YAML配置
      setOutputYaml("");
    }
  }, [ruleMode, parsedProxies, generateConfig]);

  // 解析单个链接
  const handleParseSingleLink = () => {
    if (!singleLink.trim()) {
      toast.error("请输入订阅链接");
      return;
    }

    try {
      const proxy = ProxyParser.parseProxy(singleLink.trim());
      if (!proxy) {
        toast.error("解析失败，请检查链接格式");
        return;
      }

      const parsedProxy: ParsedProxy = {
        ...proxy,
        id: generateId()
      };

      const newProxies = [...parsedProxies, parsedProxy];
      setParsedProxies(newProxies);
      setSingleLink("");
      
      toast.success(`成功解析节点: ${proxy.name}`);
    } catch (error) {
      console.error("解析错误:", error);
      toast.error("解析失败，请检查链接格式");
    }
  };

  // 手动生成YAML配置
  const handleGenerateConfig = () => {
    if (parsedProxies.length === 0) {
      toast.error("请先添加至少一个代理节点");
      return;
    }

    setIsProcessing(true);
    generateConfig(parsedProxies, true);
    setIsProcessing(false);
  };

  // 删除节点
  const handleDeleteProxy = (id: string) => {
    const newProxies = parsedProxies.filter(p => p.id !== id);
    setParsedProxies(newProxies);
    
    toast.success("节点已删除");
  };

  // 移动节点位置
  const handleMoveProxy = (id: string, direction: "up" | "down") => {
    const index = parsedProxies.findIndex(p => p.id === id);
    if (index === -1) return;
    
    const newIndex = direction === "up" ? index - 1 : index + 1;
    if (newIndex < 0 || newIndex >= parsedProxies.length) return;

    const newArray = [...parsedProxies];
    [newArray[index], newArray[newIndex]] = [newArray[newIndex], newArray[index]];
    
    setParsedProxies(newArray);
    
    toast.success(`节点已${direction === "up" ? "上" : "下"}移`);
  };

  // 开始编辑节点
  const handleEditProxy = (proxy: ParsedProxy) => {
    setEditingProxy({ ...proxy });
    setEditDialogOpen(true);
  };

  // 保存编辑的节点
  const handleSaveEdit = () => {
    if (!editingProxy) return;

    const newProxies = parsedProxies.map(p => p.id === editingProxy.id ? editingProxy : p);
    setParsedProxies(newProxies);
    
    setEditDialogOpen(false);
    setEditingProxy(null);
    toast.success("节点信息已更新");
  };

  // 下载配置
  const handleDownload = () => {
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
  };

  // 复制配置
  const handleCopy = async () => {
    if (!outputYaml) return;
    
    try {
      await navigator.clipboard.writeText(outputYaml);
      toast.success("配置已复制到剪贴板");
    } catch (error) {
      console.error("复制失败:", error);
      toast.error("复制失败，请手动复制");
    }
  };

  // 清空所有节点
  const handleClearAll = () => {
    setParsedProxies([]);
    setOutputYaml("");
    toast.info("已清空所有节点");
  };

  const getProtocolIcon = (type: string) => {
    switch (type) {
      case "vless": return <Shield className="h-4 w-4" />;
      case "hysteria2": return <Network className="h-4 w-4" />;
      case "ss": return <Server className="h-4 w-4" />;
      case "trojan": return <Shield className="h-4 w-4" />;
      default: return <Server className="h-4 w-4" />;
    }
  };

  const getProtocolColor = (type: string) => {
    switch (type) {
      case "vless": return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200";
      case "hysteria2": return "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200";
      case "ss": return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200";
      case "trojan": return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200";
      default: return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200";
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-muted/20 to-background">
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        
        {/* 页面标题 */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-3 mb-4">
            <Rocket className="h-8 w-8 text-primary" />
            <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
              SubMix
            </h1>
          </div>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            强大的代理订阅链接转换器，支持逐个添加节点、自由编辑排序，生成专属的 Mihomo 配置
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          
          {/* 左侧：添加节点 */}
          <div className="lg:col-span-3 space-y-6">
            
            {/* 添加节点卡片 */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Plus className="h-5 w-5" />
                  添加节点
                </CardTitle>
                <CardDescription>
                  输入单个订阅链接，解析后添加到节点列表
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="single-link">订阅链接</Label>
                  <Input
                    id="single-link"
                    value={singleLink}
                    onChange={(e) => setSingleLink(e.target.value)}
                    placeholder="粘贴单个订阅链接..."
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        handleParseSingleLink();
                      }
                    }}
                  />
                </div>
                
                <Button 
                  onClick={handleParseSingleLink}
                  disabled={!singleLink.trim()}
                  className="w-full"
                >
                  <Plus className="mr-2 h-4 w-4" />
                  解析并添加
                </Button>
              </CardContent>
            </Card>

            {/* 配置类型 */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Settings className="h-5 w-5" />
                  配置选项
                </CardTitle>
                <CardDescription>
                  选择路由模式
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">


                {/* 路由模式 */}
                <div className="space-y-3">
                  <Label className="text-sm font-medium">路由模式</Label>
                  <RadioGroup 
                    value={ruleMode} 
                    onValueChange={(value) => setRuleMode(value as "whitelist" | "blacklist")}
                    className="space-y-2"
                  >
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="whitelist" id="whitelist" />
                      <Label htmlFor="whitelist" className="cursor-pointer">
                        白名单模式
                        <span className="block text-xs text-muted-foreground">
                          未匹配规则的流量走代理
                        </span>
                      </Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="blacklist" id="blacklist" />
                      <Label htmlFor="blacklist" className="cursor-pointer">
                        黑名单模式
                        <span className="block text-xs text-muted-foreground">
                          只有指定流量走代理
                        </span>
                      </Label>
                    </div>
                  </RadioGroup>
                </div>
              </CardContent>
            </Card>

            {/* 生成配置按钮 */}
            <div className="space-y-3">
              <Button 
                onClick={handleGenerateConfig}
                disabled={parsedProxies.length === 0 || isProcessing}
                className="w-full"
                size="lg"
              >
                {isProcessing ? "生成中..." : "生成 YAML 配置"}
              </Button>
              
              {parsedProxies.length > 0 && (
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button 
                      variant="outline" 
                      className="w-full"
                    >
                      <Trash2 className="mr-2 h-4 w-4" />
                      清空所有节点
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>确认清空</AlertDialogTitle>
                      <AlertDialogDescription>
                        这将删除所有已添加的节点，此操作不可撤销。
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>取消</AlertDialogCancel>
                      <AlertDialogAction onClick={handleClearAll}>
                        确认清空
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              )}
            </div>
          </div>

          {/* 中间：节点列表 */}
          <div className="lg:col-span-5 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Server className="h-5 w-5" />
                    节点列表
                  </div>
                  <Badge variant="secondary">
                    {parsedProxies.length} 个节点
                  </Badge>
                </CardTitle>
                <CardDescription>
                  管理您的代理节点，支持编辑和排序
                </CardDescription>
              </CardHeader>
              <CardContent>
                {parsedProxies.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <AlertCircle className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>暂无节点</p>
                    <p className="text-sm">请在左侧添加订阅链接</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {parsedProxies.map((proxy, index) => (
                      <Card key={proxy.id} className="group border border-border hover:border-primary/50 transition-all duration-200 hover:shadow-md">
                        <CardContent className="p-4">
                          <div className="flex items-start justify-between">
                            <div className="flex-1 min-w-0 space-y-3">
                              
                              {/* 第一行：协议类型和节点名称 */}
                              <div className="flex items-center gap-3">
                                <div className="flex items-center gap-2">
                                  <div className={`p-1.5 rounded-md ${
                                    proxy.type === "vless" ? "bg-blue-100 dark:bg-blue-900/20" :
                                    proxy.type === "hysteria2" ? "bg-purple-100 dark:bg-purple-900/20" :
                                    proxy.type === "ss" ? "bg-green-100 dark:bg-green-900/20" :
                                    proxy.type === "trojan" ? "bg-red-100 dark:bg-red-900/20" :
                                    "bg-gray-100 dark:bg-gray-900/20"
                                  }`}>
                                    {getProtocolIcon(proxy.type)}
                                  </div>
                                  <Badge variant="secondary" className="text-xs font-medium">
                                    {proxy.type.toUpperCase()}
                                  </Badge>
                                </div>
                                <div className="flex-1 min-w-0">
                                  <h4 className="font-semibold text-sm truncate group-hover:text-primary transition-colors">
                                    {proxy.name}
                                  </h4>
                                </div>
                              </div>
                              
                              {/* 第二行：服务器信息 */}
                              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                                <div className="flex items-center gap-1.5">
                                  <Server className="h-3.5 w-3.5" />
                                  <span className="font-mono font-medium">
                                    {proxy.server}
                                  </span>
                                </div>
                                <div className="flex items-center gap-1.5">
                                  <Network className="h-3.5 w-3.5" />
                                  <span>{proxy.port}</span>
                                </div>
                              </div>
                              
                              {/* 第三行：传输协议和安全信息 */}
                              <div className="flex items-center gap-2">
                                {proxy.network && (
                                  <Badge variant="outline" className="text-xs">
                                    <Network className="h-3 w-3 mr-1" />
                                    {String(proxy.network)}
                                  </Badge>
                                )}
                                {proxy.tls && (
                                  <Badge variant="outline" className="text-xs border-green-200 text-green-700 dark:border-green-800 dark:text-green-300">
                                    <Shield className="h-3 w-3 mr-1" />
                                    TLS
                                  </Badge>
                                )}
                                {proxy.security && proxy.security !== "tls" && (
                                  <Badge variant="outline" className="text-xs border-amber-200 text-amber-700 dark:border-amber-800 dark:text-amber-300">
                                    <Shield className="h-3 w-3 mr-1" />
                                    {String(proxy.security).toUpperCase()}
                                  </Badge>
                                )}
                                {proxy.flow && (
                                  <Badge variant="outline" className="text-xs">
                                    <Network className="h-3 w-3 mr-1" />
                                    {String(proxy.flow)}
                                  </Badge>
                                )}
                              </div>
                            </div>
                            
                            {/* 右侧操作按钮 */}
                            <div className="flex flex-col gap-1 ml-4 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                              {/* 排序按钮 */}
                              <div className="flex gap-1">
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="h-8 w-8 p-0"
                                  onClick={() => handleMoveProxy(proxy.id, "up")}
                                  disabled={index === 0}
                                  title="上移"
                                >
                                  <ChevronUp className="h-3.5 w-3.5" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="h-8 w-8 p-0"
                                  onClick={() => handleMoveProxy(proxy.id, "down")}
                                  disabled={index === parsedProxies.length - 1}
                                  title="下移"
                                >
                                  <ChevronDown className="h-3.5 w-3.5" />
                                </Button>
                              </div>
                              
                              {/* 编辑和删除按钮 */}
                              <div className="flex gap-1">
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="h-8 w-8 p-0 hover:bg-blue-100 hover:text-blue-600 dark:hover:bg-blue-900/20"
                                  onClick={() => handleEditProxy(proxy)}
                                  title="编辑"
                                >
                                  <Edit className="h-3.5 w-3.5" />
                                </Button>
                                
                                <AlertDialog>
                                  <AlertDialogTrigger asChild>
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      className="h-8 w-8 p-0 hover:bg-red-100 hover:text-red-600 dark:hover:bg-red-900/20"
                                      title="删除"
                                    >
                                      <Trash2 className="h-3.5 w-3.5" />
                                    </Button>
                                  </AlertDialogTrigger>
                                  <AlertDialogContent>
                                    <AlertDialogHeader>
                                      <AlertDialogTitle>删除节点</AlertDialogTitle>
                                                              <AlertDialogDescription>
                          确定要删除节点 &quot;{proxy.name}&quot; 吗？此操作不可撤销。
                        </AlertDialogDescription>
                                    </AlertDialogHeader>
                                    <AlertDialogFooter>
                                      <AlertDialogCancel>取消</AlertDialogCancel>
                                      <AlertDialogAction 
                                        onClick={() => handleDeleteProxy(proxy.id)}
                                        className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                      >
                                        删除
                                      </AlertDialogAction>
                                    </AlertDialogFooter>
                                  </AlertDialogContent>
                                </AlertDialog>
                              </div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* 右侧：输出配置 */}
          <div className="lg:col-span-4 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Settings className="h-5 w-5" />
                  YAML 配置
                </CardTitle>
                <CardDescription>
                  生成的配置文件
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="output-yaml">配置内容</Label>
                  <Textarea
                    id="output-yaml"
                    value={outputYaml}
                    readOnly
                    placeholder="生成的 YAML 配置将显示在这里..."
                    className="min-h-96 max-h-96 font-mono text-sm resize-none bg-muted/30 overflow-y-auto"
                  />
                </div>

                <div className="space-y-2">
                  <Button 
                    onClick={handleDownload}
                    disabled={!outputYaml}
                    className="w-full"
                  >
                    <Download className="mr-2 h-4 w-4" />
                    下载配置文件
                  </Button>
                  <Button 
                    variant="outline"
                    onClick={handleCopy}
                    disabled={!outputYaml}
                    className="w-full"
                  >
                    <Copy className="mr-2 h-4 w-4" />
                    复制到剪贴板
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* 支持的协议格式说明 */}
        <Card className="mt-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Settings className="h-5 w-5" />
              支持的协议格式与规则集
            </CardTitle>
            <CardDescription>
              各种代理协议的链接格式和使用的规则集说明
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* 协议格式 */}
            <div>
              <h4 className="font-medium mb-4">支持的协议格式</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <Badge className="bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                        <Shield className="h-3 w-3 mr-1" />
                        VLESS
                      </Badge>
                    </div>
                    <code className="text-xs bg-muted p-2 rounded block overflow-x-auto">
                      vless://uuid@server:port?type=ws&path=/path&security=tls&sni=domain#name
                    </code>
                    <div className="text-xs text-muted-foreground">
                      支持 WebSocket、gRPC、TCP、REALITY 等传输协议
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <Badge className="bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200">
                        <Network className="h-3 w-3 mr-1" />
                        Hysteria2
                      </Badge>
                    </div>
                    <code className="text-xs bg-muted p-2 rounded block overflow-x-auto">
                      hysteria2://password@server:port?obfs=salamander&sni=domain#name
                    </code>
                    <div className="text-xs text-muted-foreground">
                      支持混淆、带宽限制等高级配置
                    </div>
                  </div>
                </div>
                
                <div className="space-y-4">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <Badge className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                        <Server className="h-3 w-3 mr-1" />
                        Shadowsocks
                      </Badge>
                    </div>
                    <code className="text-xs bg-muted p-2 rounded block overflow-x-auto">
                      ss://method:password@server:port#name
                    </code>
                    <div className="text-xs text-muted-foreground">
                      支持各种加密方法：AES-256-GCM、ChaCha20-Poly1305 等
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <Badge className="bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200">
                        <Shield className="h-3 w-3 mr-1" />
                        Trojan
                      </Badge>
                    </div>
                    <code className="text-xs bg-muted p-2 rounded block overflow-x-auto">
                      trojan://password@server:port?type=ws&path=/path&sni=domain#name
                    </code>
                    <div className="text-xs text-muted-foreground">
                      支持 WebSocket、gRPC 等传输协议
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* 规则集说明 */}
            <div className="border-t pt-6">
              <h4 className="font-medium mb-4 flex items-center gap-2">
                <Badge variant="outline" className="text-xs">
                  🦄 Loyalsoldier/clash-rules
                </Badge>
                规则集说明
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div className="space-y-2">
                  <div className="font-medium">白名单模式（推荐）</div>
                  <ul className="text-muted-foreground space-y-1 text-xs">
                    <li>• 没有命中规则的流量统统使用代理</li>
                    <li>• 适用于服务器线路稳定、流量充足的用户</li>
                    <li>• 能确保新网站自动走代理</li>
                  </ul>
                </div>
                <div className="space-y-2">
                  <div className="font-medium">黑名单模式</div>
                  <ul className="text-muted-foreground space-y-1 text-xs">
                    <li>• 只有命中规则的流量才使用代理</li>
                    <li>• 适用于流量紧缺或线路不稳定的用户</li>
                    <li>• 常用于软路由、家庭网关用户</li>
                  </ul>
                </div>
              </div>
              <div className="mt-4 p-3 bg-muted/50 rounded-lg">
                <div className="text-xs text-muted-foreground">
                  本项目使用来自 <a href="https://github.com/Loyalsoldier/clash-rules" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">@Loyalsoldier/clash-rules</a> 的高质量规则集，
                  每日自动更新，包含广告拦截、分流规则、GeoIP 数据等完整功能。
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* 编辑节点对话框 */}
        <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>编辑节点</DialogTitle>
              <DialogDescription>
                修改节点的基本信息
              </DialogDescription>
            </DialogHeader>
            
            {editingProxy && (
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="edit-name">节点名称</Label>
                  <Input
                    id="edit-name"
                    value={editingProxy.name}
                    onChange={(e) => setEditingProxy({
                      ...editingProxy,
                      name: e.target.value
                    })}
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="edit-server">服务器</Label>
                    <Input
                      id="edit-server"
                      value={editingProxy.server}
                      onChange={(e) => setEditingProxy({
                        ...editingProxy,
                        server: e.target.value
                      })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="edit-port">端口</Label>
                    <Input
                      id="edit-port"
                      type="number"
                      value={editingProxy.port}
                      onChange={(e) => setEditingProxy({
                        ...editingProxy,
                        port: parseInt(e.target.value) || 443
                      })}
                    />
                  </div>
                </div>
                
                <div className="p-3 bg-muted rounded-lg">
                  <div className="text-sm font-medium mb-1">协议类型</div>
                  <Badge className={getProtocolColor(editingProxy.type)}>
                    {getProtocolIcon(editingProxy.type)}
                    <span className="ml-1">{editingProxy.type.toUpperCase()}</span>
                  </Badge>
                </div>
              </div>
            )}
            
            <DialogFooter>
              <Button variant="outline" onClick={() => setEditDialogOpen(false)}>
                取消
              </Button>
              <Button onClick={handleSaveEdit}>
                保存
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}
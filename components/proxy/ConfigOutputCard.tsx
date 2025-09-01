// 配置输出卡片组件

"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Download, Copy, Settings, QrCode } from "lucide-react";

interface ConfigOutputCardProps {
  outputYaml: string;
  onDownload: () => void;
  onCopy: () => void;
  onGenerateQR: () => void;
}

export function ConfigOutputCard({
  outputYaml,
  onDownload,
  onCopy,
  onGenerateQR
}: ConfigOutputCardProps) {
  return (
    <Card className="h-[560px] flex flex-col">
      <CardHeader className="flex-shrink-0 pb-4">
        <CardTitle className="flex items-center gap-2">
          <Settings className="h-5 w-5" />
          YAML 配置
        </CardTitle>
        <CardDescription>
          生成的配置文件
        </CardDescription>
      </CardHeader>
      <CardContent className="flex-1 flex flex-col min-h-0 space-y-4 pb-2">
        <div className="flex-1 flex flex-col min-h-0 space-y-2">
          <Label htmlFor="output-yaml">配置内容</Label>
          <Textarea
            id="output-yaml"
            value={outputYaml}
            readOnly
            placeholder="生成的 YAML 配置将显示在这里..."
            className="flex-1 font-mono text-sm resize-none bg-muted/30 overflow-y-auto"
          />
        </div>

        <div className="flex-shrink-0 space-y-2">
          <Button 
            onClick={onDownload}
            disabled={!outputYaml}
            className="w-full"
          >
            <Download className="mr-2 h-4 w-4" />
            下载配置文件
          </Button>
          <div className="flex gap-2">
            <Button 
              variant="outline"
              onClick={onGenerateQR}
              disabled={!outputYaml}
              className="flex-1"
            >
              <QrCode className="mr-2 h-4 w-4" />
              二维码
            </Button>
            <Button 
              variant="outline"
              onClick={onCopy}
              disabled={!outputYaml}
              className="flex-1"
            >
              <Copy className="mr-2 h-4 w-4" />
              复制
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}


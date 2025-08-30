/**
 * 协议配置公共字段定义
 * 提供可复用的字段配置，减少重复代码
 */

import type { FormFieldConfig } from '@/types/proxy';

// 基本信息字段
export const basicFields: FormFieldConfig[] = [
  {
    key: 'name',
    label: '节点名称',
    type: 'text',
    required: true,
    group: 'basic',
    placeholder: '请输入节点名称'
  },
  {
    key: 'server',
    label: '服务器地址',
    type: 'text',
    required: true,
    group: 'basic',
    placeholder: 'example.com'
  }
];

// 端口字段生成器
export const createPortField = (defaultPort: number = 443): FormFieldConfig => ({
  key: 'port',
  label: '端口',
  type: 'number',
  required: true,
  group: 'basic',
  defaultValue: defaultPort,
  validation: { min: 1, max: 65535 }
});

// TLS 配置字段
export const tlsFields: FormFieldConfig[] = [
  {
    key: 'sni',
    label: 'SNI',
    type: 'text',
    group: 'tls',
    placeholder: 'example.com',
    description: 'TLS Server Name Indication'
  },
  {
    key: 'skip-cert-verify',
    label: '跳过证书验证',
    type: 'boolean',
    group: 'tls',
    defaultValue: false,
    description: '跳过 TLS 证书验证（不安全）'
  },
  {
    key: 'alpn',
    label: 'ALPN 协议',
    type: 'text',
    group: 'tls',
    placeholder: 'h2,http/1.1',
    description: 'Application Layer Protocol Negotiation，逗号分隔'
  },
  {
    key: 'fingerprint',
    label: '服务器指纹',
    type: 'text',
    group: 'tls',
    placeholder: 'xxxx',
    description: '服务器证书指纹'
  }
];

// 客户端指纹字段
export const clientFingerprintField: FormFieldConfig = {
  key: 'client-fingerprint',
  label: '客户端指纹',
  type: 'select',
  group: 'tls',
  options: [
    { value: '', label: '默认' },
    { value: 'chrome', label: 'Chrome' },
    { value: 'firefox', label: 'Firefox' },
    { value: 'safari', label: 'Safari' },
    { value: 'ios', label: 'iOS' },
    { value: 'android', label: 'Android' },
    { value: 'edge', label: 'Edge' },
    { value: 'random', label: '随机' }
  ],
  description: 'TLS 客户端指纹模拟'
};

// REALITY 配置字段
export const realityFields: FormFieldConfig[] = [
  {
    key: 'reality-opts.public-key',
    label: 'REALITY 公钥',
    type: 'text',
    group: 'reality',
    placeholder: 'xxxx',
    description: 'REALITY 协议公钥'
  },
  {
    key: 'reality-opts.short-id',
    label: 'REALITY Short ID',
    type: 'text',
    group: 'reality',
    placeholder: 'xxxx',
    description: 'REALITY 协议短 ID'
  }
];

// WebSocket 配置字段
export const websocketFields: FormFieldConfig[] = [
  {
    key: 'ws-opts.path',
    label: 'WebSocket 路径',
    type: 'text',
    group: 'websocket',
    placeholder: '/ws',
    description: 'WebSocket 连接路径'
  },
  {
    key: 'ws-opts.headers.host',
    label: 'WebSocket Host',
    type: 'text',
    group: 'websocket',
    placeholder: 'example.com',
    description: 'WebSocket Host 头'
  }
];

// HTTP 配置字段
export const httpFields: FormFieldConfig[] = [
  {
    key: 'http-opts.path',
    label: 'HTTP 路径',
    type: 'text',
    group: 'http',
    placeholder: '/,/path1,/path2',
    description: 'HTTP 请求路径，逗号分隔多个路径'
  },
  {
    key: 'http-opts.headers.Host',
    label: 'HTTP Host',
    type: 'text',
    group: 'http',
    placeholder: 'example.com,cdn.example.com',
    description: 'HTTP Host 头，逗号分隔多个域名'
  }
];

// HTTP/2 配置字段
export const http2Fields: FormFieldConfig[] = [
  {
    key: 'h2-opts.path',
    label: 'HTTP/2 路径',
    type: 'text',
    group: 'http2',
    placeholder: '/h2',
    description: 'HTTP/2 连接路径'
  },
  {
    key: 'h2-opts.host',
    label: 'HTTP/2 Host',
    type: 'text',
    group: 'http2',
    placeholder: 'example.com,cdn.example.com',
    description: 'HTTP/2 Host，逗号分隔多个域名'
  }
];

// gRPC 配置字段
export const grpcFields: FormFieldConfig[] = [
  {
    key: 'grpc-opts.grpc-service-name',
    label: 'gRPC 服务名',
    type: 'text',
    group: 'grpc',
    placeholder: 'GunService',
    description: 'gRPC 服务名称'
  },
  {
    key: 'grpc-opts.grpc-mode',
    label: 'gRPC 模式',
    type: 'select',
    group: 'grpc',
    options: [
      { value: 'gun', label: 'Gun' },
      { value: 'multi', label: 'Multi' }
    ],
    defaultValue: 'gun',
    description: 'gRPC 传输模式'
  }
];

// 传输协议选择字段生成器
export const createNetworkField = (supportedNetworks: string[] = ['tcp', 'ws', 'http', 'h2', 'grpc']): FormFieldConfig => {
  const networkOptions = [
    { value: 'tcp', label: 'TCP' },
    { value: 'ws', label: 'WebSocket' },
    { value: 'http', label: 'HTTP' },
    { value: 'h2', label: 'HTTP/2' },
    { value: 'grpc', label: 'gRPC' }
  ].filter(option => supportedNetworks.includes(option.value));

  return {
    key: 'network',
    label: '传输协议',
    type: 'select',
    group: 'transport',
    options: networkOptions,
    defaultValue: 'tcp',
    description: `传输层协议，支持 ${supportedNetworks.join('/')}`
  };
};

// 带宽控制字段
export const bandwidthFields: FormFieldConfig[] = [
  {
    key: 'up',
    label: '上传带宽',
    type: 'text',
    group: 'bandwidth',
    placeholder: '30 Mbps',
    description: '上传带宽限制，若不写单位默认为 Mbps'
  },
  {
    key: 'down',
    label: '下载带宽',
    type: 'text',
    group: 'bandwidth',
    placeholder: '200 Mbps',
    description: '下载带宽限制，若不写单位默认为 Mbps'
  }
];

// 证书配置字段
export const certificateFields: FormFieldConfig[] = [
  {
    key: 'ca',
    label: 'CA 证书文件',
    type: 'text',
    group: 'certificate',
    placeholder: './my.ca',
    description: 'CA 证书文件路径'
  },
  {
    key: 'ca-str',
    label: 'CA 证书内容',
    type: 'text',
    group: 'certificate',
    placeholder: 'xyz',
    description: 'CA 证书内容字符串'
  }
];

// 高级参数字段
export const advancedFields: FormFieldConfig[] = [
  {
    key: 'udp',
    label: 'UDP 支持',
    type: 'boolean',
    group: 'advanced',
    defaultValue: true,
    description: '是否启用 UDP 转发'
  }
];

// SMUX 多路复用字段
export const smuxField: FormFieldConfig = {
  key: 'smux.enabled',
  label: 'SMUX 多路复用',
  type: 'boolean',
  group: 'advanced',
  defaultValue: false,
  description: '启用 SMUX 连接多路复用'
};

// 密码字段生成器
export const createPasswordField = (label: string = '密码', description?: string): FormFieldConfig => ({
  key: 'password',
  label,
  type: 'password',
  required: true,
  group: 'protocol',
  description
});

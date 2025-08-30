/**
 * VLESS 协议配置
 */

import type { ProtocolEditConfig } from '@/types/proxy';
import { 
  basicFields, 
  createPortField, 
  tlsFields, 
  clientFingerprintField,
  realityFields,
  websocketFields,
  httpFields,
  http2Fields,
  grpcFields,
  createNetworkField,
  advancedFields,
  smuxField
} from '../base/common-fields';
import { 
  vlessFlowOptions, 
  packetEncodingOptions,
  defaultPorts 
} from '../base/field-types';

export const vlessConfig: ProtocolEditConfig = {
  type: 'vless',
  name: 'VLESS',
  icon: 'Shield',
  color: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
  fields: [
    // 基本信息
    ...basicFields,
    createPortField(defaultPorts.vless),
    
    // 协议参数
    {
      key: 'uuid',
      label: 'UUID',
      type: 'text',
      required: true,
      group: 'protocol',
      placeholder: '12345678-1234-1234-1234-123456789012',
      description: 'VLESS 用户 ID，必须为有效的 UUID 格式'
    },
    {
      key: 'flow',
      label: '流控',
      type: 'select',
      group: 'protocol',
      options: vlessFlowOptions,
      description: 'VLESS 子协议流控模式'
    },
    {
      key: 'packet-encoding',
      label: 'UDP 包编码',
      type: 'select',
      group: 'protocol',
      options: packetEncodingOptions,
      description: 'UDP 数据包编码方式'
    },
    {
      key: 'encryption',
      label: '加密配置',
      type: 'text',
      group: 'protocol',
      placeholder: '',
      description: 'VLESS 加密配置，留空表示无加密'
    },
    
    // 传输协议
    createNetworkField(['tcp', 'ws', 'http', 'h2', 'grpc']),
    
    // TLS 配置
    {
      key: 'tls',
      label: '启用 TLS',
      type: 'boolean',
      group: 'tls',
      defaultValue: true,
      description: '是否启用 TLS 加密'
    },
    {
      key: 'servername',
      label: 'Server Name (SNI)',
      type: 'text',
      group: 'tls',
      placeholder: 'example.com',
      description: 'TLS Server Name Indication'
    },
    ...tlsFields,
    clientFingerprintField,
    
    // REALITY 配置
    ...realityFields,
    
    // WebSocket 配置
    ...websocketFields,
    {
      key: 'ws-opts.early-data-header-name',
      label: '早期数据头名',
      type: 'text',
      group: 'websocket',
      placeholder: 'Sec-WebSocket-Protocol',
      description: 'WebSocket 早期数据头名称'
    },
    
    // HTTP 配置
    ...httpFields,
    
    // HTTP/2 配置
    ...http2Fields,
    
    // gRPC 配置
    ...grpcFields,
    
    // 高级参数
    ...advancedFields,
    smuxField
  ]
};

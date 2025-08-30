/**
 * Trojan 协议配置
 */

import type { ProtocolEditConfig } from '@/types/proxy';
import { 
  basicFields, 
  createPortField, 
  createPasswordField,
  clientFingerprintField,
  realityFields,
  websocketFields,
  createNetworkField,
  advancedFields,
  smuxField
} from '../base/common-fields';
import { 
  trojanSSAEADOptions,
  defaultPorts 
} from '../base/field-types';

export const trojanConfig: ProtocolEditConfig = {
  type: 'trojan',
  name: 'Trojan',
  icon: 'Shield',
  color: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
  fields: [
    // 基本信息
    ...basicFields,
    createPortField(defaultPorts.trojan),
    
    // 协议参数
    {
      ...createPasswordField('服务器密码', 'Trojan 服务器密码（必须）'),
      key: 'password'
    },
    
    // 传输协议
    createNetworkField(['tcp', 'ws', 'grpc']),
    
    // TLS 配置
    {
      key: 'sni',
      label: 'SNI',
      type: 'text',
      group: 'tls',
      placeholder: 'example.com',
      description: 'TLS Server Name Indication'
    },
    {
      key: 'alpn',
      label: 'ALPN 协议',
      type: 'text',
      group: 'tls',
      placeholder: 'h2,http/1.1',
      description: 'Application Layer Protocol Negotiation，逗号分隔'
    },
    clientFingerprintField,
    {
      key: 'fingerprint',
      label: '服务器指纹',
      type: 'text',
      group: 'tls',
      placeholder: 'xxxx',
      description: '服务器证书指纹'
    },
    {
      key: 'skip-cert-verify',
      label: '跳过证书验证',
      type: 'boolean',
      group: 'tls',
      defaultValue: false,
      description: '跳过 TLS 证书验证（不安全）'
    },
    
    // REALITY 配置
    ...realityFields,
    
    // Shadowsocks AEAD 配置（trojan-go）
    {
      key: 'ss-opts.enabled',
      label: '启用 SS AEAD',
      type: 'boolean',
      group: 'trojan-go',
      defaultValue: false,
      description: '启用 trojan-go 的 shadowsocks AEAD 加密'
    },
    {
      key: 'ss-opts.method',
      label: 'SS 加密方法',
      type: 'select',
      group: 'trojan-go',
      options: trojanSSAEADOptions,
      defaultValue: 'aes-128-gcm',
      description: 'Shadowsocks AEAD 加密方法'
    },
    {
      key: 'ss-opts.password',
      label: 'SS 密码',
      type: 'password',
      group: 'trojan-go',
      description: 'trojan-go 的 shadowsocks AEAD 加密密码'
    },
    
    // WebSocket 配置
    ...websocketFields,
    
    // gRPC 配置
    {
      key: 'grpc-opts.grpc-service-name',
      label: 'gRPC 服务名',
      type: 'text',
      group: 'grpc',
      placeholder: 'GunService',
      description: 'gRPC 服务名称'
    },
    
    // 高级参数
    ...advancedFields,
    smuxField
  ]
};

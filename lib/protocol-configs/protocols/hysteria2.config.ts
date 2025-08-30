/**
 * Hysteria2 协议配置
 */

import type { ProtocolEditConfig } from '@/types/proxy';
import { 
  basicFields, 
  createPortField, 
  tlsFields,
  certificateFields,
  advancedFields,
  createPasswordField
} from '../base/common-fields';
import { 
  hysteria2ObfsOptions,
  defaultPorts 
} from '../base/field-types';

export const hysteria2Config: ProtocolEditConfig = {
  type: 'hysteria2',
  name: 'Hysteria2',
  icon: 'Network',
  color: 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-200',
  fields: [
    // 基本信息
    ...basicFields,
    createPortField(defaultPorts.hysteria2),
    
    // 协议参数
    {
      ...createPasswordField('认证密码', 'Hysteria2 认证密码'),
      key: 'password'
    },
    {
      key: 'ports',
      label: '端口跳跃',
      type: 'text',
      group: 'protocol',
      placeholder: '443-8443',
      description: '端口跳跃范围，配置后会忽略单独的端口设置'
    },
    {
      key: 'obfs',
      label: 'QUIC 混淆器',
      type: 'select',
      group: 'protocol',
      options: hysteria2ObfsOptions,
      description: 'QUIC 流量混淆器，目前仅支持 salamander'
    },
    {
      key: 'obfs-password',
      label: '混淆器密码',
      type: 'password',
      group: 'protocol',
      description: 'QUIC 流量混淆器密码'
    },
    
    // 带宽控制 (brutal 速率控制)
    {
      key: 'up',
      label: '上传带宽',
      type: 'text',
      group: 'bandwidth',
      placeholder: '30 Mbps',
      description: 'brutal 上传速率控制，若不写单位默认为 Mbps'
    },
    {
      key: 'down',
      label: '下载带宽',
      type: 'text',
      group: 'bandwidth',
      placeholder: '200 Mbps',
      description: 'brutal 下载速率控制，若不写单位默认为 Mbps'
    },
    
    // TLS 配置
    ...tlsFields,
    
    // 证书配置
    ...certificateFields,
    
    // QUIC-GO 特殊配置（高级用户）
    {
      key: 'initial-stream-receive-window',
      label: '初始流接收窗口',
      type: 'number',
      group: 'quic-go',
      placeholder: '8388608',
      description: 'QUIC-GO 初始流接收窗口大小（高级配置）'
    },
    {
      key: 'max-stream-receive-window',
      label: '最大流接收窗口',
      type: 'number',
      group: 'quic-go',
      placeholder: '8388608',
      description: 'QUIC-GO 最大流接收窗口大小（高级配置）'
    },
    {
      key: 'initial-connection-receive-window',
      label: '初始连接接收窗口',
      type: 'number',
      group: 'quic-go',
      placeholder: '20971520',
      description: 'QUIC-GO 初始连接接收窗口大小（高级配置）'
    },
    {
      key: 'max-connection-receive-window',
      label: '最大连接接收窗口',
      type: 'number',
      group: 'quic-go',
      placeholder: '20971520',
      description: 'QUIC-GO 最大连接接收窗口大小（高级配置）'
    },
    
    // 高级参数
    ...advancedFields
  ]
};

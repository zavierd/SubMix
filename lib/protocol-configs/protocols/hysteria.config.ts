/**
 * Hysteria 协议配置
 */

import type { ProtocolEditConfig } from '@/types/proxy';
import { 
  basicFields, 
  createPortField, 
  tlsFields,
  bandwidthFields,
  certificateFields,
  advancedFields,
  createPasswordField
} from '../base/common-fields';
import { 
  hysteriaProtocolOptions,
  defaultPorts 
} from '../base/field-types';

export const hysteriaConfig: ProtocolEditConfig = {
  type: 'hysteria',
  name: 'Hysteria',
  icon: 'Network',
  color: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200',
  fields: [
    // 基本信息
    ...basicFields,
    createPortField(defaultPorts.hysteria),
    
    // 协议参数
    {
      ...createPasswordField('认证字符串', 'Hysteria 认证密码'),
      key: 'auth-str',
      label: '认证字符串',
      placeholder: 'yourpassword'
    },
    {
      key: 'protocol',
      label: '协议类型',
      type: 'select',
      group: 'protocol',
      options: hysteriaProtocolOptions,
      defaultValue: 'udp',
      description: '传输协议类型'
    },
    {
      key: 'obfs',
      label: '混淆字符串',
      type: 'text',
      group: 'protocol',
      placeholder: 'obfs_str',
      description: '流量混淆字符串'
    },
    
    // 带宽控制
    ...bandwidthFields,
    
    // TLS 配置
    ...tlsFields,
    
    // 证书配置
    ...certificateFields,
    
    // 连接配置
    {
      key: 'recv-window-conn',
      label: '连接接收窗口',
      type: 'number',
      group: 'connection',
      placeholder: '12582912',
      description: '单连接接收窗口大小'
    },
    {
      key: 'recv-window',
      label: '全局接收窗口',
      type: 'number',
      group: 'connection',
      placeholder: '52428800',
      description: '全局接收窗口大小'
    },
    {
      key: 'disable_mtu_discovery',
      label: '禁用 MTU 发现',
      type: 'boolean',
      group: 'connection',
      defaultValue: false,
      description: '禁用 MTU 路径发现'
    },
    {
      key: 'fast-open',
      label: 'Fast Open',
      type: 'boolean',
      group: 'connection',
      defaultValue: false,
      description: '启用 Fast Open (降低连接建立延迟)'
    },
    
    // 高级参数
    ...advancedFields
  ]
};

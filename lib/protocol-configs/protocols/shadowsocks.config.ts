/**
 * Shadowsocks 协议配置
 */

import type { ProtocolEditConfig } from '@/types/proxy';
import { 
  basicFields, 
  createPortField, 
  createPasswordField,
  clientFingerprintField,
  advancedFields,
  smuxField
} from '../base/common-fields';
import { 
  shadowsocksCiphers,
  ss2022Ciphers,
  shadowsocksPluginOptions,
  pluginModeOptions,
  udpOverTcpVersionOptions,
  ipVersionOptions,
  defaultPorts 
} from '../base/field-types';

// Shadowsocks 标准版配置
export const shadowsocksConfig: ProtocolEditConfig = {
  type: 'ss',
  name: 'Shadowsocks',
  icon: 'Server',
  color: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
  fields: [
    // 基本信息
    ...basicFields,
    createPortField(defaultPorts.ss),
    
    // 协议参数
    {
      key: 'cipher',
      label: '加密方法',
      type: 'select',
      required: true,
      group: 'protocol',
      options: shadowsocksCiphers
    },
    createPasswordField(),
    {
      key: 'plugin',
      label: '插件',
      type: 'select',
      group: 'plugin',
      options: shadowsocksPluginOptions
    },
    
    // 插件配置
    {
      key: 'plugin-opts.mode',
      label: '插件模式',
      type: 'select',
      group: 'plugin',
      options: pluginModeOptions,
      description: '不同插件支持不同的模式'
    },
    {
      key: 'plugin-opts.host',
      label: '插件Host',
      type: 'text',
      group: 'plugin',
      placeholder: 'example.com',
      description: '插件混淆域名'
    },
    {
      key: 'plugin-opts.path',
      label: '路径',
      type: 'text',
      group: 'plugin',
      placeholder: '/',
      description: 'WebSocket路径 (v2ray-plugin/gost-plugin)'
    },
    {
      key: 'plugin-opts.tls',
      label: 'TLS加密',
      type: 'boolean',
      group: 'plugin',
      defaultValue: false,
      description: '启用TLS加密 (v2ray-plugin/gost-plugin)'
    },
    {
      key: 'plugin-opts.skip-cert-verify',
      label: '跳过证书验证',
      type: 'boolean',
      group: 'plugin',
      defaultValue: false,
      description: '跳过证书验证 (v2ray-plugin/gost-plugin)'
    },
    {
      key: 'plugin-opts.mux',
      label: '多路复用',
      type: 'boolean',
      group: 'plugin',
      defaultValue: false,
      description: '启用多路复用 (v2ray-plugin/gost-plugin)'
    },
    {
      key: 'plugin-opts.version',
      label: '插件版本',
      type: 'number',
      group: 'plugin',
      defaultValue: 2,
      validation: { min: 1, max: 3 },
      description: 'Shadow-TLS版本 (1/2/3)'
    },
    {
      key: 'plugin-opts.password',
      label: '插件密码',
      type: 'password',
      group: 'plugin',
      description: '插件专用密码 (shadow-tls/restls)'
    },
    {
      key: 'plugin-opts.version-hint',
      label: '版本提示',
      type: 'text',
      group: 'plugin',
      defaultValue: 'tls13',
      description: 'TLS版本提示 (restls)'
    },
    {
      key: 'plugin-opts.restls-script',
      label: 'RestLS脚本',
      type: 'text',
      group: 'plugin',
      placeholder: '300?100<1,400~100,350~100',
      description: 'RestLS行为控制脚本'
    },
    {
      ...clientFingerprintField,
      group: 'plugin',
      description: '客户端TLS指纹 (shadow-tls/restls)'
    },
    
    // 高级参数
    ...advancedFields,
    {
      key: 'udp-over-tcp',
      label: 'UDP over TCP',
      type: 'boolean',
      group: 'advanced',
      defaultValue: false,
      description: '启用UDP over TCP传输'
    },
    {
      key: 'udp-over-tcp-version',
      label: 'UDP over TCP版本',
      type: 'select',
      group: 'advanced',
      options: udpOverTcpVersionOptions,
      defaultValue: '2',
      description: 'UDP over TCP协议版本'
    },
    {
      key: 'ip-version',
      label: 'IP版本',
      type: 'select',
      group: 'advanced',
      options: ipVersionOptions,
      defaultValue: 'ipv4'
    },
    smuxField
  ]
};

// Shadowsocks 2022 配置
export const ss2022Config: ProtocolEditConfig = {
  type: 'ss2022',
  name: 'Shadowsocks 2022',
  icon: 'Server',
  color: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-200',
  fields: [
    // 基本信息
    ...basicFields,
    createPortField(defaultPorts.ss),
    
    // 协议参数
    {
      key: 'cipher',
      label: '加密方法',
      type: 'select',
      required: true,
      group: 'protocol',
      options: ss2022Ciphers
    },
    {
      ...createPasswordField('密码', 'SS2022 需要较长的密码，建议至少32字符'),
      key: 'password'
    },
    
    // 高级参数（SS2022特有）
    ...advancedFields,
    {
      key: 'udp-over-tcp',
      label: 'UDP over TCP',
      type: 'boolean',
      group: 'advanced',
      defaultValue: false,
      description: '启用UDP over TCP传输'
    },
    {
      key: 'udp-over-tcp-version',
      label: 'UDP over TCP版本',
      type: 'select',
      group: 'advanced',
      options: udpOverTcpVersionOptions,
      defaultValue: '2',
      description: 'UDP over TCP协议版本'
    },
    {
      key: 'ip-version',
      label: 'IP版本',
      type: 'select',
      group: 'advanced',
      options: ipVersionOptions,
      defaultValue: 'ipv4'
    },
    smuxField
  ]
};

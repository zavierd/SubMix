// 订阅链接解析器
export interface ProxyNode {
  name: string;
  type: string;
  server: string;
  port: number;
  id?: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  [key: string]: any;
}

export interface VlessConfig {
  uuid: string;
  network?: string;
  tls?: boolean;
  sni?: string;
  alpn?: string[];
  path?: string;
  host?: string;
  headers?: Record<string, string>;
  security?: string;
  flow?: string;
  'client-fingerprint'?: string;
}

export interface Hysteria2Config {
  password: string;
  obfs?: string;
  'obfs-password'?: string;
  sni?: string;
  'skip-cert-verify'?: boolean;
  alpn?: string[];
  'up-mbps'?: number;
  'down-mbps'?: number;
}

export interface ShadowsocksConfig {
  cipher: string;
  password: string;
  plugin?: string;
  'plugin-opts'?: Record<string, string | number | boolean>;
  // SS2022 专用字段
  'server-port'?: number;
}

export interface TrojanConfig {
  password: string;
  sni?: string;
  'skip-cert-verify'?: boolean;
  alpn?: string[];
  network?: string;
  'ws-opts'?: {
    path?: string;
    headers?: Record<string, string>;
  };
}

export class ProxyParser {
  
  /**
   * 生成随机ID
   */
  private static generateId(): string {
    const chars = 'abcdefghijklmnopqrstuvwxyz0123456789';
    let result = '';
    for (let i = 0; i < 11; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  }

  /**
   * 检测是否为SS2022加密方法
   */
  public static isSSR2022Cipher(cipher: string): boolean {
    if (!cipher) return false;
    return cipher.includes('2022');
  }

  /**
   * 解析布尔值参数的通用方法
   */
  private static parseBooleanParam(value: string | undefined, defaultValue: boolean = false): boolean {
    if (!value) return defaultValue;
    
    const param = value.toLowerCase();
    if (param === 'true' || param === '1') return true;
    if (param === 'false' || param === '0') return false;
    
    return defaultValue;
  }

  /**
   * 解析数值参数的通用方法
   */
  private static parseNumberParam(value: string | undefined, defaultValue: number = 0): number {
    if (!value) return defaultValue;
    
    const num = parseInt(value);
    return isNaN(num) ? defaultValue : num;
  }

  /**
   * 解析 Base64 编码的字符串
   */
  private static decodeBase64(str: string): string {
    try {
      // 清理 Base64 字符串，移除可能的 URL 编码
      let cleanStr = str.trim();
      
      // 处理 URL 安全的 Base64 (替换 - 和 _ 为标准 Base64 字符)
      cleanStr = cleanStr.replace(/-/g, '+').replace(/_/g, '/');
      
      // 确保 Base64 字符串的长度是 4 的倍数
      while (cleanStr.length % 4) {
        cleanStr += '=';
      }
      
      return atob(cleanStr);
    } catch (error) {
      console.warn('Base64 解码失败:', str, error);
      // 如果不是有效的 Base64，直接返回原字符串
      return str;
    }
  }

  /**
   * 解析 URL 参数
   */
  private static parseUrlParams(search: string): Record<string, string> {
    const params: Record<string, string> = {};
    if (!search) return params;
    
    const urlParams = new URLSearchParams(search);
    for (const [key, value] of urlParams.entries()) {
      params[key] = value;
    }
    return params;
  }

  /**
   * 解析插件选项参数
   * @param pluginOptsStr 插件选项字符串，格式：key=value;key2=value2
   * @param pluginName 插件名称，用于特定插件的参数适配
   */
  private static parsePluginOpts(pluginOptsStr: string, pluginName: string): Record<string, string | number | boolean> {
    const pluginOpts: Record<string, string | number | boolean> = {};
    
    if (!pluginOptsStr) return pluginOpts;
    
    // 解析基本的键值对格式
    const opts = pluginOptsStr.split(';');
    
    for (const opt of opts) {
      const [key, value] = opt.split('=');
      if (key && value !== undefined) {
        const trimmedKey = key.trim();
        const trimmedValue = value.trim();
        
        // 根据插件类型和键名进行特定转换
        if (this.shouldConvertToBoolean(trimmedKey, pluginName)) {
          pluginOpts[trimmedKey] = trimmedValue.toLowerCase() === 'true';
        } else if (this.shouldConvertToNumber(trimmedKey, pluginName)) {
          const numValue = parseInt(trimmedValue);
          pluginOpts[trimmedKey] = isNaN(numValue) ? trimmedValue : numValue;
        } else {
          pluginOpts[trimmedKey] = trimmedValue;
        }
      }
    }
    
    return pluginOpts;
  }

  /**
   * 判断是否应该转换为布尔值
   */
  private static shouldConvertToBoolean(key: string, pluginName: string): boolean {
    const generalBooleanKeys = ['tls', 'skip-cert-verify', 'allowInsecure', 'udp'];
    
    // 插件特定的布尔值参数
    const pluginSpecificBooleanKeys: Record<string, string[]> = {
      'v2ray-plugin': ['tls', 'skip-cert-verify'],
      'gost-plugin': ['tls', 'skip-cert-verify']
    };
    
    // 检查通用布尔值参数
    if (generalBooleanKeys.includes(key)) {
      return true;
    }
    
    // 检查插件特定的布尔值参数
    if (pluginName && pluginSpecificBooleanKeys[pluginName]) {
      return pluginSpecificBooleanKeys[pluginName].includes(key);
    }
    
    return false;
  }

  /**
   * 判断是否应该转换为数值
   */
  private static shouldConvertToNumber(key: string, pluginName: string): boolean {
    const generalNumberKeys = ['port', 'mux'];
    
    // 插件特定的数值参数
    const pluginSpecificNumberKeys: Record<string, string[]> = {
      'shadow-tls': ['server-port', 'version'],
      'restls': ['server-port'],
      'gost-plugin': ['port']
    };
    
    // 检查通用数值参数
    if (generalNumberKeys.includes(key)) {
      return true;
    }
    
    // 检查插件特定的数值参数
    if (pluginName && pluginSpecificNumberKeys[pluginName]) {
      return pluginSpecificNumberKeys[pluginName].includes(key);
    }
    
    return false;
  }

  /**
   * 解析UDP参数，支持多种格式
   * @param udpParam UDP参数值
   */
  private static parseUdpParam(udpParam: string | undefined): boolean {
    return this.parseBooleanParam(udpParam, true); // 默认为true
  }

  /**
   * 验证并标准化插件配置
   * @param config 当前节点配置
   * @param pluginName 插件名称
   * @param pluginOpts 插件选项
   */
  private static validateAndNormalizePluginConfig(
    config: ProxyNode & ShadowsocksConfig, 
    pluginName: string, 
    pluginOpts: Record<string, string | number | boolean>
  ): void {
    if (pluginName === 'obfs' || pluginName === 'simple-obfs' || pluginName === 'obfs-local') {
      // obfs 相关插件标准化
      
      // 处理obfs参数 (obfs-local使用obfs而不是mode)
      if (pluginOpts.obfs) {
        const obfsMode = pluginOpts.obfs.toString().toLowerCase();
        if (!['http', 'tls'].includes(obfsMode)) {
          console.warn(`obfs 插件不支持的模式: ${obfsMode}，将使用默认模式 http`);
          pluginOpts.obfs = 'http';
        } else {
          pluginOpts.obfs = obfsMode;
        }
      } else if (pluginOpts.mode) {
        // 兼容mode参数
        const mode = pluginOpts.mode.toString().toLowerCase();
        if (!['http', 'tls'].includes(mode)) {
          console.warn(`obfs 插件不支持的模式: ${mode}，将使用默认模式 http`);
          pluginOpts.mode = 'http';
        } else {
          pluginOpts.mode = mode;
        }
      } else {
        // 根据插件名称设置默认参数
        if (pluginName === 'obfs-local') {
          pluginOpts.obfs = 'http';
        } else {
          pluginOpts.mode = 'http';
        }
      }
      
      // 处理host参数 (obfs-local使用obfs-host)
      const hostKey = pluginOpts['obfs-host'] ? 'obfs-host' : 'host';
      if (!pluginOpts[hostKey]) {
        console.warn(`${pluginName} 插件缺少 ${hostKey} 参数，建议设置混淆域名`);
      }
      
    } else if (pluginName === 'v2ray-plugin') {
      // v2ray-plugin 插件标准化
      if (pluginOpts.mode) {
        const mode = pluginOpts.mode.toString().toLowerCase();
        if (mode !== 'websocket') {
          console.warn(`v2ray-plugin 当前只支持 websocket 模式，收到: ${mode}`);
          pluginOpts.mode = 'websocket';
        } else {
          pluginOpts.mode = mode;
        }
      } else {
        pluginOpts.mode = 'websocket';
      }
      
      // 确保布尔值类型正确
      if (pluginOpts.tls !== undefined && typeof pluginOpts.tls !== 'boolean') {
        pluginOpts.tls = this.parseBooleanParam(pluginOpts.tls.toString());
      }
      
      if (pluginOpts['skip-cert-verify'] !== undefined && typeof pluginOpts['skip-cert-verify'] !== 'boolean') {
        pluginOpts['skip-cert-verify'] = this.parseBooleanParam(pluginOpts['skip-cert-verify'].toString());
      }
      
      // 默认路径
      if (!pluginOpts.path) {
        pluginOpts.path = '/';
      }
      
    } else if (pluginName === 'shadow-tls') {
      // shadow-tls 插件标准化
      
      // 验证必需参数
      if (!pluginOpts.server) {
        console.warn('shadow-tls 插件缺少 server 参数');
      }
      
      if (!pluginOpts.password) {
        console.warn('shadow-tls 插件缺少 password 参数');
      }
      
      // 设置默认版本
      if (!pluginOpts.version) {
        pluginOpts.version = '3'; // shadow-tls v3
      }
      
      // 确保数值类型正确
      if (pluginOpts['server-port']) {
        pluginOpts['server-port'] = this.parseNumberParam(pluginOpts['server-port'].toString(), 443);
      }
      
    } else if (pluginName === 'restls') {
      // restls 插件标准化
      
      // 验证必需参数
      if (!pluginOpts.server) {
        console.warn('restls 插件缺少 server 参数');
      }
      
      if (!pluginOpts.password) {
        console.warn('restls 插件缺少 password 参数');
      }
      
      // 设置默认版本提示
      if (!pluginOpts['version-hint']) {
        pluginOpts['version-hint'] = 'tls13';
      }
      
      // 确保数值类型正确
      if (pluginOpts['server-port']) {
        pluginOpts['server-port'] = this.parseNumberParam(pluginOpts['server-port'].toString(), 443);
      }
      
    } else if (pluginName === 'gost-plugin') {
      // gost-plugin 插件标准化
      
      // 验证必需参数
      if (!pluginOpts.server) {
        console.warn('gost-plugin 插件缺少 server 参数');
      }
      
      // 设置默认模式
      if (!pluginOpts.mode) {
        pluginOpts.mode = 'tls'; // 默认使用TLS模式
      } else {
        const mode = pluginOpts.mode.toString().toLowerCase();
        if (!['tls', 'ws', 'wss', 'quic'].includes(mode)) {
          console.warn(`gost-plugin 不支持的模式: ${mode}，将使用默认模式 tls`);
          pluginOpts.mode = 'tls';
        } else {
          pluginOpts.mode = mode;
        }
      }
      
    } else {
      // 检查是否为允许的插件但未实现特定处理
      if (this.getAllowedPlugins().includes(pluginName)) {
        console.info(`插件 ${pluginName} 将使用通用参数解析`);
      } else {
        console.warn(`插件 ${pluginName} 不在允许的插件列表中`);
      }
    }
  }

  /**
   * 解析 VLESS 链接
   * vless://uuid@server:port?param1=value1&param2=value2#name
   */
  static parseVless(url: string): ProxyNode | null {
    try {
      if (!url.startsWith('vless://')) {
        throw new Error('不是有效的 VLESS 链接');
      }

      const urlObj = new URL(url);
      const uuid = urlObj.username;
      const server = urlObj.hostname;
      const port = parseInt(urlObj.port) || 443;
      const name = decodeURIComponent(urlObj.hash.slice(1)) || `vless-${server}`;
      const params = this.parseUrlParams(urlObj.search);

      const config: ProxyNode & VlessConfig = {
        name,
        type: 'vless',
        server,
        port,
        uuid,
        udp: this.parseUdpParam(params.udp),
        id: this.generateId(),
      };

      // 处理传输层协议
      if (params.type) {
        config.network = params.type;
      }

      // 处理 TLS
      if (params.security === 'tls' || params.security === 'reality') {
        config.tls = true;
        config.security = params.security;
        
        if (params.sni) {
          config.sni = params.sni;
        }
        
        if (params.alpn) {
          config.alpn = params.alpn.split(',');
        }

        if (params.fp) {
          config['client-fingerprint'] = params.fp;
        }
      }

      // 处理 WebSocket 配置
      if (params.type === 'ws') {
        config['ws-opts'] = {};
        if (params.path) {
          config['ws-opts'].path = params.path;
        }
        if (params.host) {
          config['ws-opts'].headers = { host: params.host };
        }
      }

      // 处理 gRPC 配置
      if (params.type === 'grpc') {
        config['grpc-opts'] = {};
        if (params.serviceName) {
          config['grpc-opts']['grpc-service-name'] = params.serviceName;
        }
      }

      // 处理流控
      if (params.flow) {
        config.flow = params.flow;
      }

      return config;
    } catch (error) {
      console.error('解析 VLESS 链接失败:', error);
      return null;
    }
  }

  /**
   * 解析 Hysteria2 链接
   * hysteria2://password@server:port?param1=value1&param2=value2#name
   */
  static parseHysteria2(url: string): ProxyNode | null {
    try {
      if (!url.startsWith('hysteria2://') && !url.startsWith('hy2://')) {
        throw new Error('不是有效的 Hysteria2 链接');
      }

      const urlObj = new URL(url);
      const password = urlObj.username;
      const server = urlObj.hostname;
      const port = parseInt(urlObj.port) || 443;
      const name = decodeURIComponent(urlObj.hash.slice(1)) || `hysteria2-${server}`;
      const params = this.parseUrlParams(urlObj.search);

      const config: ProxyNode & Hysteria2Config = {
        name,
        type: 'hysteria2',
        server,
        port,
        password,
        udp: this.parseUdpParam(params.udp),
        id: this.generateId(),
      };

      // 处理混淆
      if (params.obfs) {
        config.obfs = params.obfs;
        if (params['obfs-password']) {
          config['obfs-password'] = params['obfs-password'];
        }
      }

      // 处理 SNI
      if (params.sni) {
        config.sni = params.sni;
      }

      // 处理证书验证
      if (params['skip-cert-verify']) {
        config['skip-cert-verify'] = this.parseBooleanParam(params['skip-cert-verify']);
      }

      // 处理 ALPN
      if (params.alpn) {
        config.alpn = params.alpn.split(',');
      }

      // 处理带宽限制
      if (params.up) {
        config['up-mbps'] = this.parseNumberParam(params.up);
      }
      if (params.down) {
        config['down-mbps'] = this.parseNumberParam(params.down);
      }

      return config;
    } catch (error) {
      console.error('解析 Hysteria2 链接失败:', error);
      return null;
    }
  }

  /**
   * 检查是否为 SS2022 加密方法
   */
  private static isSS2022Method(method: string): boolean {
    const ss2022Methods = [
      '2022-blake3-aes-128-gcm',
      '2022-blake3-aes-256-gcm', 
      '2022-blake3-chacha20-poly1305'
    ];
    return ss2022Methods.includes(method.toLowerCase());
  }

  /**
   * 获取支持的 Shadowsocks 加密方法
   */
  static getSupportedSSMethods(): string[] {
    return [
      // 传统 SS 方法
      'aes-128-gcm',
      'aes-256-gcm',
      'aes-128-cfb',
      'aes-256-cfb',
      'aes-128-ctr',
      'aes-256-ctr',
      'chacha20-ietf',
      'chacha20-ietf-poly1305',
      'xchacha20-ietf-poly1305',
      'rc4-md5',
      // SS2022 新方法
      '2022-blake3-aes-128-gcm',
      '2022-blake3-aes-256-gcm',
      '2022-blake3-chacha20-poly1305'
    ];
  }

  /**
   * 获取允许的插件名称列表
   */
  static getAllowedPlugins(): string[] {
    return ['obfs', 'simple-obfs', 'obfs-local', 'v2ray-plugin', 'shadow-tls', 'restls', 'gost-plugin'];
  }

  /**
   * 插件名称映射 - 将实际插件名称映射为标准名称
   */
  private static mapPluginName(pluginName: string): string {
    const pluginMapping: Record<string, string> = {
      'obfs-local': 'obfs',
      'simple-obfs': 'obfs'
    };
    
    return pluginMapping[pluginName] || pluginName;
  }

  /**
   * 插件参数映射 - 将插件特定参数映射为标准参数
   */
  private static mapPluginOptions(pluginName: string, options: Record<string, string | number | boolean>): Record<string, string | number | boolean> {
    const mappedOptions: Record<string, string | number | boolean> = {};
    
    // obfs-local 和 simple-obfs 的参数映射
    if (pluginName === 'obfs-local' || pluginName === 'simple-obfs') {
      for (const [key, value] of Object.entries(options)) {
        switch (key) {
          case 'obfs':
            mappedOptions.mode = value;
            break;
          case 'obfs-host':
            mappedOptions.host = value;
            break;
          default:
            mappedOptions[key] = value;
        }
      }
    } else {
      // 其他插件保持原样
      Object.assign(mappedOptions, options);
    }
    
    return mappedOptions;
  }

  /**
   * 解析 Shadowsocks 链接 (支持 SS 和 SS2022)
   * ss://method:password@server:port#name
   * ss://base64(method:password)@server:port#name
   */
  static parseShadowsocks(url: string): ProxyNode | null {
    try {
      if (!url.startsWith('ss://')) {
        throw new Error('不是有效的 Shadowsocks 链接');
      }

      const urlObj = new URL(url);
      let method: string;
      let password: string;
      
      // 处理两种编码格式
      if (urlObj.username && urlObj.password) {
        // 格式：ss://method:password@server:port#name
        method = decodeURIComponent(urlObj.username);
        password = decodeURIComponent(urlObj.password);
      } else {
        // 格式：ss://base64(method:password)@server:port#name
        try {
          // 提取 Base64 编码部分
          const urlWithoutProtocol = url.slice(5); // 移除 "ss://"
          const atIndex = urlWithoutProtocol.indexOf('@');
          
          if (atIndex === -1) {
            throw new Error('无效的 Shadowsocks 链接格式');
          }
          
          const encoded = urlWithoutProtocol.slice(0, atIndex);
          const decoded = this.decodeBase64(encoded);
          
          const colonIndex = decoded.indexOf(':');
          if (colonIndex === -1) {
            throw new Error('Base64 解码后格式无效');
          }
          
          method = decoded.slice(0, colonIndex);
          password = decoded.slice(colonIndex + 1);
        } catch (error) {
          console.error('Base64 格式解析失败:', error);
          throw new Error('无法解析 Base64 编码的 Shadowsocks 链接');
        }
      }

      const server = urlObj.hostname;
      const port = parseInt(urlObj.port) || 8388;
      const name = decodeURIComponent(urlObj.hash.slice(1)) || `ss-${server}`;
      const params = this.parseUrlParams(urlObj.search);

      // 验证加密方法
      const supportedMethods = this.getSupportedSSMethods();
      if (!supportedMethods.includes(method.toLowerCase())) {
        console.warn(`不支持的 Shadowsocks 加密方法: ${method}`);
      }

      // 根据加密方法确定协议类型
      const isSSR2022 = this.isSS2022Method(method);
      
      const config: ProxyNode & ShadowsocksConfig = {
        name,
        type: 'ss', // SS2022 是 SS 协议的分支，统一使用 'ss' 类型
        server,
        port,
        cipher: method,
        password,
        // UDP支持根据URL参数设置，默认为true
        udp: this.parseUdpParam(params.udp),
        // 生成唯一ID
        id: this.generateId(),
      };

      // 处理混淆插件参数
      if (params.plugin) {
        // 检查plugin参数是否包含配置信息（格式：plugin-name;key1=value1;key2=value2）
        const pluginParts = params.plugin.split(';');
        const originalPluginName = pluginParts[0];
        
        // 验证插件是否被允许
        if (!this.getAllowedPlugins().includes(originalPluginName)) {
          console.warn(`不支持的插件: ${originalPluginName}，允许的插件: ${this.getAllowedPlugins().join(', ')}`);
          return config; // 跳过不支持的插件
        }
        
        // 映射插件名称（如 obfs-local -> obfs）
        const mappedPluginName = this.mapPluginName(originalPluginName);
        config.plugin = mappedPluginName;
        
        let pluginOpts: Record<string, string | number | boolean> = {};
        
        // 处理plugin参数中的内联配置
        if (pluginParts.length > 1) {
          // 从plugin参数中解析配置选项
          const inlineOptsStr = pluginParts.slice(1).join(';');
          pluginOpts = this.parsePluginOpts(inlineOptsStr, originalPluginName);
        }
        
        // 处理独立的plugin-opts参数
        if (params['plugin-opts']) {
          const separateOpts = this.parsePluginOpts(params['plugin-opts'], originalPluginName);
          // 合并两种配置，独立的plugin-opts优先级更高
          pluginOpts = { ...pluginOpts, ...separateOpts };
        }
        
        // 映射插件参数（如 obfs -> mode, obfs-host -> host）
        const mappedPluginOpts = this.mapPluginOptions(originalPluginName, pluginOpts);
        
        // 验证并标准化插件配置（使用映射后的插件名称）
        this.validateAndNormalizePluginConfig(config, mappedPluginName, mappedPluginOpts);
        
        // 只有当有配置选项时才添加plugin-opts字段
        if (Object.keys(mappedPluginOpts).length > 0) {
          config['plugin-opts'] = mappedPluginOpts;
        }
      }

      // 处理 SS2022 特殊配置
      if (isSSR2022) {
        // SS2022 协议的特殊处理
        config['server-port'] = port;
        
        // SS2022 密码格式验证
        if (!password || password.length < 16) {
          console.warn('SS2022 密码长度可能不足，建议使用更长的密码');
        }
      }

      return config;
    } catch (error) {
      console.error('解析 Shadowsocks 链接失败:', error);
      return null;
    }
  }

  /**
   * 解析 Trojan 链接
   * trojan://password@server:port?param1=value1&param2=value2#name
   */
  static parseTrojan(url: string): ProxyNode | null {
    try {
      if (!url.startsWith('trojan://')) {
        throw new Error('不是有效的 Trojan 链接');
      }

      const urlObj = new URL(url);
      const password = urlObj.username;
      const server = urlObj.hostname;
      const port = parseInt(urlObj.port) || 443;
      const name = decodeURIComponent(urlObj.hash.slice(1)) || `trojan-${server}`;
      const params = this.parseUrlParams(urlObj.search);

      const config: ProxyNode & TrojanConfig = {
        name,
        type: 'trojan',
        server,
        port,
        password,
        udp: this.parseUdpParam(params.udp),
        id: this.generateId(),
      };

      // 处理 SNI
      if (params.sni) {
        config.sni = params.sni;
      }

      // 处理证书验证
      if (params['skip-cert-verify']) {
        config['skip-cert-verify'] = this.parseBooleanParam(params['skip-cert-verify']);
      }
      
      // 处理 allowInsecure 参数（映射到 skip-cert-verify）
      if (params.allowInsecure) {
        config['skip-cert-verify'] = this.parseBooleanParam(params.allowInsecure);
      }

      // 处理 ALPN
      if (params.alpn) {
        config.alpn = params.alpn.split(',');
      } else {
        // 设置默认 ALPN
        config.alpn = ['h2', 'http/1.1'];
      }

      // 处理 WebSocket
      if (params.type === 'ws') {
        config.network = 'ws';
        config['ws-opts'] = {};
        if (params.path) {
          config['ws-opts'].path = params.path;
        }
        if (params.host) {
          config['ws-opts'].headers = { host: params.host };
        }
      }

      return config;
    } catch (error) {
      console.error('解析 Trojan 链接失败:', error);
      return null;
    }
  }

  /**
   * 自动检测并解析代理链接
   */
  static parseProxy(url: string): ProxyNode | null {
    const trimmedUrl = url.trim();
    
    if (trimmedUrl.startsWith('vless://')) {
      return this.parseVless(trimmedUrl);
    } else if (trimmedUrl.startsWith('hysteria2://') || trimmedUrl.startsWith('hy2://')) {
      return this.parseHysteria2(trimmedUrl);
    } else if (trimmedUrl.startsWith('ss://')) {
      return this.parseShadowsocks(trimmedUrl);
    } else if (trimmedUrl.startsWith('trojan://')) {
      return this.parseTrojan(trimmedUrl);
    } else {
      console.error('不支持的代理协议:', trimmedUrl.split('://')[0]);
      return null;
    }
  }

  /**
   * 解析多个代理链接
   */
  static parseMultipleProxies(urls: string[]): ProxyNode[] {
    const proxies: ProxyNode[] = [];
    
    for (const url of urls) {
      const proxy = this.parseProxy(url);
      if (proxy) {
        proxies.push(proxy);
      }
    }
    
    return proxies;
  }
}

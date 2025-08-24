// 订阅链接解析器
export interface ProxyNode {
  name: string;
  type: string;
  server: string;
  port: number;
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
        udp: true,
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
      if (params['skip-cert-verify'] === 'true') {
        config['skip-cert-verify'] = true;
      }

      // 处理 ALPN
      if (params.alpn) {
        config.alpn = params.alpn.split(',');
      }

      // 处理带宽限制
      if (params.up) {
        config['up-mbps'] = parseInt(params.up);
      }
      if (params.down) {
        config['down-mbps'] = parseInt(params.down);
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

      // 验证加密方法
      const supportedMethods = this.getSupportedSSMethods();
      if (!supportedMethods.includes(method.toLowerCase())) {
        console.warn(`不支持的 Shadowsocks 加密方法: ${method}`);
      }

      const config: ProxyNode & ShadowsocksConfig = {
        name,
        type: 'ss',
        server,
        port,
        cipher: method,
        password,
        udp: true,
      };

      // 处理 SS2022 特殊配置
      if (this.isSS2022Method(method)) {
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
        udp: true,
      };

      // 处理 SNI
      if (params.sni) {
        config.sni = params.sni;
      }

      // 处理证书验证
      if (params['skip-cert-verify'] === 'true') {
        config['skip-cert-verify'] = true;
      }

      // 处理 ALPN
      if (params.alpn) {
        config.alpn = params.alpn.split(',');
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
   * 验证 Shadowsocks 配置
   */
  static validateShadowsocksConfig(config: ProxyNode & ShadowsocksConfig): boolean {
    // 检查基本字段
    if (!config.cipher || !config.password || !config.server || !config.port) {
      return false;
    }

    // 检查加密方法是否支持
    const supportedMethods = this.getSupportedSSMethods();
    if (!supportedMethods.includes(config.cipher.toLowerCase())) {
      return false;
    }

    // SS2022 特殊验证
    if (this.isSS2022Method(config.cipher)) {
      // SS2022 需要更强的密码
      if (config.password.length < 16) {
        console.warn('SS2022 建议使用更长的密码');
      }
    }

    return true;
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

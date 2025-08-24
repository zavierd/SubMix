import * as yaml from 'js-yaml';
import { ProxyNode } from './proxy-parser';

export interface MihomoConfig {
  port?: number;
  'socks-port'?: number;
  'redir-port'?: number;
  'mixed-port'?: number;
  'allow-lan'?: boolean;
  mode?: 'rule' | 'global' | 'direct';
  'log-level'?: 'info' | 'warning' | 'error' | 'debug' | 'silent';
  'external-controller'?: string;
  'external-ui'?: string;
  'external-ui-name'?: string;
  'external-ui-url'?: string;
  secret?: string;
  'interface-name'?: string;
  'routing-mark'?: number;
  'unified-delay'?: boolean;
  'tcp-concurrent'?: boolean;
  'enable-process'?: boolean;
  'find-process-mode'?: 'always' | 'strict' | 'off';
  'global-client-fingerprint'?: string;
  ipv6?: boolean;
  'geodata-mode'?: boolean;
  'geodata-loader'?: 'memconservative' | 'standard';
  'geox-url'?: {
    geoip?: string;
    geosite?: string;
    mmdb?: string;
  };
  profile?: {
    'store-selected'?: boolean;
    'store-fake-ip'?: boolean;
  };
  sniffer?: {
    enable?: boolean;
    sniff?: {
      TLS?: {
        ports?: number[];
      };
      HTTP?: {
        ports?: number[];
        'override-destination'?: boolean;
      };
    };
    'force-domain'?: string[];
    'skip-domain'?: string[];
    sniffing?: string[];
    'port-whitelist'?: number[];
  };
  tun?: {
    enable?: boolean;
    stack?: 'system' | 'gvisor' | 'mixed';
    'dns-hijack'?: string[];
    'auto-route'?: boolean;
    'auto-detect-interface'?: boolean;
    'inet4-address'?: string[];
    'inet6-address'?: string[];
    mtu?: number;
    'strict-route'?: boolean;
    'inet4-route-address'?: string[];
    'inet6-route-address'?: string[];
    'include-uid'?: number[];
    'include-uid-range'?: string[];
    'exclude-uid'?: number[];
    'exclude-uid-range'?: string[];
    'include-android-user'?: number[];
    'include-package'?: string[];
    'exclude-package'?: string[];
    'endpoint-independent-nat'?: boolean;
  };
  dns?: {
    enable?: boolean;
    listen?: string;
    ipv6?: boolean;
    'use-hosts'?: boolean;
    'use-system-hosts'?: boolean;
    'respect-rules'?: boolean;
    'enhanced-mode'?: 'fake-ip' | 'redir-host';
    'fake-ip-range'?: string;
    'fake-ip-filter'?: string[];
    'default-nameserver'?: string[];
    nameserver?: string[];
    'proxy-server-nameserver'?: string[];
    'nameserver-policy'?: Record<string, string | string[]>;
    fallback?: string[];
    'fallback-filter'?: {
      geoip?: boolean;
      'geoip-code'?: string;
      ipcidr?: string[];
      domain?: string[];
    };
  };
  proxies?: ProxyNode[];
  'proxy-groups'?: Array<{
    name: string;
    type: 'select' | 'url-test' | 'fallback' | 'load-balance' | 'relay';
    proxies?: string[];
    use?: string[];
    url?: string;
    interval?: number;
    tolerance?: number;
    timeout?: number;
    lazy?: boolean;
    'disable-udp'?: boolean;
    filter?: string;
    'exclude-filter'?: string;
    'exclude-type'?: string;
    'include-all'?: boolean;
    icon?: string;
  }>;
  'proxy-providers'?: Record<string, {
    type: 'http' | 'file';
    url?: string;
    path?: string;
    interval?: number;
    'health-check'?: {
      enable?: boolean;
      url?: string;
      interval?: number;
    };
    filter?: string;
    'exclude-filter'?: string;
    'exclude-type'?: string;
  }>;
  rules?: string[];
  'rule-providers'?: Record<string, {
    type: 'http' | 'file';
    behavior: 'domain' | 'ipcidr' | 'classical';
    url?: string;
    path?: string;
    interval?: number;
  }>;
}

export class MihomoConfigGenerator {
  
  /**
   * 生成基础的 Mihomo 配置
   */
  static generateBaseConfig(): Partial<MihomoConfig> {
    return {
      port: 7890,
      'socks-port': 7891,
      'mixed-port': 7892,
      'allow-lan': false,
      mode: 'rule',
      'log-level': 'info',
      'external-controller': '127.0.0.1:9090',
      'unified-delay': true,
      'tcp-concurrent': true,
      'enable-process': true,
      'find-process-mode': 'strict',
      'global-client-fingerprint': 'chrome',
      ipv6: false,
      'geodata-mode': true,
      'geodata-loader': 'standard',
      'geox-url': {
        geoip: 'https://mirror.ghproxy.com/https://github.com/MetaCubeX/meta-rules-dat/releases/download/latest/geoip-lite.dat',
        geosite: 'https://mirror.ghproxy.com/https://github.com/MetaCubeX/meta-rules-dat/releases/download/latest/geosite.dat',
        mmdb: 'https://mirror.ghproxy.com/https://github.com/MetaCubeX/meta-rules-dat/releases/download/latest/country-lite.mmdb'
      },
      profile: {
        'store-selected': true,
        'store-fake-ip': true
      },
      sniffer: {
        enable: true,
        sniff: {
          TLS: {
            ports: [443, 8443]
          },
          HTTP: {
            ports: [80, 8080],
            'override-destination': true
          }
        }
      },
      dns: {
        enable: true,
        listen: '0.0.0.0:1053',
        ipv6: false,
        'enhanced-mode': 'fake-ip',
        'fake-ip-range': '198.18.0.1/16',
        'fake-ip-filter': [
          '*.lan',
          '*.localdomain',
          '*.example',
          '*.invalid',
          '*.localhost',
          '*.test',
          '*.local',
          '*.home.arpa',
          'time.*.com',
          'time.*.gov',
          'time.*.edu.cn',
          'time.*.apple.com',
          'time-ios.apple.com',
          'time1.*.com',
          'time2.*.com',
          'time3.*.com',
          'time4.*.com',
          'time5.*.com',
          'time6.*.com',
          'time7.*.com',
          'ntp.*.com',
          'ntp1.*.com',
          'ntp2.*.com',
          'ntp3.*.com',
          'ntp4.*.com',
          'ntp5.*.com',
          'ntp6.*.com',
          'ntp7.*.com',
          '*.time.edu.cn',
          '*.ntp.org.cn',
          '+.pool.ntp.org',
          'time1.cloud.tencent.com',
          'music.163.com',
          '*.music.163.com',
          '*.126.net',
          'musicapi.taihe.com',
          'music.taihe.com',
          'songsearch.kugou.com',
          'trackercdn.kugou.com',
          '*.kuwo.cn',
          'api-jooxtt.sanook.com',
          'api.joox.com',
          'joox.com',
          'y.qq.com',
          '*.y.qq.com',
          'streamoc.music.tc.qq.com',
          'mobileoc.music.tc.qq.com',
          'isure.stream.qqmusic.qq.com',
          'dl.stream.qqmusic.qq.com',
          'aqqmusic.tc.qq.com',
          'amobile.music.tc.qq.com',
          '*.xiami.com',
          '*.music.migu.cn',
          'music.migu.cn',
          '*.msftconnecttest.com',
          '*.msftncsi.com',
          'localhost.ptlogin2.qq.com',
          'localhost.sec.qq.com',
          '+.srv.nintendo.net',
          '+.stun.playstation.net',
          'xbox.*.microsoft.com',
          '+.xboxlive.com',
          'proxy.golang.org',
          'stun.*.*',
          'stun.*.*.*',
          '+.stun.*.*',
          '+.stun.*.*.*',
          '+.stun.*.*.*.*',
          'heartbeat.belkin.com',
          '*.linksys.com',
          '*.linksyssmartwifi.com',
          '*.router.asus.com',
          'mesu.apple.com',
          'swscan.apple.com',
          'swquery.apple.com',
          'swdownload.apple.com',
          'swcdn.apple.com',
          'swdist.apple.com',
          'lens.l.google.com',
          'stun.l.google.com'
        ],
        'default-nameserver': [
          '223.5.5.5',
          '8.8.8.8'
        ],
        nameserver: [
          'https://doh.pub/dns-query',
          'https://dns.alidns.com/dns-query'
        ],
        fallback: [
          'https://1.1.1.1/dns-query',
          'https://dns.cloudflare.com/dns-query',
          'https://dns.google/dns-query'
        ],
        'fallback-filter': {
          geoip: true,
          'geoip-code': 'CN',
          ipcidr: [
            '240.0.0.0/4'
          ]
        }
      }
    };
  }

  /**
   * 生成代理组配置 - 优化版本
   */
  static generateProxyGroups(proxyNames: string[]) {
    return [
      {
        name: '🚀 手动切换',
        type: 'select' as const,
        proxies: ['♻️ 自动选择', '🔯 故障转移', '🔮 负载均衡', '🎯 全球直连', ...proxyNames],
        icon: 'https://raw.githubusercontent.com/Koolson/Qure/master/IconSet/Color/Rocket.png'
      },
      {
        name: '♻️ 自动选择',
        type: 'url-test' as const,
        proxies: proxyNames,
        url: 'http://www.gstatic.com/generate_204',
        interval: 300,
        tolerance: 50,
        icon: 'https://raw.githubusercontent.com/Koolson/Qure/master/IconSet/Color/Auto.png'
      },
      {
        name: '🔯 故障转移',
        type: 'fallback' as const,
        proxies: proxyNames,
        url: 'http://www.gstatic.com/generate_204',
        interval: 300,
        icon: 'https://raw.githubusercontent.com/Koolson/Qure/master/IconSet/Color/Available.png'
      },
      {
        name: '🔮 负载均衡',
        type: 'load-balance' as const,
        proxies: proxyNames,
        url: 'http://www.gstatic.com/generate_204',
        interval: 300,
        icon: 'https://raw.githubusercontent.com/Koolson/Qure/master/IconSet/Color/Static.png'
      },
      {
        name: '🛑 广告拦截',
        type: 'select' as const,
        proxies: ['REJECT', '🎯 全球直连'],
        icon: 'https://raw.githubusercontent.com/Koolson/Qure/master/IconSet/Color/Reject.png'
      },
      {
        name: '🎯 全球直连',
        type: 'select' as const,
        proxies: ['DIRECT'],
        icon: 'https://raw.githubusercontent.com/Koolson/Qure/master/IconSet/Color/Direct.png'
      }
    ];
  }

  /**
   * 生成基础规则 - 使用 Loyalsoldier/clash-rules (白名单模式)
   */
  static generateBasicRules(): string[] {
    return [
      // 常见软件直连
      'RULE-SET,applications,🎯 全球直连',
      
      // Clash 管理面板
      'DOMAIN,clash.razord.top,🎯 全球直连',
      'DOMAIN,yacd.haishan.me,🎯 全球直连',
      
      // 私有和局域网
      'RULE-SET,private,🎯 全球直连',
      
      // 广告拦截
      'RULE-SET,reject,🛑 广告拦截',
      
      // Apple 和 iCloud 服务
      'RULE-SET,icloud,🎯 全球直连',
      'RULE-SET,apple,🎯 全球直连',
      
      // Google 服务 (根据需要可改为代理)
      'RULE-SET,google,🚀 手动切换',
      
      // 代理域名列表
      'RULE-SET,proxy,🚀 手动切换',
      
      // 直连域名列表
      'RULE-SET,direct,🎯 全球直连',
      
      // IP 段规则
      'RULE-SET,lancidr,🎯 全球直连',
      'RULE-SET,cncidr,🎯 全球直连',
      'RULE-SET,telegramcidr,🚀 手动切换',
      
      // GeoIP 规则
      'GEOIP,LAN,🎯 全球直连',
      'GEOIP,CN,🎯 全球直连',
      
      // 最终规则 (白名单模式：未匹配的走代理)
      'MATCH,🚀 手动切换'
    ];
  }
  
  /**
   * 生成黑名单模式规则 - 使用 Loyalsoldier/clash-rules
   */
  static generateBlacklistRules(): string[] {
    return [
      // 常见软件直连
      'RULE-SET,applications,🎯 全球直连',
      
      // Clash 管理面板
      'DOMAIN,clash.razord.top,🎯 全球直连',
      'DOMAIN,yacd.haishan.me,🎯 全球直连',
      
      // 私有和局域网
      'RULE-SET,private,🎯 全球直连',
      
      // 广告拦截
      'RULE-SET,reject,🛑 广告拦截',
      
      // 需要代理的域名
      'RULE-SET,tld-not-cn,🚀 手动切换',
      'RULE-SET,gfw,🚀 手动切换',
      'RULE-SET,telegramcidr,🚀 手动切换',
      
      // 最终规则 (黑名单模式：未匹配的走直连)
      'MATCH,🎯 全球直连'
    ];
  }

  /**
   * 生成规则提供商配置 - 使用 Loyalsoldier/clash-rules
   */
  static generateRuleProviders() {
    const baseUrl = 'https://cdn.jsdelivr.net/gh/Loyalsoldier/clash-rules@release/';
    
    return {
      // 广告拦截和隐私保护
      'reject': {
        type: 'http' as const,
        behavior: 'domain' as const,
        url: `${baseUrl}reject.txt`,
        path: './ruleset/reject.yaml',
        interval: 86400
      },
      
      // Apple 服务
      'apple': {
        type: 'http' as const,
        behavior: 'domain' as const,
        url: `${baseUrl}apple.txt`,
        path: './ruleset/apple.yaml',
        interval: 86400
      },
      
      // iCloud 服务
      'icloud': {
        type: 'http' as const,
        behavior: 'domain' as const,
        url: `${baseUrl}icloud.txt`,
        path: './ruleset/icloud.yaml',
        interval: 86400
      },
      
      // Google 服务
      'google': {
        type: 'http' as const,
        behavior: 'domain' as const,
        url: `${baseUrl}google.txt`,
        path: './ruleset/google.yaml',
        interval: 86400
      },
      
      // 代理域名列表
      'proxy': {
        type: 'http' as const,
        behavior: 'domain' as const,
        url: `${baseUrl}proxy.txt`,
        path: './ruleset/proxy.yaml',
        interval: 86400
      },
      
      // 直连域名列表
      'direct': {
        type: 'http' as const,
        behavior: 'domain' as const,
        url: `${baseUrl}direct.txt`,
        path: './ruleset/direct.yaml',
        interval: 86400
      },
      
      // 私有域名列表
      'private': {
        type: 'http' as const,
        behavior: 'domain' as const,
        url: `${baseUrl}private.txt`,
        path: './ruleset/private.yaml',
        interval: 86400
      },
      
      // GFW 被墙域名列表
      'gfw': {
        type: 'http' as const,
        behavior: 'domain' as const,
        url: `${baseUrl}gfw.txt`,
        path: './ruleset/gfw.yaml',
        interval: 86400
      },
      
      // 非中国大陆顶级域名
      'tld-not-cn': {
        type: 'http' as const,
        behavior: 'domain' as const,
        url: `${baseUrl}tld-not-cn.txt`,
        path: './ruleset/tld-not-cn.yaml',
        interval: 86400
      },
      
      // Telegram IP 段
      'telegramcidr': {
        type: 'http' as const,
        behavior: 'ipcidr' as const,
        url: `${baseUrl}telegramcidr.txt`,
        path: './ruleset/telegramcidr.yaml',
        interval: 86400
      },
      
      // 中国大陆 IP 段
      'cncidr': {
        type: 'http' as const,
        behavior: 'ipcidr' as const,
        url: `${baseUrl}cncidr.txt`,
        path: './ruleset/cncidr.yaml',
        interval: 86400
      },
      
      // 局域网 IP 段
      'lancidr': {
        type: 'http' as const,
        behavior: 'ipcidr' as const,
        url: `${baseUrl}lancidr.txt`,
        path: './ruleset/lancidr.yaml',
        interval: 86400
      },
      
      // 常见软件列表
      'applications': {
        type: 'http' as const,
        behavior: 'classical' as const,
        url: `${baseUrl}applications.txt`,
        path: './ruleset/applications.yaml',
        interval: 86400
      }
    };
  }

  /**
   * 从代理节点生成完整的 Mihomo 配置
   */
  static generateConfig(proxies: ProxyNode[], ruleMode: 'whitelist' | 'blacklist' = 'whitelist'): MihomoConfig {
    const baseConfig = this.generateBaseConfig();
    const proxyNames = proxies.map(proxy => proxy.name);
    const proxyGroups = this.generateProxyGroups(proxyNames);
    const rules = ruleMode === 'whitelist' ? this.generateBasicRules() : this.generateBlacklistRules();
    const ruleProviders = this.generateRuleProviders();

    return {
      ...baseConfig,
      proxies,
      'proxy-groups': proxyGroups,
      'rule-providers': ruleProviders,
      rules
    };
  }

  /**
   * 将配置对象转换为 YAML 字符串
   */
  static configToYaml(config: MihomoConfig): string {
    return yaml.dump(config, {
      lineWidth: -1,
      noRefs: true,
      quotingType: '"',
      forceQuotes: false
    });
  }

  /**
   * 生成简化的配置（包含核心规则集）
   */
  static generateSimpleConfig(proxies: ProxyNode[], ruleMode: 'whitelist' | 'blacklist' = 'whitelist'): MihomoConfig {
    const baseConfig = this.generateBaseConfig();
    const proxyNames = proxies.map(proxy => proxy.name);
    
    // 简化的代理组
    const proxyGroups = [
      {
        name: '🚀 手动切换',
        type: 'select' as const,
        proxies: ['♻️ 自动选择', '🎯 全球直连', ...proxyNames],
        icon: 'https://raw.githubusercontent.com/Koolson/Qure/master/IconSet/Color/Rocket.png'
      },
      {
        name: '♻️ 自动选择',
        type: 'url-test' as const,
        proxies: proxyNames,
        url: 'http://www.gstatic.com/generate_204',
        interval: 300,
        icon: 'https://raw.githubusercontent.com/Koolson/Qure/master/IconSet/Color/Auto.png'
      },
      {
        name: '🛑 广告拦截',
        type: 'select' as const,
        proxies: ['REJECT', '🎯 全球直连'],
        icon: 'https://raw.githubusercontent.com/Koolson/Qure/master/IconSet/Color/Reject.png'
      },
      {
        name: '🎯 全球直连',
        type: 'select' as const,
        proxies: ['DIRECT'],
        icon: 'https://raw.githubusercontent.com/Koolson/Qure/master/IconSet/Color/Direct.png'
      }
    ];

    // 核心规则提供商（简化版）
    const ruleProviders: Record<string, { type: 'http' | 'file'; behavior: 'domain' | 'ipcidr' | 'classical'; url: string; path: string; interval: number }> = {
      'reject': {
        type: 'http' as const,
        behavior: 'domain' as const,
        url: 'https://cdn.jsdelivr.net/gh/Loyalsoldier/clash-rules@release/reject.txt',
        path: './ruleset/reject.yaml',
        interval: 86400
      },
      'private': {
        type: 'http' as const,
        behavior: 'domain' as const,
        url: 'https://cdn.jsdelivr.net/gh/Loyalsoldier/clash-rules@release/private.txt',
        path: './ruleset/private.yaml',
        interval: 86400
      },
      'proxy': {
        type: 'http' as const,
        behavior: 'domain' as const,
        url: 'https://cdn.jsdelivr.net/gh/Loyalsoldier/clash-rules@release/proxy.txt',
        path: './ruleset/proxy.yaml',
        interval: 86400
      },
      'direct': {
        type: 'http' as const,
        behavior: 'domain' as const,
        url: 'https://cdn.jsdelivr.net/gh/Loyalsoldier/clash-rules@release/direct.txt',
        path: './ruleset/direct.yaml',
        interval: 86400
      },
      'cncidr': {
        type: 'http' as const,
        behavior: 'ipcidr' as const,
        url: 'https://cdn.jsdelivr.net/gh/Loyalsoldier/clash-rules@release/cncidr.txt',
        path: './ruleset/cncidr.yaml',
        interval: 86400
      },
      'lancidr': {
        type: 'http' as const,
        behavior: 'ipcidr' as const,
        url: 'https://cdn.jsdelivr.net/gh/Loyalsoldier/clash-rules@release/lancidr.txt',
        path: './ruleset/lancidr.yaml',
        interval: 86400
      }
    };

    // 如果是黑名单模式，添加额外的规则集
    if (ruleMode === 'blacklist') {
      ruleProviders['gfw'] = {
        type: 'http' as const,
        behavior: 'domain' as const,
        url: 'https://cdn.jsdelivr.net/gh/Loyalsoldier/clash-rules@release/gfw.txt',
        path: './ruleset/gfw.yaml',
        interval: 86400
      };
      ruleProviders['tld-not-cn'] = {
        type: 'http' as const,
        behavior: 'domain' as const,
        url: 'https://cdn.jsdelivr.net/gh/Loyalsoldier/clash-rules@release/tld-not-cn.txt',
        path: './ruleset/tld-not-cn.yaml',
        interval: 86400
      };
    }

    // 根据模式选择规则
    const rules = ruleMode === 'whitelist' ? [
      // 白名单模式 - 未匹配的走代理
      'RULE-SET,private,🎯 全球直连',
      'RULE-SET,reject,🛑 广告拦截',
      'RULE-SET,direct,🎯 全球直连',
      'RULE-SET,proxy,🚀 手动切换',
      'RULE-SET,lancidr,🎯 全球直连',
      'RULE-SET,cncidr,🎯 全球直连',
      'GEOIP,LAN,🎯 全球直连',
      'GEOIP,CN,🎯 全球直连',
      'MATCH,🚀 手动切换'
    ] : [
      // 黑名单模式 - 未匹配的走直连
      'RULE-SET,private,🎯 全球直连',
      'RULE-SET,reject,🛑 广告拦截',
      'RULE-SET,gfw,🚀 手动切换',
      'RULE-SET,tld-not-cn,🚀 手动切换',
      'MATCH,🎯 全球直连'
    ];

    return {
      ...baseConfig,
      proxies,
      'proxy-groups': proxyGroups,
      'rule-providers': ruleProviders,
      rules
    };
  }
}

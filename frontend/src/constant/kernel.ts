import {
  ClashMode,
  LogLevel,
  ProxyGroup,
  RulesetBehavior,
  RulesetFormat,
  RuleType,
  TunStack,
} from '@/enums/kernel'
import { useEnvStore } from '@/stores'

export const CoreStopOutputKeyword = 'start initial compatible provider default'
export const CoreWorkingDirectory = 'data/mihomo'
export const CorePidFilePath = CoreWorkingDirectory + '/pid.txt'
export const CoreConfigFilePath = CoreWorkingDirectory + '/config.yaml'
export const CoreCacheFilePath = CoreWorkingDirectory + '/cache.db'

export const ModeOptions = [
  {
    label: 'kernel.global',
    value: ClashMode.Global,
    desc: 'kernel.globalDesc',
  },
  {
    label: 'kernel.rule',
    value: ClashMode.Rule,
    desc: 'kernel.ruleDesc',
  },
  {
    label: 'kernel.direct',
    value: ClashMode.Direct,
    desc: 'kernel.directDesc',
  },
]

export const LogLevelOptions = [
  {
    label: 'kernel.info',
    value: LogLevel.Info,
  },
  {
    label: 'kernel.warning',
    value: LogLevel.Warning,
  },
  {
    label: 'kernel.error',
    value: LogLevel.Error,
  },
  {
    label: 'kernel.debug',
    value: LogLevel.Debug,
  },
  {
    label: 'kernel.silent',
    value: LogLevel.Silent,
  },
]

export const FindProcessModeOptions = [
  {
    label: 'kernel.always',
    value: 'always',
  },
  {
    label: 'kernel.strict',
    value: 'strict',
  },
  {
    label: 'kernel.off',
    value: 'off',
  },
]

export const GlobalClientFingerprintOptions = [
  { label: 'kernel.chrome', value: 'chrome' },
  { label: 'kernel.firefox', value: 'firefox' },
  { label: 'kernel.safari', value: 'safari' },
  { label: 'kernel.iOS', value: 'iOS' },
  { label: 'kernel.android', value: 'android' },
  { label: 'kernel.edge', value: 'edge' },
  { label: 'kernel.360', value: '360' },
  { label: 'kernel.qq', value: 'qq' },
  { label: 'kernel.random', value: 'random' },
]

export const GeodataLoaderOptions = [
  { label: 'kernel.standard', value: 'standard' },
  { label: 'kernel.memconservative', value: 'memconservative' },
]

export const GeoSiteMatcherOptions = [
  { label: 'kernel.geosite-matcher.succinct', value: 'succinct' },
  { label: 'kernel.geosite-matcher.mph', value: 'mph' },
]

export const GroupsTypeOptions = [
  {
    label: 'kernel.proxyGroups.type.select',
    value: ProxyGroup.Select,
  },
  {
    label: 'kernel.proxyGroups.type.url-test',
    value: ProxyGroup.UrlTest,
  },
  {
    label: 'kernel.proxyGroups.type.fallback',
    value: ProxyGroup.Fallback,
  },
  {
    label: 'kernel.proxyGroups.type.relay',
    value: ProxyGroup.Relay,
  },
  {
    label: 'kernel.proxyGroups.type.load-balance',
    value: ProxyGroup.LoadBalance,
  },
]

export const StrategyOptions = [
  {
    label: 'kernel.proxyGroups.strategy.consistent-hashing',
    value: 'consistent-hashing',
  },
  {
    label: 'kernel.proxyGroups.strategy.round-robin',
    value: 'round-robin',
  },
]

export const RulesTypeOptions = [
  {
    label: 'kernel.rules.type.DOMAIN',
    value: RuleType.Domain,
  },
  {
    label: 'kernel.rules.type.DOMAIN-SUFFIX',
    value: RuleType.DomainSuffix,
  },
  {
    label: 'kernel.rules.type.DOMAIN-KEYWORD',
    value: RuleType.DomainKeyword,
  },
  {
    label: 'kernel.rules.type.DOMAIN-REGEX',
    value: RuleType.DomainRegex,
  },
  {
    label: 'kernel.rules.type.IP-CIDR',
    value: RuleType.IpCidr,
  },
  {
    label: 'kernel.rules.type.IP-CIDR6',
    value: RuleType.IpCidr6,
  },
  {
    label: 'kernel.rules.type.IP-ASN',
    value: RuleType.IpAsn,
  },
  {
    label: 'kernel.rules.type.SRC-IP-CIDR',
    value: RuleType.SrcIpCidr,
  },
  {
    label: 'kernel.rules.type.SRC-PORT',
    value: RuleType.SrcPort,
  },
  {
    label: 'kernel.rules.type.DST-PORT',
    value: RuleType.DstPort,
  },
  {
    label: 'kernel.rules.type.PROCESS-NAME',
    value: RuleType.ProcessName,
  },
  {
    label: 'kernel.rules.type.PROCESS-PATH',
    value: RuleType.ProcessPath,
  },
  {
    label: 'kernel.rules.type.RULE-SET',
    value: RuleType.RuleSet,
  },
  {
    label: 'kernel.rules.type.LOGIC',
    value: RuleType.Logic,
  },
  {
    label: 'kernel.rules.type.GEOIP',
    value: RuleType.Geoip,
  },
  {
    label: 'kernel.rules.type.GEOSITE',
    value: RuleType.Geosite,
  },
  {
    label: 'kernel.rules.type.MATCH',
    value: RuleType.Match,
  },
]

export const StackOptions = [
  { label: 'kernel.tun.system', value: TunStack.System },
  { label: 'kernel.tun.gvisor', value: TunStack.GVisor },
  { label: 'kernel.tun.mixed', value: TunStack.Mixed },
]

export const EnhancedModeOptions = [
  {
    label: 'kernel.dns.fake-ip',
    value: 'fake-ip',
  },
  {
    label: 'kernel.dns.redir-host',
    value: 'redir-host',
  },
]

export const FakeipFilterMode = [
  {
    label: 'kernel.dns.fake-ip-filter-mode.blacklist',
    value: 'blacklist',
  },
  {
    label: 'kernel.dns.fake-ip-filter-mode.whitelist',
    value: 'whitelist',
  },
]

export const RulesetFormatOptions = [
  { label: 'ruleset.format.yaml', value: RulesetFormat.Yaml },
  { label: 'ruleset.format.mrs', value: RulesetFormat.Mrs },
]

export const RulesetBehaviorOptions = [
  { label: 'ruleset.behavior.classical', value: RulesetBehavior.Classical },
  { label: 'ruleset.behavior.domain', value: RulesetBehavior.Domain },
  { label: 'ruleset.behavior.ipcidr', value: RulesetBehavior.Ipcidr },
]

export const EmptyRuleSet = {
  payload: [],
}

export const BuiltInOutbound = ['DIRECT', 'REJECT', 'REJECT-DROP', 'PASS', 'COMPATIBLE']

export const DefaultConnections = () => {
  return {
    visibility: {
      'metadata.inboundName': true,
      'metadata.type': true,
      'metadata.process': false,
      'metadata.processPath': false,
      'metadata.host': true,
      'metadata.sniffHost': false,
      'metadata.sourceIP': false,
      'metadata.remoteDestination': false,
      rule: true,
      chains: true,
      up: true,
      down: true,
      upload: true,
      download: true,
      start: true,
    },
    order: [
      'metadata.inboundName',
      'metadata.type',
      'metadata.process',
      'metadata.processPath',
      'metadata.host',
      'metadata.sniffHost',
      'metadata.sourceIP',
      'metadata.remoteDestination',
      'rule',
      'chains',
      'up',
      'down',
      'upload',
      'download',
      'start',
    ],
  }
}

export const DefaultCoreConfig = () => {
  const { env } = useEnvStore()
  const separator = env.os === 'windows' ? ';' : ':'

  return {
    env: {
      SAFE_PATHS: ['$APP_BASE_PATH/data/subscribes', '$APP_BASE_PATH/data/rulesets'].join(
        separator,
      ),
    },
    args: ['-d', '$APP_BASE_PATH/$CORE_BASE_PATH'],
  }
}

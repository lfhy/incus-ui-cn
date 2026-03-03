const descriptionMap: Record<string, string> = {
  "Agree to ACME terms of service": "同意 ACME 服务条款",
  "URL to the directory resource of the ACME service":
    "ACME 服务目录资源的 URL",
  "ACME challenge type to use": "要使用的 ACME 验证类型",
  "Domain for which the certificate is issued": "签发证书所对应的域名",
  "Email address used for the account registration": "用于账户注册的邮箱地址",
  "Port and interface for HTTP server (used by HTTP-01)":
    "HTTP 服务器的端口和监听接口（用于 HTTP-01）",
  "Backend provider for the challenge (used by DNS-01)":
    "验证所用后端提供方（用于 DNS-01）",
  "Environment variables to set during the challenge (used by DNS-01)":
    "验证期间需设置的环境变量（用于 DNS-01）",
  "Comma-separated list of DNS resolvers (used by DNS-01)":
    "DNS 解析器列表，逗号分隔（用于 DNS-01）",
  "Threshold when to evacuate an offline cluster member":
    "离线集群成员触发疏散的阈值",
  "Address to use for clustering traffic": "用于集群通信的地址",
  "Number of cluster members that replicate an image": "复制镜像的集群成员数量",
  "Time after which a cluster join token expires": "集群加入令牌的过期时间",
  "Number of database stand-by members": "数据库备用成员数量",
  "Number of database voter members": "数据库投票成员数量",
  "Threshold when an unresponsive member is considered offline":
    "将无响应成员判定为离线的阈值",
  "Maximum number of instances to move during one re-balancing run":
    "单次重平衡最多迁移的实例数量",
  "Amount of time during which an instance will not be moved again":
    "实例在此时间内不会再次被迁移",
  "How often (in minutes) to consider re-balancing things. 0 to disable (default)":
    "执行重平衡检查的间隔（分钟）。0 表示禁用（默认）",
  "Percentage load difference between most and least busy server needed to trigger a migration":
    "触发迁移所需最忙与最闲服务器之间的负载差百分比",
  "Address to bind the BGP server to": "BGP 服务器监听地址",
  "BGP Autonomous System Number for the local server":
    "本地服务器的 BGP 自治系统编号",
  "A unique identifier for the BGP server": "BGP 服务器唯一标识",
  "Address to bind the pprof debug server to (HTTP)":
    "pprof 调试服务器监听地址（HTTP）",
  "Address to bind the authoritative DNS server to": "权威 DNS 服务器监听地址",
  "Address to bind for the remote API (HTTPS)": "远程 API 监听地址（HTTPS）",
  "Whether to set Access-Control-Allow-Credentials":
    "是否设置 Access-Control-Allow-Credentials",
  "Access-Control-Allow-Headers HTTP header value":
    "Access-Control-Allow-Headers HTTP 头值",
  "Access-Control-Allow-Methods HTTP header value":
    "Access-Control-Allow-Methods HTTP 头值",
  "Access-Control-Allow-Origin HTTP header value":
    "Access-Control-Allow-Origin HTTP 头值",
  "Trusted servers to provide the client's address":
    "可提供客户端地址的受信任服务器",
  "Address to bind the metrics server to (HTTPS)":
    "指标服务器监听地址（HTTPS）",
  "Whether to enforce authentication on the metrics endpoint":
    "是否对指标端点强制认证",
  "HTTP proxy to use": "要使用的 HTTP 代理",
  "HTTPS proxy to use": "要使用的 HTTPS 代理",
  "Hosts that don't need the proxy": "不需要代理的主机",
  "Time after which a remote add token expires": "远程添加令牌的过期时间",
  "How long to wait before shutdown": "关机前等待时长",
  "Address to bind the storage object server to (HTTPS)":
    "对象存储服务器监听地址（HTTPS）",
  "Whether to enable the syslog unixgram socket listener":
    "是否启用 syslog unixgram 套接字监听器",
  "Whether to automatically trust clients signed by the CA":
    "是否自动信任由 CA 签名的客户端",
  "Whether to automatically update cached images": "是否自动更新缓存镜像",
  "Interval at which to look for updates to cached images":
    "检查缓存镜像更新的间隔",
  "Compression algorithm to use for new images": "新镜像使用的压缩算法",
  "Default architecture to use in a mixed-architecture cluster":
    "混合架构集群中使用的默认架构",
  "When an unused cached remote image is flushed":
    "未使用的远程缓存镜像何时清理",
  "Comma separate list of projects, empty means all":
    "项目列表（逗号分隔），留空表示全部",
  "E.g., instance, comma separate, empty means all":
    "例如 instance，逗号分隔，留空表示全部",
  "Minimum log level to send to the logger": "发送到日志器的最小日志级别",
  "Address of the logger": "日志器地址",
  "CA certificate for the server": "服务器 CA 证书",
  "The syslog facility defines the category of the log message":
    "syslog facility 用于定义日志消息类别",
  "Name to use as the instance field in Loki events.":
    "Loki 事件中 instance 字段使用的名称。",
  "Labels for a Loki log entry": "Loki 日志条目的标签",
  "Password used for authentication": "认证密码",
  "number of delivery retries, default 3": "投递重试次数，默认 3",
  "The type of the logger. One of loki, syslog or webhook.":
    "日志器类型，可选 loki、syslog 或 webhook。",
  "User name used for authentication": "认证用户名",
  "Events to send to the logger": "要发送到日志器的事件",
  "CA certificate for the Loki server": "Loki 服务器 CA 证书",
  "URL to the Loki server": "Loki 服务器 URL",
  "Password used for Loki authentication": "Loki 认证密码",
  "User name used for Loki authentication": "Loki 认证用户名",
  "Minimum log level to send to the Loki server":
    "发送到 Loki 服务器的最小日志级别",
  "Events to send to the Loki server": "要发送到 Loki 服务器的事件",
  "LXD will replace {instance} and {project} with project and instance names for deep-linking to individual grafana pages.":
    "LXD 会将 {instance} 和 {project} 替换为项目和实例名称，用于深链到对应 Grafana 页面。",
  "Whether to restrict login options to SSO/OIDC only.":
    "是否仅允许 SSO/OIDC 登录。",
  "Project to display on login.": "登录时显示的项目。",
  "Set UI to dark theme, light theme, or to match the system theme.":
    "将界面设置为深色、浅色，或跟随系统主题。",
  "Title for the LXD-UI web page. Shows the hostname when unset.":
    "LXD-UI 网页标题。未设置时显示主机名。",
  "Authorization scriptlet": "授权脚本",
  "Compression algorithm to use for backups": "备份使用的压缩算法",
  "Whether to run LXCFS on a per-instance basis": "是否按实例方式运行 LXCFS",
  "How to set the host name for a NIC": "如何设置网卡主机名",
  "Instance placement scriptlet for automatic instance placement":
    "用于自动实例放置的实例放置脚本",
  "OVN SSL certificate authority": "OVN SSL 证书颁发机构",
  "OVN SSL client certificate": "OVN SSL 客户端证书",
  "OVN SSL client key": "OVN SSL 客户端密钥",
  "OVS integration bridge to use for OVN networks":
    "OVN 网络使用的 OVS 集成网桥",
  "OVN northbound database connection string":
    "OVN Northbound 数据库连接字符串",
  "OVS socket path": "OVS 套接字路径",
  "Volume to use to store backup tarballs": "用于存储备份 tar 包的卷",
  "Volume to use to store the image tarballs": "用于存储镜像 tar 包的卷",
  "LINSTOR SSL certificate authority": "LINSTOR SSL 证书颁发机构",
  "LINSTOR SSL client certificate": "LINSTOR SSL 客户端证书",
  "LINSTOR SSL client key": "LINSTOR SSL 客户端密钥",
  "LINSTOR controller connection string": "LINSTOR 控制器连接字符串",
  "LINSTOR satellite node name override": "LINSTOR 卫星节点名称覆盖",
  "MAC address template": "MAC 地址模板",
  "Expected audience value for the application": "应用期望的 audience 值",
  "OpenID Connect claim to use as the username":
    "作为用户名使用的 OpenID Connect claim",
  "OpenID Connect client ID": "OpenID Connect 客户端 ID",
  "OpenID Connect Discovery URL for the provider":
    "提供方的 OpenID Connect Discovery URL",
  "Comma separated list of OpenID Connect scopes":
    "OpenID Connect scopes 列表（逗号分隔）",
  "API token of the OpenFGA server": "OpenFGA 服务器 API 令牌",
  "URL of the OpenFGA server": "OpenFGA 服务器 URL",
  "ID of the OpenFGA permission store": "OpenFGA 权限存储 ID",
  "LXD will replace `{instance}` and `{project}` with project and instance names for deep-linking to individual grafana pages.\nSee {ref}`grafana` for more information.":
    "LXD 会将 `{instance}` 和 `{project}` 替换为项目和实例名称，用于深链到对应 Grafana 页面。",
};

const normalize = (input: string): string =>
  input
    .replace(/\s+/g, " ")
    .trim()
    .replace(/[.。]$/, "");

const normalizedDescriptionMap: Record<string, string> = Object.fromEntries(
  Object.entries(descriptionMap).map(([key, value]) => [normalize(key), value]),
);

export const translateSettingDescription = (
  description?: string,
): string | undefined => {
  if (!description) {
    return description;
  }
  return (
    descriptionMap[description] ??
    normalizedDescriptionMap[normalize(description)] ??
    description
  );
};

export const translateSettingCategory = (category: string): string => {
  const categoryMap: Record<string, string> = {
    miscellaneous: "杂项",
    network: "网络",
    images: "镜像",
    logging: "日志",
    cluster: "集群",
    core: "核心",
    user: "用户",
  };
  return categoryMap[category] ?? category;
};

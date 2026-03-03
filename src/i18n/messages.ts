export const SUPPORTED_LOCALES = ["zh-CN", "en"] as const;

export type Locale = (typeof SUPPORTED_LOCALES)[number];

export type TranslationParams = Record<string, string | number>;

const en = {
  loading: "Loading...",
  loadingResources: "Loading resources...",
  menu: "Menu",
  closeNavigation: "Close navigation",
  mainNavigation: "main navigation",
  selectProjectToExplore: "Select a project to explore {title}",
  navTitleWithProject: "{title} ({project})",
  allProjects: "All projects",
  defaultProject: "default",
  project: "Project",
  selectProject: "Select project ({project})",
  search: "Search",
  createProject: "Create project",
  noPermissionCreateProjects: "You do not have permission to create projects",
  instances: "Instances",
  profiles: "Profiles",
  networking: "Networking",
  networks: "Networks",
  acls: "ACLs",
  ipam: "IPAM",
  storage: "Storage",
  pools: "Pools",
  volumes: "Volumes",
  customIsos: "Custom ISOs",
  buckets: "Buckets",
  images: "Images",
  configuration: "Configuration",
  clustering: "Clustering",
  members: "Members",
  groups: "Groups",
  server: "Server",
  operations: "Operations",
  warnings: "Warnings",
  permissions: "Permissions",
  identities: "Identities",
  idpGroups: "IDP groups",
  settings: "Settings",
  os: "OS",
  documentation: "Documentation",
  discussion: "Discussion",
  reportBug: "Report a bug",
  logOut: "Log out",
  loginWithSSOInstead: "Login with SSO instead",
  browserCertificate: "Browser certificate",
  identityTrustToken: "Identity trust token",
  expandMainNavigation: "Expand main navigation",
  collapseMainNavigation: "Collapse main navigation",
  login: "Login",
  chooseLoginMethod: "Choose your login method",
  loginWithSSO: "Login with SSO",
  loginWithTLS: "Login with TLS",
  notFoundTitle: "404 Page not found",
  notFoundBody: "Sorry, we cannot find the page that you are looking for.",
  notFoundLead: "If you think this is an error in our product, please",
} as const;

type MessageCatalog = Record<keyof typeof en, string>;

const zhCN: MessageCatalog = {
  loading: "加载中...",
  loadingResources: "资源加载中...",
  menu: "菜单",
  closeNavigation: "关闭导航",
  mainNavigation: "主导航",
  selectProjectToExplore: "请选择一个项目以查看{title}",
  navTitleWithProject: "{title}（{project}）",
  allProjects: "所有项目",
  defaultProject: "默认",
  project: "项目",
  selectProject: "选择项目（{project}）",
  search: "搜索",
  createProject: "创建项目",
  noPermissionCreateProjects: "你没有创建项目的权限",
  instances: "实例",
  profiles: "配置文件",
  networking: "网络",
  networks: "网络",
  acls: "访问控制列表",
  ipam: "IP 地址管理",
  storage: "存储",
  pools: "存储池",
  volumes: "存储卷",
  customIsos: "自定义 ISO",
  buckets: "存储桶",
  images: "镜像",
  configuration: "配置",
  clustering: "集群",
  members: "成员",
  groups: "组",
  server: "服务器",
  operations: "操作",
  warnings: "告警",
  permissions: "权限",
  identities: "身份",
  idpGroups: "IDP 组",
  settings: "设置",
  os: "操作系统",
  documentation: "文档",
  discussion: "讨论",
  reportBug: "报告问题",
  logOut: "退出登录",
  loginWithSSOInstead: "改用 SSO 登录",
  browserCertificate: "浏览器证书",
  identityTrustToken: "身份信任令牌",
  expandMainNavigation: "展开主导航",
  collapseMainNavigation: "收起主导航",
  login: "登录",
  chooseLoginMethod: "选择登录方式",
  loginWithSSO: "使用 SSO 登录",
  loginWithTLS: "使用 TLS 登录",
  notFoundTitle: "404 页面未找到",
  notFoundBody: "抱歉，未找到你访问的页面。",
  notFoundLead: "如果你认为这是产品错误，请",
};

export type MessageKey = keyof typeof en;

const MESSAGES: Record<Locale, MessageCatalog> = {
  "zh-CN": zhCN,
  en,
};

export const DEFAULT_LOCALE: Locale = "zh-CN";

export const isSupportedLocale = (value: string): value is Locale => {
  return SUPPORTED_LOCALES.includes(value as Locale);
};

export const translateMessage = (
  locale: Locale,
  key: MessageKey,
  params?: TranslationParams,
): string => {
  const template = MESSAGES[locale][key] ?? en[key] ?? key;

  if (!params) {
    return template;
  }

  return template.replace(/\{(\w+)\}/g, (_match: string, token: string) => {
    const value = params[token];
    return value === undefined ? `{${token}}` : String(value);
  });
};

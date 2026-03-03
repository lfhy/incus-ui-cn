export const STATUS = "状态";
export const NAME = "名称";
export const TYPE = "类型";
export const CLUSTER_MEMBER = "位置";
export const DESCRIPTION = "描述";
export const MEMORY = "内存";
export const FILESYSTEM = "根文件系统";
export const IPV4 = "IPv4";
export const IPV6 = "IPv6";
export const SNAPSHOTS = "快照";
export const PROJECT = "项目";
export const ACTIONS = "操作";

export const COLUMN_WIDTHS: Record<string, number> = {
  [NAME]: 170,
  [TYPE]: 130,
  [CLUSTER_MEMBER]: 150,
  [MEMORY]: 150,
  [FILESYSTEM]: 150,
  [DESCRIPTION]: 150,
  [IPV4]: 150,
  [IPV6]: 330,
  [SNAPSHOTS]: 110,
  [PROJECT]: 160,
  [STATUS]: 160,
  [ACTIONS]: 240,
};

export const SIZE_HIDEABLE_COLUMNS = [
  SNAPSHOTS,
  IPV6,
  IPV4,
  DESCRIPTION,
  CLUSTER_MEMBER,
  FILESYSTEM,
  MEMORY,
  TYPE,
  STATUS,
  ACTIONS,
];

export const USER_HIDEABLE_COLUMNS = [
  TYPE,
  MEMORY,
  FILESYSTEM,
  CLUSTER_MEMBER,
  DESCRIPTION,
  IPV4,
  IPV6,
  SNAPSHOTS,
];

export const CREATION_SPAN_COLUMNS = [
  TYPE,
  DESCRIPTION,
  MEMORY,
  FILESYSTEM,
  IPV4,
  IPV6,
  SNAPSHOTS,
];

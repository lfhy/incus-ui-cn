import type { OptionHTMLAttributes } from "react";
import type { LxdSettings } from "types/server";

export const dirDriver = "dir";
export const btrfsDriver = "btrfs";
export const lvmDriver = "lvm";
export const zfsDriver = "zfs";
export const cephDriver = "ceph";
export const cephFSDriver = "cephfs";
export const cephObject = "cephobject";
export const powerFlex = "powerflex";
export const pureStorage = "pure";
export const alletraDriver = "alletra";
export const lvmClusterDriver = "lvmcluster";

export const storageDriverLabels: { [key: string]: string } = {
  [dirDriver]: "目录",
  [btrfsDriver]: "Btrfs",
  [lvmDriver]: "LVM",
  [zfsDriver]: "ZFS",
  [cephDriver]: "Ceph",
  [cephFSDriver]: "CephFS",
  [powerFlex]: "Dell PowerFlex",
  [pureStorage]: "Pure Storage",
  [cephObject]: "Ceph Object",
  [alletraDriver]: "HPE Alletra",
  [lvmClusterDriver]: "LVM Cluster",
};

const bucketCompatibleDrivers = [dirDriver, btrfsDriver, lvmDriver, zfsDriver];
const driversWithClusterWideSource = [cephDriver, cephFSDriver];

export const isBucketCompatibleDriver = (driver: string): boolean => {
  return bucketCompatibleDrivers.includes(driver);
};

export const isClusterWideSourceDriver = (driver: string): boolean => {
  return driversWithClusterWideSource.includes(driver);
};

export const getStorageDriverOptions = (
  settings?: LxdSettings,
): OptionHTMLAttributes<HTMLOptionElement>[] => {
  const serverSupportedStorageDrivers =
    settings?.environment?.storage_supported_drivers || [];
  const storageDriverOptions: OptionHTMLAttributes<HTMLOptionElement>[] = [];
  for (const driver of serverSupportedStorageDrivers) {
    const label = storageDriverLabels[driver.Name];
    if (label) {
      storageDriverOptions.push({ label, value: driver.Name });
    }
  }

  return storageDriverOptions.sort((a, b) =>
    (a.label as string).localeCompare(b.label as string),
  );
};

export const getSupportedStorageDrivers = (
  settings?: LxdSettings,
): Set<string> => {
  return new Set(
    getStorageDriverOptions(settings).map((driver) => driver.value as string),
  );
};

const storageDriverToSourceHelp: Record<string, string> = {
  btrfs: "可选，指向现有块设备、循环文件或 Btrfs 子卷的路径",
  dir: "可选，指向现有目录的路径",
  lvm: "可选，指向现有块设备、循环文件或 LVM 卷组的路径",
  zfs: "可选，指向现有块设备、循环文件或 ZFS 数据集/池的路径",
  ceph: "可选，OSD 存储池名称",
  cephfs: "可选，现有 CephFS 文件系统或要使用的文件系统路径",
};

export const getSourceHelpForDriver = (driver: string) => {
  if (Object.keys(storageDriverToSourceHelp).includes(driver)) {
    return storageDriverToSourceHelp[driver];
  }
  return "不可用";
};

export const driversWithFilesystemSupport = [
  zfsDriver,
  lvmDriver,
  cephDriver,
  pureStorage,
  cephObject,
];

export const isRemoteStorage = (driver: string) => {
  return [cephDriver, cephFSDriver, cephObject, powerFlex].includes(driver);
};

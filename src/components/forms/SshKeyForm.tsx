import type { FC } from "react";
import {
  Button,
  Icon,
  MainTable,
  Tooltip,
  usePortal,
} from "@canonical/react-components";
import type {
  InstanceAndProfileFormikProps,
  InstanceAndProfileFormValues,
} from "./instanceAndProfileFormValues";
import { ensureEditMode, parseSshKeys } from "util/instanceEdit";
import { getAppliedProfiles } from "util/configInheritance";
import { useProfiles } from "context/useProfiles";
import type { LxdProfile } from "types/profile";
import SshKeyAddModal from "components/forms/SshKeyAddModal";
import ResourceLink from "components/ResourceLink";
import type { MainTableRow } from "@canonical/react-components/dist/components/MainTable/MainTable";
import { useSupportedFeatures } from "context/useSupportedFeatures";
import { useParams } from "react-router-dom";
import { scrollToElement } from "util/scroll";

export interface SshKey {
  id: string;
  name: string;
  user: string;
  fingerprint: string;
}

export interface SshKeyFormValues {
  cloud_init_ssh_keys: SshKey[];
}

export const sshKeyPayload = (values: InstanceAndProfileFormValues) => {
  const result: Record<string, string | undefined> = {};

  values.cloud_init_ssh_keys?.forEach((record) => {
    result[`cloud-init.ssh-keys.${record.name}`] =
      `${record.user}:${record.fingerprint}`;
  });

  return result;
};

interface InheritedSshKey {
  sshKey: SshKey;
  source: string;
}

export const getInheritedSshKeys = (
  values: InstanceAndProfileFormValues,
  profiles: LxdProfile[],
): InheritedSshKey[] => {
  const inheritedKeys: InheritedSshKey[] = [];
  if (values.entityType === "instance") {
    const appliedProfiles = getAppliedProfiles(values, profiles);
    for (const profile of appliedProfiles) {
      const profileKeys = parseSshKeys(profile);
      profileKeys.forEach((sshKey) =>
        inheritedKeys.push({ sshKey, source: profile.name }),
      );
    }
  }
  return inheritedKeys;
};

interface Props {
  formik: InstanceAndProfileFormikProps;
  disabledReason?: string;
}

const SshKeyForm: FC<Props> = ({ formik, disabledReason }) => {
  const { project } = useParams<{ project: string }>();
  const { hasCloudInitSshKeys } = useSupportedFeatures();
  const { data: profiles = [] } = useProfiles(project ?? "");
  const { openPortal, closePortal, isOpen, Portal } = usePortal();

  if (!hasCloudInitSshKeys) {
    return null;
  }

  const formKeys = formik.values.cloud_init_ssh_keys ?? [];
  const inheritedSshKeys = getInheritedSshKeys(formik.values, profiles);

  const getNewKeyName = () => {
    const formIds = formKeys.map((key) => key.id);
    const inheritedIds = inheritedSshKeys.map((key) => key.sshKey.id);
    const existingKeys = new Set(formIds.concat(inheritedIds));

    const prefix = formik.values.entityType === "profile" ? "profile" : "ssh";

    for (let i = 1; i < 1000; i++) {
      const candidate = `${prefix}-key-${i}`;
      if (!existingKeys.has(candidate)) {
        return candidate;
      }
    }
    return `${prefix}-key-1`;
  };

  const addKey = (name: string, user: string, fingerprint: string) => {
    formik.setFieldValue("cloud_init_ssh_keys", [
      ...formKeys,
      {
        id: getNewKeyName(),
        name,
        user,
        fingerprint,
      },
    ]);
    closePortal();
    setTimeout(() => {
      scrollToElement("add-ssh-key-btn");
    }, 100);
  };

  const headers = [
    { content: "名称", className: "name" },
    { content: "用户", className: "user" },
    { content: "密钥", className: "key" },
    ...(inheritedSshKeys.length > 0
      ? [{ content: "配置文件", className: "profile" }]
      : []),
    { "aria-label": "操作", className: "actions" },
  ];

  const inheritedRows: MainTableRow[] = inheritedSshKeys.map((inheritedKey) => {
    const isDetached = formKeys.some(
      (key) => key.id === inheritedKey.sshKey.id,
    );

    const detach = () => {
      ensureEditMode(formik);
      formik.setFieldValue("cloud_init_ssh_keys", [
        ...formKeys,
        {
          id: inheritedKey.sshKey.id,
          name: inheritedKey.sshKey.id,
          user: "nouser",
          fingerprint: "nokey",
        },
      ]);
    };

    const reAttach = () => {
      ensureEditMode(formik);
      formik.setFieldValue(
        "cloud_init_ssh_keys",
        formKeys.filter((key) => key.id !== inheritedKey.sshKey.id),
      );
    };

    return {
      key: `inherited-${inheritedKey.sshKey.id}`,
      className: isDetached ? "u-text--muted u-text--line-through" : "",
      columns: [
        {
          content: inheritedKey.sshKey.name,
          role: "rowheader",
          "aria-label": "名称",
          className: "name",
        },
        {
          content: inheritedKey.sshKey.user,
          role: "cell",
          "aria-label": "用户",
          className: "user",
        },
        {
          content: inheritedKey.sshKey.fingerprint,
          title: inheritedKey.sshKey.fingerprint,
          role: "cell",
          "aria-label": "密钥",
          className: "key u-truncate",
        },
        ...(inheritedSshKeys.length > 0
          ? [
              {
                content: (
                  <ResourceLink
                    to={`/ui/project/${encodeURIComponent(project ?? "")}/profile/${encodeURIComponent(inheritedKey.source)}/configuration`}
                    type="profile"
                    value={inheritedKey.source}
                    disabled={isDetached}
                  />
                ),
                role: "cell",
                "aria-label": "配置文件",
                className: "profile",
              },
            ]
          : []),
        {
          content: isDetached ? (
            <Button
              onClick={reAttach}
              dense
              type="button"
              hasIcon
              appearance="base"
              disabled={!!disabledReason}
              title={disabledReason}
            >
              <Icon name="connected" />
              <span>重新关联</span>
            </Button>
          ) : (
            <Button
              onClick={detach}
              dense
              type="button"
              hasIcon
              appearance="base"
              disabled={!!disabledReason}
              title={disabledReason}
            >
              <Icon name="disconnect" />
              <span>取消关联</span>
            </Button>
          ),
          role: "cell",
          "aria-label": "操作",
          className: "actions u-align--right",
        },
      ],
    };
  });

  const formRows: MainTableRow[] = formKeys
    ?.filter(
      (record) => !inheritedSshKeys.some((key) => key.sshKey.id === record.id),
    )
    .map((sshKey) => {
      const remove = () => {
        ensureEditMode(formik);
        formik.setFieldValue(
          "cloud_init_ssh_keys",
          formKeys.filter((key) => key.id !== sshKey.id),
        );
      };

      return {
        key: `local-${sshKey.id}`,
        columns: [
          {
            content: sshKey.name,
            role: "cell",
            "aria-label": "名称",
            className: "name",
          },
          {
            content: sshKey.user,
            role: "cell",
            "aria-label": "用户",
            className: "user",
          },
          {
            content: sshKey.fingerprint,
            title: sshKey.fingerprint,
            role: "cell",
            "aria-label": "密钥",
            className: "key u-truncate",
          },
          ...(inheritedSshKeys.length > 0
            ? [
                {
                  content: "",
                  role: "cell",
                  "aria-label": "配置文件",
                  className: "profile",
                },
              ]
            : []),
          {
            content: (
              <Button
                onClick={remove}
                dense
                type="button"
                hasIcon
                appearance="base"
                disabled={!!disabledReason}
                title={disabledReason}
              >
                <Icon name="delete" />
                <span>删除</span>
              </Button>
            ),
            role: "cell",
            "aria-label": "操作",
            className: "actions u-align--right",
          },
        ],
      };
    });

  const rows = inheritedRows.concat(formRows);

  return (
    <div className="ssh-key-form">
      <p className="p-form__label u-sv-1">
        SSH 密钥{" "}
        <Tooltip
          message={`必须在实例上启用 Cloud init 才能应用密钥。\n新增密钥会在实例创建或重启时生效。\nSSH 密钥不会被自动移除。`}
        >
          <Icon name="information" />
        </Tooltip>
      </p>

      {rows.length > 0 && (
        <MainTable
          id="ssh-keys-table"
          headers={headers}
          rows={rows}
          sortable
          className="ssh-key-table"
        />
      )}
      <Button
        id="add-ssh-key-btn"
        type="button"
        onClick={(e) => {
          ensureEditMode(formik);
          openPortal(e);
        }}
        hasIcon
        disabled={!!disabledReason}
        title={disabledReason}
      >
        <Icon name="plus" />
        <span>新增 SSH 密钥</span>
      </Button>
      {isOpen && (
        <Portal>
          <SshKeyAddModal
            initialName={getNewKeyName()}
            onClose={closePortal}
            onSelect={addKey}
          />
        </Portal>
      )}
    </div>
  );
};

export default SshKeyForm;

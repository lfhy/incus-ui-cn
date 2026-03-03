import type { FC } from "react";
import { useState } from "react";
import {
  Button,
  Form,
  Icon,
  Input,
  ScrollableContainer,
  useNotify,
  usePortal,
} from "@canonical/react-components";
import AutoExpandingTextArea from "components/AutoExpandingTextArea";
import type { FormikProps } from "formik/dist/types";
import type { AclRuleFormValues } from "pages/networks/forms/NetworkAclRuleModal";
import NetworkAclRuleModal from "pages/networks/forms/NetworkAclRuleModal";
import NetworkAclRuleTable from "pages/networks/forms/NetworkAclRuleTable";
import { ensureEditMode } from "util/instanceEdit";
import { slugify } from "util/slugify";
import { YAML_CONFIGURATION } from "pages/networks/forms/NetworkFormMenu";
import YamlForm from "components/forms/YamlForm";
import type { LxdNetworkAcl } from "types/network";
import NetworkAclUsedBy from "pages/networks/NetworkAclUsedBy";

export const toNetworkAcl = (
  values: NetworkAclFormValues,
  networkAcl?: LxdNetworkAcl,
): LxdNetworkAcl => {
  const result: LxdNetworkAcl = {
    name: values.name,
    description: values.description,
    egress: values.egress,
    ingress: values.ingress,
  };
  if (networkAcl?.config) {
    result.config = networkAcl.config;
  }
  return result;
};

export type RuleDirection = "ingress" | "egress";

export interface NetworkAclFormValues {
  readOnly: boolean;
  isCreating: boolean;
  name: string;
  description?: string;
  egress: AclRuleFormValues[];
  ingress: AclRuleFormValues[];
  yaml?: string;
  editRestriction?: string;
  bareAcl?: LxdNetworkAcl;
  entityType: "network-acl";
}

interface Props {
  formik: FormikProps<NetworkAclFormValues>;
  getYaml: () => string;
  section: string;
}

const NetworkAclForm: FC<Props> = ({ formik, getYaml, section }) => {
  const notify = useNotify();
  const { openPortal, closePortal, isOpen, Portal } = usePortal();
  const [editRule, setEditRule] = useState<AclRuleFormValues | null>(null);
  const [ruleDirection, setRuleDirection] = useState<RuleDirection>("ingress");

  const getRules = (direction: RuleDirection) => {
    return direction === "ingress"
      ? formik.values.ingress
      : formik.values.egress;
  };

  const handleSaveRule = ({ index: editIndex, ...rule }: AclRuleFormValues) => {
    const rules = getRules(ruleDirection);

    if (editIndex === undefined) {
      // Add new rule
      formik.setFieldValue(ruleDirection, [...rules, rule]);
    } else {
      // Update existing rule
      const copy = [...rules];
      copy[editIndex] = rule;
      formik.setFieldValue(ruleDirection, copy);
    }

    ensureEditMode(formik);
    closePortal();
    setEditRule(null);
  };

  const openAddRuleModal = (direction: RuleDirection) => {
    setRuleDirection(direction);
    openPortal();
  };

  const handleRemoveRule = (direction: RuleDirection, index: number) => {
    const rules = getRules(direction);
    const copy = [...rules];
    copy.splice(index, 1);

    formik.setFieldValue(direction, copy);
    ensureEditMode(formik);
  };

  const openEditRuleModal = (direction: RuleDirection, index: number) => {
    const rules = getRules(direction);
    const rule = rules[index];
    setRuleDirection(direction);
    setEditRule({ ...rule, index });
    openPortal();
  };

  const handleCloseRuleModal = () => {
    closePortal();
    setEditRule(null);
  };

  const isLackingEditPermission = !!formik.values.editRestriction;

  return (
    <>
      {isOpen && (
        <Portal>
          <NetworkAclRuleModal
            onClose={handleCloseRuleModal}
            onAdd={handleSaveRule}
            editRule={editRule}
            direction={ruleDirection}
          />
        </Portal>
      )}
      <ScrollableContainer
        dependencies={[notify.notification]}
        belowIds={["form-footer", "status-bar"]}
      >
        <Form onSubmit={formik.handleSubmit}>
          {section !== slugify(YAML_CONFIGURATION) && (
            <>
              {/* hidden submit to enable enter key in inputs */}
              <div className="bare-inputs">
                <Input type="submit" hidden value="Hidden input" />
                <Input
                  id="name"
                  type="text"
                  label="名称"
                  placeholder="请输入名称"
                  required
                  autoFocus
                  disabled={
                    !formik.values.isCreating || isLackingEditPermission
                  }
                  title={formik.values.editRestriction}
                  help={
                    !formik.values.isCreating
                      ? "点击页眉中的 ACL 名称可重命名 ACL"
                      : ""
                  }
                  {...formik.getFieldProps("name")}
                  error={formik.touched.name ? formik.errors.name : null}
                />
                <AutoExpandingTextArea
                  id="description"
                  name="description"
                  label="描述"
                  placeholder="请输入描述"
                  onBlur={formik.handleBlur}
                  onChange={(e) => {
                    ensureEditMode(formik);
                    formik.handleChange(e);
                  }}
                  value={formik.values.description}
                  disabled={isLackingEditPermission}
                  title={formik.values.editRestriction}
                />
              </div>
              {formik.values.ingress.length > 0 && (
                <>
                  <h2 className="p-heading--4">入站规则</h2>
                  <NetworkAclRuleTable
                    rules={formik.values.ingress}
                    onRemove={(index) => {
                      handleRemoveRule("ingress", index);
                    }}
                    onEdit={(index) => {
                      openEditRuleModal("ingress", index);
                    }}
                    editRestriction={formik.values.editRestriction}
                  />
                </>
              )}
              <div>
                <Button
                  hasIcon
                  onClick={() => {
                    openAddRuleModal("ingress");
                  }}
                  type="button"
                  disabled={isLackingEditPermission}
                  title={formik.values.editRestriction}
                >
                  <Icon name="plus" />
                  <span>新增入站规则</span>
                </Button>
              </div>

              {formik.values.egress.length > 0 && (
                <>
                  <h2 className="p-heading--4">出站规则</h2>
                  <NetworkAclRuleTable
                    rules={formik.values.egress}
                    onRemove={(index) => {
                      handleRemoveRule("egress", index);
                    }}
                    onEdit={(index) => {
                      openEditRuleModal("egress", index);
                    }}
                    editRestriction={formik.values.editRestriction}
                  />
                </>
              )}
              <div>
                <Button
                  hasIcon
                  onClick={() => {
                    openAddRuleModal("egress");
                  }}
                  type="button"
                  disabled={isLackingEditPermission}
                  title={formik.values.editRestriction}
                >
                  <Icon name="plus" />
                  <span>新增出站规则</span>
                </Button>
              </div>
              {formik.values.bareAcl?.used_by && (
                <>
                  <h2 className="p-heading--4">使用情况</h2>
                  <NetworkAclUsedBy networkAcl={formik.values.bareAcl} />
                </>
              )}
            </>
          )}
          {section === slugify(YAML_CONFIGURATION) && (
            <YamlForm
              yaml={getYaml()}
              setYaml={(yaml) => {
                ensureEditMode(formik);
                formik.setFieldValue("yaml", yaml);
              }}
              readOnly={isLackingEditPermission}
              readOnlyMessage={formik.values.editRestriction}
            />
          )}
        </Form>
      </ScrollableContainer>
    </>
  );
};

export default NetworkAclForm;

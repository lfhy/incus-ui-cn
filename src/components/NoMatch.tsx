import type { FC } from "react";
import { Row, Col, CustomLayout } from "@canonical/react-components";
import { useI18n } from "i18n/context";

const NoMatch: FC = () => {
  const { t } = useI18n();

  return (
    <CustomLayout mainClassName="no-match">
      <Row>
        <Col size={6} className="col-start-large-4">
          <h1 className="p-heading--4">{t("notFoundTitle")}</h1>
          <p>
            {t("notFoundBody")}
            <br />
            {t("notFoundLead")}{" "}
            <a
              href="https://github.com/zabbly/lxd-ui-canonical/issues/new"
              target="_blank"
              rel="noopener noreferrer"
              title={t("reportBug")}
            >
              {t("reportBug")}
            </a>
            .
          </p>
        </Col>
      </Row>
    </CustomLayout>
  );
};

export default NoMatch;

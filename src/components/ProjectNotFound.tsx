import type { FC } from "react";
import { Row, Col, CustomLayout } from "@canonical/react-components";

const ProjectNotFound: FC = () => {
  const url = location.pathname;
  const hasProjectInUrl = url.startsWith("/ui/project/");
  const project = hasProjectInUrl ? url.split("/")[3] : "default";

  return (
    <CustomLayout mainClassName="no-match">
      <Row>
        <Col size={6} className="col-start-large-4">
          <h1 className="p-heading--4">未找到项目</h1>
          <p>
            项目 <code>{project}</code> 不存在，或你无权访问。
          </p>
        </Col>
      </Row>
    </CustomLayout>
  );
};

export default ProjectNotFound;

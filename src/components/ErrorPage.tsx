import type { FC } from "react";
import { useEffect } from "react";
import {
  CodeSnippet,
  CodeSnippetBlockAppearance,
  Notification,
  Strip,
  useListener,
} from "@canonical/react-components";
import { updateMaxHeight } from "util/updateMaxHeight";
import { getReportBugURL } from "util/reportBug";

interface Props {
  error?: Error;
}

const ErrorPage: FC<Props> = ({ error }) => {
  const url = getReportBugURL(error);

  const updateHeight = () => {
    updateMaxHeight("error-info", undefined, 0, "max-height");
  };
  useEffect(updateHeight, []);
  useListener(window, updateHeight, "resize", true);

  const errorBlocks = [];
  if (error?.message) {
    errorBlocks.push({
      title: "错误",
      appearance: CodeSnippetBlockAppearance.NUMBERED,
      wrapLines: true,
      code: error.message,
    });
  }

  if (error?.message.toLowerCase().includes("dynamically imported module")) {
    errorBlocks.push({
      title: "可能原因",
      appearance: CodeSnippetBlockAppearance.NUMBERED,
      wrapLines: true,
      code: `这可能是临时网络问题导致的，请尝试刷新页面。
如果问题持续，请确认与 LXD 服务器的连接正常，或稍后重试。`,
    });
  }

  if (error?.stack) {
    errorBlocks.push({
      title: "堆栈跟踪",
      appearance: CodeSnippetBlockAppearance.NUMBERED,
      wrapLines: true,
      code: error.stack,
    });
  }

  return (
    <Strip className="u-no-padding--bottom">
      <Notification severity="negative" title="错误">
        系统发生异常。如果问题持续存在，{" "}
        <a href={url} rel="noopener noreferrer" target="_blank">
          请在 GitHub 上提交 issue。
        </a>
      </Notification>
      <CodeSnippet
        className="error-info u-no-margin--bottom"
        blocks={errorBlocks}
      />
    </Strip>
  );
};

export default ErrorPage;

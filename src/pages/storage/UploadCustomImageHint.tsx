import type { FC } from "react";

const UploadCustomImageHint: FC = () => {
  return (
    <>
      <div className={`p-notification--information`}>
        <div className="p-notification__content">
          <h3 className="p-notification__title">
            某些镜像格式需要先转换，才能与 LXD 一起使用。
          </h3>
        </div>
      </div>
    </>
  );
};

export default UploadCustomImageHint;

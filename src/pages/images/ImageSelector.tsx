import type { FC, OptionHTMLAttributes } from "react";
import { useEffect, useState } from "react";
import {
  Button,
  CheckboxInput,
  Col,
  MainTable,
  Modal,
  Row,
  ScrollableTable,
  SearchBox,
  Select,
  Spinner,
} from "@canonical/react-components";
import type { LxdImageType, RemoteImage, RemoteImageList } from "types/image";
import { capitalizeFirstLetter, handleResponse } from "util/helpers";
import { useQuery } from "@tanstack/react-query";
import { queryKeys } from "util/queryKeys";
import type { MainTableRow } from "@canonical/react-components/dist/components/MainTable/MainTable";
import {
  byOSRelease,
  localLxdToRemoteImage,
  isContainerOnlyImage,
  isVmOnlyImage,
  LOCAL_ISO,
  LOCAL_IMAGE,
} from "util/images";
import { getArchitectureAliases } from "util/architectures";
import { instanceCreationTypes } from "util/instanceOptions";
import { useSettings } from "context/useSettings";
import { useParams } from "react-router-dom";
import { useImagesInProject } from "context/useImages";

interface Props {
  onSelect: (image: RemoteImage, type?: LxdImageType) => void;
  onClose: () => void;
}

const linuxContainersJson =
  "https://images.linuxcontainers.org/streams/v1/images.json";
const linuxContainersServer = "https://images.linuxcontainers.org";

const ANY = "any";
const CONTAINER = "container";
const VM = "virtual-machine";

const ImageSelector: FC<Props> = ({ onSelect, onClose }) => {
  const [query, setQuery] = useState<string>("");
  const [os, setOs] = useState<string>("");
  const [release, setRelease] = useState<string>("");
  const [arch, setArch] = useState<string>("amd64");
  const [type, setType] = useState<LxdImageType | undefined>(undefined);
  const [variant, setVariant] = useState<string>(ANY);
  const [hideRemote, setHideRemote] = useState(false);
  const { project } = useParams<{ project: string }>();

  const loadImages = async (
    file: string,
    server: string,
  ): Promise<RemoteImage[]> => {
    return new Promise((resolve, reject) => {
      fetch(file)
        .then(handleResponse)
        .then((data: RemoteImageList) => {
          const images = Object.entries(data.products).map((product) => {
            const { os, ...image } = product[1];
            const formattedOs = capitalizeFirstLetter(os);
            return { ...image, os: formattedOs, server: server };
          });
          resolve(images);
        })
        .catch(reject);
    });
  };

  const { data: settings, isLoading: isSettingsLoading } = useSettings();

  const { data: linuxContainerImages = [], isLoading: isLciLoading } = useQuery(
    {
      queryKey: [queryKeys.images, linuxContainersServer],
      queryFn: async () =>
        loadImages(linuxContainersJson, linuxContainersServer),
      retry: false, // avoid retry to ease experience in airgapped deployments
    },
  );

  const { data: localImages = [], isLoading: isLocalImageLoading } =
    useImagesInProject(project ?? "default");

  const isLoading = isLciLoading || isLocalImageLoading || isSettingsLoading;
  const archSupported = getArchitectureAliases(
    settings?.environment?.architectures ?? [],
  );
  const images = isLoading
    ? []
    : localImages
        .map(localLxdToRemoteImage)
        .sort(byOSRelease)
        .concat(linuxContainerImages)
        .filter((image) => archSupported.includes(image.arch));

  const archAll = [...new Set(images.map((item) => item.arch))]
    .filter((arch) => arch !== "")
    .sort();
  const variantAll = [...new Set(images.map((item) => item.variant))].sort();

  if (!isLoading && !archAll.includes(arch) && archAll.length > 0) {
    setArch(archAll[0]);
  }

  const getOptionList: (
    mapper: (item: RemoteImage) => string,
    filter?: (item: RemoteImage) => boolean,
  ) => OptionHTMLAttributes<HTMLOptionElement>[] = (
    mapper,
    filter = () => true,
  ) => {
    const options = [...new Set(images.filter(filter).map(mapper))]
      .sort()
      .map((item: string) => {
        return {
          label: item,
          value: item,
        };
      });
    options.unshift({
      label: "任意",
      value: "",
    });
    return options;
  };

  useEffect(() => {
    const modalCloseBtn = document.querySelector<HTMLButtonElement>(
      ".image-select-modal .p-modal__close",
    );
    if (modalCloseBtn) {
      modalCloseBtn.textContent = "关闭";
      modalCloseBtn.setAttribute("aria-label", "关闭弹窗");
    }

    const searchBtn = document.querySelector<HTMLButtonElement>(
      ".image-select-modal .p-search-box__button",
    );
    if (searchBtn) {
      searchBtn.textContent = "搜索";
      searchBtn.setAttribute("aria-label", "搜索");
    }
  }, []);

  const rows: MainTableRow[] = images
    .filter((item) => {
      const isLocalIso = item.server === LOCAL_ISO;
      if (type === VM && isContainerOnlyImage(item)) {
        return false;
      }
      if (type === CONTAINER && isVmOnlyImage(item)) {
        return false;
      }
      if (arch !== item.arch && !isLocalIso) {
        return false;
      }
      if (variant !== ANY && variant !== item.variant) {
        return false;
      }
      if (os && item.os !== os) {
        return false;
      }
      if (release && item.release !== release) {
        return false;
      }
      if (!query) {
        return true;
      }
      return (
        item.aliases.toLowerCase().includes(query) ||
        item.arch.toLowerCase().includes(query) ||
        item.os.toLowerCase().includes(query) ||
        item.release.toLowerCase().includes(query)
      );
    })
    .filter((item) => {
      if (!hideRemote) {
        return true;
      }
      return item.server === LOCAL_IMAGE || item.cached;
    })
    .map((item) => {
      const figureType = () => {
        if (item.type) {
          return item.type;
        }
        if (isVmOnlyImage(item)) {
          return VM;
        }
        if (isContainerOnlyImage(item)) {
          return CONTAINER;
        }
        return "all";
      };
      const itemType = figureType();
      const typeLabel =
        itemType === VM ? "虚拟机" : itemType === CONTAINER ? "容器" : "全部";

      const selectImage = () => {
        onSelect(item, item.type ?? type);
      };

      const displayRelease =
        item.os === "Ubuntu" &&
        item.release_title &&
        !item.release.includes(item.release_title)
          ? item.release_title
          : item.release;

      const displayVariant =
        item.os === "Ubuntu" &&
        item.release_title &&
        !item.variant &&
        !item.release.includes(item.release_title)
          ? item.release
          : item.variant;

      const getSource = () => {
        let source = "自定义";
        if (!item.cached && item.created_at) {
          source = "本地";
        }
        if (item.server === linuxContainersServer) {
          source = "Linux Containers";
        }
        return source;
      };

      return {
        key:
          itemType +
          item.os +
          displayRelease +
          displayVariant +
          item.server +
          item.fingerprint,
        className: "u-row",
        columns: [
          {
            content: item.os,
            role: "rowheader",
            "aria-label": "发行版",
            onClick: selectImage,
          },
          {
            content: displayRelease,
            role: "cell",
            "aria-label": "版本",
            onClick: selectImage,
          },
          {
            content: displayVariant,
            role: "cell",
            "aria-label": "变体",
            onClick: selectImage,
          },
          {
            content: typeLabel,
            role: "cell",
            "aria-label": "类型",
            onClick: selectImage,
          },
          {
            className: "u-hide--small u-hide--medium",
            content: item.aliases.split(",").pop(),
            role: "cell",
            "aria-label": "别名",
            onClick: selectImage,
          },
          {
            content: getSource(),
            role: "cell",
            "aria-label": "来源",
            onClick: selectImage,
          },
          {
            className: "u-hide--small u-hide--medium",
            content: item.cached ? "已缓存" : "远程",
            role: "cell",
            "aria-label": "缓存状态",
            onClick: selectImage,
          },
          {
            className: "u-hide--small u-hide--medium",
            content: (
              <Button
                onClick={selectImage}
                type="button"
                dense
                className="u-no-margin--bottom"
                appearance={
                  item.cached || item.server === LOCAL_IMAGE
                    ? "positive"
                    : "default"
                }
              >
                选择
              </Button>
            ),
            role: "cell",
            "aria-label": "操作",
            onClick: selectImage,
          },
        ],
        sortData: {
          os: item.os.toLowerCase(),
          release: displayRelease.toLowerCase(),
          variant: displayVariant?.toLowerCase(),
          type: itemType,
          alias: item.aliases,
        },
      };
    });

  const headers = [
    { content: "发行版", sortKey: "os" },
    { content: "版本", sortKey: "release" },
    { content: "变体", sortKey: "variant" },
    { content: "类型", sortKey: "type" },
    {
      content: "别名",
      sortKey: "alias",
      className: "u-hide--small u-hide--medium",
    },
    {
      content: "来源",
    },
    {
      className: "u-hide--small u-hide--medium",
      content: "缓存",
    },
    {
      className: "u-hide--small u-hide--medium",
      content: "",
      "aria-label": "操作",
    },
  ];

  return (
    <Modal close={onClose} title="选择基础镜像" className="image-select-modal">
      <Row className="u-no-padding--left u-no-padding--right">
        <Col size={3}>
          <div className="image-select-filters">
            <Select
              id="imageFilterDistribution"
              label="发行版"
              name="distribution"
              onChange={(v) => {
                setOs(v.target.value);
                setRelease("");
              }}
              options={getOptionList((item: RemoteImage) => item.os)}
              value={os}
            />
            <Select
              id="imageFilterRelease"
              label="版本"
              name="release"
              onChange={(v) => {
                setRelease(v.target.value);
              }}
              options={getOptionList(
                (item) => item.release,
                (item) => item.os === os,
              )}
              value={release}
              disabled={os === ""}
            />
            <Select
              id="imageFilterVariant"
              label="变体"
              name="variant"
              onChange={(v) => {
                setVariant(v.target.value);
              }}
              options={[
                {
                  label: "任意",
                  value: ANY,
                },
              ].concat(
                variantAll
                  .filter((item) => Boolean(item))
                  .map((item) => {
                    return {
                      label: item ?? "",
                      value: item ?? "",
                    };
                  }),
              )}
              value={variant}
            />
            <Select
              id="imageFilterArchitecture"
              label="架构"
              name="architecture"
              onChange={(v) => {
                setArch(v.target.value);
              }}
              options={archAll.map((item) => {
                return {
                  label: item,
                  value: item,
                };
              })}
              value={arch}
            />
            <Select
              id="imageFilterType"
              label="类型"
              name="type"
              onChange={(v) => {
                setType(
                  v.target.value === ANY
                    ? undefined
                    : (v.target.value as LxdImageType),
                );
              }}
              options={[
                {
                  label: "任意",
                  value: ANY,
                },
                ...instanceCreationTypes,
              ]}
              value={type ?? ""}
            />
            <CheckboxInput
              aria-label="仅显示已缓存镜像"
              checked={hideRemote}
              label="仅显示已缓存镜像"
              onChange={() => {
                setHideRemote((prev) => !prev);
              }}
            />
          </div>
        </Col>
        <Col size={9}>
          <div className="image-select-header">
            <div>
              <SearchBox
                autoFocus
                className="search-image"
                name="search-image"
                type="text"
                onChange={(value) => {
                  setQuery(value.toLowerCase());
                  setOs("");
                  setRelease("");
                }}
                placeholder="搜索镜像"
              />
            </div>
          </div>
          <div className="image-list">
            <ScrollableTable
              dependencies={[images]}
              tableId="image-selector-table"
            >
              <MainTable
                id="image-selector-table"
                className="table-image-select"
                emptyStateMsg={
                  isLoading ? (
                    <Spinner className="u-loader" text="镜像加载中..." />
                  ) : (
                    "未找到匹配的镜像"
                  )
                }
                headers={headers}
                rows={rows}
                paginate={null}
                sortable
              />
            </ScrollableTable>
          </div>
        </Col>
      </Row>
    </Modal>
  );
};

export default ImageSelector;

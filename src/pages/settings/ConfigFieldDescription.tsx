import type { FC } from "react";
import { useDocs } from "context/useDocs";
import { configDescriptionToHtml } from "util/config";
import { useQuery } from "@tanstack/react-query";
import { fetchDocObjects } from "api/server";
import { useSupportedFeatures } from "context/useSupportedFeatures";
import { cleanDescription } from "util/config";
import { translateSettingDescription } from "util/settingsI18n";

interface Props {
  description?: string;
  className?: string;
}

const ConfigFieldDescription: FC<Props> = ({ description, className }) => {
  const docBaseLink = useDocs();
  const { hasDocumentationObject } = useSupportedFeatures();
  const objectsInvTxt = useQuery({
    queryKey: ["documentation/objects.inv.txt"],
    queryFn: async () => fetchDocObjects(hasDocumentationObject),
    staleTime: 60_000, // consider cache fresh for 1 minutes to avoid excessive API calls
  });

  const localizedDescription = translateSettingDescription(description);

  return localizedDescription ? (
    <span
      className={className}
      dangerouslySetInnerHTML={{
        __html: configDescriptionToHtml(
          cleanDescription(localizedDescription),
          docBaseLink,
          objectsInvTxt.data,
        ),
      }}
    />
  ) : null;
};

export default ConfigFieldDescription;

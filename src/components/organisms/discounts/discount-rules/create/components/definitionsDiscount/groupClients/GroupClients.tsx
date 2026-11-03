import { Checkbox, Flex, Typography } from "antd";
import styles from "./GroupClients.module.scss";
import { IClientsGroup } from "@/types/clientsGroups/IClientsGroups";
import { UseFormReturn } from "react-hook-form";
import { DiscountSchema } from "../../../resolvers/generalResolver";
import { useTranslations } from "use-intl";

const { Text } = Typography;

type Props = {
  clients?: IClientsGroup[];
  error: any;
  loading: boolean;
  form: UseFormReturn<DiscountSchema, any, undefined>;
  statusForm: "create" | "edit" | "review";
};
export default function GroupClients({ clients, error, loading, form, statusForm }: Props) {
  const tCommon = useTranslations("common");
  const {
    formState: { errors },
    getValues,
    setValue,
    watch
  } = form;

  const handleCkeck = (id: number, checked: boolean) => {
    const valid = { shouldValidate: true };
    if (!checked) {
      setValue(
        "client_groups",
        [...(getValues("client_groups")?.filter((x) => x !== id) || [])],
        valid
      );
    } else {
      setValue("client_groups", [...(getValues("client_groups") || []), id], valid);
    }
  };

  return (
    <>
      <Flex className={styles.principalContainer} gap={20} wrap justify="space-around">
        {error && <Text type="danger"></Text>}
        {clients &&
          clients.map((client) => (
            <label
              key={"cliente - " + client.id}
              className={styles.groupClients}
              htmlFor={"cliente - " + client.id}
            >
              {client.group_name}
              <Checkbox
                checked={!!watch("client_groups")?.find((x) => x == client.id)}
                onChange={(e) => handleCkeck(client.id, e.target.checked)}
                style={{ marginLeft: "1rem" }}
                id={"cliente - " + client.id}
                disabled={statusForm === "review"}
              />
            </label>
          ))}
        {loading && <Text type="secondary">{tCommon("status.loading")}</Text>}
      </Flex>
      <Text type="danger" hidden={!errors.client_groups}>
        {errors.client_groups?.message}
      </Text>
    </>
  );
}

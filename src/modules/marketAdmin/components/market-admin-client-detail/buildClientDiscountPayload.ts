import dayjs from "dayjs";
import { discountTypeByAnnual } from "@/components/organisms/discounts/constants/discountTypes";
import { DiscountSchema } from "@/components/organisms/discounts/discount-rules/create/resolvers/generalResolver";
import { ClienteOption, NewClientDiscountData } from "@/types/marketAdmin/IMarketAdmin";

// Siempre plan anual: cada producto de cada grupo es una fila de annual_ranges.
// El resto de campos replica los defaults de useCreateDiscountView para enviar el mismo body.
export const buildClientDiscountPayload = (
  data: NewClientDiscountData,
  cliente: ClienteOption
): DiscountSchema => ({
  name: cliente.nombre,
  description: cliente.nombre,
  discount_type: discountTypeByAnnual[0],
  start_date: dayjs(data.startDate).toDate(),
  end_date: dayjs(data.endDate).toDate(),
  is_active: false,
  products_category: [],
  min_order: 0,
  computation_type: 1,
  client_groups: [],
  discount: 0,
  ranges: [],
  client: cliente.nit,
  client_name: cliente.nombre,
  annual_ranges: data.groups.flatMap((group) =>
    group.products.map((product) => ({
      id: 0,
      idLine: product.lineId,
      idProduct: product.id,
      units: group.units,
      discount: group.discount
    }))
  )
});

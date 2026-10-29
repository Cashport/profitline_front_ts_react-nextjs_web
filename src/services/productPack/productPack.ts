import { API } from "@/utils/api/api";
import { GenericResponse } from "@/types/global/IGlobal";
import { IProductPackBody, IProductPackDetail } from "@/types/productPack/IProductPack";

// PUT /product-pack/:id con imagen: multer arma `items[0][productId]` como
// objeto anidado, así que el body viaja como campos planos del FormData.
const toFormData = (body: IProductPackBody, image: File) => {
  const formData = new FormData();
  formData.append("sku", body.sku);
  formData.append("description", body.description);
  formData.append("idLine", String(body.idLine));
  formData.append("idCategory", String(body.idCategory));
  body.items.forEach((item, index) => {
    formData.append(`items[${index}][productId]`, String(item.productId));
    formData.append(`items[${index}][quantity]`, String(item.quantity));
  });
  formData.append("image", image);
  return formData;
};

export const createProductPack = async (body: IProductPackBody) => {
  const response: GenericResponse<IProductPackDetail> = await API.post("/product-pack", body);
  return response.data;
};

export const updateProductPack = async (
  id: number,
  body: IProductPackBody,
  image?: File | null
) => {
  const response: GenericResponse<IProductPackDetail> = image
    ? await API.put(`/product-pack/${id}`, toFormData(body, image), {
        headers: { "Content-Type": "multipart/form-data" }
      })
    : await API.put(`/product-pack/${id}`, body);
  return response.data;
};

export const changeProductPackState = async (id: number, isAvailable: 0 | 1) => {
  const response: GenericResponse<unknown> = await API.put(`/product-pack/${id}/state`, {
    is_available: String(isAvailable)
  });
  return response.data;
};

export const deleteProductPack = async (id: number) => {
  const response: GenericResponse<unknown> = await API.delete(`/product-pack/${id}`);
  return response.data;
};

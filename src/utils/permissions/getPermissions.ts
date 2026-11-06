import { IUserPermissions } from "@/types/userPermissions/IUserPermissions";

export async function getPermissions(token: string) {
  const response = await fetch(`${process.env.NEXT_PUBLIC_API_HOST}/role/permissions`, {
    headers: {
      Authorization: `Bearer ${token}`
    }
  });

  if (response.status === 200) {
    const data = (await response.json()) as IUserPermissions;
    return data.data;
  }
}

export async function getPermissionsWithStatus(token: string) {
  const response = await fetch(`${process.env.NEXT_PUBLIC_API_HOST}/role/permissions`, {
    headers: {
      Authorization: `Bearer ${token}`
    }
  });
  const body = await response.json().catch(() => null);
  return {
    status: response.status,
    code: typeof body?.code === "string" ? (body.code as string) : undefined,
    data: response.status === 200 ? (body?.data as IUserPermissions["data"]) : undefined
  };
}

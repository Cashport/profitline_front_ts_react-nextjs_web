import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { COOKIE_NAME } from "@/utils/constants/globalConstants";

export async function POST(request: NextRequest) {
  try {
    // Obtener el pathname actual del body
    const body = await request.json();
    const currentPath = body?.currentPath || "";

    // Eliminar la cookie de sesión
    cookies().delete(COOKIE_NAME || "");

    // Determinar la URL de redirección basada en la ruta actual
    let redirectUrl = "/auth/login";

    if (currentPath === "/comercio/cetaphil") {
      redirectUrl = "/cetaphil";
    }

    return NextResponse.json(
      {
        success: true,
        message: "Logout successful",
        redirectUrl
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error during logout:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Logout failed",
        redirectUrl: "/auth/login"
      },
      { status: 500 }
    );
  }
}

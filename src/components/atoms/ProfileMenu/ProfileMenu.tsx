"use client";
import UserMenu from "@/components/organisms/header/user-menu/user-menu";

/**
 * Avatar del usuario con su menú, a la derecha de los encabezados que no usan el `Header`
 * compartido (p. ej. Informes). Es el mismo menú del header (docs/DESIGN.md §4).
 */
export const ProfileMenu = () => <UserMenu />;

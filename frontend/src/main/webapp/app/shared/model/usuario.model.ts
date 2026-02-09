export interface IUsuario {
    id?: number;
    idKeycloak?: string;
    cedula?: string;
    nombre?: string;
    apellido?: string | null;
    telefono?: string | null;
    activo?: boolean | null;
    email?: string;
    password?: string;
    rol?: string; // 'ROLE_ADMIN', 'ROLE_BODEGUERO', 'ROLE_VENDEDOR'
}

export const defaultUsuario: Readonly<IUsuario> = {
    activo: true,
};

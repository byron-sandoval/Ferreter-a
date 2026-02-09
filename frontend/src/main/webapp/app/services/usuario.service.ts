import axios from 'axios';
import { IUsuario } from '../shared/model/usuario.model';

const API_URL = 'api/usuarios';

export const UsuarioService = {
    getAll() {
        return axios.get<IUsuario[]>(API_URL);
    },
    getById(id: number) {
        return axios.get<IUsuario>(`${API_URL}/${id}`);
    },
    getByKeycloakId(id: string) {
        return axios.get<IUsuario[]>(`${API_URL}?idKeycloak.equals=${id}`);
    },
    create(usuario: IUsuario) {
        return axios.post<IUsuario>(API_URL, usuario);
    },
    update(usuario: IUsuario) {
        return axios.put<IUsuario>(`${API_URL}/${usuario.id}`, usuario);
    },
    delete(id: number) {
        return axios.delete(`${API_URL}/${id}`);
    },
};

export default UsuarioService;

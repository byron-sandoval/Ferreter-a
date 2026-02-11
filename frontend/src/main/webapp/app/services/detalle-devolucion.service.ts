import axios from 'axios';
import { IDetalleDevolucion } from '../shared/model/detalle-devolucion.model';

const API_URL = 'api/detalle-devolucions';

export const DetalleDevolucionService = {
    create(detalle: IDetalleDevolucion) {
        return axios.post<IDetalleDevolucion>(API_URL, detalle);
    },
    getAll() {
        return axios.get<IDetalleDevolucion[]>(API_URL);
    },
    getById(id: number) {
        return axios.get<IDetalleDevolucion>(`${API_URL}/${id}`);
    },
    getByDevolucion(devolucionId: number) {
        return axios.get<IDetalleDevolucion[]>(`${API_URL}?devolucionId.equals=${devolucionId}`);
    },
    delete(id: number) {
        return axios.delete(`${API_URL}/${id}`);
    }
};

export default DetalleDevolucionService;

import axios from 'axios';
import { IArticulo } from '../shared/model/articulo.model';

const API_URL = 'api/articulos';

export const ArticuloService = {
  getAll(page?: number, size?: number, sort?: string) {
    return axios.get<IArticulo[]>(`${API_URL}${page ? `?page=${page}&size=${size}&sort=${sort}` : ''}`);
  },

  getById(id: number) {
    return axios.get<IArticulo>(`${API_URL}/${id}`);
  },

  create(articulo: IArticulo) {
    return axios.post<IArticulo>(API_URL, articulo);
  },

  update(articulo: IArticulo) {
    return axios.put<IArticulo>(`${API_URL}/${articulo.id}`, articulo);
  },

  delete(id: number) {
    return axios.delete(`${API_URL}/${id}`);
  },

  getBajoStock() {
    return axios.get<IArticulo[]>(`${API_URL}?existencia.lessThan=existenciaMinima`);
  },
};

export default ArticuloService;

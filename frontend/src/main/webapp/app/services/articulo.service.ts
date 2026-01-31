import axios from 'axios';
import { IArticulo } from '../shared/model/articulo.model';

const API_URL = 'api/articulos';

const getAll = (page?: number, size?: number, sort?: string) => {
  return axios.get<IArticulo[]>(`${API_URL}${page ? `?page=${page}&size=${size}&sort=${sort}` : ''}`);
};

const getById = (id: number) => {
  return axios.get<IArticulo>(`${API_URL}/${id}`);
};

const create = (articulo: IArticulo) => {
  return axios.post<IArticulo>(API_URL, articulo);
};

const update = (articulo: IArticulo) => {
  return axios.put<IArticulo>(`${API_URL}/${articulo.id}`, articulo);
};

const remove = (id: number) => {
  return axios.delete(`${API_URL}/${id}`);
};

const getBajoStock = () => {
  return axios.get<IArticulo[]>(`${API_URL}?existencia.lessThan=existenciaMinima`);
};

export default {
  getAll,
  getById,
  create,
  update,
  delete: remove,
  getBajoStock,
};

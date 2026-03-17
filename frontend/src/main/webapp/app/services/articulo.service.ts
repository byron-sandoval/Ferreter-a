import axios from 'axios';
import { IArticulo } from '../shared/model/articulo.model';

const API_URL = 'api/articulos';

const getAll = (params?: any) => {
  if (!params) {
    params = { page: 0, size: 1000 };
  }
  return axios.get<IArticulo[]>(API_URL, { params });
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

const countByCriteria = (criteria: any) => {
  const params = new URLSearchParams();
  Object.keys(criteria).forEach(key => {
    params.append(key, criteria[key]);
  });
  return axios.get<number>(`${API_URL}/count?${params.toString()}`);
};

export default {
  getAll,
  getById,
  create,
  update,
  delete: remove,
  getBajoStock,
  countByCriteria,
};

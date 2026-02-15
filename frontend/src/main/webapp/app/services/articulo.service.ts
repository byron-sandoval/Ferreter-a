import axios from 'axios';
import { IArticulo } from '../shared/model/articulo.model';

const API_URL = 'api/articulos';

const getAll = (page?: number, size?: number, sort?: string) => {
  const params = new URLSearchParams();
  if (page !== undefined) params.append('page', page.toString());
  if (size !== undefined) params.append('size', size.toString());
  if (sort !== undefined) params.append('sort', sort);
  const queryString = params.toString();
  return axios.get<IArticulo[]>(`${API_URL}${queryString ? `?${queryString}` : ''}`);
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

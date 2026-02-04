import axios from 'axios';
import { IUnidadMedida } from '../shared/model/unidad-medida.model';

const API_URL = 'api/unidad-medidas';

const getAll = () => {
  return axios.get<IUnidadMedida[]>(`${API_URL}?sort=nombre,asc`);
};

const getById = (id: number) => {
  return axios.get<IUnidadMedida>(`${API_URL}/${id}`);
};

const create = (unidad: IUnidadMedida) => {
  return axios.post<IUnidadMedida>(API_URL, unidad);
};

const update = (unidad: IUnidadMedida) => {
  return axios.put<IUnidadMedida>(`${API_URL}/${unidad.id}`, unidad);
};

const remove = (id: number) => {
  return axios.delete(`${API_URL}/${id}`);
};

export default {
  getAll,
  getById,
  create,
  update,
  delete: remove,
};

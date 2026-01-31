import axios from 'axios';
import { IUnidadMedida } from '../shared/model/unidad-medida.model';

const API_URL = 'api/unidad-medidas';

const getAll = () => {
  return axios.get<IUnidadMedida[]>(`${API_URL}?sort=nombre,asc`);
};

const getById = (id: number) => {
  return axios.get<IUnidadMedida>(`${API_URL}/${id}`);
};

export default {
  getAll,
  getById,
};

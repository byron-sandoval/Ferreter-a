import axios from 'axios';
import { ICategoria } from '../shared/model/categoria.model';

const API_URL = 'api/categorias';

const getAll = (page?: number, size?: number, sort?: string) => {
  return axios.get<ICategoria[]>(`${API_URL}?sort=nombre,asc`);
};

const getById = (id: number) => {
  return axios.get<ICategoria>(`${API_URL}/${id}`);
};

export default {
  getAll,
  getById,
};

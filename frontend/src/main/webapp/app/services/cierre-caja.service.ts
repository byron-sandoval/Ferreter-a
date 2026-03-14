import axios from 'axios';
import { ICierreCaja } from 'app/shared/model/cierre-caja.model';

const apiURL = 'api/cierre-cajas';

const CierreCajaService = {
  async create(cierreCaja: ICierreCaja) {
    return axios.post<ICierreCaja>(apiURL, cierreCaja);
  },

  async getAll(params?: any) {
    return axios.get<ICierreCaja[]>(apiURL, { params });
  },

  async getById(id: number) {
    return axios.get<ICierreCaja>(`${apiURL}/${id}`);
  },

  async getLast() {
    return axios.get<ICierreCaja>(`${apiURL}/last`);
  },

  async delete(id: number) {
    return axios.delete(`${apiURL}/${id}`);
  },
};

export default CierreCajaService;

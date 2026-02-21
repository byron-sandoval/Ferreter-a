import axios from 'axios';
import { ICierreCaja } from 'app/shared/model/cierre-caja.model';

const apiURL = 'api/cierre-cajas';

const CierreCajaService = {
    create: async (cierreCaja: ICierreCaja) => {
        return axios.post<ICierreCaja>(apiURL, cierreCaja);
    },

    getAll: async (params?: any) => {
        return axios.get<ICierreCaja[]>(apiURL, { params });
    },

    getById: async (id: number) => {
        return axios.get<ICierreCaja>(`${apiURL}/${id}`);
    },

    getLast: async () => {
        return axios.get<ICierreCaja>(`${apiURL}/last`);
    },

    delete: async (id: number) => {
        return axios.delete(`${apiURL}/${id}`);
    },
};

export default CierreCajaService;

import axios from 'axios';
import { IEmpresa } from '../shared/model/empresa.model';

const API_EMPRESA = 'api/empresas';

export const EmpresaService = {
  getAll() {
    return axios.get<IEmpresa[]>(API_EMPRESA);
  },

  get(id: number) {
    return axios.get<IEmpresa>(`${API_EMPRESA}/${id}`);
  },

  create(empresa: IEmpresa) {
    return axios.post<IEmpresa>(API_EMPRESA, empresa);
  },

  update(empresa: IEmpresa) {
    return axios.put<IEmpresa>(`${API_EMPRESA}/${empresa.id}`, empresa);
  },

  delete(id: number) {
    return axios.delete(`${API_EMPRESA}/${id}`);
  },
};

export default EmpresaService;

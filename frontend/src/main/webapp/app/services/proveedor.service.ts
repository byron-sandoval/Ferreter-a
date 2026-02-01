import axios from 'axios';
import { IProveedor } from '../shared/model/proveedor.model';

const API_PROVEEDOR = 'api/proveedors';

export const ProveedorService = {
  getAll() {
    return axios.get<IProveedor[]>(API_PROVEEDOR);
  },

  get(id: number) {
    return axios.get<IProveedor>(`${API_PROVEEDOR}/${id}`);
  },

  create(proveedor: IProveedor) {
    return axios.post<IProveedor>(API_PROVEEDOR, proveedor);
  },

  update(proveedor: IProveedor) {
    return axios.put<IProveedor>(`${API_PROVEEDOR}/${proveedor.id}`, proveedor);
  },

  delete(id: number) {
    return axios.delete(`${API_PROVEEDOR}/${id}`);
  },
};

export default ProveedorService;

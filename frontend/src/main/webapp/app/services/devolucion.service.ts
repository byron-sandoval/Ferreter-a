import axios from 'axios';
import { IDevolucion } from '../shared/model/devolucion.model';

const API_URL = 'api/devolucions';

export const DevolucionService = {
  create(devolucion: IDevolucion) {
    return axios.post<IDevolucion>(API_URL, devolucion);
  },
};

export default DevolucionService;

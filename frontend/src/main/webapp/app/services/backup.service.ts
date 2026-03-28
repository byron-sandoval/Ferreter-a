import axios from 'axios';

const API_BACKUP = 'api/backup';

export const BackupService = {
  downloadBackup() {
    return axios.get(API_BACKUP, { responseType: 'blob' });
  },

  restoreBackup(file: File) {
    const formData = new FormData();
    formData.append('file', file);
    return axios.post(`${API_BACKUP}/restore`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  },
};

export default BackupService;

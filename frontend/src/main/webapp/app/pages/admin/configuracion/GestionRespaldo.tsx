import React, { useState } from 'react';
import { Row, Col, Card, CardBody, Button, Form } from 'reactstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faDatabase,
  faCloudDownloadAlt,
  faFileUpload,
  faExclamationTriangle,
} from '@fortawesome/free-solid-svg-icons';
import { BackupService } from 'app/services/backup.service';
import { toast } from 'react-toastify';

const GestionRespaldo = () => {
  const [restoring, setRestoring] = useState(false);
  const [backingUp, setBackingUp] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const handleBackup = async () => {
    setBackingUp(true);
    try {
      const response = await BackupService.downloadBackup();
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);
      link.setAttribute('download', `respaldo_${timestamp}.dump`);
      document.body.appendChild(link);
      link.click();
      toast.success('Respaldo generado con éxito');
    } catch (error) {
      console.error('Error:', error);
      toast.error('Error al generar respaldo');
    } finally {
      setBackingUp(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0]);
    }
  };

  const clearFile = () => {
    setSelectedFile(null);
    const el = document.getElementById('restoreFile') as HTMLInputElement;
    if (el) el.value = '';
  };

  const handleRestore = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedFile) return;

    if (!window.confirm('¿Desea restaurar la base de datos? Se perderán los datos actuales.')) {
      return;
    }

    setRestoring(true);
    try {
      await BackupService.restoreBackup(selectedFile);
      toast.success('Restauración completada');
      setSelectedFile(null);
      setTimeout(() => window.location.reload(), 1500);
    } catch (error: any) {
      console.error('Error al restaurar respaldo:', error);
      const message = error.response?.data?.title || error.message || 'Error en la restauración';
      toast.error(message);
    } finally {
      setRestoring(false);
    }
  };

  return (
    <div className="p-2">
      <Card className="border-0 shadow-sm" style={{ borderRadius: '12px' }}>
        <CardBody className="p-3">
          <div className="d-flex align-items-center mb-3 border-bottom pb-2">
            <FontAwesomeIcon icon={faDatabase} className="text-secondary me-2" />
            <h6 className="mb-0 fw-bold text-dark">Gestión de Base de Datos</h6>
          </div>

          <Row className="g-3">
            {/* Exportación */}
            <Col md="6">
              <div className="p-3 border rounded-3 bg-light h-100">
                <div className="d-flex align-items-center mb-3">
                  <div className="icon-circle me-2 bg-primary-soft">
                    <FontAwesomeIcon icon={faCloudDownloadAlt} className="text-primary" />
                  </div>
                  <span className="fw-bold small">Exportar Datos</span>
                </div>
                <p className="text-muted extra-small mb-3">Genera un respaldo completo del sistema para su almacenamiento externo.</p>
                <Button color="primary" outline size="sm" className="w-100 fw-bold" onClick={handleBackup} disabled={backingUp}>
                  {backingUp ? 'Generando...' : 'Realizar Respaldo'}
                </Button>
              </div>
            </Col>

            {/* Importación */}
            <Col md="6">
              <div className="p-3 border rounded-3 bg-light h-100">
                <div className="d-flex align-items-center mb-3">
                  <div className="icon-circle me-2 bg-success-soft">
                    <FontAwesomeIcon icon={faFileUpload} className="text-success" />
                  </div>
                  <span className="fw-bold small">Importar Datos</span>
                </div>
                <Form onSubmit={handleRestore}>
                  <input
                    type="file"
                    id="restoreFile"
                    onChange={handleFileChange}
                    accept=".dump"
                    style={{ display: 'none' }}
                  />
                  <div className="d-flex align-items-center gap-2 mb-2">
                    <button
                      type="button"
                      className="btn-file-select"
                      onClick={() => (document.getElementById('restoreFile') as HTMLInputElement)?.click()}
                    >
                      Seleccionar archivo
                    </button>
                    {selectedFile ? (
                      <span className="d-flex align-items-center gap-1">
                        <span className="extra-small text-muted file-name-label">{selectedFile.name}</span>
                        <button
                          type="button"
                          title="Quitar archivo"
                          onClick={clearFile}
                          style={{
                            background: 'none',
                            border: 'none',
                            color: '#999',
                            cursor: 'pointer',
                            fontSize: '0.9rem',
                            padding: '0 2px',
                            lineHeight: 1,
                          }}
                        >
                          ✕
                        </button>
                      </span>
                    ) : (
                      <span className="extra-small text-muted">Ningún archivo</span>
                    )}
                  </div>
                  <Button
                    color="success"
                    outline
                    size="sm"
                    className="w-100 fw-bold"
                    disabled={restoring || !selectedFile}
                    type="submit"
                  >
                    {restoring ? 'Restaurando...' : 'Subir Respaldo'}
                  </Button>
                </Form>
              </div>
            </Col>
          </Row>

          <div className="mt-3 p-2 bg-warning-soft rounded d-flex align-items-start border-start border-warning border-3">
            <FontAwesomeIcon icon={faExclamationTriangle} className="text-warning me-2 mt-1" />
            <div className="extra-small text-dark">
              <strong>Atención:</strong> La restauración reemplazará todos los datos actuales sin posibilidad de deshacer cambios.
            </div>
          </div>
        </CardBody>
      </Card>

      <style>
        {`
          .extra-small { font-size: 0.75rem; }
          .icon-circle {
            width: 32px;
            height: 32px;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 0.9rem;
          }
          .bg-primary-soft { background-color: rgba(13, 110, 253, 0.1); }
          .bg-success-soft { background-color: rgba(25, 135, 84, 0.1); }
          .bg-warning-soft { background-color: rgba(255, 193, 7, 0.1); }
          .file-name-label {
            max-width: 110px;
            overflow: hidden;
            text-overflow: ellipsis;
            white-space: nowrap;
            display: inline-block;
          }
          .btn-file-select {
            background-color: white;
            border: 1px solid #343a40;
            color: #343a40;
            border-radius: 4px;
            padding: 4px 10px;
            font-size: 0.75rem;
            cursor: pointer;
            transition: background-color 0.15s, color 0.15s;
          }
          .btn-file-select:hover {
            background-color: #f0f0f0;
            color: #343a40;
          }
        `}
      </style>
    </div>
  );
};

export default GestionRespaldo;

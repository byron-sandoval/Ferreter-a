import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Row, Col, Card, CardBody, CardTitle, CardText, Button, Container } from 'reactstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faChartBar,
  faCalendarAlt,
  faExclamationTriangle,
  faCashRegister,
  faStar,
  faTruck,
  faMoneyBillWave,
  faUserFriends,
  faFileInvoice,
  faFileExcel,
  faArrowRight,
} from '@fortawesome/free-solid-svg-icons';

const reports = [
  {
    title: 'Cierre de Caja',
    description: 'Resumen de ventas diarias desglosado por método de pago.',
    icon: faCashRegister,
    color: 'success',
    path: '/admin/reportes/cierre-caja',
  },
  {
    title: 'Mayor y Menor Demanda',
    description: 'Análisis de rotación de productos (Top 10 más vendidos y menos vendidos).',
    icon: faStar,
    color: 'warning',
    path: '/admin/reportes/demanda',
  },
  {
    title: 'Compras por Proveedor',
    description: 'Historial de ingresos y abastecimiento por cada proveedor.',
    icon: faTruck,
    color: 'info',
    path: '/admin/reportes/compras-por-proveedor',
  },
  {
    title: 'Reporte de Ganancias',
    description: 'Margen de utilidad calculado entre costo y precio de venta.',
    icon: faMoneyBillWave,
    color: 'primary',
    path: '/admin/reportes/ganancias',
  },
];

export const ReportList = () => {
  const navigate = useNavigate();
  return (
    <div className="animate__animated animate__fadeIn p-3 px-md-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h4 className="text-primary fw-bold m-0">
            <FontAwesomeIcon icon={faChartBar} className="me-2" /> Centro de Reportes
          </h4>
          <p className="text-muted small m-0">Genera y exporta la información clave de tu ferretería</p>
        </div>
      </div>



      <Row>
        {reports.map((report, index) => (
          <Col md="4" lg="3" key={index} className="mb-4">
            <Card className="shadow-sm border-0 h-100 report-card hover-lift">
              <CardBody className="d-flex flex-column">
                <div
                  className={`rounded-circle bg-${report.color} bg-opacity-10 p-3 mb-3 d-inline-flex align-items-center justify-content-center`}
                  style={{ width: '50px', height: '50px' }}
                >
                  <FontAwesomeIcon icon={report.icon} className={`text-${report.color}`} />
                </div>
                <CardTitle tag="h6" className="fw-bold mb-2">
                  {report.title}
                </CardTitle>
                <CardText className="small text-muted flex-grow-1">{report.description}</CardText>
                <div className="mt-3 pt-3 border-top">
                  <Button
                    color="link"
                    className={`p-0 text-${report.color} text-decoration-none small fw-bold w-100 d-flex justify-content-between align-items-center`}
                    onClick={() => report.path && navigate(report.path)}
                    disabled={!report.path}
                  >
                    {report.path ? 'VER REPORTE' : 'PRÓXIMAMENTE'}
                    <FontAwesomeIcon icon={faArrowRight} size="xs" />
                  </Button>
                </div>
              </CardBody>
            </Card>
          </Col>
        ))}
      </Row>

      <style>
        {`
          .report-card {
            transition: all 0.3s ease;
          }
          .report-card:hover {
            transform: translateY(-5px);
            box-shadow: 0 10px 20px rgba(0,0,0,0.1) !important;
          }
          .hover-lift:hover {
            border-bottom: 3px solid #031125ff !important;
          }
        `}
      </style>
    </div>
  );
};

export default ReportList;

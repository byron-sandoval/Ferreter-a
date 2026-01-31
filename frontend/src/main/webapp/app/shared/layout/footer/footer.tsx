import './footer.scss';

import React from 'react';
import { Translate } from 'react-jhipster';
import { Col, Row } from 'reactstrap';

const Footer = () => (
  <div className="footer page-content">
    <Row>
      <Col md="12">
        <p className="text-center mt-3 text-muted">
          &copy; {new Date().getFullYear()} FerroNica - Sistema de Gestión de Ferretería. Todos los derechos reservados.
        </p>
      </Col>
    </Row>
  </div>
);

export default Footer;

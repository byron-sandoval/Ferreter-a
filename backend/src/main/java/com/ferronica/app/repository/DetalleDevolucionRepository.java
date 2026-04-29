package com.ferronica.app.repository;

import com.ferronica.app.domain.DetalleDevolucion;
import org.springframework.data.jpa.repository.*;
import org.springframework.stereotype.Repository;

/**
 * Spring Data JPA repository for the DetalleDevolucion entity.
 */
@Repository
public interface DetalleDevolucionRepository
        extends JpaRepository<DetalleDevolucion, Long>, JpaSpecificationExecutor<DetalleDevolucion> {
}

package com.ferronica.app.repository;

import com.ferronica.app.domain.DetalleIngreso;
import org.springframework.data.jpa.repository.*;
import org.springframework.stereotype.Repository;

/**
 * Spring Data JPA repository for the DetalleIngreso entity.
 */
@SuppressWarnings("unused")
@Repository
public interface DetalleIngresoRepository extends JpaRepository<DetalleIngreso, Long> {}

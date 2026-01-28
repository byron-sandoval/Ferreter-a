package com.ferronica.app.repository;

import com.ferronica.app.domain.Devolucion;
import org.springframework.data.jpa.repository.*;
import org.springframework.stereotype.Repository;

/**
 * Spring Data JPA repository for the Devolucion entity.
 */
@SuppressWarnings("unused")
@Repository
public interface DevolucionRepository extends JpaRepository<Devolucion, Long> {}

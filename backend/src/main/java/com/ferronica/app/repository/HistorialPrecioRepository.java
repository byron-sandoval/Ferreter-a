package com.ferronica.app.repository;

import com.ferronica.app.domain.HistorialPrecio;
import org.springframework.data.jpa.repository.*;
import org.springframework.stereotype.Repository;

/**
 * Spring Data JPA repository for the HistorialPrecio entity.
 */
@SuppressWarnings("unused")
@Repository
public interface HistorialPrecioRepository extends JpaRepository<HistorialPrecio, Long> {}

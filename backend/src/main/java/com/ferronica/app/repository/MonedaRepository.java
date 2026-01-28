package com.ferronica.app.repository;

import com.ferronica.app.domain.Moneda;
import org.springframework.data.jpa.repository.*;
import org.springframework.stereotype.Repository;

/**
 * Spring Data JPA repository for the Moneda entity.
 */
@SuppressWarnings("unused")
@Repository
public interface MonedaRepository extends JpaRepository<Moneda, Long> {}

package com.ferronica.app.repository;

import com.ferronica.app.domain.NumeracionFactura;
import org.springframework.data.jpa.repository.*;
import org.springframework.stereotype.Repository;

/**
 * Spring Data JPA repository for the NumeracionFactura entity.
 */
@SuppressWarnings("unused")
@Repository
public interface NumeracionFacturaRepository extends JpaRepository<NumeracionFactura, Long> {}

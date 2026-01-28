package com.ferronica.app.repository;

import com.ferronica.app.domain.Vendedor;
import org.springframework.data.jpa.repository.*;
import org.springframework.stereotype.Repository;

/**
 * Spring Data JPA repository for the Vendedor entity.
 */
@SuppressWarnings("unused")
@Repository
public interface VendedorRepository extends JpaRepository<Vendedor, Long> {}

package com.ferronica.app.repository;

import com.ferronica.app.domain.Articulo;
import org.springframework.data.jpa.repository.*;
import org.springframework.stereotype.Repository;

/**
 * Spring Data JPA repository for the Articulo entity.
 */
@SuppressWarnings("unused")
@Repository
public interface ArticuloRepository extends JpaRepository<Articulo, Long>, JpaSpecificationExecutor<Articulo> {}

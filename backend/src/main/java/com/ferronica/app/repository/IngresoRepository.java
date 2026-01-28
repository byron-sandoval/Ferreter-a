package com.ferronica.app.repository;

import com.ferronica.app.domain.Ingreso;
import org.springframework.data.jpa.repository.*;
import org.springframework.stereotype.Repository;

/**
 * Spring Data JPA repository for the Ingreso entity.
 */
@SuppressWarnings("unused")
@Repository
public interface IngresoRepository extends JpaRepository<Ingreso, Long>, JpaSpecificationExecutor<Ingreso> {}

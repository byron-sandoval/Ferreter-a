package com.ferronica.app.repository;

import com.ferronica.app.domain.UnidadMedida;
import org.springframework.data.jpa.repository.*;
import org.springframework.stereotype.Repository;

/**
 * Spring Data JPA repository for the UnidadMedida entity.
 */
@SuppressWarnings("unused")
@Repository
public interface UnidadMedidaRepository extends JpaRepository<UnidadMedida, Long> {}

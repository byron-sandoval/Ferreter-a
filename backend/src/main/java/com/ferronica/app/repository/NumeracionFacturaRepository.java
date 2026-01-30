package com.ferronica.app.repository;

import com.ferronica.app.domain.NumeracionFactura;
import jakarta.persistence.LockModeType;
import java.util.Optional;
import org.springframework.data.jpa.repository.*;
import org.springframework.stereotype.Repository;

/**
 * Spring Data JPA repository for the NumeracionFactura entity.
 */
@SuppressWarnings("unused")
@Repository
public interface NumeracionFacturaRepository extends JpaRepository<NumeracionFactura, Long> {
    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("select n from NumeracionFactura n where n.activo = true")
    Optional<NumeracionFactura> findByActivoTrue();
}

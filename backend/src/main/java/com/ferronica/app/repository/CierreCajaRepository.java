package com.ferronica.app.repository;

import com.ferronica.app.domain.CierreCaja;
import java.util.Optional;
import org.springframework.data.jpa.repository.*;
import org.springframework.stereotype.Repository;

/**
 * Spring Data JPA repository for the CierreCaja entity.
 */
@SuppressWarnings("unused")
@Repository
public interface CierreCajaRepository extends JpaRepository<CierreCaja, Long>, JpaSpecificationExecutor<CierreCaja> {
    Optional<CierreCaja> findFirstByOrderByFechaDesc();
}

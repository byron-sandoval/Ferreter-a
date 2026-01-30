package com.ferronica.app.repository;

import com.ferronica.app.domain.Articulo;
import jakarta.persistence.LockModeType;
import java.util.Optional;
import org.springframework.data.jpa.repository.*;
import org.springframework.stereotype.Repository;

/**
 * Spring Data JPA repository for the Articulo entity.
 */
@SuppressWarnings("unused")
@Repository
public interface ArticuloRepository extends JpaRepository<Articulo, Long>, JpaSpecificationExecutor<Articulo> {
    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("select a from Articulo a where a.id = :id")
    Optional<Articulo> findByIdWithLock(Long id);
}

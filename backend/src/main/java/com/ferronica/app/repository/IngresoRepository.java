package com.ferronica.app.repository;

import com.ferronica.app.domain.Ingreso;
import java.util.Optional;
import org.springframework.data.jpa.repository.*;
import org.springframework.stereotype.Repository;

/**
 * Spring Data JPA repository for the Ingreso entity.
 */
@SuppressWarnings("unused")
@Repository
public interface IngresoRepository extends JpaRepository<Ingreso, Long>, JpaSpecificationExecutor<Ingreso> {
    @EntityGraph(attributePaths = { "proveedor", "usuario", "detalles", "detalles.articulo" })
    @Query("select ingreso from Ingreso ingreso where ingreso.id = :id")
    Optional<Ingreso> findOneWithEagerRelationships(@org.springframework.data.repository.query.Param("id") Long id);

    long countByUsuarioId(Long usuarioId);
}

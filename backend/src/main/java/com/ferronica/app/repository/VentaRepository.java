package com.ferronica.app.repository;

import com.ferronica.app.domain.Venta;
import java.util.Optional;
import org.springframework.data.jpa.repository.*;
import org.springframework.stereotype.Repository;

/**
 * Spring Data JPA repository for the Venta entity.
 */
@SuppressWarnings("unused")
@Repository
public interface VentaRepository extends JpaRepository<Venta, Long>, JpaSpecificationExecutor<Venta> {
    @EntityGraph(attributePaths = { "cliente", "usuario", "moneda", "detalles", "detalles.articulo" })
    @Query("select venta from Venta venta where venta.id = :id")
    Optional<Venta> findOneWithEagerRelationships(@org.springframework.data.repository.query.Param("id") Long id);

    long countByUsuarioId(Long usuarioId);
}

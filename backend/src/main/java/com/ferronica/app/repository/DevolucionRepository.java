package com.ferronica.app.repository;

import com.ferronica.app.domain.Devolucion;
import org.springframework.data.jpa.repository.*;
import org.springframework.stereotype.Repository;

/**
 * Spring Data JPA repository for the Devolucion entity.
 */
@SuppressWarnings("unused")
@Repository
public interface DevolucionRepository extends JpaRepository<Devolucion, Long> {
    @EntityGraph(attributePaths = { "detalles", "detalles.articulo", "venta", "venta.cliente" })
    @Query("select dev from Devolucion dev where dev.venta.id = :ventaId")
    java.util.List<Devolucion> findAllByVentaId(
            @org.springframework.data.repository.query.Param("ventaId") Long ventaId);

    @Override
    @EntityGraph(attributePaths = { "venta", "venta.cliente", "detalles", "detalles.articulo" })
    java.util.List<Devolucion> findAll();
}

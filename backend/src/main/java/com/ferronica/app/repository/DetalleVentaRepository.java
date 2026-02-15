package com.ferronica.app.repository;

import com.ferronica.app.domain.DetalleVenta;
import java.util.List;
import org.springframework.data.jpa.repository.*;
import org.springframework.stereotype.Repository;

/**
 * Spring Data JPA repository for the DetalleVenta entity.
 */
@SuppressWarnings("unused")
@Repository
public interface DetalleVentaRepository extends JpaRepository<DetalleVenta, Long> {
    @Query("select detalleVenta from DetalleVenta detalleVenta left join fetch detalleVenta.articulo left join fetch detalleVenta.venta")
    List<DetalleVenta> findAllEager();
}

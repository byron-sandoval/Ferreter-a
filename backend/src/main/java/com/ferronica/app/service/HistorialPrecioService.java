package com.ferronica.app.service;

import com.ferronica.app.service.dto.HistorialPrecioDTO;
import java.util.List;
import java.util.Optional;

/**
 * Service Interface for managing
 * {@link com.ferronica.app.domain.HistorialPrecio}.
 */
public interface HistorialPrecioService {
    /**
     * Save a historialPrecio.
     *
     * @param historialPrecioDTO the entity to save.
     * @return the persisted entity.
     */
    HistorialPrecioDTO save(HistorialPrecioDTO historialPrecioDTO);

    /**
     * Updates a historialPrecio.
     *
     * @param historialPrecioDTO the entity to update.
     * @return the persisted entity.
     */
    HistorialPrecioDTO update(HistorialPrecioDTO historialPrecioDTO);

    /**
     * Partially updates a historialPrecio.
     *
     * @param historialPrecioDTO the entity to update partially.
     * @return the persisted entity.
     */
    Optional<HistorialPrecioDTO> partialUpdate(HistorialPrecioDTO historialPrecioDTO);

    /**
     * Get all the historialPrecios.
     *
     * @return the list of entities.
     */
    List<HistorialPrecioDTO> findAll();

    /**
     * Get the "id" historialPrecio.
     *
     * @param id the id of the entity.
     * @return the entity.
     */
    Optional<HistorialPrecioDTO> findOne(Long id);

    /**
     * Get all the historialPrecios by articulo.
     *
     * @param articuloId the id of the articulo.
     * @return the list of entities.
     */
    List<HistorialPrecioDTO> findByArticulo(Long articuloId);

    /**
     * Delete the "id" historialPrecio.
     *
     * @param id the id of the entity.
     */
    void delete(Long id);
}

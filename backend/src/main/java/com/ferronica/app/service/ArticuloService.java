package com.ferronica.app.service;

import com.ferronica.app.service.dto.ArticuloDTO;
import java.util.Optional;

/**
 * Service Interface for managing {@link com.ferronica.app.domain.Articulo}.
 */
public interface ArticuloService {
    /**
     * Save a articulo.
     *
     * @param articuloDTO the entity to save.
     * @return the persisted entity.
     */
    ArticuloDTO save(ArticuloDTO articuloDTO);

    /**
     * Updates a articulo.
     *
     * @param articuloDTO the entity to update.
     * @return the persisted entity.
     */
    ArticuloDTO update(ArticuloDTO articuloDTO);

    /**
     * Partially updates a articulo.
     *
     * @param articuloDTO the entity to update partially.
     * @return the persisted entity.
     */
    Optional<ArticuloDTO> partialUpdate(ArticuloDTO articuloDTO);

    /**
     * Get the "id" articulo.
     *
     * @param id the id of the entity.
     * @return the entity.
     */
    Optional<ArticuloDTO> findOne(Long id);

    /**
     * Delete the "id" articulo.
     *
     * @param id the id of the entity.
     */
    void delete(Long id);
}

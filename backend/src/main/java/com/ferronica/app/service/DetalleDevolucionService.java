package com.ferronica.app.service;

import com.ferronica.app.service.dto.DetalleDevolucionDTO;
import java.util.List;
import java.util.Optional;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

/**
 * Service Interface for managing
 * {@link com.ferronica.app.domain.DetalleDevolucion}.
 */
public interface DetalleDevolucionService {
    /**
     * Save a detalleDevolucion.
     *
     * @param detalleDevolucionDTO the entity to save.
     * @return the persisted entity.
     */
    DetalleDevolucionDTO save(DetalleDevolucionDTO detalleDevolucionDTO);

    /**
     * Updates a detalleDevolucion.
     *
     * @param detalleDevolucionDTO the entity to update.
     * @return the persisted entity.
     */
    DetalleDevolucionDTO update(DetalleDevolucionDTO detalleDevolucionDTO);

    /**
     * Partially updates a detalleDevolucion.
     *
     * @param detalleDevolucionDTO the entity to update partially.
     * @return the persisted entity.
     */
    Optional<DetalleDevolucionDTO> partialUpdate(DetalleDevolucionDTO detalleDevolucionDTO);

    /**
     * Get all the detalleDevolucions.
     *
     * @param pageable the pagination information.
     * @return the list of entities.
     */
    Page<DetalleDevolucionDTO> findAll(Pageable pageable);

    /**
     * Get the "id" detalleDevolucion.
     *
     * @param id the id of the entity.
     * @return the entity.
     */
    Optional<DetalleDevolucionDTO> findOne(Long id);

    /**
     * Delete the "id" detalleDevolucion.
     *
     * @param id the id of the entity.
     */
    void delete(Long id);
}

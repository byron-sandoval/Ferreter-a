package com.ferronica.app.service;

import com.ferronica.app.service.dto.DevolucionDTO;
import java.util.List;
import java.util.Optional;

/**
 * Service Interface for managing {@link com.ferronica.app.domain.Devolucion}.
 */
public interface DevolucionService {
    /**
     * Save a devolucion.
     *
     * @param devolucionDTO the entity to save.
     * @return the persisted entity.
     */
    DevolucionDTO save(DevolucionDTO devolucionDTO);

    /**
     * Updates a devolucion.
     *
     * @param devolucionDTO the entity to update.
     * @return the persisted entity.
     */
    DevolucionDTO update(DevolucionDTO devolucionDTO);

    /**
     * Partially updates a devolucion.
     *
     * @param devolucionDTO the entity to update partially.
     * @return the persisted entity.
     */
    Optional<DevolucionDTO> partialUpdate(DevolucionDTO devolucionDTO);

    /**
     * Get all the devolucions.
     *
     * @return the list of entities.
     */
    List<DevolucionDTO> findAll();

    /**
     * Get the "id" devolucion.
     *
     * @param id the id of the entity.
     * @return the entity.
     */
    Optional<DevolucionDTO> findOne(Long id);

    /**
     * Delete the "id" devolucion.
     *
     * @param id the id of the entity.
     */
    void delete(Long id);

    /**
     * Get all devolutions by venta ID.
     * 
     * @param ventaId the ID of the venta.
     * @return the list of entities.
     */
    List<DevolucionDTO> findAllByVenta(Long ventaId);
}

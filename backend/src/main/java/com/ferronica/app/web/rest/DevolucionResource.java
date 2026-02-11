package com.ferronica.app.web.rest;

import com.ferronica.app.repository.DevolucionRepository;
import com.ferronica.app.service.DevolucionService;
import com.ferronica.app.service.dto.DevolucionDTO;
import com.ferronica.app.web.rest.errors.BadRequestAlertException;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotNull;
import java.net.URI;
import java.net.URISyntaxException;
import java.util.List;
import java.util.Objects;
import java.util.Optional;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import tech.jhipster.web.util.HeaderUtil;
import tech.jhipster.web.util.ResponseUtil;

/**
 * REST controller for managing {@link com.ferronica.app.domain.Devolucion}.
 */
@RestController
@RequestMapping("/api/devolucions")
public class DevolucionResource {

    private static final Logger LOG = LoggerFactory.getLogger(DevolucionResource.class);

    private static final String ENTITY_NAME = "devolucion";

    @Value("${jhipster.clientApp.name}")
    private String applicationName;

    private final DevolucionService devolucionService;

    private final DevolucionRepository devolucionRepository;

    public DevolucionResource(DevolucionService devolucionService, DevolucionRepository devolucionRepository) {
        this.devolucionService = devolucionService;
        this.devolucionRepository = devolucionRepository;
    }

    /**
     * {@code POST  /devolucions} : Create a new devolucion.
     *
     * @param devolucionDTO the devolucionDTO to create.
     * @return the {@link ResponseEntity} with status {@code 201 (Created)} and with
     *         body the new devolucionDTO, or with status {@code 400 (Bad Request)}
     *         if the devolucion has already an ID.
     * @throws URISyntaxException if the Location URI syntax is incorrect.
     */
    @PreAuthorize("hasAnyAuthority('ROLE_ADMIN', 'ROLE_VENDEDOR')")
    @PostMapping("")
    public ResponseEntity<DevolucionDTO> createDevolucion(@Valid @RequestBody DevolucionDTO devolucionDTO)
            throws URISyntaxException {
        LOG.debug("REST request to save Devolucion : {}", devolucionDTO);
        if (devolucionDTO.getId() != null) {
            throw new BadRequestAlertException("A new devolucion cannot already have an ID", ENTITY_NAME, "idexists");
        }
        devolucionDTO = devolucionService.save(devolucionDTO);
        return ResponseEntity.created(new URI("/api/devolucions/" + devolucionDTO.getId()))
                .headers(HeaderUtil.createEntityCreationAlert(applicationName, false, ENTITY_NAME,
                        devolucionDTO.getId().toString()))
                .body(devolucionDTO);
    }

    /**
     * {@code PUT  /devolucions/:id} : Updates an existing devolucion.
     *
     * @param id            the id of the devolucionDTO to save.
     * @param devolucionDTO the devolucionDTO to update.
     * @return the {@link ResponseEntity} with status {@code 200 (OK)} and with body
     *         the updated devolucionDTO,
     *         or with status {@code 400 (Bad Request)} if the devolucionDTO is not
     *         valid,
     *         or with status {@code 500 (Internal Server Error)} if the
     *         devolucionDTO couldn't be updated.
     * @throws URISyntaxException if the Location URI syntax is incorrect.
     */
    @PreAuthorize("hasAuthority('ROLE_ADMIN')")
    @PutMapping("/{id}")
    public ResponseEntity<DevolucionDTO> updateDevolucion(
            @PathVariable(value = "id", required = false) final Long id,
            @Valid @RequestBody DevolucionDTO devolucionDTO) throws URISyntaxException {
        LOG.debug("REST request to update Devolucion : {}, {}", id, devolucionDTO);
        if (devolucionDTO.getId() == null) {
            throw new BadRequestAlertException("Invalid id", ENTITY_NAME, "idnull");
        }
        if (!Objects.equals(id, devolucionDTO.getId())) {
            throw new BadRequestAlertException("Invalid ID", ENTITY_NAME, "idinvalid");
        }

        if (!devolucionRepository.existsById(id)) {
            throw new BadRequestAlertException("Entity not found", ENTITY_NAME, "idnotfound");
        }

        devolucionDTO = devolucionService.update(devolucionDTO);
        return ResponseEntity.ok()
                .headers(HeaderUtil.createEntityUpdateAlert(applicationName, false, ENTITY_NAME,
                        devolucionDTO.getId().toString()))
                .body(devolucionDTO);
    }

    /**
     * {@code PATCH  /devolucions/:id} : Partial updates given fields of an existing
     * devolucion, field will ignore if it is null
     *
     * @param id            the id of the devolucionDTO to save.
     * @param devolucionDTO the devolucionDTO to update.
     * @return the {@link ResponseEntity} with status {@code 200 (OK)} and with body
     *         the updated devolucionDTO,
     *         or with status {@code 400 (Bad Request)} if the devolucionDTO is not
     *         valid,
     *         or with status {@code 404 (Not Found)} if the devolucionDTO is not
     *         found,
     *         or with status {@code 500 (Internal Server Error)} if the
     *         devolucionDTO couldn't be updated.
     * @throws URISyntaxException if the Location URI syntax is incorrect.
     */
    @PreAuthorize("hasAuthority('ROLE_ADMIN')")
    @PatchMapping(value = "/{id}", consumes = { "application/json", "application/merge-patch+json" })
    public ResponseEntity<DevolucionDTO> partialUpdateDevolucion(
            @PathVariable(value = "id", required = false) final Long id,
            @NotNull @RequestBody DevolucionDTO devolucionDTO) throws URISyntaxException {
        LOG.debug("REST request to partial update Devolucion partially : {}, {}", id, devolucionDTO);
        if (devolucionDTO.getId() == null) {
            throw new BadRequestAlertException("Invalid id", ENTITY_NAME, "idnull");
        }
        if (!Objects.equals(id, devolucionDTO.getId())) {
            throw new BadRequestAlertException("Invalid ID", ENTITY_NAME, "idinvalid");
        }

        if (!devolucionRepository.existsById(id)) {
            throw new BadRequestAlertException("Entity not found", ENTITY_NAME, "idnotfound");
        }

        Optional<DevolucionDTO> result = devolucionService.partialUpdate(devolucionDTO);

        return ResponseUtil.wrapOrNotFound(
                result,
                HeaderUtil.createEntityUpdateAlert(applicationName, false, ENTITY_NAME,
                        devolucionDTO.getId().toString()));
    }

    /**
     * {@code GET  /devolucions} : get all the devolucions.
     *
     * @return the {@link ResponseEntity} with status {@code 200 (OK)} and the list
     *         of devolucions in body.
     */
    @PreAuthorize("hasAnyAuthority('ROLE_ADMIN', 'ROLE_BODEGUERO', 'ROLE_VENDEDOR')")
    @GetMapping("")
    public List<DevolucionDTO> getAllDevolucions() {
        LOG.debug("REST request to get all Devolucions");
        return devolucionService.findAll();
    }

    /**
     * {@code GET  /devolucions/:id} : get the "id" devolucion.
     *
     * @param id the id of the devolucionDTO to retrieve.
     * @return the {@link ResponseEntity} with status {@code 200 (OK)} and with body
     *         the devolucionDTO, or with status {@code 404 (Not Found)}.
     */
    @PreAuthorize("hasAnyAuthority('ROLE_ADMIN', 'ROLE_BODEGUERO', 'ROLE_VENDEDOR')")
    @GetMapping("/{id}")
    public ResponseEntity<DevolucionDTO> getDevolucion(@PathVariable("id") Long id) {
        LOG.debug("REST request to get Devolucion : {}", id);
        Optional<DevolucionDTO> devolucionDTO = devolucionService.findOne(id);
        return ResponseUtil.wrapOrNotFound(devolucionDTO);
    }

    /**
     * {@code DELETE  /devolucions/:id} : delete the "id" devolucion.
     *
     * @param id the id of the devolucionDTO to delete.
     * @return the {@link ResponseEntity} with status {@code 204 (NO_CONTENT)}.
     */
    @PreAuthorize("hasAuthority('ROLE_ADMIN')")
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteDevolucion(@PathVariable("id") Long id) {
        LOG.debug("REST request to delete Devolucion : {}", id);
        devolucionService.delete(id);
        return ResponseEntity.noContent()
                .headers(HeaderUtil.createEntityDeletionAlert(applicationName, false, ENTITY_NAME, id.toString()))
                .build();
    }

    /**
     * {@code GET  /devolucions/venta/:ventaId} : get all the devolucions by venta.
     *
     * @param ventaId the id of the venta.
     * @return the {@link ResponseEntity} with status {@code 200 (OK)} and the list
     *         of devolucions in body.
     */
    @PreAuthorize("hasAnyAuthority('ROLE_ADMIN', 'ROLE_BODEGUERO', 'ROLE_VENDEDOR')")
    @GetMapping("/venta/{ventaId}")
    public List<DevolucionDTO> getAllByVenta(@PathVariable("ventaId") Long ventaId) {
        LOG.debug("REST request to get Devolucions by Venta : {}", ventaId);
        return devolucionService.findAllByVenta(ventaId);
    }
}

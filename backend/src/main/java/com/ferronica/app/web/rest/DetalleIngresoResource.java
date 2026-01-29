package com.ferronica.app.web.rest;

import com.ferronica.app.repository.DetalleIngresoRepository;
import com.ferronica.app.service.DetalleIngresoService;
import com.ferronica.app.service.dto.DetalleIngresoDTO;
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
 * REST controller for managing {@link com.ferronica.app.domain.DetalleIngreso}.
 */
@RestController
@RequestMapping("/api/detalle-ingresos")
public class DetalleIngresoResource {

    private static final Logger LOG = LoggerFactory.getLogger(DetalleIngresoResource.class);

    private static final String ENTITY_NAME = "detalleIngreso";

    @Value("${jhipster.clientApp.name}")
    private String applicationName;

    private final DetalleIngresoService detalleIngresoService;

    private final DetalleIngresoRepository detalleIngresoRepository;

    public DetalleIngresoResource(DetalleIngresoService detalleIngresoService,
            DetalleIngresoRepository detalleIngresoRepository) {
        this.detalleIngresoService = detalleIngresoService;
        this.detalleIngresoRepository = detalleIngresoRepository;
    }

    /**
     * {@code POST  /detalle-ingresos} : Create a new detalleIngreso.
     *
     * @param detalleIngresoDTO the detalleIngresoDTO to create.
     * @return the {@link ResponseEntity} with status {@code 201 (Created)} and with
     *         body the new detalleIngresoDTO, or with status
     *         {@code 400 (Bad Request)} if the detalleIngreso has already an ID.
     * @throws URISyntaxException if the Location URI syntax is incorrect.
     */
    @PreAuthorize("hasAnyAuthority('ROLE_ADMIN', 'ROLE_BODEGUERO')")
    @PostMapping("")
    public ResponseEntity<DetalleIngresoDTO> createDetalleIngreso(
            @Valid @RequestBody DetalleIngresoDTO detalleIngresoDTO)
            throws URISyntaxException {
        LOG.debug("REST request to save DetalleIngreso : {}", detalleIngresoDTO);
        if (detalleIngresoDTO.getId() != null) {
            throw new BadRequestAlertException("A new detalleIngreso cannot already have an ID", ENTITY_NAME,
                    "idexists");
        }
        detalleIngresoDTO = detalleIngresoService.save(detalleIngresoDTO);
        return ResponseEntity.created(new URI("/api/detalle-ingresos/" + detalleIngresoDTO.getId()))
                .headers(HeaderUtil.createEntityCreationAlert(applicationName, false, ENTITY_NAME,
                        detalleIngresoDTO.getId().toString()))
                .body(detalleIngresoDTO);
    }

    /**
     * {@code PUT  /detalle-ingresos/:id} : Updates an existing detalleIngreso.
     *
     * @param id                the id of the detalleIngresoDTO to save.
     * @param detalleIngresoDTO the detalleIngresoDTO to update.
     * @return the {@link ResponseEntity} with status {@code 200 (OK)} and with body
     *         the updated detalleIngresoDTO,
     *         or with status {@code 400 (Bad Request)} if the detalleIngresoDTO is
     *         not valid,
     *         or with status {@code 500 (Internal Server Error)} if the
     *         detalleIngresoDTO couldn't be updated.
     * @throws URISyntaxException if the Location URI syntax is incorrect.
     */
    @PreAuthorize("hasAnyAuthority('ROLE_ADMIN', 'ROLE_BODEGUERO')")
    @PutMapping("/{id}")
    public ResponseEntity<DetalleIngresoDTO> updateDetalleIngreso(
            @PathVariable(value = "id", required = false) final Long id,
            @Valid @RequestBody DetalleIngresoDTO detalleIngresoDTO) throws URISyntaxException {
        LOG.debug("REST request to update DetalleIngreso : {}, {}", id, detalleIngresoDTO);
        if (detalleIngresoDTO.getId() == null) {
            throw new BadRequestAlertException("Invalid id", ENTITY_NAME, "idnull");
        }
        if (!Objects.equals(id, detalleIngresoDTO.getId())) {
            throw new BadRequestAlertException("Invalid ID", ENTITY_NAME, "idinvalid");
        }

        if (!detalleIngresoRepository.existsById(id)) {
            throw new BadRequestAlertException("Entity not found", ENTITY_NAME, "idnotfound");
        }

        detalleIngresoDTO = detalleIngresoService.update(detalleIngresoDTO);
        return ResponseEntity.ok()
                .headers(HeaderUtil.createEntityUpdateAlert(applicationName, false, ENTITY_NAME,
                        detalleIngresoDTO.getId().toString()))
                .body(detalleIngresoDTO);
    }

    /**
     * {@code PATCH  /detalle-ingresos/:id} : Partial updates given fields of an
     * existing detalleIngreso, field will ignore if it is null
     *
     * @param id                the id of the detalleIngresoDTO to save.
     * @param detalleIngresoDTO the detalleIngresoDTO to update.
     * @return the {@link ResponseEntity} with status {@code 200 (OK)} and with body
     *         the updated detalleIngresoDTO,
     *         or with status {@code 400 (Bad Request)} if the detalleIngresoDTO is
     *         not valid,
     *         or with status {@code 404 (Not Found)} if the detalleIngresoDTO is
     *         not found,
     *         or with status {@code 500 (Internal Server Error)} if the
     *         detalleIngresoDTO couldn't be updated.
     * @throws URISyntaxException if the Location URI syntax is incorrect.
     */
    @PreAuthorize("hasAnyAuthority('ROLE_ADMIN', 'ROLE_BODEGUERO')")
    @PatchMapping(value = "/{id}", consumes = { "application/json", "application/merge-patch+json" })
    public ResponseEntity<DetalleIngresoDTO> partialUpdateDetalleIngreso(
            @PathVariable(value = "id", required = false) final Long id,
            @NotNull @RequestBody DetalleIngresoDTO detalleIngresoDTO) throws URISyntaxException {
        LOG.debug("REST request to partial update DetalleIngreso partially : {}, {}", id, detalleIngresoDTO);
        if (detalleIngresoDTO.getId() == null) {
            throw new BadRequestAlertException("Invalid id", ENTITY_NAME, "idnull");
        }
        if (!Objects.equals(id, detalleIngresoDTO.getId())) {
            throw new BadRequestAlertException("Invalid ID", ENTITY_NAME, "idinvalid");
        }

        if (!detalleIngresoRepository.existsById(id)) {
            throw new BadRequestAlertException("Entity not found", ENTITY_NAME, "idnotfound");
        }

        Optional<DetalleIngresoDTO> result = detalleIngresoService.partialUpdate(detalleIngresoDTO);

        return ResponseUtil.wrapOrNotFound(
                result,
                HeaderUtil.createEntityUpdateAlert(applicationName, false, ENTITY_NAME,
                        detalleIngresoDTO.getId().toString()));
    }

    /**
     * {@code GET  /detalle-ingresos} : get all the detalleIngresos.
     *
     * @return the {@link ResponseEntity} with status {@code 200 (OK)} and the list
     *         of detalleIngresos in body.
     */
    @PreAuthorize("hasAnyAuthority('ROLE_ADMIN', 'ROLE_BODEGUERO')")
    @GetMapping("")
    public List<DetalleIngresoDTO> getAllDetalleIngresos() {
        LOG.debug("REST request to get all DetalleIngresos");
        return detalleIngresoService.findAll();
    }

    /**
     * {@code GET  /detalle-ingresos/:id} : get the "id" detalleIngreso.
     *
     * @param id the id of the detalleIngresoDTO to retrieve.
     * @return the {@link ResponseEntity} with status {@code 200 (OK)} and with body
     *         the detalleIngresoDTO, or with status {@code 404 (Not Found)}.
     */
    @PreAuthorize("hasAnyAuthority('ROLE_ADMIN', 'ROLE_BODEGUERO')")
    @GetMapping("/{id}")
    public ResponseEntity<DetalleIngresoDTO> getDetalleIngreso(@PathVariable("id") Long id) {
        LOG.debug("REST request to get DetalleIngreso : {}", id);
        Optional<DetalleIngresoDTO> detalleIngresoDTO = detalleIngresoService.findOne(id);
        return ResponseUtil.wrapOrNotFound(detalleIngresoDTO);
    }

    /**
     * {@code DELETE  /detalle-ingresos/:id} : delete the "id" detalleIngreso.
     *
     * @param id the id of the detalleIngresoDTO to delete.
     * @return the {@link ResponseEntity} with status {@code 204 (NO_CONTENT)}.
     */
    @PreAuthorize("hasAuthority('ROLE_ADMIN')")
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteDetalleIngreso(@PathVariable("id") Long id) {
        LOG.debug("REST request to delete DetalleIngreso : {}", id);
        detalleIngresoService.delete(id);
        return ResponseEntity.noContent()
                .headers(HeaderUtil.createEntityDeletionAlert(applicationName, false, ENTITY_NAME, id.toString()))
                .build();
    }
}

package com.ferronica.app.web.rest;

import com.ferronica.app.repository.DetalleVentaRepository;
import com.ferronica.app.service.DetalleVentaService;
import com.ferronica.app.service.dto.DetalleVentaDTO;
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
import org.springframework.web.bind.annotation.*;
import tech.jhipster.web.util.HeaderUtil;
import tech.jhipster.web.util.ResponseUtil;

/**
 * REST controller for managing {@link com.ferronica.app.domain.DetalleVenta}.
 */
@RestController
@RequestMapping("/api/detalle-ventas")
public class DetalleVentaResource {

    private static final Logger LOG = LoggerFactory.getLogger(DetalleVentaResource.class);

    private static final String ENTITY_NAME = "detalleVenta";

    @Value("${jhipster.clientApp.name}")
    private String applicationName;

    private final DetalleVentaService detalleVentaService;

    private final DetalleVentaRepository detalleVentaRepository;

    public DetalleVentaResource(DetalleVentaService detalleVentaService, DetalleVentaRepository detalleVentaRepository) {
        this.detalleVentaService = detalleVentaService;
        this.detalleVentaRepository = detalleVentaRepository;
    }

    /**
     * {@code POST  /detalle-ventas} : Create a new detalleVenta.
     *
     * @param detalleVentaDTO the detalleVentaDTO to create.
     * @return the {@link ResponseEntity} with status {@code 201 (Created)} and with body the new detalleVentaDTO, or with status {@code 400 (Bad Request)} if the detalleVenta has already an ID.
     * @throws URISyntaxException if the Location URI syntax is incorrect.
     */
    @PostMapping("")
    public ResponseEntity<DetalleVentaDTO> createDetalleVenta(@Valid @RequestBody DetalleVentaDTO detalleVentaDTO)
        throws URISyntaxException {
        LOG.debug("REST request to save DetalleVenta : {}", detalleVentaDTO);
        if (detalleVentaDTO.getId() != null) {
            throw new BadRequestAlertException("A new detalleVenta cannot already have an ID", ENTITY_NAME, "idexists");
        }
        detalleVentaDTO = detalleVentaService.save(detalleVentaDTO);
        return ResponseEntity.created(new URI("/api/detalle-ventas/" + detalleVentaDTO.getId()))
            .headers(HeaderUtil.createEntityCreationAlert(applicationName, false, ENTITY_NAME, detalleVentaDTO.getId().toString()))
            .body(detalleVentaDTO);
    }

    /**
     * {@code PUT  /detalle-ventas/:id} : Updates an existing detalleVenta.
     *
     * @param id the id of the detalleVentaDTO to save.
     * @param detalleVentaDTO the detalleVentaDTO to update.
     * @return the {@link ResponseEntity} with status {@code 200 (OK)} and with body the updated detalleVentaDTO,
     * or with status {@code 400 (Bad Request)} if the detalleVentaDTO is not valid,
     * or with status {@code 500 (Internal Server Error)} if the detalleVentaDTO couldn't be updated.
     * @throws URISyntaxException if the Location URI syntax is incorrect.
     */
    @PutMapping("/{id}")
    public ResponseEntity<DetalleVentaDTO> updateDetalleVenta(
        @PathVariable(value = "id", required = false) final Long id,
        @Valid @RequestBody DetalleVentaDTO detalleVentaDTO
    ) throws URISyntaxException {
        LOG.debug("REST request to update DetalleVenta : {}, {}", id, detalleVentaDTO);
        if (detalleVentaDTO.getId() == null) {
            throw new BadRequestAlertException("Invalid id", ENTITY_NAME, "idnull");
        }
        if (!Objects.equals(id, detalleVentaDTO.getId())) {
            throw new BadRequestAlertException("Invalid ID", ENTITY_NAME, "idinvalid");
        }

        if (!detalleVentaRepository.existsById(id)) {
            throw new BadRequestAlertException("Entity not found", ENTITY_NAME, "idnotfound");
        }

        detalleVentaDTO = detalleVentaService.update(detalleVentaDTO);
        return ResponseEntity.ok()
            .headers(HeaderUtil.createEntityUpdateAlert(applicationName, false, ENTITY_NAME, detalleVentaDTO.getId().toString()))
            .body(detalleVentaDTO);
    }

    /**
     * {@code PATCH  /detalle-ventas/:id} : Partial updates given fields of an existing detalleVenta, field will ignore if it is null
     *
     * @param id the id of the detalleVentaDTO to save.
     * @param detalleVentaDTO the detalleVentaDTO to update.
     * @return the {@link ResponseEntity} with status {@code 200 (OK)} and with body the updated detalleVentaDTO,
     * or with status {@code 400 (Bad Request)} if the detalleVentaDTO is not valid,
     * or with status {@code 404 (Not Found)} if the detalleVentaDTO is not found,
     * or with status {@code 500 (Internal Server Error)} if the detalleVentaDTO couldn't be updated.
     * @throws URISyntaxException if the Location URI syntax is incorrect.
     */
    @PatchMapping(value = "/{id}", consumes = { "application/json", "application/merge-patch+json" })
    public ResponseEntity<DetalleVentaDTO> partialUpdateDetalleVenta(
        @PathVariable(value = "id", required = false) final Long id,
        @NotNull @RequestBody DetalleVentaDTO detalleVentaDTO
    ) throws URISyntaxException {
        LOG.debug("REST request to partial update DetalleVenta partially : {}, {}", id, detalleVentaDTO);
        if (detalleVentaDTO.getId() == null) {
            throw new BadRequestAlertException("Invalid id", ENTITY_NAME, "idnull");
        }
        if (!Objects.equals(id, detalleVentaDTO.getId())) {
            throw new BadRequestAlertException("Invalid ID", ENTITY_NAME, "idinvalid");
        }

        if (!detalleVentaRepository.existsById(id)) {
            throw new BadRequestAlertException("Entity not found", ENTITY_NAME, "idnotfound");
        }

        Optional<DetalleVentaDTO> result = detalleVentaService.partialUpdate(detalleVentaDTO);

        return ResponseUtil.wrapOrNotFound(
            result,
            HeaderUtil.createEntityUpdateAlert(applicationName, false, ENTITY_NAME, detalleVentaDTO.getId().toString())
        );
    }

    /**
     * {@code GET  /detalle-ventas} : get all the detalleVentas.
     *
     * @return the {@link ResponseEntity} with status {@code 200 (OK)} and the list of detalleVentas in body.
     */
    @GetMapping("")
    public List<DetalleVentaDTO> getAllDetalleVentas() {
        LOG.debug("REST request to get all DetalleVentas");
        return detalleVentaService.findAll();
    }

    /**
     * {@code GET  /detalle-ventas/:id} : get the "id" detalleVenta.
     *
     * @param id the id of the detalleVentaDTO to retrieve.
     * @return the {@link ResponseEntity} with status {@code 200 (OK)} and with body the detalleVentaDTO, or with status {@code 404 (Not Found)}.
     */
    @GetMapping("/{id}")
    public ResponseEntity<DetalleVentaDTO> getDetalleVenta(@PathVariable("id") Long id) {
        LOG.debug("REST request to get DetalleVenta : {}", id);
        Optional<DetalleVentaDTO> detalleVentaDTO = detalleVentaService.findOne(id);
        return ResponseUtil.wrapOrNotFound(detalleVentaDTO);
    }

    /**
     * {@code DELETE  /detalle-ventas/:id} : delete the "id" detalleVenta.
     *
     * @param id the id of the detalleVentaDTO to delete.
     * @return the {@link ResponseEntity} with status {@code 204 (NO_CONTENT)}.
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteDetalleVenta(@PathVariable("id") Long id) {
        LOG.debug("REST request to delete DetalleVenta : {}", id);
        detalleVentaService.delete(id);
        return ResponseEntity.noContent()
            .headers(HeaderUtil.createEntityDeletionAlert(applicationName, false, ENTITY_NAME, id.toString()))
            .build();
    }
}

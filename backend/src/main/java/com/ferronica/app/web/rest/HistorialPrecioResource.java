package com.ferronica.app.web.rest;

import com.ferronica.app.repository.HistorialPrecioRepository;
import com.ferronica.app.service.HistorialPrecioService;
import com.ferronica.app.service.dto.HistorialPrecioDTO;
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
 * REST controller for managing
 * {@link com.ferronica.app.domain.HistorialPrecio}.
 */
@RestController
@RequestMapping("/api/historial-precios")
public class HistorialPrecioResource {

    private static final Logger LOG = LoggerFactory.getLogger(HistorialPrecioResource.class);

    private static final String ENTITY_NAME = "historialPrecio";

    @Value("${jhipster.clientApp.name}")
    private String applicationName;

    private final HistorialPrecioService historialPrecioService;

    private final HistorialPrecioRepository historialPrecioRepository;

    public HistorialPrecioResource(HistorialPrecioService historialPrecioService,
            HistorialPrecioRepository historialPrecioRepository) {
        this.historialPrecioService = historialPrecioService;
        this.historialPrecioRepository = historialPrecioRepository;
    }

    /**
     * {@code POST  /historial-precios} : Create a new historialPrecio.
     *
     * @param historialPrecioDTO the historialPrecioDTO to create.
     * @return the {@link ResponseEntity} with status {@code 201 (Created)} and with
     *         body the new historialPrecioDTO, or with status
     *         {@code 400 (Bad Request)} if the historialPrecio has already an ID.
     * @throws URISyntaxException if the Location URI syntax is incorrect.
     */
    @PreAuthorize("hasAuthority('ROLE_ADMIN')")
    @PostMapping("")
    public ResponseEntity<HistorialPrecioDTO> createHistorialPrecio(
            @Valid @RequestBody HistorialPrecioDTO historialPrecioDTO)
            throws URISyntaxException {
        LOG.debug("REST request to save HistorialPrecio : {}", historialPrecioDTO);
        if (historialPrecioDTO.getId() != null) {
            throw new BadRequestAlertException("A new historialPrecio cannot already have an ID", ENTITY_NAME,
                    "idexists");
        }
        historialPrecioDTO = historialPrecioService.save(historialPrecioDTO);
        return ResponseEntity.created(new URI("/api/historial-precios/" + historialPrecioDTO.getId()))
                .headers(HeaderUtil.createEntityCreationAlert(applicationName, false, ENTITY_NAME,
                        historialPrecioDTO.getId().toString()))
                .body(historialPrecioDTO);
    }

    /**
     * {@code PUT  /historial-precios/:id} : Updates an existing historialPrecio.
     *
     * @param id                 the id of the historialPrecioDTO to save.
     * @param historialPrecioDTO the historialPrecioDTO to update.
     * @return the {@link ResponseEntity} with status {@code 200 (OK)} and with body
     *         the updated historialPrecioDTO,
     *         or with status {@code 400 (Bad Request)} if the historialPrecioDTO is
     *         not valid,
     *         or with status {@code 500 (Internal Server Error)} if the
     *         historialPrecioDTO couldn't be updated.
     * @throws URISyntaxException if the Location URI syntax is incorrect.
     */
    @PreAuthorize("hasAuthority('ROLE_ADMIN')")
    @PutMapping("/{id}")
    public ResponseEntity<HistorialPrecioDTO> updateHistorialPrecio(
            @PathVariable(value = "id", required = false) final Long id,
            @Valid @RequestBody HistorialPrecioDTO historialPrecioDTO) throws URISyntaxException {
        LOG.debug("REST request to update HistorialPrecio : {}, {}", id, historialPrecioDTO);
        if (historialPrecioDTO.getId() == null) {
            throw new BadRequestAlertException("Invalid id", ENTITY_NAME, "idnull");
        }
        if (!Objects.equals(id, historialPrecioDTO.getId())) {
            throw new BadRequestAlertException("Invalid ID", ENTITY_NAME, "idinvalid");
        }

        if (!historialPrecioRepository.existsById(id)) {
            throw new BadRequestAlertException("Entity not found", ENTITY_NAME, "idnotfound");
        }

        historialPrecioDTO = historialPrecioService.update(historialPrecioDTO);
        return ResponseEntity.ok()
                .headers(HeaderUtil.createEntityUpdateAlert(applicationName, false, ENTITY_NAME,
                        historialPrecioDTO.getId().toString()))
                .body(historialPrecioDTO);
    }

    /**
     * {@code PATCH  /historial-precios/:id} : Partial updates given fields of an
     * existing historialPrecio, field will ignore if it is null
     *
     * @param id                 the id of the historialPrecioDTO to save.
     * @param historialPrecioDTO the historialPrecioDTO to update.
     * @return the {@link ResponseEntity} with status {@code 200 (OK)} and with body
     *         the updated historialPrecioDTO,
     *         or with status {@code 400 (Bad Request)} if the historialPrecioDTO is
     *         not valid,
     *         or with status {@code 404 (Not Found)} if the historialPrecioDTO is
     *         not found,
     *         or with status {@code 500 (Internal Server Error)} if the
     *         historialPrecioDTO couldn't be updated.
     * @throws URISyntaxException if the Location URI syntax is incorrect.
     */
    @PreAuthorize("hasAuthority('ROLE_ADMIN')")
    @PatchMapping(value = "/{id}", consumes = { "application/json", "application/merge-patch+json" })
    public ResponseEntity<HistorialPrecioDTO> partialUpdateHistorialPrecio(
            @PathVariable(value = "id", required = false) final Long id,
            @NotNull @RequestBody HistorialPrecioDTO historialPrecioDTO) throws URISyntaxException {
        LOG.debug("REST request to partial update HistorialPrecio partially : {}, {}", id, historialPrecioDTO);
        if (historialPrecioDTO.getId() == null) {
            throw new BadRequestAlertException("Invalid id", ENTITY_NAME, "idnull");
        }
        if (!Objects.equals(id, historialPrecioDTO.getId())) {
            throw new BadRequestAlertException("Invalid ID", ENTITY_NAME, "idinvalid");
        }

        if (!historialPrecioRepository.existsById(id)) {
            throw new BadRequestAlertException("Entity not found", ENTITY_NAME, "idnotfound");
        }

        Optional<HistorialPrecioDTO> result = historialPrecioService.partialUpdate(historialPrecioDTO);

        return ResponseUtil.wrapOrNotFound(
                result,
                HeaderUtil.createEntityUpdateAlert(applicationName, false, ENTITY_NAME,
                        historialPrecioDTO.getId().toString()));
    }

    /**
     * {@code GET  /historial-precios} : get all the historialPrecios.
     *
     * @return the {@link ResponseEntity} with status {@code 200 (OK)} and the list
     *         of historialPrecios in body.
     */
    @PreAuthorize("hasAnyAuthority('ROLE_ADMIN', 'ROLE_BODEGUERO')")
    @GetMapping("")
    public List<HistorialPrecioDTO> getAllHistorialPrecios(@RequestParam(required = false) Long articuloId) {
        LOG.debug("REST request to get all HistorialPrecios");
        if (articuloId != null) {
            return historialPrecioService.findByArticulo(articuloId);
        }
        return historialPrecioService.findAll();
    }

    /**
     * {@code GET  /historial-precios/:id} : get the "id" historialPrecio.
     *
     * @param id the id of the historialPrecioDTO to retrieve.
     * @return the {@link ResponseEntity} with status {@code 200 (OK)} and with body
     *         the historialPrecioDTO, or with status {@code 404 (Not Found)}.
     */
    @PreAuthorize("hasAnyAuthority('ROLE_ADMIN', 'ROLE_BODEGUERO')")
    @GetMapping("/{id}")
    public ResponseEntity<HistorialPrecioDTO> getHistorialPrecio(@PathVariable("id") Long id) {
        LOG.debug("REST request to get HistorialPrecio : {}", id);
        Optional<HistorialPrecioDTO> historialPrecioDTO = historialPrecioService.findOne(id);
        return ResponseUtil.wrapOrNotFound(historialPrecioDTO);
    }

    /**
     * {@code DELETE  /historial-precios/:id} : delete the "id" historialPrecio.
     *
     * @param id the id of the historialPrecioDTO to delete.
     * @return the {@link ResponseEntity} with status {@code 204 (NO_CONTENT)}.
     */
    @PreAuthorize("hasAuthority('ROLE_ADMIN')")
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteHistorialPrecio(@PathVariable("id") Long id) {
        LOG.debug("REST request to delete HistorialPrecio : {}", id);
        historialPrecioService.delete(id);
        return ResponseEntity.noContent()
                .headers(HeaderUtil.createEntityDeletionAlert(applicationName, false, ENTITY_NAME, id.toString()))
                .build();
    }
}

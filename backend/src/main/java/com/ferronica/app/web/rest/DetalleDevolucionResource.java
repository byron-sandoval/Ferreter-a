package com.ferronica.app.web.rest;

import com.ferronica.app.repository.DetalleDevolucionRepository;
import com.ferronica.app.service.DetalleDevolucionService;
import com.ferronica.app.service.dto.DetalleDevolucionDTO;
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
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpHeaders;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.servlet.support.ServletUriComponentsBuilder;
import tech.jhipster.web.util.HeaderUtil;
import tech.jhipster.web.util.PaginationUtil;
import tech.jhipster.web.util.ResponseUtil;

/**
 * REST controller for managing
 * {@link com.ferronica.app.domain.DetalleDevolucion}.
 */
@RestController
@RequestMapping("/api/detalle-devolucions")
public class DetalleDevolucionResource {

    private static final Logger LOG = LoggerFactory.getLogger(DetalleDevolucionResource.class);

    private static final String ENTITY_NAME = "detalleDevolucion";

    @Value("${jhipster.clientApp.name}")
    private String applicationName;

    private final DetalleDevolucionService detalleDevolucionService;

    private final DetalleDevolucionRepository detalleDevolucionRepository;

    public DetalleDevolucionResource(
            DetalleDevolucionService detalleDevolucionService,
            DetalleDevolucionRepository detalleDevolucionRepository) {
        this.detalleDevolucionService = detalleDevolucionService;
        this.detalleDevolucionRepository = detalleDevolucionRepository;
    }

    /**
     * {@code POST  /detalle-devolucions} : Create a new detalleDevolucion.
     *
     * @param detalleDevolucionDTO the detalleDevolucionDTO to create.
     * @return the {@link ResponseEntity} with status {@code 201 (Created)} and with
     *         body the new detalleDevolucionDTO, or with status
     *         {@code 400 (Bad Request)} if the detalleDevolucion has already an ID.
     * @throws URISyntaxException if the Location URI syntax is incorrect.
     */
    @PostMapping("")
    public ResponseEntity<DetalleDevolucionDTO> createDetalleDevolucion(
            @Valid @RequestBody DetalleDevolucionDTO detalleDevolucionDTO)
            throws URISyntaxException {
        LOG.debug("REST request to save DetalleDevolucion : {}", detalleDevolucionDTO);
        if (detalleDevolucionDTO.getId() != null) {
            throw new BadRequestAlertException("A new detalleDevolucion cannot already have an ID", ENTITY_NAME,
                    "idexists");
        }
        detalleDevolucionDTO = detalleDevolucionService.save(detalleDevolucionDTO);
        return ResponseEntity.created(new URI("/api/detalle-devolucions/" + detalleDevolucionDTO.getId()))
                .headers(HeaderUtil.createEntityCreationAlert(applicationName, false, ENTITY_NAME,
                        detalleDevolucionDTO.getId().toString()))
                .body(detalleDevolucionDTO);
    }

    /**
     * {@code PUT  /detalle-devolucions/:id} : Updates an existing
     * detalleDevolucion.
     *
     * @param id                   the id of the detalleDevolucionDTO to save.
     * @param detalleDevolucionDTO the detalleDevolucionDTO to update.
     * @return the {@link ResponseEntity} with status {@code 200 (OK)} and with body
     *         the updated detalleDevolucionDTO,
     *         or with status {@code 400 (Bad Request)} if the detalleDevolucionDTO
     *         is not valid,
     *         or with status {@code 500 (Internal Server Error)} if the
     *         detalleDevolucionDTO couldn't be updated.
     * @throws URISyntaxException if the Location URI syntax is incorrect.
     */
    @PutMapping("/{id}")
    public ResponseEntity<DetalleDevolucionDTO> updateDetalleDevolucion(
            @PathVariable(value = "id", required = false) final Long id,
            @Valid @RequestBody DetalleDevolucionDTO detalleDevolucionDTO) throws URISyntaxException {
        LOG.debug("REST request to update DetalleDevolucion : {}, {}", id, detalleDevolucionDTO);
        if (detalleDevolucionDTO.getId() == null) {
            throw new BadRequestAlertException("Invalid id", ENTITY_NAME, "idnull");
        }
        if (!Objects.equals(id, detalleDevolucionDTO.getId())) {
            throw new BadRequestAlertException("Invalid ID", ENTITY_NAME, "idinvalid");
        }

        if (!detalleDevolucionRepository.existsById(id)) {
            throw new BadRequestAlertException("Entity not found", ENTITY_NAME, "idnotfound");
        }

        detalleDevolucionDTO = detalleDevolucionService.update(detalleDevolucionDTO);
        return ResponseEntity.ok()
                .headers(HeaderUtil.createEntityUpdateAlert(applicationName, false, ENTITY_NAME,
                        detalleDevolucionDTO.getId().toString()))
                .body(detalleDevolucionDTO);
    }

    /**
     * {@code GET  /detalle-devolucions} : get all the detalleDevolucions.
     *
     * @param pageable the pagination information.
     * @return the {@link ResponseEntity} with status {@code 200 (OK)} and the list
     *         of detalleDevolucions in body.
     */
    @GetMapping("")
    public ResponseEntity<List<DetalleDevolucionDTO>> getAllDetalleDevolucions(Pageable pageable) {
        LOG.debug("REST request to get all DetalleDevolucions");
        Page<DetalleDevolucionDTO> page = detalleDevolucionService.findAll(pageable);
        HttpHeaders headers = PaginationUtil
                .generatePaginationHttpHeaders(ServletUriComponentsBuilder.fromCurrentRequest(), page);
        return ResponseEntity.ok().headers(headers).body(page.getContent());
    }

    /**
     * {@code GET  /detalle-devolucions/:id} : get the "id" detalleDevolucion.
     *
     * @param id the id of the detalleDevolucionDTO to retrieve.
     * @return the {@link ResponseEntity} with status {@code 200 (OK)} and with body
     *         the detalleDevolucionDTO, or with status {@code 404 (Not Found)}.
     */
    @GetMapping("/{id}")
    public ResponseEntity<DetalleDevolucionDTO> getDetalleDevolucion(@PathVariable("id") Long id) {
        LOG.debug("REST request to get DetalleDevolucion : {}", id);
        Optional<DetalleDevolucionDTO> detalleDevolucionDTO = detalleDevolucionService.findOne(id);
        return ResponseUtil.wrapOrNotFound(detalleDevolucionDTO);
    }

    /**
     * {@code DELETE  /detalle-devolucions/:id} : delete the "id" detalleDevolucion.
     *
     * @param id the id of the detalleDevolucionDTO to delete.
     * @return the {@link ResponseEntity} with status {@code 204 (NO_CONTENT)}.
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteDetalleDevolucion(@PathVariable("id") Long id) {
        LOG.debug("REST request to delete DetalleDevolucion : {}", id);
        detalleDevolucionService.delete(id);
        return ResponseEntity.noContent()
                .headers(HeaderUtil.createEntityDeletionAlert(applicationName, false, ENTITY_NAME, id.toString()))
                .build();
    }
}

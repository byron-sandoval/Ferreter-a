package com.ferronica.app.web.rest;

import com.ferronica.app.repository.NumeracionFacturaRepository;
import com.ferronica.app.service.NumeracionFacturaService;
import com.ferronica.app.service.dto.NumeracionFacturaDTO;
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
 * {@link com.ferronica.app.domain.NumeracionFactura}.
 */
@RestController
@RequestMapping("/api/numeracion-facturas")
public class NumeracionFacturaResource {

    private static final Logger LOG = LoggerFactory.getLogger(NumeracionFacturaResource.class);

    private static final String ENTITY_NAME = "numeracionFactura";

    @Value("${jhipster.clientApp.name}")
    private String applicationName;

    private final NumeracionFacturaService numeracionFacturaService;

    private final NumeracionFacturaRepository numeracionFacturaRepository;

    public NumeracionFacturaResource(
            NumeracionFacturaService numeracionFacturaService,
            NumeracionFacturaRepository numeracionFacturaRepository) {
        this.numeracionFacturaService = numeracionFacturaService;
        this.numeracionFacturaRepository = numeracionFacturaRepository;
    }

    /**
     * {@code POST  /numeracion-facturas} : Create a new numeracionFactura.
     *
     * @param numeracionFacturaDTO the numeracionFacturaDTO to create.
     * @return the {@link ResponseEntity} with status {@code 201 (Created)} and with
     *         body the new numeracionFacturaDTO, or with status
     *         {@code 400 (Bad Request)} if the numeracionFactura has already an ID.
     * @throws URISyntaxException if the Location URI syntax is incorrect.
     */
    @PreAuthorize("hasAuthority('ROLE_ADMIN')")
    @PostMapping("")
    public ResponseEntity<NumeracionFacturaDTO> createNumeracionFactura(
            @Valid @RequestBody NumeracionFacturaDTO numeracionFacturaDTO)
            throws URISyntaxException {
        LOG.debug("REST request to save NumeracionFactura : {}", numeracionFacturaDTO);
        if (numeracionFacturaDTO.getId() != null) {
            throw new BadRequestAlertException("A new numeracionFactura cannot already have an ID", ENTITY_NAME,
                    "idexists");
        }
        numeracionFacturaDTO = numeracionFacturaService.save(numeracionFacturaDTO);
        return ResponseEntity.created(new URI("/api/numeracion-facturas/" + numeracionFacturaDTO.getId()))
                .headers(HeaderUtil.createEntityCreationAlert(applicationName, false, ENTITY_NAME,
                        numeracionFacturaDTO.getId().toString()))
                .body(numeracionFacturaDTO);
    }

    /**
     * {@code PUT  /numeracion-facturas/:id} : Updates an existing
     * numeracionFactura.
     *
     * @param id                   the id of the numeracionFacturaDTO to save.
     * @param numeracionFacturaDTO the numeracionFacturaDTO to update.
     * @return the {@link ResponseEntity} with status {@code 200 (OK)} and with body
     *         the updated numeracionFacturaDTO,
     *         or with status {@code 400 (Bad Request)} if the numeracionFacturaDTO
     *         is not valid,
     *         or with status {@code 500 (Internal Server Error)} if the
     *         numeracionFacturaDTO couldn't be updated.
     * @throws URISyntaxException if the Location URI syntax is incorrect.
     */
    @PreAuthorize("hasAuthority('ROLE_ADMIN')")
    @PutMapping("/{id}")
    public ResponseEntity<NumeracionFacturaDTO> updateNumeracionFactura(
            @PathVariable(value = "id", required = false) final Long id,
            @Valid @RequestBody NumeracionFacturaDTO numeracionFacturaDTO) throws URISyntaxException {
        LOG.debug("REST request to update NumeracionFactura : {}, {}", id, numeracionFacturaDTO);
        if (numeracionFacturaDTO.getId() == null) {
            throw new BadRequestAlertException("Invalid id", ENTITY_NAME, "idnull");
        }
        if (!Objects.equals(id, numeracionFacturaDTO.getId())) {
            throw new BadRequestAlertException("Invalid ID", ENTITY_NAME, "idinvalid");
        }

        if (!numeracionFacturaRepository.existsById(id)) {
            throw new BadRequestAlertException("Entity not found", ENTITY_NAME, "idnotfound");
        }

        numeracionFacturaDTO = numeracionFacturaService.update(numeracionFacturaDTO);
        return ResponseEntity.ok()
                .headers(HeaderUtil.createEntityUpdateAlert(applicationName, false, ENTITY_NAME,
                        numeracionFacturaDTO.getId().toString()))
                .body(numeracionFacturaDTO);
    }

    /**
     * {@code PATCH  /numeracion-facturas/:id} : Partial updates given fields of an
     * existing numeracionFactura, field will ignore if it is null
     *
     * @param id                   the id of the numeracionFacturaDTO to save.
     * @param numeracionFacturaDTO the numeracionFacturaDTO to update.
     * @return the {@link ResponseEntity} with status {@code 200 (OK)} and with body
     *         the updated numeracionFacturaDTO,
     *         or with status {@code 400 (Bad Request)} if the numeracionFacturaDTO
     *         is not valid,
     *         or with status {@code 404 (Not Found)} if the numeracionFacturaDTO is
     *         not found,
     *         or with status {@code 500 (Internal Server Error)} if the
     *         numeracionFacturaDTO couldn't be updated.
     * @throws URISyntaxException if the Location URI syntax is incorrect.
     */
    @PreAuthorize("hasAuthority('ROLE_ADMIN')")
    @PatchMapping(value = "/{id}", consumes = { "application/json", "application/merge-patch+json" })
    public ResponseEntity<NumeracionFacturaDTO> partialUpdateNumeracionFactura(
            @PathVariable(value = "id", required = false) final Long id,
            @NotNull @RequestBody NumeracionFacturaDTO numeracionFacturaDTO) throws URISyntaxException {
        LOG.debug("REST request to partial update NumeracionFactura partially : {}, {}", id, numeracionFacturaDTO);
        if (numeracionFacturaDTO.getId() == null) {
            throw new BadRequestAlertException("Invalid id", ENTITY_NAME, "idnull");
        }
        if (!Objects.equals(id, numeracionFacturaDTO.getId())) {
            throw new BadRequestAlertException("Invalid ID", ENTITY_NAME, "idinvalid");
        }

        if (!numeracionFacturaRepository.existsById(id)) {
            throw new BadRequestAlertException("Entity not found", ENTITY_NAME, "idnotfound");
        }

        Optional<NumeracionFacturaDTO> result = numeracionFacturaService.partialUpdate(numeracionFacturaDTO);

        return ResponseUtil.wrapOrNotFound(
                result,
                HeaderUtil.createEntityUpdateAlert(applicationName, false, ENTITY_NAME,
                        numeracionFacturaDTO.getId().toString()));
    }

    /**
     * {@code GET  /numeracion-facturas} : get all the numeracionFacturas.
     *
     * @return the {@link ResponseEntity} with status {@code 200 (OK)} and the list
     *         of numeracionFacturas in body.
     */
    @PreAuthorize("hasAnyAuthority('ROLE_ADMIN', 'ROLE_BODEGUERO', 'ROLE_VENDEDOR')")
    @GetMapping("")
    public List<NumeracionFacturaDTO> getAllNumeracionFacturas() {
        LOG.debug("REST request to get all NumeracionFacturas");
        return numeracionFacturaService.findAll();
    }

    /**
     * {@code GET  /numeracion-facturas/:id} : get the "id" numeracionFactura.
     *
     * @param id the id of the numeracionFacturaDTO to retrieve.
     * @return the {@link ResponseEntity} with status {@code 200 (OK)} and with body
     *         the numeracionFacturaDTO, or with status {@code 404 (Not Found)}.
     */
    @PreAuthorize("hasAnyAuthority('ROLE_ADMIN', 'ROLE_BODEGUERO', 'ROLE_VENDEDOR')")
    @GetMapping("/{id}")
    public ResponseEntity<NumeracionFacturaDTO> getNumeracionFactura(@PathVariable("id") Long id) {
        LOG.debug("REST request to get NumeracionFactura : {}", id);
        Optional<NumeracionFacturaDTO> numeracionFacturaDTO = numeracionFacturaService.findOne(id);
        return ResponseUtil.wrapOrNotFound(numeracionFacturaDTO);
    }

    /**
     * {@code DELETE  /numeracion-facturas/:id} : delete the "id" numeracionFactura.
     *
     * @param id the id of the numeracionFacturaDTO to delete.
     * @return the {@link ResponseEntity} with status {@code 204 (NO_CONTENT)}.
     */
    @PreAuthorize("hasAuthority('ROLE_ADMIN')")
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteNumeracionFactura(@PathVariable("id") Long id) {
        LOG.debug("REST request to delete NumeracionFactura : {}", id);
        numeracionFacturaService.delete(id);
        return ResponseEntity.noContent()
                .headers(HeaderUtil.createEntityDeletionAlert(applicationName, false, ENTITY_NAME, id.toString()))
                .build();
    }
}

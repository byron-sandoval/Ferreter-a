package com.ferronica.app.web.rest;

import com.ferronica.app.repository.EmpresaRepository;
import com.ferronica.app.service.EmpresaService;
import com.ferronica.app.service.dto.EmpresaDTO;
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
 * REST controller for managing {@link com.ferronica.app.domain.Empresa}.
 */
@RestController
@RequestMapping("/api/empresas")
public class EmpresaResource {

    private static final Logger LOG = LoggerFactory.getLogger(EmpresaResource.class);

    private static final String ENTITY_NAME = "empresa";

    @Value("${jhipster.clientApp.name}")
    private String applicationName;

    private final EmpresaService empresaService;

    private final EmpresaRepository empresaRepository;

    public EmpresaResource(EmpresaService empresaService, EmpresaRepository empresaRepository) {
        this.empresaService = empresaService;
        this.empresaRepository = empresaRepository;
    }

    /**
     * {@code POST  /empresas} : Create a new empresa.
     *
     * @param empresaDTO the empresaDTO to create.
     * @return the {@link ResponseEntity} with status {@code 201 (Created)} and with
     *         body the new empresaDTO, or with status {@code 400 (Bad Request)} if
     *         the empresa has already an ID.
     * @throws URISyntaxException if the Location URI syntax is incorrect.
     */
    @PreAuthorize("hasAuthority('ROLE_ADMIN')")
    @PostMapping("")
    public ResponseEntity<EmpresaDTO> createEmpresa(@Valid @RequestBody EmpresaDTO empresaDTO)
            throws URISyntaxException {
        LOG.debug("REST request to save Empresa : {}", empresaDTO);
        if (empresaDTO.getId() != null) {
            throw new BadRequestAlertException("A new empresa cannot already have an ID", ENTITY_NAME, "idexists");
        }
        empresaDTO = empresaService.save(empresaDTO);
        return ResponseEntity.created(new URI("/api/empresas/" + empresaDTO.getId()))
                .headers(HeaderUtil.createEntityCreationAlert(applicationName, false, ENTITY_NAME,
                        empresaDTO.getId().toString()))
                .body(empresaDTO);
    }

    /**
     * {@code PUT  /empresas/:id} : Updates an existing empresa.
     *
     * @param id         the id of the empresaDTO to save.
     * @param empresaDTO the empresaDTO to update.
     * @return the {@link ResponseEntity} with status {@code 200 (OK)} and with body
     *         the updated empresaDTO,
     *         or with status {@code 400 (Bad Request)} if the empresaDTO is not
     *         valid,
     *         or with status {@code 500 (Internal Server Error)} if the empresaDTO
     *         couldn't be updated.
     * @throws URISyntaxException if the Location URI syntax is incorrect.
     */
    @PreAuthorize("hasAuthority('ROLE_ADMIN')")
    @PutMapping("/{id}")
    public ResponseEntity<EmpresaDTO> updateEmpresa(
            @PathVariable(value = "id", required = false) final Long id,
            @Valid @RequestBody EmpresaDTO empresaDTO) throws URISyntaxException {
        LOG.debug("REST request to update Empresa : {}, {}", id, empresaDTO);
        if (empresaDTO.getId() == null) {
            throw new BadRequestAlertException("Invalid id", ENTITY_NAME, "idnull");
        }
        if (!Objects.equals(id, empresaDTO.getId())) {
            throw new BadRequestAlertException("Invalid ID", ENTITY_NAME, "idinvalid");
        }

        if (!empresaRepository.existsById(id)) {
            throw new BadRequestAlertException("Entity not found", ENTITY_NAME, "idnotfound");
        }

        empresaDTO = empresaService.update(empresaDTO);
        return ResponseEntity.ok()
                .headers(HeaderUtil.createEntityUpdateAlert(applicationName, false, ENTITY_NAME,
                        empresaDTO.getId().toString()))
                .body(empresaDTO);
    }

    /**
     * {@code PATCH  /empresas/:id} : Partial updates given fields of an existing
     * empresa, field will ignore if it is null
     *
     * @param id         the id of the empresaDTO to save.
     * @param empresaDTO the empresaDTO to update.
     * @return the {@link ResponseEntity} with status {@code 200 (OK)} and with body
     *         the updated empresaDTO,
     *         or with status {@code 400 (Bad Request)} if the empresaDTO is not
     *         valid,
     *         or with status {@code 404 (Not Found)} if the empresaDTO is not
     *         found,
     *         or with status {@code 500 (Internal Server Error)} if the empresaDTO
     *         couldn't be updated.
     * @throws URISyntaxException if the Location URI syntax is incorrect.
     */
    @PreAuthorize("hasAuthority('ROLE_ADMIN')")
    @PatchMapping(value = "/{id}", consumes = { "application/json", "application/merge-patch+json" })
    public ResponseEntity<EmpresaDTO> partialUpdateEmpresa(
            @PathVariable(value = "id", required = false) final Long id,
            @NotNull @RequestBody EmpresaDTO empresaDTO) throws URISyntaxException {
        LOG.debug("REST request to partial update Empresa partially : {}, {}", id, empresaDTO);
        if (empresaDTO.getId() == null) {
            throw new BadRequestAlertException("Invalid id", ENTITY_NAME, "idnull");
        }
        if (!Objects.equals(id, empresaDTO.getId())) {
            throw new BadRequestAlertException("Invalid ID", ENTITY_NAME, "idinvalid");
        }

        if (!empresaRepository.existsById(id)) {
            throw new BadRequestAlertException("Entity not found", ENTITY_NAME, "idnotfound");
        }

        Optional<EmpresaDTO> result = empresaService.partialUpdate(empresaDTO);

        return ResponseUtil.wrapOrNotFound(
                result,
                HeaderUtil.createEntityUpdateAlert(applicationName, false, ENTITY_NAME, empresaDTO.getId().toString()));
    }

    /**
     * {@code GET  /empresas} : get all the empresas.
     *
     * @return the {@link ResponseEntity} with status {@code 200 (OK)} and the list
     *         of empresas in body.
     */
    @PreAuthorize("hasAnyAuthority('ROLE_ADMIN', 'ROLE_BODEGUERO', 'ROLE_VENDEDOR')")
    @GetMapping("")
    public List<EmpresaDTO> getAllEmpresas() {
        LOG.debug("REST request to get all Empresas");
        return empresaService.findAll();
    }

    /**
     * {@code GET  /empresas/:id} : get the "id" empresa.
     *
     * @param id the id of the empresaDTO to retrieve.
     * @return the {@link ResponseEntity} with status {@code 200 (OK)} and with body
     *         the empresaDTO, or with status {@code 404 (Not Found)}.
     */
    @PreAuthorize("hasAnyAuthority('ROLE_ADMIN', 'ROLE_BODEGUERO', 'ROLE_VENDEDOR')")
    @GetMapping("/{id}")
    public ResponseEntity<EmpresaDTO> getEmpresa(@PathVariable("id") Long id) {
        LOG.debug("REST request to get Empresa : {}", id);
        Optional<EmpresaDTO> empresaDTO = empresaService.findOne(id);
        return ResponseUtil.wrapOrNotFound(empresaDTO);
    }

    /**
     * {@code DELETE  /empresas/:id} : delete the "id" empresa.
     *
     * @param id the id of the empresaDTO to delete.
     * @return the {@link ResponseEntity} with status {@code 204 (NO_CONTENT)}.
     */
    @PreAuthorize("hasAuthority('ROLE_ADMIN')")
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteEmpresa(@PathVariable("id") Long id) {
        LOG.debug("REST request to delete Empresa : {}", id);
        empresaService.delete(id);
        return ResponseEntity.noContent()
                .headers(HeaderUtil.createEntityDeletionAlert(applicationName, false, ENTITY_NAME, id.toString()))
                .build();
    }
}

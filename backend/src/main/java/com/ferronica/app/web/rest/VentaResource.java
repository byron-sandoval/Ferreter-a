package com.ferronica.app.web.rest;

import com.ferronica.app.repository.UsuarioRepository;
import com.ferronica.app.repository.VentaRepository;
import com.ferronica.app.security.AuthoritiesConstants;
import com.ferronica.app.security.SecurityUtils;
import com.ferronica.app.service.VentaQueryService;
import com.ferronica.app.service.VentaService;
import com.ferronica.app.service.criteria.VentaCriteria;
import com.ferronica.app.service.dto.VentaDTO;
import com.ferronica.app.web.rest.errors.BadRequestAlertException;
import tech.jhipster.service.filter.LongFilter;
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
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.servlet.support.ServletUriComponentsBuilder;
import tech.jhipster.web.util.HeaderUtil;
import tech.jhipster.web.util.PaginationUtil;
import tech.jhipster.web.util.ResponseUtil;

/**
 * REST controller for managing {@link com.ferronica.app.domain.Venta}.
 */
@RestController
@RequestMapping("/api/ventas")
public class VentaResource {

    private static final Logger LOG = LoggerFactory.getLogger(VentaResource.class);

    private static final String ENTITY_NAME = "venta";

    @Value("${jhipster.clientApp.name}")
    private String applicationName;

    private final VentaService ventaService;

    private final VentaRepository ventaRepository;

    private final VentaQueryService ventaQueryService;
    private final UsuarioRepository usuarioRepository;

    public VentaResource(VentaService ventaService, VentaRepository ventaRepository,
            VentaQueryService ventaQueryService, UsuarioRepository usuarioRepository) {
        this.ventaService = ventaService;
        this.ventaRepository = ventaRepository;
        this.ventaQueryService = ventaQueryService;
        this.usuarioRepository = usuarioRepository;
    }

    /**
     * {@code POST  /ventas} : Create a new venta.
     *
     * @param ventaDTO the ventaDTO to create.
     * @return the {@link ResponseEntity} with status {@code 201 (Created)} and with
     *         body the new ventaDTO, or with status {@code 400 (Bad Request)} if
     *         the venta has already an ID.
     * @throws URISyntaxException if the Location URI syntax is incorrect.
     */
    @PreAuthorize("hasAnyAuthority('ROLE_ADMIN', 'ROLE_VENDEDOR')")
    @PostMapping("")
    public ResponseEntity<VentaDTO> createVenta(@Valid @RequestBody VentaDTO ventaDTO) throws URISyntaxException {
        LOG.debug("REST request to save Venta : {}", ventaDTO);
        if (ventaDTO.getId() != null) {
            throw new BadRequestAlertException("A new venta cannot already have an ID", ENTITY_NAME, "idexists");
        }
        ventaDTO = ventaService.save(ventaDTO);
        return ResponseEntity.created(new URI("/api/ventas/" + ventaDTO.getId()))
                .headers(HeaderUtil.createEntityCreationAlert(applicationName, false, ENTITY_NAME,
                        ventaDTO.getId().toString()))
                .body(ventaDTO);
    }

    /**
     * {@code PUT  /ventas/:id} : Updates an existing venta.
     *
     * @param id       the id of the ventaDTO to save.
     * @param ventaDTO the ventaDTO to update.
     * @return the {@link ResponseEntity} with status {@code 200 (OK)} and with body
     *         the updated ventaDTO,
     *         or with status {@code 400 (Bad Request)} if the ventaDTO is not
     *         valid,
     *         or with status {@code 500 (Internal Server Error)} if the ventaDTO
     *         couldn't be updated.
     * @throws URISyntaxException if the Location URI syntax is incorrect.
     */
    @PreAuthorize("hasAuthority('ROLE_ADMIN')")
    @PutMapping("/{id}")
    public ResponseEntity<VentaDTO> updateVenta(
            @PathVariable(value = "id", required = false) final Long id,
            @Valid @RequestBody VentaDTO ventaDTO) throws URISyntaxException {
        LOG.debug("REST request to update Venta : {}, {}", id, ventaDTO);
        if (ventaDTO.getId() == null) {
            throw new BadRequestAlertException("Invalid id", ENTITY_NAME, "idnull");
        }
        if (!Objects.equals(id, ventaDTO.getId())) {
            throw new BadRequestAlertException("Invalid ID", ENTITY_NAME, "idinvalid");
        }

        if (!ventaRepository.existsById(id)) {
            throw new BadRequestAlertException("Entity not found", ENTITY_NAME, "idnotfound");
        }

        ventaDTO = ventaService.update(ventaDTO);
        return ResponseEntity.ok()
                .headers(HeaderUtil.createEntityUpdateAlert(applicationName, false, ENTITY_NAME,
                        ventaDTO.getId().toString()))
                .body(ventaDTO);
    }

    /**
     * {@code PATCH  /ventas/:id} : Partial updates given fields of an existing
     * venta, field will ignore if it is null
     *
     * @param id       the id of the ventaDTO to save.
     * @param ventaDTO the ventaDTO to update.
     * @return the {@link ResponseEntity} with status {@code 200 (OK)} and with body
     *         the updated ventaDTO,
     *         or with status {@code 400 (Bad Request)} if the ventaDTO is not
     *         valid,
     *         or with status {@code 404 (Not Found)} if the ventaDTO is not found,
     *         or with status {@code 500 (Internal Server Error)} if the ventaDTO
     *         couldn't be updated.
     * @throws URISyntaxException if the Location URI syntax is incorrect.
     */
    @PreAuthorize("hasAuthority('ROLE_ADMIN')")
    @PatchMapping(value = "/{id}", consumes = { "application/json", "application/merge-patch+json" })
    public ResponseEntity<VentaDTO> partialUpdateVenta(
            @PathVariable(value = "id", required = false) final Long id,
            @NotNull @RequestBody VentaDTO ventaDTO) throws URISyntaxException {
        LOG.debug("REST request to partial update Venta partially : {}, {}", id, ventaDTO);
        if (ventaDTO.getId() == null) {
            throw new BadRequestAlertException("Invalid id", ENTITY_NAME, "idnull");
        }
        if (!Objects.equals(id, ventaDTO.getId())) {
            throw new BadRequestAlertException("Invalid ID", ENTITY_NAME, "idinvalid");
        }

        if (!ventaRepository.existsById(id)) {
            throw new BadRequestAlertException("Entity not found", ENTITY_NAME, "idnotfound");
        }

        Optional<VentaDTO> result = ventaService.partialUpdate(ventaDTO);

        return ResponseUtil.wrapOrNotFound(
                result,
                HeaderUtil.createEntityUpdateAlert(applicationName, false, ENTITY_NAME, ventaDTO.getId().toString()));
    }

    /**
     * {@code GET  /ventas} : get all the ventas.
     *
     * @param pageable the pagination information.
     * @param criteria the criteria which the requested entities should match.
     * @return the {@link ResponseEntity} with status {@code 200 (OK)} and the list
     *         of ventas in body.
     */
    @PreAuthorize("hasAnyAuthority('ROLE_ADMIN', 'ROLE_BODEGUERO', 'ROLE_VENDEDOR')")
    @GetMapping("")
    public ResponseEntity<List<VentaDTO>> getAllVentas(
            VentaCriteria criteria,
            @org.springdoc.core.annotations.ParameterObject Pageable pageable) {
        LOG.debug("REST request to get Ventas by criteria: {}", criteria);
        applySellerFilter(criteria);
        Page<VentaDTO> page = ventaQueryService.findByCriteria(criteria, pageable);
        HttpHeaders headers = PaginationUtil
                .generatePaginationHttpHeaders(ServletUriComponentsBuilder.fromCurrentRequest(), page);
        return ResponseEntity.ok().headers(headers).body(page.getContent());
    }

    /**
     * {@code GET  /ventas/count} : count all the ventas.
     *
     * @param criteria the criteria which the requested entities should match.
     * @return the {@link ResponseEntity} with status {@code 200 (OK)} and the count
     *         in body.
     */
    @PreAuthorize("hasAnyAuthority('ROLE_ADMIN', 'ROLE_BODEGUERO', 'ROLE_VENDEDOR')")
    @GetMapping("/count")
    public ResponseEntity<Long> countVentas(VentaCriteria criteria) {
        LOG.debug("REST request to count Ventas by criteria: {}", criteria);
        applySellerFilter(criteria);
        return ResponseEntity.ok().body(ventaQueryService.countByCriteria(criteria));
    }

    /**
     * {@code GET  /ventas/:id} : get the "id" venta.
     *
     * @param id the id of the ventaDTO to retrieve.
     * @return the {@link ResponseEntity} with status {@code 200 (OK)} and with body
     *         the ventaDTO, or with status {@code 404 (Not Found)}.
     */
    @PreAuthorize("hasAnyAuthority('ROLE_ADMIN', 'ROLE_BODEGUERO', 'ROLE_VENDEDOR')")
    @GetMapping("/{id}")
    public ResponseEntity<VentaDTO> getVenta(@PathVariable("id") Long id) {
        LOG.debug("REST request to get Venta : {}", id);
        Optional<VentaDTO> ventaDTO = ventaService.findOne(id);

        // Seguridad extra: Si es vendedor y NO es admin, verificar que la venta le
        // pertenezca
        if (ventaDTO.isPresent() && SecurityUtils.hasCurrentUserThisAuthority(AuthoritiesConstants.VENDEDOR)
                && !SecurityUtils.hasCurrentUserThisAuthority(AuthoritiesConstants.ADMIN)) {
            String currentUserLogin = SecurityUtils.getCurrentUserLogin().orElse("");
            if (ventaDTO.get().getUsuario() != null
                    && !currentUserLogin.equals(ventaDTO.get().getUsuario().getUsername())) {
                return ResponseEntity.status(org.springframework.http.HttpStatus.FORBIDDEN).build();
            }
        }

        return ResponseUtil.wrapOrNotFound(ventaDTO);
    }

    /**
     * {@code DELETE  /ventas/:id} : delete the "id" venta.
     *
     * @param id the id of the ventaDTO to delete.
     * @return the {@link ResponseEntity} with status {@code 204 (NO_CONTENT)}.
     */
    @PreAuthorize("hasAnyAuthority('ROLE_ADMIN', 'ROLE_VENDEDOR')")
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteVenta(@PathVariable("id") Long id) {
        LOG.debug("REST request to delete Venta : {}", id);
        ventaService.delete(id);
        return ResponseEntity.noContent()
                .headers(HeaderUtil.createEntityDeletionAlert(applicationName, false, ENTITY_NAME, id.toString()))
                .build();
    }

    private void applySellerFilter(VentaCriteria criteria) {
        // Si es vendedor y NO es admin, forzar el filtro de su propio usuario
        if (SecurityUtils.hasCurrentUserThisAuthority(AuthoritiesConstants.VENDEDOR)
                && !SecurityUtils.hasCurrentUserThisAuthority(AuthoritiesConstants.ADMIN)) {
            SecurityUtils.getCurrentUserKeycloakId()
                    .flatMap(usuarioRepository::findByIdKeycloak)
                    .ifPresent(usuario -> {
                        LongFilter filter = new LongFilter();
                        filter.setEquals(usuario.getId());
                        criteria.setUsuarioId(filter);
                    });
        }
    }
}

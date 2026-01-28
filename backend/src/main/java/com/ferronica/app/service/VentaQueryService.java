package com.ferronica.app.service;

import com.ferronica.app.domain.*; // for static metamodels
import com.ferronica.app.domain.Venta;
import com.ferronica.app.repository.VentaRepository;
import com.ferronica.app.service.criteria.VentaCriteria;
import com.ferronica.app.service.dto.VentaDTO;
import com.ferronica.app.service.mapper.VentaMapper;
import jakarta.persistence.criteria.JoinType;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import tech.jhipster.service.QueryService;

/**
 * Service for executing complex queries for {@link Venta} entities in the database.
 * The main input is a {@link VentaCriteria} which gets converted to {@link Specification},
 * in a way that all the filters must apply.
 * It returns a {@link Page} of {@link VentaDTO} which fulfills the criteria.
 */
@Service
@Transactional(readOnly = true)
public class VentaQueryService extends QueryService<Venta> {

    private static final Logger LOG = LoggerFactory.getLogger(VentaQueryService.class);

    private final VentaRepository ventaRepository;

    private final VentaMapper ventaMapper;

    public VentaQueryService(VentaRepository ventaRepository, VentaMapper ventaMapper) {
        this.ventaRepository = ventaRepository;
        this.ventaMapper = ventaMapper;
    }

    /**
     * Return a {@link Page} of {@link VentaDTO} which matches the criteria from the database.
     * @param criteria The object which holds all the filters, which the entities should match.
     * @param page The page, which should be returned.
     * @return the matching entities.
     */
    @Transactional(readOnly = true)
    public Page<VentaDTO> findByCriteria(VentaCriteria criteria, Pageable page) {
        LOG.debug("find by criteria : {}, page: {}", criteria, page);
        final Specification<Venta> specification = createSpecification(criteria);
        return ventaRepository.findAll(specification, page).map(ventaMapper::toDto);
    }

    /**
     * Return the number of matching entities in the database.
     * @param criteria The object which holds all the filters, which the entities should match.
     * @return the number of matching entities.
     */
    @Transactional(readOnly = true)
    public long countByCriteria(VentaCriteria criteria) {
        LOG.debug("count by criteria : {}", criteria);
        final Specification<Venta> specification = createSpecification(criteria);
        return ventaRepository.count(specification);
    }

    /**
     * Function to convert {@link VentaCriteria} to a {@link Specification}
     * @param criteria The object which holds all the filters, which the entities should match.
     * @return the matching {@link Specification} of the entity.
     */
    protected Specification<Venta> createSpecification(VentaCriteria criteria) {
        Specification<Venta> specification = Specification.where(null);
        if (criteria != null) {
            // This has to be called first, because the distinct method returns null
            specification = Specification.allOf(
                Boolean.TRUE.equals(criteria.getDistinct()) ? distinct(criteria.getDistinct()) : null,
                buildRangeSpecification(criteria.getId(), Venta_.id),
                buildRangeSpecification(criteria.getFecha(), Venta_.fecha),
                buildRangeSpecification(criteria.getNoFactura(), Venta_.noFactura),
                buildRangeSpecification(criteria.getSubtotal(), Venta_.subtotal),
                buildRangeSpecification(criteria.getIva(), Venta_.iva),
                buildRangeSpecification(criteria.getTotal(), Venta_.total),
                buildRangeSpecification(criteria.getTotalEnMonedaBase(), Venta_.totalEnMonedaBase),
                buildSpecification(criteria.getMetodoPago(), Venta_.metodoPago),
                buildStringSpecification(criteria.getStripeId(), Venta_.stripeId),
                buildSpecification(criteria.getEsContado(), Venta_.esContado),
                buildRangeSpecification(criteria.getTipoCambioVenta(), Venta_.tipoCambioVenta),
                buildSpecification(criteria.getAnulada(), Venta_.anulada),
                buildSpecification(criteria.getDetallesId(), root -> root.join(Venta_.detalles, JoinType.LEFT).get(DetalleVenta_.id)),
                buildSpecification(criteria.getClienteId(), root -> root.join(Venta_.cliente, JoinType.LEFT).get(Cliente_.id)),
                buildSpecification(criteria.getVendedorId(), root -> root.join(Venta_.vendedor, JoinType.LEFT).get(Vendedor_.id)),
                buildSpecification(criteria.getMonedaId(), root -> root.join(Venta_.moneda, JoinType.LEFT).get(Moneda_.id)),
                buildSpecification(criteria.getNumeracionId(), root ->
                    root.join(Venta_.numeracion, JoinType.LEFT).get(NumeracionFactura_.id)
                )
            );
        }
        return specification;
    }
}

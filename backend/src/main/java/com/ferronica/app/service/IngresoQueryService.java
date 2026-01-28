package com.ferronica.app.service;

import com.ferronica.app.domain.*; // for static metamodels
import com.ferronica.app.domain.Ingreso;
import com.ferronica.app.repository.IngresoRepository;
import com.ferronica.app.service.criteria.IngresoCriteria;
import com.ferronica.app.service.dto.IngresoDTO;
import com.ferronica.app.service.mapper.IngresoMapper;
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
 * Service for executing complex queries for {@link Ingreso} entities in the database.
 * The main input is a {@link IngresoCriteria} which gets converted to {@link Specification},
 * in a way that all the filters must apply.
 * It returns a {@link Page} of {@link IngresoDTO} which fulfills the criteria.
 */
@Service
@Transactional(readOnly = true)
public class IngresoQueryService extends QueryService<Ingreso> {

    private static final Logger LOG = LoggerFactory.getLogger(IngresoQueryService.class);

    private final IngresoRepository ingresoRepository;

    private final IngresoMapper ingresoMapper;

    public IngresoQueryService(IngresoRepository ingresoRepository, IngresoMapper ingresoMapper) {
        this.ingresoRepository = ingresoRepository;
        this.ingresoMapper = ingresoMapper;
    }

    /**
     * Return a {@link Page} of {@link IngresoDTO} which matches the criteria from the database.
     * @param criteria The object which holds all the filters, which the entities should match.
     * @param page The page, which should be returned.
     * @return the matching entities.
     */
    @Transactional(readOnly = true)
    public Page<IngresoDTO> findByCriteria(IngresoCriteria criteria, Pageable page) {
        LOG.debug("find by criteria : {}, page: {}", criteria, page);
        final Specification<Ingreso> specification = createSpecification(criteria);
        return ingresoRepository.findAll(specification, page).map(ingresoMapper::toDto);
    }

    /**
     * Return the number of matching entities in the database.
     * @param criteria The object which holds all the filters, which the entities should match.
     * @return the number of matching entities.
     */
    @Transactional(readOnly = true)
    public long countByCriteria(IngresoCriteria criteria) {
        LOG.debug("count by criteria : {}", criteria);
        final Specification<Ingreso> specification = createSpecification(criteria);
        return ingresoRepository.count(specification);
    }

    /**
     * Function to convert {@link IngresoCriteria} to a {@link Specification}
     * @param criteria The object which holds all the filters, which the entities should match.
     * @return the matching {@link Specification} of the entity.
     */
    protected Specification<Ingreso> createSpecification(IngresoCriteria criteria) {
        Specification<Ingreso> specification = Specification.where(null);
        if (criteria != null) {
            // This has to be called first, because the distinct method returns null
            specification = Specification.allOf(
                Boolean.TRUE.equals(criteria.getDistinct()) ? distinct(criteria.getDistinct()) : null,
                buildRangeSpecification(criteria.getId(), Ingreso_.id),
                buildRangeSpecification(criteria.getFecha(), Ingreso_.fecha),
                buildStringSpecification(criteria.getNoDocumento(), Ingreso_.noDocumento),
                buildRangeSpecification(criteria.getTotal(), Ingreso_.total),
                buildStringSpecification(criteria.getObservaciones(), Ingreso_.observaciones),
                buildSpecification(criteria.getActivo(), Ingreso_.activo),
                buildSpecification(criteria.getDetallesId(), root -> root.join(Ingreso_.detalles, JoinType.LEFT).get(DetalleIngreso_.id)),
                buildSpecification(criteria.getVendedorId(), root -> root.join(Ingreso_.vendedor, JoinType.LEFT).get(Vendedor_.id)),
                buildSpecification(criteria.getProveedorId(), root -> root.join(Ingreso_.proveedor, JoinType.LEFT).get(Proveedor_.id))
            );
        }
        return specification;
    }
}

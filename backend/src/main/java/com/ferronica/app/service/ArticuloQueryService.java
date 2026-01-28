package com.ferronica.app.service;

import com.ferronica.app.domain.*; // for static metamodels
import com.ferronica.app.domain.Articulo;
import com.ferronica.app.repository.ArticuloRepository;
import com.ferronica.app.service.criteria.ArticuloCriteria;
import com.ferronica.app.service.dto.ArticuloDTO;
import com.ferronica.app.service.mapper.ArticuloMapper;
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
 * Service for executing complex queries for {@link Articulo} entities in the database.
 * The main input is a {@link ArticuloCriteria} which gets converted to {@link Specification},
 * in a way that all the filters must apply.
 * It returns a {@link Page} of {@link ArticuloDTO} which fulfills the criteria.
 */
@Service
@Transactional(readOnly = true)
public class ArticuloQueryService extends QueryService<Articulo> {

    private static final Logger LOG = LoggerFactory.getLogger(ArticuloQueryService.class);

    private final ArticuloRepository articuloRepository;

    private final ArticuloMapper articuloMapper;

    public ArticuloQueryService(ArticuloRepository articuloRepository, ArticuloMapper articuloMapper) {
        this.articuloRepository = articuloRepository;
        this.articuloMapper = articuloMapper;
    }

    /**
     * Return a {@link Page} of {@link ArticuloDTO} which matches the criteria from the database.
     * @param criteria The object which holds all the filters, which the entities should match.
     * @param page The page, which should be returned.
     * @return the matching entities.
     */
    @Transactional(readOnly = true)
    public Page<ArticuloDTO> findByCriteria(ArticuloCriteria criteria, Pageable page) {
        LOG.debug("find by criteria : {}, page: {}", criteria, page);
        final Specification<Articulo> specification = createSpecification(criteria);
        return articuloRepository.findAll(specification, page).map(articuloMapper::toDto);
    }

    /**
     * Return the number of matching entities in the database.
     * @param criteria The object which holds all the filters, which the entities should match.
     * @return the number of matching entities.
     */
    @Transactional(readOnly = true)
    public long countByCriteria(ArticuloCriteria criteria) {
        LOG.debug("count by criteria : {}", criteria);
        final Specification<Articulo> specification = createSpecification(criteria);
        return articuloRepository.count(specification);
    }

    /**
     * Function to convert {@link ArticuloCriteria} to a {@link Specification}
     * @param criteria The object which holds all the filters, which the entities should match.
     * @return the matching {@link Specification} of the entity.
     */
    protected Specification<Articulo> createSpecification(ArticuloCriteria criteria) {
        Specification<Articulo> specification = Specification.where(null);
        if (criteria != null) {
            // This has to be called first, because the distinct method returns null
            specification = Specification.allOf(
                Boolean.TRUE.equals(criteria.getDistinct()) ? distinct(criteria.getDistinct()) : null,
                buildRangeSpecification(criteria.getId(), Articulo_.id),
                buildStringSpecification(criteria.getCodigo(), Articulo_.codigo),
                buildStringSpecification(criteria.getNombre(), Articulo_.nombre),
                buildStringSpecification(criteria.getDescripcion(), Articulo_.descripcion),
                buildRangeSpecification(criteria.getExistencia(), Articulo_.existencia),
                buildRangeSpecification(criteria.getExistenciaMinima(), Articulo_.existenciaMinima),
                buildRangeSpecification(criteria.getPrecio(), Articulo_.precio),
                buildRangeSpecification(criteria.getCosto(), Articulo_.costo),
                buildSpecification(criteria.getActivo(), Articulo_.activo),
                buildSpecification(criteria.getCategoriaId(), root -> root.join(Articulo_.categoria, JoinType.LEFT).get(Categoria_.id)),
                buildSpecification(criteria.getUnidadMedidaId(), root ->
                    root.join(Articulo_.unidadMedida, JoinType.LEFT).get(UnidadMedida_.id)
                )
            );
        }
        return specification;
    }
}

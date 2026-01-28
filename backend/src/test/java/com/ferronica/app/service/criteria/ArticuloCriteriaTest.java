package com.ferronica.app.service.criteria;

import static org.assertj.core.api.Assertions.assertThat;

import java.util.Objects;
import java.util.function.BiFunction;
import java.util.function.Function;
import org.assertj.core.api.Condition;
import org.junit.jupiter.api.Test;

class ArticuloCriteriaTest {

    @Test
    void newArticuloCriteriaHasAllFiltersNullTest() {
        var articuloCriteria = new ArticuloCriteria();
        assertThat(articuloCriteria).is(criteriaFiltersAre(Objects::isNull));
    }

    @Test
    void articuloCriteriaFluentMethodsCreatesFiltersTest() {
        var articuloCriteria = new ArticuloCriteria();

        setAllFilters(articuloCriteria);

        assertThat(articuloCriteria).is(criteriaFiltersAre(Objects::nonNull));
    }

    @Test
    void articuloCriteriaCopyCreatesNullFilterTest() {
        var articuloCriteria = new ArticuloCriteria();
        var copy = articuloCriteria.copy();

        assertThat(articuloCriteria).satisfies(
            criteria ->
                assertThat(criteria).is(
                    copyFiltersAre(copy, (a, b) -> (a == null || a instanceof Boolean) ? a == b : (a != b && a.equals(b)))
                ),
            criteria -> assertThat(criteria).isEqualTo(copy),
            criteria -> assertThat(criteria).hasSameHashCodeAs(copy)
        );

        assertThat(copy).satisfies(
            criteria -> assertThat(criteria).is(criteriaFiltersAre(Objects::isNull)),
            criteria -> assertThat(criteria).isEqualTo(articuloCriteria)
        );
    }

    @Test
    void articuloCriteriaCopyDuplicatesEveryExistingFilterTest() {
        var articuloCriteria = new ArticuloCriteria();
        setAllFilters(articuloCriteria);

        var copy = articuloCriteria.copy();

        assertThat(articuloCriteria).satisfies(
            criteria ->
                assertThat(criteria).is(
                    copyFiltersAre(copy, (a, b) -> (a == null || a instanceof Boolean) ? a == b : (a != b && a.equals(b)))
                ),
            criteria -> assertThat(criteria).isEqualTo(copy),
            criteria -> assertThat(criteria).hasSameHashCodeAs(copy)
        );

        assertThat(copy).satisfies(
            criteria -> assertThat(criteria).is(criteriaFiltersAre(Objects::nonNull)),
            criteria -> assertThat(criteria).isEqualTo(articuloCriteria)
        );
    }

    @Test
    void toStringVerifier() {
        var articuloCriteria = new ArticuloCriteria();

        assertThat(articuloCriteria).hasToString("ArticuloCriteria{}");
    }

    private static void setAllFilters(ArticuloCriteria articuloCriteria) {
        articuloCriteria.id();
        articuloCriteria.codigo();
        articuloCriteria.nombre();
        articuloCriteria.descripcion();
        articuloCriteria.existencia();
        articuloCriteria.existenciaMinima();
        articuloCriteria.precio();
        articuloCriteria.costo();
        articuloCriteria.activo();
        articuloCriteria.categoriaId();
        articuloCriteria.unidadMedidaId();
        articuloCriteria.distinct();
    }

    private static Condition<ArticuloCriteria> criteriaFiltersAre(Function<Object, Boolean> condition) {
        return new Condition<>(
            criteria ->
                condition.apply(criteria.getId()) &&
                condition.apply(criteria.getCodigo()) &&
                condition.apply(criteria.getNombre()) &&
                condition.apply(criteria.getDescripcion()) &&
                condition.apply(criteria.getExistencia()) &&
                condition.apply(criteria.getExistenciaMinima()) &&
                condition.apply(criteria.getPrecio()) &&
                condition.apply(criteria.getCosto()) &&
                condition.apply(criteria.getActivo()) &&
                condition.apply(criteria.getCategoriaId()) &&
                condition.apply(criteria.getUnidadMedidaId()) &&
                condition.apply(criteria.getDistinct()),
            "every filter matches"
        );
    }

    private static Condition<ArticuloCriteria> copyFiltersAre(ArticuloCriteria copy, BiFunction<Object, Object, Boolean> condition) {
        return new Condition<>(
            criteria ->
                condition.apply(criteria.getId(), copy.getId()) &&
                condition.apply(criteria.getCodigo(), copy.getCodigo()) &&
                condition.apply(criteria.getNombre(), copy.getNombre()) &&
                condition.apply(criteria.getDescripcion(), copy.getDescripcion()) &&
                condition.apply(criteria.getExistencia(), copy.getExistencia()) &&
                condition.apply(criteria.getExistenciaMinima(), copy.getExistenciaMinima()) &&
                condition.apply(criteria.getPrecio(), copy.getPrecio()) &&
                condition.apply(criteria.getCosto(), copy.getCosto()) &&
                condition.apply(criteria.getActivo(), copy.getActivo()) &&
                condition.apply(criteria.getCategoriaId(), copy.getCategoriaId()) &&
                condition.apply(criteria.getUnidadMedidaId(), copy.getUnidadMedidaId()) &&
                condition.apply(criteria.getDistinct(), copy.getDistinct()),
            "every filter matches"
        );
    }
}

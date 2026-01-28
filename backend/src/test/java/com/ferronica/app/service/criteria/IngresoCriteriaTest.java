package com.ferronica.app.service.criteria;

import static org.assertj.core.api.Assertions.assertThat;

import java.util.Objects;
import java.util.function.BiFunction;
import java.util.function.Function;
import org.assertj.core.api.Condition;
import org.junit.jupiter.api.Test;

class IngresoCriteriaTest {

    @Test
    void newIngresoCriteriaHasAllFiltersNullTest() {
        var ingresoCriteria = new IngresoCriteria();
        assertThat(ingresoCriteria).is(criteriaFiltersAre(Objects::isNull));
    }

    @Test
    void ingresoCriteriaFluentMethodsCreatesFiltersTest() {
        var ingresoCriteria = new IngresoCriteria();

        setAllFilters(ingresoCriteria);

        assertThat(ingresoCriteria).is(criteriaFiltersAre(Objects::nonNull));
    }

    @Test
    void ingresoCriteriaCopyCreatesNullFilterTest() {
        var ingresoCriteria = new IngresoCriteria();
        var copy = ingresoCriteria.copy();

        assertThat(ingresoCriteria).satisfies(
            criteria ->
                assertThat(criteria).is(
                    copyFiltersAre(copy, (a, b) -> (a == null || a instanceof Boolean) ? a == b : (a != b && a.equals(b)))
                ),
            criteria -> assertThat(criteria).isEqualTo(copy),
            criteria -> assertThat(criteria).hasSameHashCodeAs(copy)
        );

        assertThat(copy).satisfies(
            criteria -> assertThat(criteria).is(criteriaFiltersAre(Objects::isNull)),
            criteria -> assertThat(criteria).isEqualTo(ingresoCriteria)
        );
    }

    @Test
    void ingresoCriteriaCopyDuplicatesEveryExistingFilterTest() {
        var ingresoCriteria = new IngresoCriteria();
        setAllFilters(ingresoCriteria);

        var copy = ingresoCriteria.copy();

        assertThat(ingresoCriteria).satisfies(
            criteria ->
                assertThat(criteria).is(
                    copyFiltersAre(copy, (a, b) -> (a == null || a instanceof Boolean) ? a == b : (a != b && a.equals(b)))
                ),
            criteria -> assertThat(criteria).isEqualTo(copy),
            criteria -> assertThat(criteria).hasSameHashCodeAs(copy)
        );

        assertThat(copy).satisfies(
            criteria -> assertThat(criteria).is(criteriaFiltersAre(Objects::nonNull)),
            criteria -> assertThat(criteria).isEqualTo(ingresoCriteria)
        );
    }

    @Test
    void toStringVerifier() {
        var ingresoCriteria = new IngresoCriteria();

        assertThat(ingresoCriteria).hasToString("IngresoCriteria{}");
    }

    private static void setAllFilters(IngresoCriteria ingresoCriteria) {
        ingresoCriteria.id();
        ingresoCriteria.fecha();
        ingresoCriteria.noDocumento();
        ingresoCriteria.total();
        ingresoCriteria.observaciones();
        ingresoCriteria.activo();
        ingresoCriteria.detallesId();
        ingresoCriteria.vendedorId();
        ingresoCriteria.proveedorId();
        ingresoCriteria.distinct();
    }

    private static Condition<IngresoCriteria> criteriaFiltersAre(Function<Object, Boolean> condition) {
        return new Condition<>(
            criteria ->
                condition.apply(criteria.getId()) &&
                condition.apply(criteria.getFecha()) &&
                condition.apply(criteria.getNoDocumento()) &&
                condition.apply(criteria.getTotal()) &&
                condition.apply(criteria.getObservaciones()) &&
                condition.apply(criteria.getActivo()) &&
                condition.apply(criteria.getDetallesId()) &&
                condition.apply(criteria.getVendedorId()) &&
                condition.apply(criteria.getProveedorId()) &&
                condition.apply(criteria.getDistinct()),
            "every filter matches"
        );
    }

    private static Condition<IngresoCriteria> copyFiltersAre(IngresoCriteria copy, BiFunction<Object, Object, Boolean> condition) {
        return new Condition<>(
            criteria ->
                condition.apply(criteria.getId(), copy.getId()) &&
                condition.apply(criteria.getFecha(), copy.getFecha()) &&
                condition.apply(criteria.getNoDocumento(), copy.getNoDocumento()) &&
                condition.apply(criteria.getTotal(), copy.getTotal()) &&
                condition.apply(criteria.getObservaciones(), copy.getObservaciones()) &&
                condition.apply(criteria.getActivo(), copy.getActivo()) &&
                condition.apply(criteria.getDetallesId(), copy.getDetallesId()) &&
                condition.apply(criteria.getVendedorId(), copy.getVendedorId()) &&
                condition.apply(criteria.getProveedorId(), copy.getProveedorId()) &&
                condition.apply(criteria.getDistinct(), copy.getDistinct()),
            "every filter matches"
        );
    }
}

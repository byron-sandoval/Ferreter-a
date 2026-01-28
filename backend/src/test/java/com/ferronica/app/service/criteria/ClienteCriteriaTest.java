package com.ferronica.app.service.criteria;

import static org.assertj.core.api.Assertions.assertThat;

import java.util.Objects;
import java.util.function.BiFunction;
import java.util.function.Function;
import org.assertj.core.api.Condition;
import org.junit.jupiter.api.Test;

class ClienteCriteriaTest {

    @Test
    void newClienteCriteriaHasAllFiltersNullTest() {
        var clienteCriteria = new ClienteCriteria();
        assertThat(clienteCriteria).is(criteriaFiltersAre(Objects::isNull));
    }

    @Test
    void clienteCriteriaFluentMethodsCreatesFiltersTest() {
        var clienteCriteria = new ClienteCriteria();

        setAllFilters(clienteCriteria);

        assertThat(clienteCriteria).is(criteriaFiltersAre(Objects::nonNull));
    }

    @Test
    void clienteCriteriaCopyCreatesNullFilterTest() {
        var clienteCriteria = new ClienteCriteria();
        var copy = clienteCriteria.copy();

        assertThat(clienteCriteria).satisfies(
            criteria ->
                assertThat(criteria).is(
                    copyFiltersAre(copy, (a, b) -> (a == null || a instanceof Boolean) ? a == b : (a != b && a.equals(b)))
                ),
            criteria -> assertThat(criteria).isEqualTo(copy),
            criteria -> assertThat(criteria).hasSameHashCodeAs(copy)
        );

        assertThat(copy).satisfies(
            criteria -> assertThat(criteria).is(criteriaFiltersAre(Objects::isNull)),
            criteria -> assertThat(criteria).isEqualTo(clienteCriteria)
        );
    }

    @Test
    void clienteCriteriaCopyDuplicatesEveryExistingFilterTest() {
        var clienteCriteria = new ClienteCriteria();
        setAllFilters(clienteCriteria);

        var copy = clienteCriteria.copy();

        assertThat(clienteCriteria).satisfies(
            criteria ->
                assertThat(criteria).is(
                    copyFiltersAre(copy, (a, b) -> (a == null || a instanceof Boolean) ? a == b : (a != b && a.equals(b)))
                ),
            criteria -> assertThat(criteria).isEqualTo(copy),
            criteria -> assertThat(criteria).hasSameHashCodeAs(copy)
        );

        assertThat(copy).satisfies(
            criteria -> assertThat(criteria).is(criteriaFiltersAre(Objects::nonNull)),
            criteria -> assertThat(criteria).isEqualTo(clienteCriteria)
        );
    }

    @Test
    void toStringVerifier() {
        var clienteCriteria = new ClienteCriteria();

        assertThat(clienteCriteria).hasToString("ClienteCriteria{}");
    }

    private static void setAllFilters(ClienteCriteria clienteCriteria) {
        clienteCriteria.id();
        clienteCriteria.cedula();
        clienteCriteria.nombre();
        clienteCriteria.genero();
        clienteCriteria.direccion();
        clienteCriteria.telefono();
        clienteCriteria.saldo();
        clienteCriteria.activo();
        clienteCriteria.distinct();
    }

    private static Condition<ClienteCriteria> criteriaFiltersAre(Function<Object, Boolean> condition) {
        return new Condition<>(
            criteria ->
                condition.apply(criteria.getId()) &&
                condition.apply(criteria.getCedula()) &&
                condition.apply(criteria.getNombre()) &&
                condition.apply(criteria.getGenero()) &&
                condition.apply(criteria.getDireccion()) &&
                condition.apply(criteria.getTelefono()) &&
                condition.apply(criteria.getSaldo()) &&
                condition.apply(criteria.getActivo()) &&
                condition.apply(criteria.getDistinct()),
            "every filter matches"
        );
    }

    private static Condition<ClienteCriteria> copyFiltersAre(ClienteCriteria copy, BiFunction<Object, Object, Boolean> condition) {
        return new Condition<>(
            criteria ->
                condition.apply(criteria.getId(), copy.getId()) &&
                condition.apply(criteria.getCedula(), copy.getCedula()) &&
                condition.apply(criteria.getNombre(), copy.getNombre()) &&
                condition.apply(criteria.getGenero(), copy.getGenero()) &&
                condition.apply(criteria.getDireccion(), copy.getDireccion()) &&
                condition.apply(criteria.getTelefono(), copy.getTelefono()) &&
                condition.apply(criteria.getSaldo(), copy.getSaldo()) &&
                condition.apply(criteria.getActivo(), copy.getActivo()) &&
                condition.apply(criteria.getDistinct(), copy.getDistinct()),
            "every filter matches"
        );
    }
}

package com.ferronica.app.service.criteria;

import static org.assertj.core.api.Assertions.assertThat;

import java.util.Objects;
import java.util.function.BiFunction;
import java.util.function.Function;
import org.assertj.core.api.Condition;
import org.junit.jupiter.api.Test;

class VentaCriteriaTest {

    @Test
    void newVentaCriteriaHasAllFiltersNullTest() {
        var ventaCriteria = new VentaCriteria();
        assertThat(ventaCriteria).is(criteriaFiltersAre(Objects::isNull));
    }

    @Test
    void ventaCriteriaFluentMethodsCreatesFiltersTest() {
        var ventaCriteria = new VentaCriteria();

        setAllFilters(ventaCriteria);

        assertThat(ventaCriteria).is(criteriaFiltersAre(Objects::nonNull));
    }

    @Test
    void ventaCriteriaCopyCreatesNullFilterTest() {
        var ventaCriteria = new VentaCriteria();
        var copy = ventaCriteria.copy();

        assertThat(ventaCriteria).satisfies(
            criteria ->
                assertThat(criteria).is(
                    copyFiltersAre(copy, (a, b) -> (a == null || a instanceof Boolean) ? a == b : (a != b && a.equals(b)))
                ),
            criteria -> assertThat(criteria).isEqualTo(copy),
            criteria -> assertThat(criteria).hasSameHashCodeAs(copy)
        );

        assertThat(copy).satisfies(
            criteria -> assertThat(criteria).is(criteriaFiltersAre(Objects::isNull)),
            criteria -> assertThat(criteria).isEqualTo(ventaCriteria)
        );
    }

    @Test
    void ventaCriteriaCopyDuplicatesEveryExistingFilterTest() {
        var ventaCriteria = new VentaCriteria();
        setAllFilters(ventaCriteria);

        var copy = ventaCriteria.copy();

        assertThat(ventaCriteria).satisfies(
            criteria ->
                assertThat(criteria).is(
                    copyFiltersAre(copy, (a, b) -> (a == null || a instanceof Boolean) ? a == b : (a != b && a.equals(b)))
                ),
            criteria -> assertThat(criteria).isEqualTo(copy),
            criteria -> assertThat(criteria).hasSameHashCodeAs(copy)
        );

        assertThat(copy).satisfies(
            criteria -> assertThat(criteria).is(criteriaFiltersAre(Objects::nonNull)),
            criteria -> assertThat(criteria).isEqualTo(ventaCriteria)
        );
    }

    @Test
    void toStringVerifier() {
        var ventaCriteria = new VentaCriteria();

        assertThat(ventaCriteria).hasToString("VentaCriteria{}");
    }

    private static void setAllFilters(VentaCriteria ventaCriteria) {
        ventaCriteria.id();
        ventaCriteria.fecha();
        ventaCriteria.noFactura();
        ventaCriteria.subtotal();
        ventaCriteria.iva();
        ventaCriteria.total();
        ventaCriteria.totalEnMonedaBase();
        ventaCriteria.metodoPago();
        ventaCriteria.stripeId();
        ventaCriteria.esContado();
        ventaCriteria.tipoCambioVenta();
        ventaCriteria.anulada();
        ventaCriteria.detallesId();
        ventaCriteria.clienteId();
        ventaCriteria.vendedorId();
        ventaCriteria.monedaId();
        ventaCriteria.numeracionId();
        ventaCriteria.distinct();
    }

    private static Condition<VentaCriteria> criteriaFiltersAre(Function<Object, Boolean> condition) {
        return new Condition<>(
            criteria ->
                condition.apply(criteria.getId()) &&
                condition.apply(criteria.getFecha()) &&
                condition.apply(criteria.getNoFactura()) &&
                condition.apply(criteria.getSubtotal()) &&
                condition.apply(criteria.getIva()) &&
                condition.apply(criteria.getTotal()) &&
                condition.apply(criteria.getTotalEnMonedaBase()) &&
                condition.apply(criteria.getMetodoPago()) &&
                condition.apply(criteria.getStripeId()) &&
                condition.apply(criteria.getEsContado()) &&
                condition.apply(criteria.getTipoCambioVenta()) &&
                condition.apply(criteria.getAnulada()) &&
                condition.apply(criteria.getDetallesId()) &&
                condition.apply(criteria.getClienteId()) &&
                condition.apply(criteria.getVendedorId()) &&
                condition.apply(criteria.getMonedaId()) &&
                condition.apply(criteria.getNumeracionId()) &&
                condition.apply(criteria.getDistinct()),
            "every filter matches"
        );
    }

    private static Condition<VentaCriteria> copyFiltersAre(VentaCriteria copy, BiFunction<Object, Object, Boolean> condition) {
        return new Condition<>(
            criteria ->
                condition.apply(criteria.getId(), copy.getId()) &&
                condition.apply(criteria.getFecha(), copy.getFecha()) &&
                condition.apply(criteria.getNoFactura(), copy.getNoFactura()) &&
                condition.apply(criteria.getSubtotal(), copy.getSubtotal()) &&
                condition.apply(criteria.getIva(), copy.getIva()) &&
                condition.apply(criteria.getTotal(), copy.getTotal()) &&
                condition.apply(criteria.getTotalEnMonedaBase(), copy.getTotalEnMonedaBase()) &&
                condition.apply(criteria.getMetodoPago(), copy.getMetodoPago()) &&
                condition.apply(criteria.getStripeId(), copy.getStripeId()) &&
                condition.apply(criteria.getEsContado(), copy.getEsContado()) &&
                condition.apply(criteria.getTipoCambioVenta(), copy.getTipoCambioVenta()) &&
                condition.apply(criteria.getAnulada(), copy.getAnulada()) &&
                condition.apply(criteria.getDetallesId(), copy.getDetallesId()) &&
                condition.apply(criteria.getClienteId(), copy.getClienteId()) &&
                condition.apply(criteria.getVendedorId(), copy.getVendedorId()) &&
                condition.apply(criteria.getMonedaId(), copy.getMonedaId()) &&
                condition.apply(criteria.getNumeracionId(), copy.getNumeracionId()) &&
                condition.apply(criteria.getDistinct(), copy.getDistinct()),
            "every filter matches"
        );
    }
}

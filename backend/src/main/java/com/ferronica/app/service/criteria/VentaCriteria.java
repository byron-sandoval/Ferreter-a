package com.ferronica.app.service.criteria;

import com.ferronica.app.domain.enumeration.MetodoPagoEnum;
import java.io.Serializable;
import java.util.Objects;
import java.util.Optional;
import org.springdoc.core.annotations.ParameterObject;
import tech.jhipster.service.Criteria;
import tech.jhipster.service.filter.*;

/**
 * Criteria class for the {@link com.ferronica.app.domain.Venta} entity. This
 * class is used
 * in {@link com.ferronica.app.web.rest.VentaResource} to receive all the
 * possible filtering options from
 * the Http GET request parameters.
 * For example the following could be a valid request:
 * {@code /ventas?id.greaterThan=5&attr1.contains=something&attr2.specified=false}
 * As Spring is unable to properly convert the types, unless specific
 * {@link Filter} class are used, we need to use
 * fix type specific filters.
 */
@ParameterObject
@SuppressWarnings("common-java:DuplicatedBlocks")
public class VentaCriteria implements Serializable, Criteria {

    /**
     * Class for filtering MetodoPagoEnum
     */
    public static class MetodoPagoEnumFilter extends Filter<MetodoPagoEnum> {

        public MetodoPagoEnumFilter() {
        }

        public MetodoPagoEnumFilter(MetodoPagoEnumFilter filter) {
            super(filter);
        }

        @Override
        public MetodoPagoEnumFilter copy() {
            return new MetodoPagoEnumFilter(this);
        }
    }

    private static final long serialVersionUID = 1L;

    private LongFilter id;

    private InstantFilter fecha;

    private LongFilter noFactura;

    private BigDecimalFilter subtotal;

    private BigDecimalFilter iva;

    private BigDecimalFilter total;

    private BigDecimalFilter totalEnMonedaBase;

    private MetodoPagoEnumFilter metodoPago;

    private StringFilter stripeId;

    private BooleanFilter esContado;

    private BigDecimalFilter tipoCambioVenta;

    private BooleanFilter anulada;

    private LongFilter detallesId;

    private LongFilter clienteId;

    private LongFilter usuarioId;

    private LongFilter monedaId;

    private LongFilter numeracionId;

    private Boolean distinct;

    public VentaCriteria() {
    }

    public VentaCriteria(VentaCriteria other) {
        this.id = other.optionalId().map(LongFilter::copy).orElse(null);
        this.fecha = other.optionalFecha().map(InstantFilter::copy).orElse(null);
        this.noFactura = other.optionalNoFactura().map(LongFilter::copy).orElse(null);
        this.subtotal = other.optionalSubtotal().map(BigDecimalFilter::copy).orElse(null);
        this.iva = other.optionalIva().map(BigDecimalFilter::copy).orElse(null);
        this.total = other.optionalTotal().map(BigDecimalFilter::copy).orElse(null);
        this.totalEnMonedaBase = other.optionalTotalEnMonedaBase().map(BigDecimalFilter::copy).orElse(null);
        this.metodoPago = other.optionalMetodoPago().map(MetodoPagoEnumFilter::copy).orElse(null);
        this.stripeId = other.optionalStripeId().map(StringFilter::copy).orElse(null);
        this.esContado = other.optionalEsContado().map(BooleanFilter::copy).orElse(null);
        this.tipoCambioVenta = other.optionalTipoCambioVenta().map(BigDecimalFilter::copy).orElse(null);
        this.anulada = other.optionalAnulada().map(BooleanFilter::copy).orElse(null);
        this.detallesId = other.optionalDetallesId().map(LongFilter::copy).orElse(null);
        this.clienteId = other.optionalClienteId().map(LongFilter::copy).orElse(null);
        this.usuarioId = other.optionalUsuarioId().map(LongFilter::copy).orElse(null);
        this.monedaId = other.optionalMonedaId().map(LongFilter::copy).orElse(null);
        this.numeracionId = other.optionalNumeracionId().map(LongFilter::copy).orElse(null);
        this.distinct = other.distinct;
    }

    @Override
    public VentaCriteria copy() {
        return new VentaCriteria(this);
    }

    public LongFilter getId() {
        return id;
    }

    public Optional<LongFilter> optionalId() {
        return Optional.ofNullable(id);
    }

    public LongFilter id() {
        if (id == null) {
            setId(new LongFilter());
        }
        return id;
    }

    public void setId(LongFilter id) {
        this.id = id;
    }

    public InstantFilter getFecha() {
        return fecha;
    }

    public Optional<InstantFilter> optionalFecha() {
        return Optional.ofNullable(fecha);
    }

    public InstantFilter fecha() {
        if (fecha == null) {
            setFecha(new InstantFilter());
        }
        return fecha;
    }

    public void setFecha(InstantFilter fecha) {
        this.fecha = fecha;
    }

    public LongFilter getNoFactura() {
        return noFactura;
    }

    public Optional<LongFilter> optionalNoFactura() {
        return Optional.ofNullable(noFactura);
    }

    public LongFilter noFactura() {
        if (noFactura == null) {
            setNoFactura(new LongFilter());
        }
        return noFactura;
    }

    public void setNoFactura(LongFilter noFactura) {
        this.noFactura = noFactura;
    }

    public BigDecimalFilter getSubtotal() {
        return subtotal;
    }

    public Optional<BigDecimalFilter> optionalSubtotal() {
        return Optional.ofNullable(subtotal);
    }

    public BigDecimalFilter subtotal() {
        if (subtotal == null) {
            setSubtotal(new BigDecimalFilter());
        }
        return subtotal;
    }

    public void setSubtotal(BigDecimalFilter subtotal) {
        this.subtotal = subtotal;
    }

    public BigDecimalFilter getIva() {
        return iva;
    }

    public Optional<BigDecimalFilter> optionalIva() {
        return Optional.ofNullable(iva);
    }

    public BigDecimalFilter iva() {
        if (iva == null) {
            setIva(new BigDecimalFilter());
        }
        return iva;
    }

    public void setIva(BigDecimalFilter iva) {
        this.iva = iva;
    }

    public BigDecimalFilter getTotal() {
        return total;
    }

    public Optional<BigDecimalFilter> optionalTotal() {
        return Optional.ofNullable(total);
    }

    public BigDecimalFilter total() {
        if (total == null) {
            setTotal(new BigDecimalFilter());
        }
        return total;
    }

    public void setTotal(BigDecimalFilter total) {
        this.total = total;
    }

    public BigDecimalFilter getTotalEnMonedaBase() {
        return totalEnMonedaBase;
    }

    public Optional<BigDecimalFilter> optionalTotalEnMonedaBase() {
        return Optional.ofNullable(totalEnMonedaBase);
    }

    public BigDecimalFilter totalEnMonedaBase() {
        if (totalEnMonedaBase == null) {
            setTotalEnMonedaBase(new BigDecimalFilter());
        }
        return totalEnMonedaBase;
    }

    public void setTotalEnMonedaBase(BigDecimalFilter totalEnMonedaBase) {
        this.totalEnMonedaBase = totalEnMonedaBase;
    }

    public MetodoPagoEnumFilter getMetodoPago() {
        return metodoPago;
    }

    public Optional<MetodoPagoEnumFilter> optionalMetodoPago() {
        return Optional.ofNullable(metodoPago);
    }

    public MetodoPagoEnumFilter metodoPago() {
        if (metodoPago == null) {
            setMetodoPago(new MetodoPagoEnumFilter());
        }
        return metodoPago;
    }

    public void setMetodoPago(MetodoPagoEnumFilter metodoPago) {
        this.metodoPago = metodoPago;
    }

    public StringFilter getStripeId() {
        return stripeId;
    }

    public Optional<StringFilter> optionalStripeId() {
        return Optional.ofNullable(stripeId);
    }

    public StringFilter stripeId() {
        if (stripeId == null) {
            setStripeId(new StringFilter());
        }
        return stripeId;
    }

    public void setStripeId(StringFilter stripeId) {
        this.stripeId = stripeId;
    }

    public BooleanFilter getEsContado() {
        return esContado;
    }

    public Optional<BooleanFilter> optionalEsContado() {
        return Optional.ofNullable(esContado);
    }

    public BooleanFilter esContado() {
        if (esContado == null) {
            setEsContado(new BooleanFilter());
        }
        return esContado;
    }

    public void setEsContado(BooleanFilter esContado) {
        this.esContado = esContado;
    }

    public BigDecimalFilter getTipoCambioVenta() {
        return tipoCambioVenta;
    }

    public Optional<BigDecimalFilter> optionalTipoCambioVenta() {
        return Optional.ofNullable(tipoCambioVenta);
    }

    public BigDecimalFilter tipoCambioVenta() {
        if (tipoCambioVenta == null) {
            setTipoCambioVenta(new BigDecimalFilter());
        }
        return tipoCambioVenta;
    }

    public void setTipoCambioVenta(BigDecimalFilter tipoCambioVenta) {
        this.tipoCambioVenta = tipoCambioVenta;
    }

    public BooleanFilter getAnulada() {
        return anulada;
    }

    public Optional<BooleanFilter> optionalAnulada() {
        return Optional.ofNullable(anulada);
    }

    public BooleanFilter anulada() {
        if (anulada == null) {
            setAnulada(new BooleanFilter());
        }
        return anulada;
    }

    public void setAnulada(BooleanFilter anulada) {
        this.anulada = anulada;
    }

    public LongFilter getDetallesId() {
        return detallesId;
    }

    public Optional<LongFilter> optionalDetallesId() {
        return Optional.ofNullable(detallesId);
    }

    public LongFilter detallesId() {
        if (detallesId == null) {
            setDetallesId(new LongFilter());
        }
        return detallesId;
    }

    public void setDetallesId(LongFilter detallesId) {
        this.detallesId = detallesId;
    }

    public LongFilter getClienteId() {
        return clienteId;
    }

    public Optional<LongFilter> optionalClienteId() {
        return Optional.ofNullable(clienteId);
    }

    public LongFilter clienteId() {
        if (clienteId == null) {
            setClienteId(new LongFilter());
        }
        return clienteId;
    }

    public void setClienteId(LongFilter clienteId) {
        this.clienteId = clienteId;
    }

    public LongFilter getUsuarioId() {
        return usuarioId;
    }

    public Optional<LongFilter> optionalUsuarioId() {
        return Optional.ofNullable(usuarioId);
    }

    public LongFilter usuarioId() {
        if (usuarioId == null) {
            setUsuarioId(new LongFilter());
        }
        return usuarioId;
    }

    public void setUsuarioId(LongFilter usuarioId) {
        this.usuarioId = usuarioId;
    }

    public LongFilter getMonedaId() {
        return monedaId;
    }

    public Optional<LongFilter> optionalMonedaId() {
        return Optional.ofNullable(monedaId);
    }

    public LongFilter monedaId() {
        if (monedaId == null) {
            setMonedaId(new LongFilter());
        }
        return monedaId;
    }

    public void setMonedaId(LongFilter monedaId) {
        this.monedaId = monedaId;
    }

    public LongFilter getNumeracionId() {
        return numeracionId;
    }

    public Optional<LongFilter> optionalNumeracionId() {
        return Optional.ofNullable(numeracionId);
    }

    public LongFilter numeracionId() {
        if (numeracionId == null) {
            setNumeracionId(new LongFilter());
        }
        return numeracionId;
    }

    public void setNumeracionId(LongFilter numeracionId) {
        this.numeracionId = numeracionId;
    }

    public Boolean getDistinct() {
        return distinct;
    }

    public Optional<Boolean> optionalDistinct() {
        return Optional.ofNullable(distinct);
    }

    public Boolean distinct() {
        if (distinct == null) {
            setDistinct(true);
        }
        return distinct;
    }

    public void setDistinct(Boolean distinct) {
        this.distinct = distinct;
    }

    @Override
    public boolean equals(Object o) {
        if (this == o) {
            return true;
        }
        if (o == null || getClass() != o.getClass()) {
            return false;
        }
        final VentaCriteria that = (VentaCriteria) o;
        return (Objects.equals(id, that.id) &&
                Objects.equals(fecha, that.fecha) &&
                Objects.equals(noFactura, that.noFactura) &&
                Objects.equals(subtotal, that.subtotal) &&
                Objects.equals(iva, that.iva) &&
                Objects.equals(total, that.total) &&
                Objects.equals(totalEnMonedaBase, that.totalEnMonedaBase) &&
                Objects.equals(metodoPago, that.metodoPago) &&
                Objects.equals(stripeId, that.stripeId) &&
                Objects.equals(esContado, that.esContado) &&
                Objects.equals(tipoCambioVenta, that.tipoCambioVenta) &&
                Objects.equals(anulada, that.anulada) &&
                Objects.equals(detallesId, that.detallesId) &&
                Objects.equals(clienteId, that.clienteId) &&
                Objects.equals(usuarioId, that.usuarioId) &&
                Objects.equals(monedaId, that.monedaId) &&
                Objects.equals(numeracionId, that.numeracionId) &&
                Objects.equals(distinct, that.distinct));
    }

    @Override
    public int hashCode() {
        return Objects.hash(
                id,
                fecha,
                noFactura,
                subtotal,
                iva,
                total,
                totalEnMonedaBase,
                metodoPago,
                stripeId,
                esContado,
                tipoCambioVenta,
                anulada,
                detallesId,
                clienteId,
                usuarioId,
                monedaId,
                numeracionId,
                distinct);
    }

    // prettier-ignore
    @Override
    public String toString() {
        return "VentaCriteria{" +
                optionalId().map(f -> "id=" + f + ", ").orElse("") +
                optionalFecha().map(f -> "fecha=" + f + ", ").orElse("") +
                optionalNoFactura().map(f -> "noFactura=" + f + ", ").orElse("") +
                optionalSubtotal().map(f -> "subtotal=" + f + ", ").orElse("") +
                optionalIva().map(f -> "iva=" + f + ", ").orElse("") +
                optionalTotal().map(f -> "total=" + f + ", ").orElse("") +
                optionalTotalEnMonedaBase().map(f -> "totalEnMonedaBase=" + f + ", ").orElse("") +
                optionalMetodoPago().map(f -> "metodoPago=" + f + ", ").orElse("") +
                optionalStripeId().map(f -> "stripeId=" + f + ", ").orElse("") +
                optionalEsContado().map(f -> "esContado=" + f + ", ").orElse("") +
                optionalTipoCambioVenta().map(f -> "tipoCambioVenta=" + f + ", ").orElse("") +
                optionalAnulada().map(f -> "anulada=" + f + ", ").orElse("") +
                optionalDetallesId().map(f -> "detallesId=" + f + ", ").orElse("") +
                optionalClienteId().map(f -> "clienteId=" + f + ", ").orElse("") +
                optionalUsuarioId().map(f -> "usuarioId=" + f + ", ").orElse("") +
                optionalMonedaId().map(f -> "monedaId=" + f + ", ").orElse("") +
                optionalNumeracionId().map(f -> "numeracionId=" + f + ", ").orElse("") +
                optionalDistinct().map(f -> "distinct=" + f + ", ").orElse("") +
                "}";
    }
}

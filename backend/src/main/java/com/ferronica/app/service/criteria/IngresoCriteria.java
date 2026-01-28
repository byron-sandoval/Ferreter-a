package com.ferronica.app.service.criteria;

import java.io.Serializable;
import java.util.Objects;
import java.util.Optional;
import org.springdoc.core.annotations.ParameterObject;
import tech.jhipster.service.Criteria;
import tech.jhipster.service.filter.*;

/**
 * Criteria class for the {@link com.ferronica.app.domain.Ingreso} entity. This class is used
 * in {@link com.ferronica.app.web.rest.IngresoResource} to receive all the possible filtering options from
 * the Http GET request parameters.
 * For example the following could be a valid request:
 * {@code /ingresos?id.greaterThan=5&attr1.contains=something&attr2.specified=false}
 * As Spring is unable to properly convert the types, unless specific {@link Filter} class are used, we need to use
 * fix type specific filters.
 */
@ParameterObject
@SuppressWarnings("common-java:DuplicatedBlocks")
public class IngresoCriteria implements Serializable, Criteria {

    private static final long serialVersionUID = 1L;

    private LongFilter id;

    private InstantFilter fecha;

    private StringFilter noDocumento;

    private BigDecimalFilter total;

    private StringFilter observaciones;

    private BooleanFilter activo;

    private LongFilter detallesId;

    private LongFilter vendedorId;

    private LongFilter proveedorId;

    private Boolean distinct;

    public IngresoCriteria() {}

    public IngresoCriteria(IngresoCriteria other) {
        this.id = other.optionalId().map(LongFilter::copy).orElse(null);
        this.fecha = other.optionalFecha().map(InstantFilter::copy).orElse(null);
        this.noDocumento = other.optionalNoDocumento().map(StringFilter::copy).orElse(null);
        this.total = other.optionalTotal().map(BigDecimalFilter::copy).orElse(null);
        this.observaciones = other.optionalObservaciones().map(StringFilter::copy).orElse(null);
        this.activo = other.optionalActivo().map(BooleanFilter::copy).orElse(null);
        this.detallesId = other.optionalDetallesId().map(LongFilter::copy).orElse(null);
        this.vendedorId = other.optionalVendedorId().map(LongFilter::copy).orElse(null);
        this.proveedorId = other.optionalProveedorId().map(LongFilter::copy).orElse(null);
        this.distinct = other.distinct;
    }

    @Override
    public IngresoCriteria copy() {
        return new IngresoCriteria(this);
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

    public StringFilter getNoDocumento() {
        return noDocumento;
    }

    public Optional<StringFilter> optionalNoDocumento() {
        return Optional.ofNullable(noDocumento);
    }

    public StringFilter noDocumento() {
        if (noDocumento == null) {
            setNoDocumento(new StringFilter());
        }
        return noDocumento;
    }

    public void setNoDocumento(StringFilter noDocumento) {
        this.noDocumento = noDocumento;
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

    public StringFilter getObservaciones() {
        return observaciones;
    }

    public Optional<StringFilter> optionalObservaciones() {
        return Optional.ofNullable(observaciones);
    }

    public StringFilter observaciones() {
        if (observaciones == null) {
            setObservaciones(new StringFilter());
        }
        return observaciones;
    }

    public void setObservaciones(StringFilter observaciones) {
        this.observaciones = observaciones;
    }

    public BooleanFilter getActivo() {
        return activo;
    }

    public Optional<BooleanFilter> optionalActivo() {
        return Optional.ofNullable(activo);
    }

    public BooleanFilter activo() {
        if (activo == null) {
            setActivo(new BooleanFilter());
        }
        return activo;
    }

    public void setActivo(BooleanFilter activo) {
        this.activo = activo;
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

    public LongFilter getVendedorId() {
        return vendedorId;
    }

    public Optional<LongFilter> optionalVendedorId() {
        return Optional.ofNullable(vendedorId);
    }

    public LongFilter vendedorId() {
        if (vendedorId == null) {
            setVendedorId(new LongFilter());
        }
        return vendedorId;
    }

    public void setVendedorId(LongFilter vendedorId) {
        this.vendedorId = vendedorId;
    }

    public LongFilter getProveedorId() {
        return proveedorId;
    }

    public Optional<LongFilter> optionalProveedorId() {
        return Optional.ofNullable(proveedorId);
    }

    public LongFilter proveedorId() {
        if (proveedorId == null) {
            setProveedorId(new LongFilter());
        }
        return proveedorId;
    }

    public void setProveedorId(LongFilter proveedorId) {
        this.proveedorId = proveedorId;
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
        final IngresoCriteria that = (IngresoCriteria) o;
        return (
            Objects.equals(id, that.id) &&
            Objects.equals(fecha, that.fecha) &&
            Objects.equals(noDocumento, that.noDocumento) &&
            Objects.equals(total, that.total) &&
            Objects.equals(observaciones, that.observaciones) &&
            Objects.equals(activo, that.activo) &&
            Objects.equals(detallesId, that.detallesId) &&
            Objects.equals(vendedorId, that.vendedorId) &&
            Objects.equals(proveedorId, that.proveedorId) &&
            Objects.equals(distinct, that.distinct)
        );
    }

    @Override
    public int hashCode() {
        return Objects.hash(id, fecha, noDocumento, total, observaciones, activo, detallesId, vendedorId, proveedorId, distinct);
    }

    // prettier-ignore
    @Override
    public String toString() {
        return "IngresoCriteria{" +
            optionalId().map(f -> "id=" + f + ", ").orElse("") +
            optionalFecha().map(f -> "fecha=" + f + ", ").orElse("") +
            optionalNoDocumento().map(f -> "noDocumento=" + f + ", ").orElse("") +
            optionalTotal().map(f -> "total=" + f + ", ").orElse("") +
            optionalObservaciones().map(f -> "observaciones=" + f + ", ").orElse("") +
            optionalActivo().map(f -> "activo=" + f + ", ").orElse("") +
            optionalDetallesId().map(f -> "detallesId=" + f + ", ").orElse("") +
            optionalVendedorId().map(f -> "vendedorId=" + f + ", ").orElse("") +
            optionalProveedorId().map(f -> "proveedorId=" + f + ", ").orElse("") +
            optionalDistinct().map(f -> "distinct=" + f + ", ").orElse("") +
        "}";
    }
}

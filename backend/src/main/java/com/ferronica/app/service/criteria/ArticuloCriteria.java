package com.ferronica.app.service.criteria;

import java.io.Serializable;
import java.util.Objects;
import java.util.Optional;
import org.springdoc.core.annotations.ParameterObject;
import tech.jhipster.service.Criteria;
import tech.jhipster.service.filter.*;

/**
 * Criteria class for the {@link com.ferronica.app.domain.Articulo} entity. This class is used
 * in {@link com.ferronica.app.web.rest.ArticuloResource} to receive all the possible filtering options from
 * the Http GET request parameters.
 * For example the following could be a valid request:
 * {@code /articulos?id.greaterThan=5&attr1.contains=something&attr2.specified=false}
 * As Spring is unable to properly convert the types, unless specific {@link Filter} class are used, we need to use
 * fix type specific filters.
 */
@ParameterObject
@SuppressWarnings("common-java:DuplicatedBlocks")
public class ArticuloCriteria implements Serializable, Criteria {

    private static final long serialVersionUID = 1L;

    private LongFilter id;

    private StringFilter codigo;

    private StringFilter nombre;

    private StringFilter descripcion;

    private BigDecimalFilter existencia;

    private BigDecimalFilter existenciaMinima;

    private BigDecimalFilter precio;

    private BigDecimalFilter costo;

    private BooleanFilter activo;

    private LongFilter categoriaId;

    private LongFilter unidadMedidaId;

    private Boolean distinct;

    public ArticuloCriteria() {}

    public ArticuloCriteria(ArticuloCriteria other) {
        this.id = other.optionalId().map(LongFilter::copy).orElse(null);
        this.codigo = other.optionalCodigo().map(StringFilter::copy).orElse(null);
        this.nombre = other.optionalNombre().map(StringFilter::copy).orElse(null);
        this.descripcion = other.optionalDescripcion().map(StringFilter::copy).orElse(null);
        this.existencia = other.optionalExistencia().map(BigDecimalFilter::copy).orElse(null);
        this.existenciaMinima = other.optionalExistenciaMinima().map(BigDecimalFilter::copy).orElse(null);
        this.precio = other.optionalPrecio().map(BigDecimalFilter::copy).orElse(null);
        this.costo = other.optionalCosto().map(BigDecimalFilter::copy).orElse(null);
        this.activo = other.optionalActivo().map(BooleanFilter::copy).orElse(null);
        this.categoriaId = other.optionalCategoriaId().map(LongFilter::copy).orElse(null);
        this.unidadMedidaId = other.optionalUnidadMedidaId().map(LongFilter::copy).orElse(null);
        this.distinct = other.distinct;
    }

    @Override
    public ArticuloCriteria copy() {
        return new ArticuloCriteria(this);
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

    public StringFilter getCodigo() {
        return codigo;
    }

    public Optional<StringFilter> optionalCodigo() {
        return Optional.ofNullable(codigo);
    }

    public StringFilter codigo() {
        if (codigo == null) {
            setCodigo(new StringFilter());
        }
        return codigo;
    }

    public void setCodigo(StringFilter codigo) {
        this.codigo = codigo;
    }

    public StringFilter getNombre() {
        return nombre;
    }

    public Optional<StringFilter> optionalNombre() {
        return Optional.ofNullable(nombre);
    }

    public StringFilter nombre() {
        if (nombre == null) {
            setNombre(new StringFilter());
        }
        return nombre;
    }

    public void setNombre(StringFilter nombre) {
        this.nombre = nombre;
    }

    public StringFilter getDescripcion() {
        return descripcion;
    }

    public Optional<StringFilter> optionalDescripcion() {
        return Optional.ofNullable(descripcion);
    }

    public StringFilter descripcion() {
        if (descripcion == null) {
            setDescripcion(new StringFilter());
        }
        return descripcion;
    }

    public void setDescripcion(StringFilter descripcion) {
        this.descripcion = descripcion;
    }

    public BigDecimalFilter getExistencia() {
        return existencia;
    }

    public Optional<BigDecimalFilter> optionalExistencia() {
        return Optional.ofNullable(existencia);
    }

    public BigDecimalFilter existencia() {
        if (existencia == null) {
            setExistencia(new BigDecimalFilter());
        }
        return existencia;
    }

    public void setExistencia(BigDecimalFilter existencia) {
        this.existencia = existencia;
    }

    public BigDecimalFilter getExistenciaMinima() {
        return existenciaMinima;
    }

    public Optional<BigDecimalFilter> optionalExistenciaMinima() {
        return Optional.ofNullable(existenciaMinima);
    }

    public BigDecimalFilter existenciaMinima() {
        if (existenciaMinima == null) {
            setExistenciaMinima(new BigDecimalFilter());
        }
        return existenciaMinima;
    }

    public void setExistenciaMinima(BigDecimalFilter existenciaMinima) {
        this.existenciaMinima = existenciaMinima;
    }

    public BigDecimalFilter getPrecio() {
        return precio;
    }

    public Optional<BigDecimalFilter> optionalPrecio() {
        return Optional.ofNullable(precio);
    }

    public BigDecimalFilter precio() {
        if (precio == null) {
            setPrecio(new BigDecimalFilter());
        }
        return precio;
    }

    public void setPrecio(BigDecimalFilter precio) {
        this.precio = precio;
    }

    public BigDecimalFilter getCosto() {
        return costo;
    }

    public Optional<BigDecimalFilter> optionalCosto() {
        return Optional.ofNullable(costo);
    }

    public BigDecimalFilter costo() {
        if (costo == null) {
            setCosto(new BigDecimalFilter());
        }
        return costo;
    }

    public void setCosto(BigDecimalFilter costo) {
        this.costo = costo;
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

    public LongFilter getCategoriaId() {
        return categoriaId;
    }

    public Optional<LongFilter> optionalCategoriaId() {
        return Optional.ofNullable(categoriaId);
    }

    public LongFilter categoriaId() {
        if (categoriaId == null) {
            setCategoriaId(new LongFilter());
        }
        return categoriaId;
    }

    public void setCategoriaId(LongFilter categoriaId) {
        this.categoriaId = categoriaId;
    }

    public LongFilter getUnidadMedidaId() {
        return unidadMedidaId;
    }

    public Optional<LongFilter> optionalUnidadMedidaId() {
        return Optional.ofNullable(unidadMedidaId);
    }

    public LongFilter unidadMedidaId() {
        if (unidadMedidaId == null) {
            setUnidadMedidaId(new LongFilter());
        }
        return unidadMedidaId;
    }

    public void setUnidadMedidaId(LongFilter unidadMedidaId) {
        this.unidadMedidaId = unidadMedidaId;
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
        final ArticuloCriteria that = (ArticuloCriteria) o;
        return (
            Objects.equals(id, that.id) &&
            Objects.equals(codigo, that.codigo) &&
            Objects.equals(nombre, that.nombre) &&
            Objects.equals(descripcion, that.descripcion) &&
            Objects.equals(existencia, that.existencia) &&
            Objects.equals(existenciaMinima, that.existenciaMinima) &&
            Objects.equals(precio, that.precio) &&
            Objects.equals(costo, that.costo) &&
            Objects.equals(activo, that.activo) &&
            Objects.equals(categoriaId, that.categoriaId) &&
            Objects.equals(unidadMedidaId, that.unidadMedidaId) &&
            Objects.equals(distinct, that.distinct)
        );
    }

    @Override
    public int hashCode() {
        return Objects.hash(
            id,
            codigo,
            nombre,
            descripcion,
            existencia,
            existenciaMinima,
            precio,
            costo,
            activo,
            categoriaId,
            unidadMedidaId,
            distinct
        );
    }

    // prettier-ignore
    @Override
    public String toString() {
        return "ArticuloCriteria{" +
            optionalId().map(f -> "id=" + f + ", ").orElse("") +
            optionalCodigo().map(f -> "codigo=" + f + ", ").orElse("") +
            optionalNombre().map(f -> "nombre=" + f + ", ").orElse("") +
            optionalDescripcion().map(f -> "descripcion=" + f + ", ").orElse("") +
            optionalExistencia().map(f -> "existencia=" + f + ", ").orElse("") +
            optionalExistenciaMinima().map(f -> "existenciaMinima=" + f + ", ").orElse("") +
            optionalPrecio().map(f -> "precio=" + f + ", ").orElse("") +
            optionalCosto().map(f -> "costo=" + f + ", ").orElse("") +
            optionalActivo().map(f -> "activo=" + f + ", ").orElse("") +
            optionalCategoriaId().map(f -> "categoriaId=" + f + ", ").orElse("") +
            optionalUnidadMedidaId().map(f -> "unidadMedidaId=" + f + ", ").orElse("") +
            optionalDistinct().map(f -> "distinct=" + f + ", ").orElse("") +
        "}";
    }
}

package com.ferronica.app.service.criteria;

import com.ferronica.app.domain.enumeration.Genero;
import java.io.Serializable;
import java.util.Objects;
import java.util.Optional;
import org.springdoc.core.annotations.ParameterObject;
import tech.jhipster.service.Criteria;
import tech.jhipster.service.filter.*;

/**
 * Criteria class for the {@link com.ferronica.app.domain.Cliente} entity. This class is used
 * in {@link com.ferronica.app.web.rest.ClienteResource} to receive all the possible filtering options from
 * the Http GET request parameters.
 * For example the following could be a valid request:
 * {@code /clientes?id.greaterThan=5&attr1.contains=something&attr2.specified=false}
 * As Spring is unable to properly convert the types, unless specific {@link Filter} class are used, we need to use
 * fix type specific filters.
 */
@ParameterObject
@SuppressWarnings("common-java:DuplicatedBlocks")
public class ClienteCriteria implements Serializable, Criteria {

    /**
     * Class for filtering Genero
     */
    public static class GeneroFilter extends Filter<Genero> {

        public GeneroFilter() {}

        public GeneroFilter(GeneroFilter filter) {
            super(filter);
        }

        @Override
        public GeneroFilter copy() {
            return new GeneroFilter(this);
        }
    }

    private static final long serialVersionUID = 1L;

    private LongFilter id;

    private StringFilter cedula;

    private StringFilter nombre;

    private GeneroFilter genero;

    private StringFilter direccion;

    private StringFilter telefono;

    private BigDecimalFilter saldo;

    private BooleanFilter activo;

    private Boolean distinct;

    public ClienteCriteria() {}

    public ClienteCriteria(ClienteCriteria other) {
        this.id = other.optionalId().map(LongFilter::copy).orElse(null);
        this.cedula = other.optionalCedula().map(StringFilter::copy).orElse(null);
        this.nombre = other.optionalNombre().map(StringFilter::copy).orElse(null);
        this.genero = other.optionalGenero().map(GeneroFilter::copy).orElse(null);
        this.direccion = other.optionalDireccion().map(StringFilter::copy).orElse(null);
        this.telefono = other.optionalTelefono().map(StringFilter::copy).orElse(null);
        this.saldo = other.optionalSaldo().map(BigDecimalFilter::copy).orElse(null);
        this.activo = other.optionalActivo().map(BooleanFilter::copy).orElse(null);
        this.distinct = other.distinct;
    }

    @Override
    public ClienteCriteria copy() {
        return new ClienteCriteria(this);
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

    public StringFilter getCedula() {
        return cedula;
    }

    public Optional<StringFilter> optionalCedula() {
        return Optional.ofNullable(cedula);
    }

    public StringFilter cedula() {
        if (cedula == null) {
            setCedula(new StringFilter());
        }
        return cedula;
    }

    public void setCedula(StringFilter cedula) {
        this.cedula = cedula;
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

    public GeneroFilter getGenero() {
        return genero;
    }

    public Optional<GeneroFilter> optionalGenero() {
        return Optional.ofNullable(genero);
    }

    public GeneroFilter genero() {
        if (genero == null) {
            setGenero(new GeneroFilter());
        }
        return genero;
    }

    public void setGenero(GeneroFilter genero) {
        this.genero = genero;
    }

    public StringFilter getDireccion() {
        return direccion;
    }

    public Optional<StringFilter> optionalDireccion() {
        return Optional.ofNullable(direccion);
    }

    public StringFilter direccion() {
        if (direccion == null) {
            setDireccion(new StringFilter());
        }
        return direccion;
    }

    public void setDireccion(StringFilter direccion) {
        this.direccion = direccion;
    }

    public StringFilter getTelefono() {
        return telefono;
    }

    public Optional<StringFilter> optionalTelefono() {
        return Optional.ofNullable(telefono);
    }

    public StringFilter telefono() {
        if (telefono == null) {
            setTelefono(new StringFilter());
        }
        return telefono;
    }

    public void setTelefono(StringFilter telefono) {
        this.telefono = telefono;
    }

    public BigDecimalFilter getSaldo() {
        return saldo;
    }

    public Optional<BigDecimalFilter> optionalSaldo() {
        return Optional.ofNullable(saldo);
    }

    public BigDecimalFilter saldo() {
        if (saldo == null) {
            setSaldo(new BigDecimalFilter());
        }
        return saldo;
    }

    public void setSaldo(BigDecimalFilter saldo) {
        this.saldo = saldo;
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
        final ClienteCriteria that = (ClienteCriteria) o;
        return (
            Objects.equals(id, that.id) &&
            Objects.equals(cedula, that.cedula) &&
            Objects.equals(nombre, that.nombre) &&
            Objects.equals(genero, that.genero) &&
            Objects.equals(direccion, that.direccion) &&
            Objects.equals(telefono, that.telefono) &&
            Objects.equals(saldo, that.saldo) &&
            Objects.equals(activo, that.activo) &&
            Objects.equals(distinct, that.distinct)
        );
    }

    @Override
    public int hashCode() {
        return Objects.hash(id, cedula, nombre, genero, direccion, telefono, saldo, activo, distinct);
    }

    // prettier-ignore
    @Override
    public String toString() {
        return "ClienteCriteria{" +
            optionalId().map(f -> "id=" + f + ", ").orElse("") +
            optionalCedula().map(f -> "cedula=" + f + ", ").orElse("") +
            optionalNombre().map(f -> "nombre=" + f + ", ").orElse("") +
            optionalGenero().map(f -> "genero=" + f + ", ").orElse("") +
            optionalDireccion().map(f -> "direccion=" + f + ", ").orElse("") +
            optionalTelefono().map(f -> "telefono=" + f + ", ").orElse("") +
            optionalSaldo().map(f -> "saldo=" + f + ", ").orElse("") +
            optionalActivo().map(f -> "activo=" + f + ", ").orElse("") +
            optionalDistinct().map(f -> "distinct=" + f + ", ").orElse("") +
        "}";
    }
}

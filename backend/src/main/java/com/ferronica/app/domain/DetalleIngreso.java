package com.ferronica.app.domain;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import jakarta.validation.constraints.*;
import java.io.Serializable;
import java.math.BigDecimal;

/**
 * A DetalleIngreso.
 */
@Entity
@Table(name = "detalle_ingreso")
@SuppressWarnings("common-java:DuplicatedBlocks")
public class DetalleIngreso implements Serializable {

    private static final long serialVersionUID = 1L;

    @Id
    @GeneratedValue(strategy = GenerationType.SEQUENCE, generator = "sequenceGenerator")
    @SequenceGenerator(name = "sequenceGenerator")
    @Column(name = "id")
    private Long id;

    @NotNull
    @DecimalMin(value = "0")
    @Column(name = "cantidad", precision = 21, scale = 2, nullable = false)
    private BigDecimal cantidad;

    @NotNull
    @DecimalMin(value = "0")
    @Column(name = "costo_unitario", precision = 21, scale = 2, nullable = false)
    private BigDecimal costoUnitario;

    @NotNull
    @DecimalMin(value = "0")
    @Column(name = "monto", precision = 21, scale = 2, nullable = false)
    private BigDecimal monto;

    @ManyToOne(fetch = FetchType.LAZY)
    @JsonIgnoreProperties(value = { "categoria", "unidadMedida" }, allowSetters = true)
    private Articulo articulo;

    @ManyToOne(fetch = FetchType.LAZY)
    @JsonIgnoreProperties(value = { "detalles", "usuario", "proveedor" }, allowSetters = true)
    private Ingreso ingreso;

    // jhipster-needle-entity-add-field - JHipster will add fields here

    public Long getId() {
        return this.id;
    }

    public DetalleIngreso id(Long id) {
        this.setId(id);
        return this;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public BigDecimal getCantidad() {
        return this.cantidad;
    }

    public DetalleIngreso cantidad(BigDecimal cantidad) {
        this.setCantidad(cantidad);
        return this;
    }

    public void setCantidad(BigDecimal cantidad) {
        this.cantidad = cantidad;
    }

    public BigDecimal getCostoUnitario() {
        return this.costoUnitario;
    }

    public DetalleIngreso costoUnitario(BigDecimal costoUnitario) {
        this.setCostoUnitario(costoUnitario);
        return this;
    }

    public void setCostoUnitario(BigDecimal costoUnitario) {
        this.costoUnitario = costoUnitario;
    }

    public BigDecimal getMonto() {
        return this.monto;
    }

    public DetalleIngreso monto(BigDecimal monto) {
        this.setMonto(monto);
        return this;
    }

    public void setMonto(BigDecimal monto) {
        this.monto = monto;
    }

    public Articulo getArticulo() {
        return this.articulo;
    }

    public void setArticulo(Articulo articulo) {
        this.articulo = articulo;
    }

    public DetalleIngreso articulo(Articulo articulo) {
        this.setArticulo(articulo);
        return this;
    }

    public Ingreso getIngreso() {
        return this.ingreso;
    }

    public void setIngreso(Ingreso ingreso) {
        this.ingreso = ingreso;
    }

    public DetalleIngreso ingreso(Ingreso ingreso) {
        this.setIngreso(ingreso);
        return this;
    }

    // jhipster-needle-entity-add-getters-setters - JHipster will add getters and
    // setters here

    @Override
    public boolean equals(Object o) {
        if (this == o) {
            return true;
        }
        if (!(o instanceof DetalleIngreso)) {
            return false;
        }
        return getId() != null && getId().equals(((DetalleIngreso) o).getId());
    }

    @Override
    public int hashCode() {
        // see
        // https://vladmihalcea.com/how-to-implement-equals-and-hashcode-using-the-jpa-entity-identifier/
        return getClass().hashCode();
    }

    // prettier-ignore
    @Override
    public String toString() {
        return "DetalleIngreso{" +
                "id=" + getId() +
                ", cantidad=" + getCantidad() +
                ", costoUnitario=" + getCostoUnitario() +
                ", monto=" + getMonto() +
                "}";
    }
}

package com.ferronica.app.domain;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import jakarta.validation.constraints.*;
import java.io.Serializable;
import java.math.BigDecimal;

/**
 * A DetalleVenta.
 */
@Entity
@Table(name = "detalle_venta")
@SuppressWarnings("common-java:DuplicatedBlocks")
public class DetalleVenta implements Serializable {

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
    @Column(name = "precio_venta", precision = 21, scale = 2, nullable = false)
    private BigDecimal precioVenta;

    @DecimalMin(value = "0")
    @Column(name = "descuento", precision = 21, scale = 2)
    private BigDecimal descuento;

    @NotNull
    @DecimalMin(value = "0")
    @Column(name = "monto", precision = 21, scale = 2, nullable = false)
    private BigDecimal monto;

    @ManyToOne(fetch = FetchType.LAZY)
    @JsonIgnoreProperties(value = { "categoria", "unidadMedida" }, allowSetters = true)
    private Articulo articulo;

    @ManyToOne(fetch = FetchType.LAZY)
    @JsonIgnoreProperties(value = { "detalles", "cliente", "vendedor", "moneda", "numeracion" }, allowSetters = true)
    private Venta venta;

    // jhipster-needle-entity-add-field - JHipster will add fields here

    public Long getId() {
        return this.id;
    }

    public DetalleVenta id(Long id) {
        this.setId(id);
        return this;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public BigDecimal getCantidad() {
        return this.cantidad;
    }

    public DetalleVenta cantidad(BigDecimal cantidad) {
        this.setCantidad(cantidad);
        return this;
    }

    public void setCantidad(BigDecimal cantidad) {
        this.cantidad = cantidad;
    }

    public BigDecimal getPrecioVenta() {
        return this.precioVenta;
    }

    public DetalleVenta precioVenta(BigDecimal precioVenta) {
        this.setPrecioVenta(precioVenta);
        return this;
    }

    public void setPrecioVenta(BigDecimal precioVenta) {
        this.precioVenta = precioVenta;
    }

    public BigDecimal getDescuento() {
        return this.descuento;
    }

    public DetalleVenta descuento(BigDecimal descuento) {
        this.setDescuento(descuento);
        return this;
    }

    public void setDescuento(BigDecimal descuento) {
        this.descuento = descuento;
    }

    public BigDecimal getMonto() {
        return this.monto;
    }

    public DetalleVenta monto(BigDecimal monto) {
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

    public DetalleVenta articulo(Articulo articulo) {
        this.setArticulo(articulo);
        return this;
    }

    public Venta getVenta() {
        return this.venta;
    }

    public void setVenta(Venta venta) {
        this.venta = venta;
    }

    public DetalleVenta venta(Venta venta) {
        this.setVenta(venta);
        return this;
    }

    // jhipster-needle-entity-add-getters-setters - JHipster will add getters and setters here

    @Override
    public boolean equals(Object o) {
        if (this == o) {
            return true;
        }
        if (!(o instanceof DetalleVenta)) {
            return false;
        }
        return getId() != null && getId().equals(((DetalleVenta) o).getId());
    }

    @Override
    public int hashCode() {
        // see https://vladmihalcea.com/how-to-implement-equals-and-hashcode-using-the-jpa-entity-identifier/
        return getClass().hashCode();
    }

    // prettier-ignore
    @Override
    public String toString() {
        return "DetalleVenta{" +
            "id=" + getId() +
            ", cantidad=" + getCantidad() +
            ", precioVenta=" + getPrecioVenta() +
            ", descuento=" + getDescuento() +
            ", monto=" + getMonto() +
            "}";
    }
}

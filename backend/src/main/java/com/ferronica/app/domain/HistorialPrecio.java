package com.ferronica.app.domain;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import jakarta.validation.constraints.*;
import java.io.Serializable;
import java.math.BigDecimal;
import java.time.Instant;

/**
 * A HistorialPrecio.
 */
@Entity
@Table(name = "historial_precio")
@SuppressWarnings("common-java:DuplicatedBlocks")
public class HistorialPrecio implements Serializable {

    private static final long serialVersionUID = 1L;

    @Id
    @GeneratedValue(strategy = GenerationType.SEQUENCE, generator = "sequenceGenerator")
    @SequenceGenerator(name = "sequenceGenerator")
    @Column(name = "id")
    private Long id;

    @NotNull
    @Column(name = "precio_anterior", precision = 21, scale = 2, nullable = false)
    private BigDecimal precioAnterior;

    @NotNull
    @Column(name = "precio_nuevo", precision = 21, scale = 2, nullable = false)
    private BigDecimal precioNuevo;

    @NotNull
    @Column(name = "fecha", nullable = false)
    private Instant fecha;

    @Size(max = 100)
    @Column(name = "motivo", length = 100)
    private String motivo;

    @ManyToOne(fetch = FetchType.LAZY)
    @JsonIgnoreProperties(value = { "categoria", "unidadMedida" }, allowSetters = true)
    private Articulo articulo;

    // jhipster-needle-entity-add-field - JHipster will add fields here

    public Long getId() {
        return this.id;
    }

    public HistorialPrecio id(Long id) {
        this.setId(id);
        return this;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public BigDecimal getPrecioAnterior() {
        return this.precioAnterior;
    }

    public HistorialPrecio precioAnterior(BigDecimal precioAnterior) {
        this.setPrecioAnterior(precioAnterior);
        return this;
    }

    public void setPrecioAnterior(BigDecimal precioAnterior) {
        this.precioAnterior = precioAnterior;
    }

    public BigDecimal getPrecioNuevo() {
        return this.precioNuevo;
    }

    public HistorialPrecio precioNuevo(BigDecimal precioNuevo) {
        this.setPrecioNuevo(precioNuevo);
        return this;
    }

    public void setPrecioNuevo(BigDecimal precioNuevo) {
        this.precioNuevo = precioNuevo;
    }

    public Instant getFecha() {
        return this.fecha;
    }

    public HistorialPrecio fecha(Instant fecha) {
        this.setFecha(fecha);
        return this;
    }

    public void setFecha(Instant fecha) {
        this.fecha = fecha;
    }

    public String getMotivo() {
        return this.motivo;
    }

    public HistorialPrecio motivo(String motivo) {
        this.setMotivo(motivo);
        return this;
    }

    public void setMotivo(String motivo) {
        this.motivo = motivo;
    }

    public Articulo getArticulo() {
        return this.articulo;
    }

    public void setArticulo(Articulo articulo) {
        this.articulo = articulo;
    }

    public HistorialPrecio articulo(Articulo articulo) {
        this.setArticulo(articulo);
        return this;
    }

    // jhipster-needle-entity-add-getters-setters - JHipster will add getters and setters here

    @Override
    public boolean equals(Object o) {
        if (this == o) {
            return true;
        }
        if (!(o instanceof HistorialPrecio)) {
            return false;
        }
        return getId() != null && getId().equals(((HistorialPrecio) o).getId());
    }

    @Override
    public int hashCode() {
        // see https://vladmihalcea.com/how-to-implement-equals-and-hashcode-using-the-jpa-entity-identifier/
        return getClass().hashCode();
    }

    // prettier-ignore
    @Override
    public String toString() {
        return "HistorialPrecio{" +
            "id=" + getId() +
            ", precioAnterior=" + getPrecioAnterior() +
            ", precioNuevo=" + getPrecioNuevo() +
            ", fecha='" + getFecha() + "'" +
            ", motivo='" + getMotivo() + "'" +
            "}";
    }
}

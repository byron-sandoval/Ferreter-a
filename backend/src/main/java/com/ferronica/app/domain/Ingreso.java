package com.ferronica.app.domain;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import jakarta.validation.constraints.*;
import java.io.Serializable;
import java.math.BigDecimal;
import java.time.Instant;
import java.util.HashSet;
import java.util.Set;

/**
 * A Ingreso.
 */
@Entity
@Table(name = "ingreso")
@SuppressWarnings("common-java:DuplicatedBlocks")
public class Ingreso implements Serializable {

    private static final long serialVersionUID = 1L;

    @Id
    @GeneratedValue(strategy = GenerationType.SEQUENCE, generator = "sequenceGenerator")
    @SequenceGenerator(name = "sequenceGenerator")
    @Column(name = "id")
    private Long id;

    @NotNull
    @Column(name = "fecha", nullable = false)
    private Instant fecha;

    @NotNull
    @Column(name = "no_documento", nullable = false)
    private String noDocumento;

    @NotNull
    @Column(name = "total", precision = 21, scale = 2, nullable = false)
    private BigDecimal total;

    @Size(max = 255)
    @Column(name = "observaciones", length = 255)
    private String observaciones;

    @Column(name = "activo")
    private Boolean activo;

    @OneToMany(fetch = FetchType.LAZY, mappedBy = "ingreso", cascade = CascadeType.ALL, orphanRemoval = true)
    @JsonIgnoreProperties(value = { "articulo", "ingreso" }, allowSetters = true)
    private Set<DetalleIngreso> detalles = new HashSet<>();

    @ManyToOne(fetch = FetchType.LAZY)
    private Usuario usuario;

    @ManyToOne(fetch = FetchType.LAZY)
    private Proveedor proveedor;

    // jhipster-needle-entity-add-field - JHipster will add fields here

    public Long getId() {
        return this.id;
    }

    public Ingreso id(Long id) {
        this.setId(id);
        return this;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Instant getFecha() {
        return this.fecha;
    }

    public Ingreso fecha(Instant fecha) {
        this.setFecha(fecha);
        return this;
    }

    public void setFecha(Instant fecha) {
        this.fecha = fecha;
    }

    public String getNoDocumento() {
        return this.noDocumento;
    }

    public Ingreso noDocumento(String noDocumento) {
        this.setNoDocumento(noDocumento);
        return this;
    }

    public void setNoDocumento(String noDocumento) {
        this.noDocumento = noDocumento;
    }

    public BigDecimal getTotal() {
        return this.total;
    }

    public Ingreso total(BigDecimal total) {
        this.setTotal(total);
        return this;
    }

    public void setTotal(BigDecimal total) {
        this.total = total;
    }

    public String getObservaciones() {
        return this.observaciones;
    }

    public Ingreso observaciones(String observaciones) {
        this.setObservaciones(observaciones);
        return this;
    }

    public void setObservaciones(String observaciones) {
        this.observaciones = observaciones;
    }

    public Boolean getActivo() {
        return this.activo;
    }

    public Ingreso activo(Boolean activo) {
        this.setActivo(activo);
        return this;
    }

    public void setActivo(Boolean activo) {
        this.activo = activo;
    }

    public Set<DetalleIngreso> getDetalles() {
        return this.detalles;
    }

    public void setDetalles(Set<DetalleIngreso> detalleIngresos) {
        if (this.detalles != null) {
            this.detalles.forEach(i -> i.setIngreso(null));
        }
        if (detalleIngresos != null) {
            detalleIngresos.forEach(i -> i.setIngreso(this));
        }
        this.detalles = detalleIngresos;
    }

    public Ingreso detalles(Set<DetalleIngreso> detalleIngresos) {
        this.setDetalles(detalleIngresos);
        return this;
    }

    public Ingreso addDetalles(DetalleIngreso detalleIngreso) {
        this.detalles.add(detalleIngreso);
        detalleIngreso.setIngreso(this);
        return this;
    }

    public Ingreso removeDetalles(DetalleIngreso detalleIngreso) {
        this.detalles.remove(detalleIngreso);
        detalleIngreso.setIngreso(null);
        return this;
    }

    public Usuario getUsuario() {
        return this.usuario;
    }

    public void setUsuario(Usuario usuario) {
        this.usuario = usuario;
    }

    public Ingreso usuario(Usuario usuario) {
        this.setUsuario(usuario);
        return this;
    }

    public Proveedor getProveedor() {
        return this.proveedor;
    }

    public void setProveedor(Proveedor proveedor) {
        this.proveedor = proveedor;
    }

    public Ingreso proveedor(Proveedor proveedor) {
        this.setProveedor(proveedor);
        return this;
    }

    // jhipster-needle-entity-add-getters-setters - JHipster will add getters and
    // setters here

    @Override
    public boolean equals(Object o) {
        if (this == o) {
            return true;
        }
        if (!(o instanceof Ingreso)) {
            return false;
        }
        return getId() != null && getId().equals(((Ingreso) o).getId());
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
        return "Ingreso{" +
                "id=" + getId() +
                ", fecha='" + getFecha() + "'" +
                ", noDocumento='" + getNoDocumento() + "'" +
                ", total=" + getTotal() +
                ", observaciones='" + getObservaciones() + "'" +
                ", activo='" + getActivo() + "'" +
                "}";
    }
}

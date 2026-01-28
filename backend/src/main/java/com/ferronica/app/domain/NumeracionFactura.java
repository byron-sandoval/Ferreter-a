package com.ferronica.app.domain;

import jakarta.persistence.*;
import jakarta.validation.constraints.*;
import java.io.Serializable;

/**
 * A NumeracionFactura.
 */
@Entity
@Table(name = "numeracion_factura")
@SuppressWarnings("common-java:DuplicatedBlocks")
public class NumeracionFactura implements Serializable {

    private static final long serialVersionUID = 1L;

    @Id
    @GeneratedValue(strategy = GenerationType.SEQUENCE, generator = "sequenceGenerator")
    @SequenceGenerator(name = "sequenceGenerator")
    @Column(name = "id")
    private Long id;

    @NotNull
    @Size(max = 10)
    @Column(name = "serie", length = 10, nullable = false)
    private String serie;

    @NotNull
    @Column(name = "correlativo_actual", nullable = false)
    private Long correlativoActual;

    @Column(name = "activo")
    private Boolean activo;

    // jhipster-needle-entity-add-field - JHipster will add fields here

    public Long getId() {
        return this.id;
    }

    public NumeracionFactura id(Long id) {
        this.setId(id);
        return this;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getSerie() {
        return this.serie;
    }

    public NumeracionFactura serie(String serie) {
        this.setSerie(serie);
        return this;
    }

    public void setSerie(String serie) {
        this.serie = serie;
    }

    public Long getCorrelativoActual() {
        return this.correlativoActual;
    }

    public NumeracionFactura correlativoActual(Long correlativoActual) {
        this.setCorrelativoActual(correlativoActual);
        return this;
    }

    public void setCorrelativoActual(Long correlativoActual) {
        this.correlativoActual = correlativoActual;
    }

    public Boolean getActivo() {
        return this.activo;
    }

    public NumeracionFactura activo(Boolean activo) {
        this.setActivo(activo);
        return this;
    }

    public void setActivo(Boolean activo) {
        this.activo = activo;
    }

    // jhipster-needle-entity-add-getters-setters - JHipster will add getters and setters here

    @Override
    public boolean equals(Object o) {
        if (this == o) {
            return true;
        }
        if (!(o instanceof NumeracionFactura)) {
            return false;
        }
        return getId() != null && getId().equals(((NumeracionFactura) o).getId());
    }

    @Override
    public int hashCode() {
        // see https://vladmihalcea.com/how-to-implement-equals-and-hashcode-using-the-jpa-entity-identifier/
        return getClass().hashCode();
    }

    // prettier-ignore
    @Override
    public String toString() {
        return "NumeracionFactura{" +
            "id=" + getId() +
            ", serie='" + getSerie() + "'" +
            ", correlativoActual=" + getCorrelativoActual() +
            ", activo='" + getActivo() + "'" +
            "}";
    }
}

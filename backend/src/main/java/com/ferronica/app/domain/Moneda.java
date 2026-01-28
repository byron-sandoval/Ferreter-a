package com.ferronica.app.domain;

import jakarta.persistence.*;
import jakarta.validation.constraints.*;
import java.io.Serializable;
import java.math.BigDecimal;

/**
 * A Moneda.
 */
@Entity
@Table(name = "moneda")
@SuppressWarnings("common-java:DuplicatedBlocks")
public class Moneda implements Serializable {

    private static final long serialVersionUID = 1L;

    @Id
    @GeneratedValue(strategy = GenerationType.SEQUENCE, generator = "sequenceGenerator")
    @SequenceGenerator(name = "sequenceGenerator")
    @Column(name = "id")
    private Long id;

    @NotNull
    @Column(name = "nombre", nullable = false)
    private String nombre;

    @NotNull
    @Column(name = "simbolo", nullable = false)
    private String simbolo;

    @NotNull
    @Column(name = "tipo_cambio", precision = 21, scale = 2, nullable = false)
    private BigDecimal tipoCambio;

    // jhipster-needle-entity-add-field - JHipster will add fields here

    public Long getId() {
        return this.id;
    }

    public Moneda id(Long id) {
        this.setId(id);
        return this;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getNombre() {
        return this.nombre;
    }

    public Moneda nombre(String nombre) {
        this.setNombre(nombre);
        return this;
    }

    public void setNombre(String nombre) {
        this.nombre = nombre;
    }

    public String getSimbolo() {
        return this.simbolo;
    }

    public Moneda simbolo(String simbolo) {
        this.setSimbolo(simbolo);
        return this;
    }

    public void setSimbolo(String simbolo) {
        this.simbolo = simbolo;
    }

    public BigDecimal getTipoCambio() {
        return this.tipoCambio;
    }

    public Moneda tipoCambio(BigDecimal tipoCambio) {
        this.setTipoCambio(tipoCambio);
        return this;
    }

    public void setTipoCambio(BigDecimal tipoCambio) {
        this.tipoCambio = tipoCambio;
    }

    // jhipster-needle-entity-add-getters-setters - JHipster will add getters and setters here

    @Override
    public boolean equals(Object o) {
        if (this == o) {
            return true;
        }
        if (!(o instanceof Moneda)) {
            return false;
        }
        return getId() != null && getId().equals(((Moneda) o).getId());
    }

    @Override
    public int hashCode() {
        // see https://vladmihalcea.com/how-to-implement-equals-and-hashcode-using-the-jpa-entity-identifier/
        return getClass().hashCode();
    }

    // prettier-ignore
    @Override
    public String toString() {
        return "Moneda{" +
            "id=" + getId() +
            ", nombre='" + getNombre() + "'" +
            ", simbolo='" + getSimbolo() + "'" +
            ", tipoCambio=" + getTipoCambio() +
            "}";
    }
}

package com.ferronica.app.domain;

import jakarta.persistence.*;
import jakarta.validation.constraints.*;
import java.io.Serializable;

/**
 * A UnidadMedida.
 */
@Entity
@Table(name = "unidad_medida")
@SuppressWarnings("common-java:DuplicatedBlocks")
public class UnidadMedida implements Serializable {

    private static final long serialVersionUID = 1L;

    @Id
    @GeneratedValue(strategy = GenerationType.SEQUENCE, generator = "sequenceGenerator")
    @SequenceGenerator(name = "sequenceGenerator")
    @Column(name = "id")
    private Long id;

    @NotNull
    @Size(max = 20)
    @Column(name = "nombre", length = 20, nullable = false)
    private String nombre;

    @Size(max = 10)
    @Column(name = "simbolo", length = 10)
    private String simbolo;

    @Column(name = "activo")
    private Boolean activo;

    // jhipster-needle-entity-add-field - JHipster will add fields here

    public Long getId() {
        return this.id;
    }

    public UnidadMedida id(Long id) {
        this.setId(id);
        return this;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getNombre() {
        return this.nombre;
    }

    public UnidadMedida nombre(String nombre) {
        this.setNombre(nombre);
        return this;
    }

    public void setNombre(String nombre) {
        this.nombre = nombre;
    }

    public String getSimbolo() {
        return this.simbolo;
    }

    public UnidadMedida simbolo(String simbolo) {
        this.setSimbolo(simbolo);
        return this;
    }

    public void setSimbolo(String simbolo) {
        this.simbolo = simbolo;
    }

    public Boolean getActivo() {
        return this.activo;
    }

    public UnidadMedida activo(Boolean activo) {
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
        if (!(o instanceof UnidadMedida)) {
            return false;
        }
        return getId() != null && getId().equals(((UnidadMedida) o).getId());
    }

    @Override
    public int hashCode() {
        // see https://vladmihalcea.com/how-to-implement-equals-and-hashcode-using-the-jpa-entity-identifier/
        return getClass().hashCode();
    }

    // prettier-ignore
    @Override
    public String toString() {
        return "UnidadMedida{" +
            "id=" + getId() +
            ", nombre='" + getNombre() + "'" +
            ", simbolo='" + getSimbolo() + "'" +
            ", activo='" + getActivo() + "'" +
            "}";
    }
}

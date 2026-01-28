package com.ferronica.app.domain;

import jakarta.persistence.*;
import jakarta.validation.constraints.*;
import java.io.Serializable;

/**
 * A Vendedor.
 */
@Entity
@Table(name = "vendedor")
@SuppressWarnings("common-java:DuplicatedBlocks")
public class Vendedor implements Serializable {

    private static final long serialVersionUID = 1L;

    @Id
    @GeneratedValue(strategy = GenerationType.SEQUENCE, generator = "sequenceGenerator")
    @SequenceGenerator(name = "sequenceGenerator")
    @Column(name = "id")
    private Long id;

    @NotNull
    @Column(name = "id_keycloak", nullable = false, unique = true)
    private String idKeycloak;

    @NotNull
    @Size(max = 20)
    @Column(name = "cedula", length = 20, nullable = false, unique = true)
    private String cedula;

    @NotNull
    @Size(max = 50)
    @Column(name = "nombre", length = 50, nullable = false)
    private String nombre;

    @Size(max = 50)
    @Column(name = "apellido", length = 50)
    private String apellido;

    @Size(max = 15)
    @Column(name = "telefono", length = 15)
    private String telefono;

    @Column(name = "activo")
    private Boolean activo;

    // jhipster-needle-entity-add-field - JHipster will add fields here

    public Long getId() {
        return this.id;
    }

    public Vendedor id(Long id) {
        this.setId(id);
        return this;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getIdKeycloak() {
        return this.idKeycloak;
    }

    public Vendedor idKeycloak(String idKeycloak) {
        this.setIdKeycloak(idKeycloak);
        return this;
    }

    public void setIdKeycloak(String idKeycloak) {
        this.idKeycloak = idKeycloak;
    }

    public String getCedula() {
        return this.cedula;
    }

    public Vendedor cedula(String cedula) {
        this.setCedula(cedula);
        return this;
    }

    public void setCedula(String cedula) {
        this.cedula = cedula;
    }

    public String getNombre() {
        return this.nombre;
    }

    public Vendedor nombre(String nombre) {
        this.setNombre(nombre);
        return this;
    }

    public void setNombre(String nombre) {
        this.nombre = nombre;
    }

    public String getApellido() {
        return this.apellido;
    }

    public Vendedor apellido(String apellido) {
        this.setApellido(apellido);
        return this;
    }

    public void setApellido(String apellido) {
        this.apellido = apellido;
    }

    public String getTelefono() {
        return this.telefono;
    }

    public Vendedor telefono(String telefono) {
        this.setTelefono(telefono);
        return this;
    }

    public void setTelefono(String telefono) {
        this.telefono = telefono;
    }

    public Boolean getActivo() {
        return this.activo;
    }

    public Vendedor activo(Boolean activo) {
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
        if (!(o instanceof Vendedor)) {
            return false;
        }
        return getId() != null && getId().equals(((Vendedor) o).getId());
    }

    @Override
    public int hashCode() {
        // see https://vladmihalcea.com/how-to-implement-equals-and-hashcode-using-the-jpa-entity-identifier/
        return getClass().hashCode();
    }

    // prettier-ignore
    @Override
    public String toString() {
        return "Vendedor{" +
            "id=" + getId() +
            ", idKeycloak='" + getIdKeycloak() + "'" +
            ", cedula='" + getCedula() + "'" +
            ", nombre='" + getNombre() + "'" +
            ", apellido='" + getApellido() + "'" +
            ", telefono='" + getTelefono() + "'" +
            ", activo='" + getActivo() + "'" +
            "}";
    }
}

package com.ferronica.app.service.dto;

import jakarta.validation.constraints.*;
import java.io.Serializable;
import java.util.Objects;

/**
 * A DTO for the {@link com.ferronica.app.domain.Vendedor} entity.
 */
@SuppressWarnings("common-java:DuplicatedBlocks")
public class VendedorDTO implements Serializable {

    private Long id;

    @NotNull
    private String idKeycloak;

    @NotNull
    @Size(max = 20)
    private String cedula;

    @NotNull
    @Size(max = 50)
    private String nombre;

    @Size(max = 50)
    private String apellido;

    @Size(max = 15)
    private String telefono;

    private Boolean activo;

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getIdKeycloak() {
        return idKeycloak;
    }

    public void setIdKeycloak(String idKeycloak) {
        this.idKeycloak = idKeycloak;
    }

    public String getCedula() {
        return cedula;
    }

    public void setCedula(String cedula) {
        this.cedula = cedula;
    }

    public String getNombre() {
        return nombre;
    }

    public void setNombre(String nombre) {
        this.nombre = nombre;
    }

    public String getApellido() {
        return apellido;
    }

    public void setApellido(String apellido) {
        this.apellido = apellido;
    }

    public String getTelefono() {
        return telefono;
    }

    public void setTelefono(String telefono) {
        this.telefono = telefono;
    }

    public Boolean getActivo() {
        return activo;
    }

    public void setActivo(Boolean activo) {
        this.activo = activo;
    }

    @Override
    public boolean equals(Object o) {
        if (this == o) {
            return true;
        }
        if (!(o instanceof VendedorDTO)) {
            return false;
        }

        VendedorDTO vendedorDTO = (VendedorDTO) o;
        if (this.id == null) {
            return false;
        }
        return Objects.equals(this.id, vendedorDTO.id);
    }

    @Override
    public int hashCode() {
        return Objects.hash(this.id);
    }

    // prettier-ignore
    @Override
    public String toString() {
        return "VendedorDTO{" +
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

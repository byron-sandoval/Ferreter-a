package com.ferronica.app.web.rest;

import com.ferronica.app.service.EmpresaService;
import com.ferronica.app.service.dto.EmpresaDTO;
import java.util.List;
import java.util.Optional;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

/**
 * REST controller for public access to company information.
 */
@RestController
@RequestMapping("/api/public")
public class PublicResource {

    private static final Logger LOG = LoggerFactory.getLogger(PublicResource.class);

    private final EmpresaService empresaService;

    public PublicResource(EmpresaService empresaService) {
        this.empresaService = empresaService;
    }

    /**
     * {@code GET  /empresa} : get business info for login page.
     *
     * @return the business name and logo.
     */
    @GetMapping("/empresa")
    public PublicEmpresaDTO getPublicEmpresa() {
        LOG.debug("REST request to get public business info");
        List<EmpresaDTO> empresas = empresaService.findAll();
        if (empresas.isEmpty()) {
            return new PublicEmpresaDTO("FerroNica", null, null);
        }
        EmpresaDTO empresa = empresas.get(0);
        return new PublicEmpresaDTO(empresa.getNombre(), empresa.getLogo(), empresa.getLogoContentType());
    }

    /**
     * DTO for public business info.
     */
    public static class PublicEmpresaDTO {

        private String nombre;
        private byte[] logo;
        private String logoContentType;

        public PublicEmpresaDTO(String nombre, byte[] logo, String logoContentType) {
            this.nombre = nombre;
            this.logo = logo;
            this.logoContentType = logoContentType;
        }

        public String getNombre() {
            return nombre;
        }

        public void setNombre(String nombre) {
            this.nombre = nombre;
        }

        public byte[] getLogo() {
            return logo;
        }

        public void setLogo(byte[] logo) {
            this.logo = logo;
        }

        public String getLogoContentType() {
            return logoContentType;
        }

        public void setLogoContentType(String logoContentType) {
            this.logoContentType = logoContentType;
        }
    }
}

package com.ferronica.app.service.impl;

import com.ferronica.app.domain.Usuario;
import com.ferronica.app.repository.UsuarioRepository;
import com.ferronica.app.service.KeycloakService;
import com.ferronica.app.service.UsuarioService;
import com.ferronica.app.service.dto.UsuarioDTO;
import com.ferronica.app.service.mapper.UsuarioMapper;
import java.util.Optional;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/**
 * Service Implementation for managing
 * {@link com.ferronica.app.domain.Usuario}.
 */
@Service
@Transactional
public class UsuarioServiceImpl implements UsuarioService {

    private static final Logger LOG = LoggerFactory.getLogger(UsuarioServiceImpl.class);

    private final UsuarioRepository usuarioRepository;

    private final UsuarioMapper usuarioMapper;

    private final KeycloakService keycloakService;

    public UsuarioServiceImpl(UsuarioRepository usuarioRepository, UsuarioMapper usuarioMapper,
            KeycloakService keycloakService) {
        this.usuarioRepository = usuarioRepository;
        this.usuarioMapper = usuarioMapper;
        this.keycloakService = keycloakService;
    }

    @Override
    public UsuarioDTO save(UsuarioDTO usuarioDTO) {
        LOG.debug("Request to save Usuario : {}", usuarioDTO);

        // Integración con Keycloak: Si viene email y password, crear usuario en
        // Keycloak
        if (usuarioDTO.getEmail() != null && !usuarioDTO.getEmail().isEmpty() &&
                usuarioDTO.getPassword() != null && !usuarioDTO.getPassword().isEmpty()) {
            try {
                String keycloakId = keycloakService.createKeycloakUser(usuarioDTO);
                if (keycloakId != null) {
                    usuarioDTO.setIdKeycloak(keycloakId);
                }
            } catch (Exception e) {
                LOG.error("Failed to create user in Keycloak: {}", e.getMessage());
                // No lanzamos excepción para permitir que se guarde el usuario localmente
                // usuarioDTO.setIdKeycloak("ERROR_KEYCLOAK"); // Opcional: Marcar error
            }
        }

        if (usuarioDTO.getIdKeycloak() != null && usuarioDTO.getIdKeycloak().trim().isEmpty()) {
            usuarioDTO.setIdKeycloak(null);
        }
        Usuario usuario = usuarioMapper.toEntity(usuarioDTO);

        // Asegurar que el ID de Keycloak se guarde realmente
        if (usuarioDTO.getIdKeycloak() != null) {
            usuario.setIdKeycloak(usuarioDTO.getIdKeycloak());
        }

        usuario = usuarioRepository.save(usuario);
        return enrichWithRole(usuario);
    }

    @Override
    public UsuarioDTO update(UsuarioDTO usuarioDTO) {
        LOG.debug("Request to update Usuario : {}", usuarioDTO);
        if (usuarioDTO.getIdKeycloak() != null && usuarioDTO.getIdKeycloak().trim().isEmpty()) {
            usuarioDTO.setIdKeycloak(null);
        }

        // Sincronizar estado activo con Keycloak si tiene ID
        if (usuarioDTO.getIdKeycloak() != null) {
            keycloakService.updateUserStatus(usuarioDTO.getIdKeycloak(),
                    Boolean.TRUE.equals(usuarioDTO.getActivo()));
        }

        Usuario usuario = usuarioMapper.toEntity(usuarioDTO);

        // Asegurar que el ID de Keycloak se mantenga
        if (usuarioDTO.getIdKeycloak() != null) {
            usuario.setIdKeycloak(usuarioDTO.getIdKeycloak());
        }

        usuario = usuarioRepository.save(usuario);
        return enrichWithRole(usuario);
    }

    @Override
    public Optional<UsuarioDTO> partialUpdate(UsuarioDTO usuarioDTO) {
        LOG.debug("Request to partially update Usuario : {}", usuarioDTO);

        return usuarioRepository
                .findById(usuarioDTO.getId())
                .map(existingUsuario -> {
                    usuarioMapper.partialUpdate(existingUsuario, usuarioDTO);

                    // Sincronizar estado activo con Keycloak si cambia
                    if (existingUsuario.getIdKeycloak() != null && usuarioDTO.getActivo() != null) {
                        keycloakService.updateUserStatus(existingUsuario.getIdKeycloak(), existingUsuario.getActivo());
                    }

                    return existingUsuario;
                })
                .map(usuarioRepository::save)
                .map(this::enrichWithRole);
    }

    @Override
    @Transactional(readOnly = true)
    public Page<UsuarioDTO> findAll(Pageable pageable) {
        LOG.debug("Request to get all Usuarios");
        return usuarioRepository.findAll(pageable).map(this::enrichWithRole);
    }

    @Override
    @Transactional(readOnly = true)
    public Optional<UsuarioDTO> findOne(Long id) {
        LOG.debug("Request to get Usuario : {}", id);
        return usuarioRepository.findById(id).map(this::enrichWithRole);
    }

    @Override
    public void delete(Long id) {
        LOG.debug("Request to delete Usuario (Logical) : {}", id);
        usuarioRepository.findById(id).ifPresent(usuario -> {
            usuario.setActivo(false);
            usuarioRepository.save(usuario);

            // También desactivar en Keycloak si tiene ID
            if (usuario.getIdKeycloak() != null) {
                keycloakService.updateUserStatus(usuario.getIdKeycloak(), false);
            }
        });
    }

    private UsuarioDTO enrichWithRole(Usuario usuario) {
        UsuarioDTO dto = usuarioMapper.toDto(usuario);
        String keycloakId = usuario.getIdKeycloak();

        if (keycloakId != null && !keycloakId.trim().isEmpty()) {
            LOG.debug("Fetching role for user {} from Keycloak ID: {}", usuario.getNombre(), keycloakId);
            String role = keycloakService.getUserRole(keycloakId);
            if (role != null) {
                dto.setRol(role);
                LOG.info(">>> ROLE FOUND: User {} has role {}", usuario.getNombre(), role);
            } else {
                LOG.warn(">>> ROLE MISSING: Keycloak returned no role for user {}", usuario.getNombre());
            }
        } else {
            LOG.debug("Skipping role enrichment for user {} (No Keycloak ID)", usuario.getNombre());
        }
        return dto;
    }
}

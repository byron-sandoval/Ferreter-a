package com.ferronica.app.service;

import com.ferronica.app.config.ApplicationProperties;
import com.ferronica.app.service.dto.UsuarioDTO;
import jakarta.ws.rs.core.Response;
import org.keycloak.admin.client.Keycloak;
import org.keycloak.admin.client.resource.RealmResource;
import org.keycloak.admin.client.resource.UsersResource;
import org.keycloak.representations.idm.CredentialRepresentation;
import org.keycloak.representations.idm.UserRepresentation;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

import java.util.Collections;
import java.util.List;

@Service
public class KeycloakService {

    private final Logger log = LoggerFactory.getLogger(KeycloakService.class);

    private final Keycloak keycloak;
    private final ApplicationProperties applicationProperties;

    public KeycloakService(Keycloak keycloak, ApplicationProperties applicationProperties) {
        this.keycloak = keycloak;
        this.applicationProperties = applicationProperties;
    }

    public String createKeycloakUser(UsuarioDTO usuarioDTO) {
        log.debug("Creating Keycloak user for {}", usuarioDTO.getEmail());
        if (usuarioDTO.getEmail() == null || usuarioDTO.getPassword() == null) {
            log.warn("Email or password missing for Keycloak creation");
            return null;
        }

        UserRepresentation user = new UserRepresentation();
        user.setUsername(usuarioDTO.getEmail());

        // Solo asignar email si parece un correo válido
        if (usuarioDTO.getEmail().contains("@")) {
            user.setEmail(usuarioDTO.getEmail());
            user.setEmailVerified(true);
        }

        user.setFirstName(usuarioDTO.getNombre());
        user.setLastName(usuarioDTO.getApellido());
        user.setEnabled(true);

        CredentialRepresentation credential = new CredentialRepresentation();
        credential.setTemporary(false);
        credential.setType(CredentialRepresentation.PASSWORD);
        credential.setValue(usuarioDTO.getPassword());

        user.setCredentials(List.of(credential));

        String targetRealm = applicationProperties.getKeycloakAdmin().getTargetRealm();
        RealmResource realmResource = keycloak.realm(targetRealm);
        UsersResource usersResource = realmResource.users();

        try (Response response = usersResource.create(user)) {
            if (response.getStatus() == 201) {
                String location = response.getLocation().getPath();
                String userId = location.substring(location.lastIndexOf("/") + 1);
                log.info("Created Keycloak user with ID: {}", userId);

                // Assign Realm Role if provided
                if (usuarioDTO.getRol() != null) {
                    assignRole(userId, usuarioDTO.getRol());
                }

                return userId;
            } else {
                log.error("Failed to create user in Keycloak. Status: {}", response.getStatus());
                // If user exists, try to find it? No, fail for now.
                throw new RuntimeException(
                        "Could not create Keycloak user: " + response.getStatusInfo().getReasonPhrase());
            }
        } catch (Exception e) {
            log.error("Error communicating with Keycloak", e);
            throw new RuntimeException("Keycloak error: " + e.getMessage());
        }
    }

    private void assignRole(String userId, String roleName) {
        try {
            String targetRealm = applicationProperties.getKeycloakAdmin().getTargetRealm();
            // Remove ROLE_ prefix if present in Keycloak roles configuration, but strictly
            // we use EXACT match
            // However, JHipster roles are usually ROLE_ADMIN, but Keycloak realm roles
            // might be 'ROLE_ADMIN' or just 'admin'.
            // Let's assume exact match from DTO.

            RealmResource realmResource = keycloak.realm(targetRealm);
            var roleRepresentation = realmResource.roles().get(roleName).toRepresentation();

            realmResource.users().get(userId).roles().realmLevel().add(List.of(roleRepresentation));
            log.debug("Assigned role {} to user {}", roleName, userId);
        } catch (Exception e) {
            log.error("Failed to assign role {} to user {}", roleName, userId, e);
            // Non-blocking error?
        }
    }
}

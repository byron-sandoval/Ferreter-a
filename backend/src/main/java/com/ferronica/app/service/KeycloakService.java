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
        log.debug("Assigning role {} to user {}", roleName, userId);
        try {
            String targetRealm = applicationProperties.getKeycloakAdmin().getTargetRealm();
            RealmResource realmResource = keycloak.realm(targetRealm);

            // Log available roles for debugging
            log.trace("Available roles in realm: {}", realmResource.roles().list().stream().map(r -> r.getName())
                    .collect(java.util.stream.Collectors.toList()));

            var roleRepresentation = realmResource.roles().get(roleName).toRepresentation();
            realmResource.users().get(userId).roles().realmLevel().add(List.of(roleRepresentation));
            log.info(">>> ROLE SUCCESS: Assigned {} to user {}", roleName, userId);
        } catch (Exception e) {
            log.error(">>> ROLE ERROR: Failed to assign role {} to user {}: {}", roleName, userId, e.getMessage());
        }
    }

    public void updateUserStatus(String userId, boolean active) {
        if (userId == null || userId.isEmpty()) {
            return;
        }
        try {
            String targetRealm = applicationProperties.getKeycloakAdmin().getTargetRealm();
            UserRepresentation user = new UserRepresentation();
            user.setEnabled(active);
            keycloak.realm(targetRealm).users().get(userId).update(user);
            log.info(">>> KEYCLOAK: Usuario {} ahora está {}", userId, active ? "HABILITADO" : "DESHABILITADO");
        } catch (Exception e) {
            log.error(">>> KEYCLOAK ERROR: No se pudo actualizar estado para {}: {}", userId, e.getMessage());
        }
    }

    public String getUserRole(String userId) {
        if (userId == null || userId.isEmpty()) {
            return null;
        }
        try {
            String targetRealm = applicationProperties.getKeycloakAdmin().getTargetRealm();
            RealmResource realmResource = keycloak.realm(targetRealm);
            List<String> roles = realmResource.users().get(userId).roles().realmLevel().listAll().stream()
                    .map(role -> role.getName())
                    .collect(java.util.stream.Collectors.toList());

            log.debug("Roles for user {}: {}", userId, roles);

            return roles.stream()
                    .filter(name -> name.startsWith("ROLE_")) // JHipster standard roles
                    .findFirst()
                    .orElseGet(() -> roles.stream()
                            .filter(name -> !name.equals("offline_access") && !name.equals("uma_authorization")
                                    && !name.contains("default-roles"))
                            .findFirst()
                            .orElse(null));
        } catch (Exception e) {
            log.warn(">>> KEYCLOAK ERROR: Could not get role for {}: {}", userId, e.getMessage());
            return null;
        }
    }
}

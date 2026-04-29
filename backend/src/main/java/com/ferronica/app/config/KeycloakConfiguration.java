package com.ferronica.app.config;

import org.keycloak.OAuth2Constants;
import org.keycloak.admin.client.Keycloak;
import org.keycloak.admin.client.KeycloakBuilder;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class KeycloakConfiguration {

    private final ApplicationProperties applicationProperties;

    public KeycloakConfiguration(ApplicationProperties applicationProperties) {
        this.applicationProperties = applicationProperties;
    }

    @Bean
    public Keycloak keycloak() {
        ApplicationProperties.KeycloakAdmin config = applicationProperties.getKeycloakAdmin();
        return KeycloakBuilder.builder()
                .serverUrl(config.getServerUrl())
                .realm(config.getRealm())
                .grantType(OAuth2Constants.PASSWORD)
                .clientId(config.getClientId())
                .username(config.getUsername())
                .password(config.getPassword())
                .build();
    }
}

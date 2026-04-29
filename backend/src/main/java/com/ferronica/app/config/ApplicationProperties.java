package com.ferronica.app.config;

import org.springframework.boot.context.properties.ConfigurationProperties;

/**
 * Properties specific to Ferro Nica.
 * <p>
 * Properties are configured in the {@code application.yml} file.
 * See {@link tech.jhipster.config.JHipsterProperties} for a good example.
 */
@ConfigurationProperties(prefix = "application", ignoreUnknownFields = false)
public class ApplicationProperties {

    private final Liquibase liquibase = new Liquibase();

    // jhipster-needle-application-properties-property

    public Liquibase getLiquibase() {
        return liquibase;
    }

    // jhipster-needle-application-properties-property-getter

    public static class Liquibase {

        private Boolean asyncStart = true;

        public Boolean getAsyncStart() {
            return asyncStart;
        }

        public void setAsyncStart(Boolean asyncStart) {
            this.asyncStart = asyncStart;
        }
    }

    private final KeycloakAdmin keycloakAdmin = new KeycloakAdmin();

    public KeycloakAdmin getKeycloakAdmin() {
        return keycloakAdmin;
    }

    public static class KeycloakAdmin {
        private String serverUrl = "http://localhost:9080";
        private String realm = "master";
        private String username = "admin";
        private String password = "admin";
        private String clientId = "admin-cli";
        private String targetRealm = "jhipster";

        public String getServerUrl() {
            return serverUrl;
        }

        public void setServerUrl(String serverUrl) {
            this.serverUrl = serverUrl;
        }

        public String getRealm() {
            return realm;
        }

        public void setRealm(String realm) {
            this.realm = realm;
        }

        public String getUsername() {
            return username;
        }

        public void setUsername(String username) {
            this.username = username;
        }

        public String getPassword() {
            return password;
        }

        public void setPassword(String password) {
            this.password = password;
        }

        public String getClientId() {
            return clientId;
        }

        public void setClientId(String clientId) {
            this.clientId = clientId;
        }

        public String getTargetRealm() {
            return targetRealm;
        }

        public void setTargetRealm(String targetRealm) {
            this.targetRealm = targetRealm;
        }
    }
}

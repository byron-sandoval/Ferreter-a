package com.ferronica.app.security;

/**
 * Constants for Spring Security authorities.
 */
public final class AuthoritiesConstants {

    public static final String ADMIN = "ROLE_ADMIN";
    public static final String USER = "ROLE_USER";
    public static final String VENDEDOR = "ROLE_VENDEDOR";
    public static final String JEFE_BODEGA = "ROLE_JEFE_BODEGA";
    public static final String ANONYMOUS = "ROLE_ANONYMOUS";

    private AuthoritiesConstants() {
    }
}

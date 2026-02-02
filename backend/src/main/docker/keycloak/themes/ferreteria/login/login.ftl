<#import "template.ftl" as layout>
<@layout.registrationLayout displayMessage=!messagesPerField.existsError('username','password') displayInfo=realm.password && realm.registrationAllowed && !registrationDisabled??; section>

<#if section = "header">
<style>
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;600;700&display=swap');

html, body {
    margin: 0;
    height: 100%;
    font-family: 'Inter', sans-serif;
    overflow: hidden;
    /* Fondo principal negro */
    background: #000 !important;
    
    display: flex;
    align-items: center;
    justify-content: center;
}

/* Eliminar estilos feos default */
#kc-header, #kc-header-wrapper { display:none !important; }
#kc-page-container, #kc-content, #kc-content-wrapper, .card-pf, #kc-container-wrapper {
    background: transparent !important;
    box-shadow: none !important;
    border: none !important;
    padding: 0 !important;
    margin: 0 !important;
}

/* ---------- TARJETA CENTRADA ---------- */
.split-container {
    display: flex;
    width: 900px; /* Ancho fijo para aspecto de tarjeta */
    max-width: 90%;
    height: 600px;
    max-height: 90vh;
    
    background: rgba(30, 41, 59, 0.5); /* Fondo semitransparente */
    backdrop-filter: blur(20px); /* Efecto cristal */
    -webkit-backdrop-filter: blur(20px);
    
    border: 1px solid rgba(255, 255, 255, 0.1);
    border-radius: 24px; /* Bordes redondeados */
    box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5); /* Sombra elegante */
    overflow: hidden; /* Recortar contenido para respetar bordes */
}

/* LADO IZQUIERDO LOGIN */
.left-panel {
    width: 45%;
    /* Cambio de Azul a Gris Cálido (Stone/Carbón) para combinar con Naranja */
    background: rgba(60, 56, 53, 0.98); 
    padding: 40px;
    color: white;
    display: flex;
    flex-direction: column;
    justify-content: center;
    position: relative;
}

/* LADO DERECHO IMAGEN */
.right-panel {
    flex: 1;
    /* Más brillo: Gradiente más suave y filtro de brillo */
    background: 
        linear-gradient(135deg, rgba(255, 120, 0, 0.3), rgba(0, 0, 0, 0.1)),
        url("${url.resourcesPath}/img/ferroN.png"); 
    background-size: cover;
    background-position: center;
    position: relative;
    background-color: #0f172a;
    filter: brightness(1.1) contrast(1.1);
}

/* Overlay eliminado para mayor claridad */
/* .right-panel::after { ... } */

/* ---------- ESTILO LOGIN ---------- */
.logo {
    width: 60px;
    margin-bottom: 20px;
    filter: drop-shadow(0 0 8px rgba(255,107,0,0.5));
}

.title {
    font-size: 1.8rem;
    font-weight: 700;
    margin-bottom: 8px;
    color: #fff;
}

.subtitle {
    color: #94a3b8;
    margin-bottom: 30px;
    font-size: 0.9rem;
}

.form-group { margin-bottom: 1.2rem; }

label {
    font-size: 0.85rem;
    color: #cbd5e1;
    margin-bottom: 6px;
    display:block;
    font-weight: 500;
}

input {
    width: 100%;
    padding: 12px 14px;
    border-radius: 10px;
    border: 1px solid #44403c; /* Borde gris cálido */
    background: #292524;       /* Fondo gris cálido oscuro */
    color: white;
    font-size: 0.95rem;
    box-sizing: border-box; /* Importante para padding */
    transition: all 0.2s;
}

input:focus {
    outline:none;
    border-color:#ff6b00;
    background: #44403c; /* Fondo un poco más claro al foco */
    box-shadow:0 0 0 3px rgba(255,107,0,0.15);
}

.btn-primary {
    width:100%;
    padding:12px;
    background: linear-gradient(90deg, #ff6b00, #ff8c00);
    color:white;
    border:none;
    border-radius:10px;
    font-weight: 600;
    font-size: 1rem;
    margin-top:20px;
    cursor:pointer;
    transition: transform 0.1s, box-shadow 0.2s;
}

.btn-primary:hover {
    box-shadow: 0 10px 20px -5px rgba(255, 107, 0, 0.4);
    transform: translateY(-1px);
}

.link {
    color:#ff6b00;
    text-decoration:none;
    font-size:.85rem;
    transition: color 0.2s;
}

.link:hover {
    color: #ff9d4d;
    text-decoration: underline;
}

.footer {
    margin-top: auto;
    padding-top: 20px;
    font-size:.75rem;
    color:#64748b;
    text-align: center;
}

/* Responsive */
@media(max-width:900px){
    .split-container {
        height: auto;
        min-height: 500px;
        flex-direction: column;
        width: 90%;
    }
    .left-panel{
        width:100%;
        padding: 30px;
        box-sizing: border-box;
    }
    .right-panel{display:none;}
}
</style>

<#elseif section = "form">
<div class="split-container">

    <!-- LOGIN -->
    <div class="left-panel">
        <div class="title">FerroNica</div>
        <div class="subtitle">Bienvenido de nuevo</div>

        <#if realm.password>
        <form action="${url.loginAction}" method="post">

            <div class="form-group">
                <label>${msg("usernameOrEmail")}</label>
                <input name="username" type="text" value="${(login.username!'')}" autofocus autocomplete="off" />
            </div>

            <div class="form-group">
                <label>${msg("password")}</label>
                <div style="position:relative">
                    <input name="password" type="password" id="password" autocomplete="off"/>
                </div>
            </div>

            <#if realm.resetPasswordAllowed>
                <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:10px;">
                    <div style="font-size:0.8rem; color:#94a3b8">
                         <#if realm.rememberMe && !usernameEditDisabled??>
                            <#if login.rememberMe??>
                                <input id="rememberMe" name="rememberMe" type="checkbox" checked style="width:auto; margin-right:5px;">
                            <#else>
                                <input id="rememberMe" name="rememberMe" type="checkbox" style="width:auto; margin-right:5px;">
                            </#if>
                            <label for="rememberMe" style="display:inline; color:#94a3b8">${msg("rememberMe")}</label>
                        </#if>
                    </div>
                    <a href="${url.loginResetCredentialsUrl}" class="link">${msg("doForgotPassword")}</a>
                </div>
            </#if>

            <button class="btn-primary" type="submit">${msg("doLogIn")}</button>
        </form>
        </#if>

        <div class="footer">
            &copy; 2026 Sistema de Gestión Ferretera
        </div>
    </div>

    <!-- IMAGEN -->
    <div class="right-panel">
    </div>

</div>
</#if>

</@layout.registrationLayout>

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
    /* Fondo principal oscuro con un toque morado profundo */
    background: #0a0a0c !important;
    
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
    width: 900px; 
    max-width: 95%;
    height: 600px;
    max-height: 90vh;
    
    background: rgba(15, 12, 25, 0.7); /* Fondo oscuro semitransparente */
    backdrop-filter: blur(20px);
    -webkit-backdrop-filter: blur(20px);
    
    border: 1px solid rgba(139, 92, 246, 0.2); /* Borde sutil morado */
    border-radius: 24px;
    box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.8);
    overflow: hidden;
}

/* LADO IZQUIERDO LOGIN */
.left-panel {
    width: 45%;
    /* Morado muy oscuro tirando a negro */
    background: rgba(18, 14, 28, 0.98); 
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
    /* Gradiente más claro para que el logo resalte */
    background: 
        linear-gradient(135deg, rgba(88, 28, 135, 0.2), rgba(10, 10, 15, 0.4)),
        url("${url.resourcesPath}/img/ferroN.png"); 
    background-size: cover;
    background-position: center;
    position: relative;
    background-color: #1a1625;
    filter: brightness(1.1) contrast(1.1);
}

/* ---------- ESTILO LOGIN ---------- */
.title {
    font-size: 2.2rem;
    font-weight: 800;
    margin-bottom: 8px;
    color: #fff;
    letter-spacing: -1px;
    text-transform: uppercase; /* FERRONICA en mayúsculas como pediste */
}

.subtitle {
    color: #a78bfa; /* Morado claro */
    margin-bottom: 30px;
    font-size: 0.9rem;
}

.form-group { margin-bottom: 1.2rem; }

label {
    font-size: 0.85rem;
    color: #94a3b8;
    margin-bottom: 6px;
    display:block;
    font-weight: 500;
}

input {
    width: 100%;
    padding: 12px 14px;
    border-radius: 12px;
    border: 1px solid #2e2a3d; 
    background: #1a1625; 
    color: white;
    font-size: 0.95rem;
    box-sizing: border-box;
    transition: all 0.3s ease;
}

input:focus {
    outline:none;
    border-color:#8b5cf6; /* Morado vibrante al hacer foco */
    background: #241e33;
    box-shadow: 0 0 0 4px rgba(139, 92, 246, 0.2);
}

.btn-primary {
    width:100%;
    padding:14px;
    /* Gradiente Morado */
    background: linear-gradient(90deg, #6d28d9, #8b5cf6);
    color:white;
    border:none;
    border-radius:12px;
    font-weight: 700;
    font-size: 1rem;
    margin-top:20px;
    cursor:pointer;
    transition: all 0.3s;
    text-transform: uppercase;
}

.btn-primary:hover {
    box-shadow: 0 10px 20px -5px rgba(139, 92, 246, 0.5);
    transform: translateY(-2px);
    filter: brightness(1.1);
}

.link {
    color:#a78bfa;
    text-decoration:none;
    font-size:.85rem;
    transition: color 0.2s;
}

.link:hover {
    color: #c4b5fd;
    text-decoration: underline;
}

.footer {
    margin-top: auto;
    padding-top: 20px;
    font-size:.75rem;
    color:#4b5563;
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
        padding: 40px 30px;
        box-sizing: border-box;
    }
    .right-panel{display:none;}
}
</style>

<#elseif section = "form">
<div class="split-container">

    <div class="left-panel">
        <div class="title">FERRONICA</div>

        <#if realm.password>
        <form action="${url.loginAction}" method="post">

            <div class="form-group">
                <label>${msg("usernameOrEmail")}</label>
                <input name="username" type="text" value="${(login.username!'')}" autofocus autocomplete="off" placeholder="Username" />
            </div>

            <div class="form-group">
                <label>${msg("password")}</label>
                <div style="position:relative">
                    <input name="password" type="password" id="password" autocomplete="off" placeholder="••••••••"/>
                </div>
            </div>

            <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:10px;">
                <div style="font-size:0.8rem; color:#94a3b8">
                     <#if realm.rememberMe && !usernameEditDisabled??>
                        <input id="rememberMe" name="rememberMe" type="checkbox" <#if login.rememberMe??>checked</#if> style="width:auto; margin-right:5px;">
                        <label for="rememberMe" style="display:inline; color:#94a3b8">${msg("rememberMe")}</label>
                    </#if>
                </div>
                <#if realm.resetPasswordAllowed>
                    <a href="${url.loginResetCredentialsUrl}" class="link">Forgot Password?</a>
                </#if>
            </div>

            <button class="btn-primary" type="submit">SIGN IN</button>
        </form>
        </#if>

    </div>

    <div class="right-panel">
    </div>

</div>
</#if>

</@layout.registrationLayout>
<#import "template.ftl" as layout>
<@layout.registrationLayout displayMessage=!messagesPerField.existsError('password','password-confirm') displayInfo=true; section>
    <#if section = "header">
        <style>
            @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;600;700&display=swap');

            html, body {
                margin: 0;
                height: 100%;
                font-family: 'Inter', sans-serif;
                overflow: hidden;
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
            .main-card {
                width: 450px;
                max-width: 90%;
                background: rgba(60, 56, 53, 0.98); 
                padding: 40px;
                color: white;
                border: 1px solid rgba(255, 255, 255, 0.1);
                border-radius: 24px;
                box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5);
                display: flex;
                flex-direction: column;
                justify-content: center;
                position: relative;
                backdrop-filter: blur(20px);
                -webkit-backdrop-filter: blur(20px);
            }

            .title {
                font-size: 1.8rem;
                font-weight: 700;
                margin-bottom: 8px;
                color: #fff;
                text-align: center;
            }

            .subtitle {
                color: #94a3b8;
                margin-bottom: 30px;
                font-size: 0.9rem;
                text-align: center;
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
                border: 1px solid #44403c;
                background: #292524;
                color: white;
                font-size: 0.95rem;
                box-sizing: border-box;
                transition: all 0.2s;
            }

            input:focus {
                outline:none;
                border-color:#ff6b00;
                background: #44403c;
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

            .alert-error {
                background: rgba(239, 68, 68, 0.1);
                border: 1px solid rgba(239, 68, 68, 0.2);
                color: #f87171;
                padding: 10px;
                border-radius: 8px;
                margin-bottom: 20px;
                font-size: 0.85rem;
                text-align: center;
            }

            .footer {
                margin-top: 30px;
                font-size:.75rem;
                color:#64748b;
                text-align: center;
            }
        </style>
    <#elseif section = "form">
        <div class="main-card">
            <div class="title">FerroNica</div>
            <div class="subtitle">Actualizar Contraseña</div>

            <#if messagesPerField.existsError('password','password-confirm')>
                <div class="alert-error">
                    ${msg("passwordErrorMessage")}
                </div>
            </#if>

            <form id="kc-passwd-update-form" action="${url.loginAction}" method="post">
                <input type="text" id="username" name="username" value="${(login.username!'')}" autocomplete="username" readonly="readonly" style="display:none;"/>
                <input type="password" id="password" name="password" autocomplete="current-password" style="display:none;"/>

                <div class="form-group">
                    <label for="password-new">${msg("passwordNew")}</label>
                    <input type="password" id="password-new" name="password-new" autofocus autocomplete="new-password" required />
                </div>

                <div class="form-group">
                    <label for="password-confirm">${msg("passwordConfirm")}</label>
                    <input type="password" id="password-confirm" name="password-confirm" autocomplete="new-password" required />
                </div>

                <#if isAppInitiatedAction??>
                    <div style="display:flex; align-items:center; margin-bottom:10px;">
                        <input type="checkbox" id="logout-sessions" name="logout-sessions" value="on" checked style="width:auto; margin-right:8px;">
                        <label for="logout-sessions" style="display:inline; margin-bottom:0; font-size: 0.8rem; color:#94a3b8">${msg("logoutOtherSessions")}</label>
                    </div>
                </#if>

                <button class="btn-primary" type="submit">
                    ${msg("doSubmit")}
                </button>
            </form>

            <div class="footer">
                &copy; 2026 Sistema de Gestión Ferretera
            </div>
        </div>
    </#if>
</@layout.registrationLayout>
const fs = require('fs');
const path = require('path');
const dotenv = require('dotenv');

// Cargar variables del archivo .env raíz del frontend
const envPath = path.resolve(__dirname, '../.env');
let parsedEnv = {};
if (fs.existsSync(envPath)) {
  parsedEnv = dotenv.parse(fs.readFileSync(envPath));
}
dotenv.config({ path: envPath, override: true });

module.exports = {
  // APP_VERSION is passed as an environment variable from the Gradle / Maven build tasks.
  VERSION: process.env.APP_VERSION || 'DEV',
  // The root URL for API calls, ending with a '/' - for example: `"https://www.jhipster.tech:8081/myservice/"`.
  // If this URL is left empty (""), then it will be relative to the current context.
  // If you use an API server, in `prod` mode, you will need to enable CORS
  // (see the `jhipster.cors` common JHipster property in the `application-*.yml` configurations)
  SERVER_API_URL: '',
  // Stripe: clave pública cargada desde el .env del frontend (priorizando el archivo sobre el OS)
  STRIPE_PUBLISHABLE_KEY: parsedEnv.REACT_APP_STRIPE_PUBLISHABLE_KEY || process.env.REACT_APP_STRIPE_PUBLISHABLE_KEY || '',
};

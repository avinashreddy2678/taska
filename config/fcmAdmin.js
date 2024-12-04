import admin from "firebase-admin";
import dotenv from "dotenv";

// Load environment variables from .env file
dotenv.config();

// Create a service account object from environment variables
let serverJson = {
  type: process.env.type,
  project_id: process.env.project_id,
  private_key_id: process.env.private_key_id,
  private_key: process.env.private_key.replace(/\\n/g, "\n"),
  client_email: process.env.client_email,
  client_id: process.env.client_id,
  auth_uri: process.env.auth_uri,
  token_uri: process.env.token_uri,
  auth_provider_x509_cert_url: process.env.auth_provider_x509_cert_url,
  client_x509_cert_url: process.env.client_x509_cert_url,
  universe_domain: process.env.universe_domain,
};

// Initialize Firebase Admin SDK with the service account credentials
admin.initializeApp({
  credential: admin.credential.cert(serverJson),
});

export default admin;

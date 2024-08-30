import { initializeApp, getApps, cert } from "firebase-admin/app";

export default defineNitroPlugin((nitroApp) => {
  const apps = getApps();
  const { credential } = useRuntimeConfig();

  if (!apps.length) {
    initializeApp({
      credential: cert({
        clientEmail: credential.client_email,
        privateKey: credential.private_key,
        projectId: credential.project_id,
      }),
    });
  }
});

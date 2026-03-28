let registrationPromise: Promise<ServiceWorkerRegistration | null> | null = null;

const serviceWorkerUrl = `${import.meta.env.BASE_URL}service-worker.js`;

const register = async () => {
  if (!("serviceWorker" in navigator)) {
    return null;
  }

  try {
    const registration = await navigator.serviceWorker.register(serviceWorkerUrl);
    void registration.update().catch(() => undefined);
    return registration;
  } catch (error) {
    console.error("Service worker registration failed", error);
    return null;
  }
};

export const registerServiceWorker = () => {
  if (!registrationPromise) {
    registrationPromise = register();
  }

  return registrationPromise;
};

export const getServiceWorkerRegistration = async () => {
  if (!("serviceWorker" in navigator)) {
    return null;
  }

  if (registrationPromise) {
    return registrationPromise;
  }

  const existing = await navigator.serviceWorker.getRegistration();
  if (existing) {
    registrationPromise = Promise.resolve(existing);
    return existing;
  }

  return registerServiceWorker();
};

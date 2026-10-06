export function getPlatformHostname(): string {
  const configuredDomain = import.meta.env.VITE_PLATFORM_DOMAIN.trim();

  if (!configuredDomain) {
    throw new Error("Configure VITE_PLATFORM_DOMAIN com o domínio da plataforma.");
  }

  const url = new URL(
    /^https?:\/\//i.test(configuredDomain)
      ? configuredDomain
      : `https://${configuredDomain}`,
  );

  if (url.protocol !== "https:") {
    throw new Error("VITE_PLATFORM_DOMAIN deve usar HTTPS.");
  }

  return url.hostname.toLowerCase();
}

export function getBaseUrl() {
  return (
    window.location.origin + window.location.pathname.replace('iframe.html', '')
  );
}

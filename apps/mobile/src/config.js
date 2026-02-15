import Constants from "expo-constants";

function resolveAutoApiBaseUrl() {
  const hostUri =
    Constants?.expoConfig?.hostUri ||
    Constants?.manifest2?.extra?.expoClient?.hostUri ||
    Constants?.manifest?.debuggerHost ||
    "";

  const host = hostUri ? hostUri.split(":")[0] : "";
  if (!host) return "";
  return `http://${host}:3001`;
}

const AUTO_API_BASE_URL = resolveAutoApiBaseUrl();
const DEV_API_BASE_URL = process.env.EXPO_PUBLIC_API_BASE_URL || AUTO_API_BASE_URL || "http://127.0.0.1:3001";

export const API_BASE_URL = __DEV__
  ? DEV_API_BASE_URL
  : "https://your-vercel-app.vercel.app";

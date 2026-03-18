import { ConfigContext, ExpoConfig } from "expo/config";

const IS_DEV = process.env.APP_VARIANT === "development";
const IS_PREVIEW = process.env.APP_VARIANT === "preview";

const getUniqueIdentifier = () => {
  if (IS_DEV) {
    return "com.peff.guttakalender.dev";
  }

  if (IS_PREVIEW) {
    return "com.peff.guttakalender.preview";
  }

  return "com.peff.guttakalender";
};

const getAppName = () => {
  if (IS_DEV) {
    return "Guttakalender (Dev)";
  }

  if (IS_PREVIEW) {
    return "Guttakalender";
  }

  return "Guttakalender";
};

export default ({ config }: ConfigContext): ExpoConfig => ({
  ...config,
  name: getAppName(),
  slug: "guttakalender",
  version: "1.0.0",
  orientation: "portrait",
  icon: "./assets/GuttaIkon.icon/Assets/icon-1771195325299.png",
  scheme: "guttakalender",
  userInterfaceStyle: "automatic",
  ios: {
    supportsTablet: true,
    bundleIdentifier: getUniqueIdentifier(),
    icon: "./assets/GuttaIkon.icon",
    infoPlist: {
      ITSAppUsesNonExemptEncryption: false,
    },
  },
  android: {
    adaptiveIcon: {
      backgroundColor: "#E6F4FE",
      foregroundImage: "./assets/GuttaIkon.icon/Assets/icon-1771195325299.png",
    },
    predictiveBackGestureEnabled: false,
    package: getUniqueIdentifier(),
  },
  web: {
    output: "static",
    favicon: "./assets/GuttaIkon.icon/Assets/icon-1771195325299.png",
  },
  plugins: [
    "expo-router",
    [
      "expo-splash-screen",
      {
        image: "./assets/GuttaIkon.icon/Assets/icon-1771195325299.png",
        imageWidth: 200,
        resizeMode: "contain",
        backgroundColor: "#ffffff",
        dark: {
          backgroundColor: "#000000",
        },
      },
    ],
    "expo-secure-store",
    "expo-notifications",
    "expo-font",
    "expo-image",
    "expo-web-browser",
  ],
  experiments: {
    typedRoutes: true,
    reactCompiler: true,
  },
  extra: {
    router: {},
    eas: {
      projectId: "b69b0065-a241-4817-b2c8-35c4ef237434",
    },
  },
  owner: "peff",
});

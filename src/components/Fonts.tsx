import { PlusJakartaSans_200ExtraLight } from "@expo-google-fonts/plus-jakarta-sans/200ExtraLight";
import { PlusJakartaSans_200ExtraLight_Italic } from "@expo-google-fonts/plus-jakarta-sans/200ExtraLight_Italic";
import { PlusJakartaSans_300Light } from "@expo-google-fonts/plus-jakarta-sans/300Light";
import { PlusJakartaSans_300Light_Italic } from "@expo-google-fonts/plus-jakarta-sans/300Light_Italic";
import { PlusJakartaSans_400Regular } from "@expo-google-fonts/plus-jakarta-sans/400Regular";
import { PlusJakartaSans_400Regular_Italic } from "@expo-google-fonts/plus-jakarta-sans/400Regular_Italic";
import { PlusJakartaSans_500Medium } from "@expo-google-fonts/plus-jakarta-sans/500Medium";
import { PlusJakartaSans_500Medium_Italic } from "@expo-google-fonts/plus-jakarta-sans/500Medium_Italic";
import { PlusJakartaSans_600SemiBold } from "@expo-google-fonts/plus-jakarta-sans/600SemiBold";
import { PlusJakartaSans_600SemiBold_Italic } from "@expo-google-fonts/plus-jakarta-sans/600SemiBold_Italic";
import { PlusJakartaSans_700Bold } from "@expo-google-fonts/plus-jakarta-sans/700Bold";
import { PlusJakartaSans_700Bold_Italic } from "@expo-google-fonts/plus-jakarta-sans/700Bold_Italic";
import { PlusJakartaSans_800ExtraBold } from "@expo-google-fonts/plus-jakarta-sans/800ExtraBold";
import { PlusJakartaSans_800ExtraBold_Italic } from "@expo-google-fonts/plus-jakarta-sans/800ExtraBold_Italic";
import { useFonts } from "@expo-google-fonts/plus-jakarta-sans/useFonts";
import { ScrollView, Text } from "react-native";

export function FontTest() {
  let [fontsLoaded] = useFonts({
    PlusJakartaSans_200ExtraLight,
    PlusJakartaSans_300Light,
    PlusJakartaSans_400Regular,
    PlusJakartaSans_500Medium,
    PlusJakartaSans_600SemiBold,
    PlusJakartaSans_700Bold,
    PlusJakartaSans_800ExtraBold,
    PlusJakartaSans_200ExtraLight_Italic,
    PlusJakartaSans_300Light_Italic,
    PlusJakartaSans_400Regular_Italic,
    PlusJakartaSans_500Medium_Italic,
    PlusJakartaSans_600SemiBold_Italic,
    PlusJakartaSans_700Bold_Italic,
    PlusJakartaSans_800ExtraBold_Italic,
  });

  let fontSize = 20;

  if (!fontsLoaded) {
    return null;
  } else {
    return (
      <ScrollView
        contentContainerStyle={{
          flexGrow: 1,
          borderTopColor: "red",
          borderTopWidth: 1,
        }}
      >
        <Text style={{ fontSize: 20, fontWeight: "bold" }}>Fonts testing</Text>
        <Text
          style={{
            fontSize,
            // Note the quoting of the value for `fontFamily` here; it expects a string!
            fontFamily: "PlusJakartaSans_200ExtraLight",
          }}
        >
          Plus Jakarta Sans Extra Light
        </Text>
        <Text
          style={{
            fontSize,
            // Note the quoting of the value for `fontFamily` here; it expects a string!
            fontFamily: "PlusJakartaSans_300Light",
          }}
        >
          Plus Jakarta Sans Light
        </Text>
        <Text
          style={{
            fontSize,
            // Note the quoting of the value for `fontFamily` here; it expects a string!
            fontFamily: "PlusJakartaSans_400Regular",
          }}
        >
          Plus Jakarta Sans Regular
        </Text>
        <Text
          style={{
            fontSize,
            // Note the quoting of the value for `fontFamily` here; it expects a string!
            fontFamily: "PlusJakartaSans_500Medium",
          }}
        >
          Plus Jakarta Sans Medium
        </Text>
        <Text
          style={{
            fontSize,
            // Note the quoting of the value for `fontFamily` here; it expects a string!
            fontFamily: "PlusJakartaSans_600SemiBold",
          }}
        >
          Plus Jakarta Sans Semi Bold
        </Text>
        <Text
          style={{
            fontSize,
            // Note the quoting of the value for `fontFamily` here; it expects a string!
            fontFamily: "PlusJakartaSans_700Bold",
          }}
        >
          Plus Jakarta Sans Bold
        </Text>
        <Text
          style={{
            fontSize,
            // Note the quoting of the value for `fontFamily` here; it expects a string!
            fontFamily: "PlusJakartaSans_800ExtraBold",
          }}
        >
          Plus Jakarta Sans Extra Bold
        </Text>
        <Text
          style={{
            fontSize,
            // Note the quoting of the value for `fontFamily` here; it expects a string!
            fontFamily: "PlusJakartaSans_200ExtraLight_Italic",
          }}
        >
          Plus Jakarta Sans Extra Light Italic
        </Text>
        <Text
          style={{
            fontSize,
            // Note the quoting of the value for `fontFamily` here; it expects a string!
            fontFamily: "PlusJakartaSans_300Light_Italic",
          }}
        >
          Plus Jakarta Sans Light Italic
        </Text>
        <Text
          style={{
            fontSize,
            // Note the quoting of the value for `fontFamily` here; it expects a string!
            fontFamily: "PlusJakartaSans_400Regular_Italic",
          }}
        >
          Plus Jakarta Sans Italic
        </Text>
        <Text
          style={{
            fontSize,
            // Note the quoting of the value for `fontFamily` here; it expects a string!
            fontFamily: "PlusJakartaSans_500Medium_Italic",
          }}
        >
          Plus Jakarta Sans Medium Italic
        </Text>
        <Text
          style={{
            fontSize,
            // Note the quoting of the value for `fontFamily` here; it expects a string!
            fontFamily: "PlusJakartaSans_600SemiBold_Italic",
          }}
        >
          Plus Jakarta Sans Semi Bold Italic
        </Text>
        <Text
          style={{
            fontSize,
            // Note the quoting of the value for `fontFamily` here; it expects a string!
            fontFamily: "PlusJakartaSans_700Bold_Italic",
          }}
        >
          Plus Jakarta Sans Bold Italic
        </Text>
        <Text
          style={{
            fontSize,
            // Note the quoting of the value for `fontFamily` here; it expects a string!
            fontFamily: "PlusJakartaSans_800ExtraBold_Italic",
          }}
        >
          Plus Jakarta Sans Extra Bold Italic
        </Text>
      </ScrollView>
    );
  }
}

import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { Button } from "@/lib/components/Button";
import { Input } from "@/lib/components/Input";
import { Ionicons } from "@expo/vector-icons";
import { LegendList, LegendListRef } from "@legendapp/list";
import { useHeaderHeight } from "@react-navigation/elements";
import { useMutation, useQuery } from "convex/react";
import { useGlobalSearchParams } from "expo-router";
import { useEffect, useRef, useState } from "react";

import { useGradualAnimation } from "@/lib/hooks/useGradualAnimation";
import { ChatMessageBubble } from "@/src/components/ChatMessageBubble";
import {
  ActivityIndicator,
  Keyboard,
  NativeScrollEvent,
  NativeSyntheticEvent,
  Platform,
  Pressable,
  Animated as RNAnimated,
  StyleSheet,
  Text,
  View,
} from "react-native";
import Animated, { useAnimatedStyle } from "react-native-reanimated";

export default function Chat() {
  const { id } = useGlobalSearchParams<{ id?: string | string[] }>();
  const groupId = Array.isArray(id) ? id[0] : id;
  const headerHeight = useHeaderHeight();

  const [keyboardVisible, setKeyboardVisible] = useState(false);

  useEffect(() => {
    const showEvent =
      Platform.OS === "ios" ? "keyboardWillShow" : "keyboardDidShow";
    const hideEvent =
      Platform.OS === "ios" ? "keyboardWillHide" : "keyboardDidHide";

    const showSub = Keyboard.addListener(showEvent, () =>
      setKeyboardVisible(true),
    );
    const hideSub = Keyboard.addListener(hideEvent, () =>
      setKeyboardVisible(false),
    );

    return () => {
      showSub.remove();
      hideSub.remove();
    };
  }, []);

  const messages = useQuery(
    api.chat.getChats,
    groupId ? { groupId: groupId as Id<"groups"> } : "skip",
  );
  const users = useQuery(api.users.getUsers);
  const currentUser = useQuery(api.users.getCurrentUser);
  const sendMessage = useMutation(api.chat.addChat);
  const chatContainerRef = useRef<LegendListRef>(null);

  const [showScrollBtn, setShowScrollBtn] = useState(false);
  const bounceAnim = useRef(new RNAnimated.Value(0)).current;

  useEffect(() => {
    if (showScrollBtn) {
      const loop = RNAnimated.loop(
        RNAnimated.sequence([
          RNAnimated.timing(bounceAnim, {
            toValue: -6,
            duration: 450,
            useNativeDriver: true,
          }),
          RNAnimated.timing(bounceAnim, {
            toValue: 0,
            duration: 450,
            useNativeDriver: true,
          }),
        ]),
      );
      loop.start();
      return () => loop.stop();
    } else {
      bounceAnim.setValue(0);
    }
  }, [showScrollBtn]);

  const handleScroll = (e: NativeSyntheticEvent<NativeScrollEvent>) => {
    const { contentOffset, layoutMeasurement, contentSize } = e.nativeEvent;
    const distanceFromBottom =
      contentSize.height - contentOffset.y - layoutMeasurement.height;
    setShowScrollBtn(distanceFromBottom > 100);
  };

  function scrollToBottom(animated: boolean = true) {
    chatContainerRef.current?.scrollToEnd({ animated });
  }

  const [message, setMessage] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSend = async () => {
    const trimmed = message.trim();
    if (!trimmed || !groupId) return;

    setError(null);
    setIsSending(true);
    try {
      await sendMessage({ message: trimmed, groupId: groupId as Id<"groups"> });
      setMessage("");
    } catch (sendError) {
      setError(
        sendError instanceof Error
          ? sendError.message
          : "Kunne ikke sende melding.",
      );
    } finally {
      setIsSending(false);
    }
  };

  function isChatFromUser(messageUserId: string) {
    return messageUserId === currentUser?._id;
  }

  function getUserFromId(userId?: string) {
    return users?.find((user) => user._id === userId);
  }

  const isLoading =
    messages === undefined || users === undefined || currentUser === undefined;

  const { height } = useGradualAnimation();

  const keyboardPadding = useAnimatedStyle(() => {
    return {
      height: height.value,
    };
  }, []);

  const hasInitialScrolled = useRef(false);

  if (isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator />
      </View>
    );
  }

  return (
    <View style={{ flex: 1 }}>
      {/* <ScrollView
        automaticallyAdjustKeyboardInsets={true}
        // keyboardShouldPersistTaps="handled"
        // keyboardDismissMode="interactive"
        contentContainerStyle={{ flex: 1 }}
      > */}
      <View style={{ flex: 1 }}>
        <LegendList
          ref={chatContainerRef}
          data={messages ?? []}
          renderItem={({ item }) => {
            const user = getUserFromId(item.userId);
            const isCurrentUser = isChatFromUser(item.userId);
            return (
              <ChatMessageBubble
                message={item}
                userName={user?.name ?? "Ukjent"}
                isCurrentUser={isCurrentUser}
                currentUserId={currentUser?._id}
              />
            );
          }}
          keyExtractor={(item) => item._id}
          contentContainerStyle={{
            // paddingTop: Platform.OS === "ios" ? headerHeight : 0,
            paddingHorizontal: 10,
            paddingBottom: 10,
          }}
          // scrollIndicatorInsets={{ top: headerHeight }}
          ItemSeparatorComponent={() => <View style={{ height: 8 }} />}
          recycleItems={true}
          onContentSizeChange={() => {
            if (!hasInitialScrolled.current) {
              hasInitialScrolled.current = true;
              chatContainerRef.current?.scrollToEnd({ animated: false });
            }
          }}
          alignItemsAtEnd // Aligns to the end of the screen, so if there's only a few items there will be enough padding at the top to make them appear to be at the bottom.
          maintainScrollAtEnd // prop will check if you are already scrolled to the bottom when data changes, and if so it keeps you scrolled to the bottom.
          maintainScrollAtEndThreshold={0.5} // prop will check if you are already scrolled to the bottom when data changes, and if so it keeps you scrolled to the bottom.
          maintainVisibleContentPosition //Automatically adjust item positions when items are added/removed/resized above the viewport so that there is no shift in the visible content.
          // estimatedItemSize={60} // estimated height of the item
          waitForInitialLayout
          onScroll={handleScroll}
          // scrollEventThrottle={100}
          ListEmptyComponent={
            <View style={styles.centeredInfo}>
              <Text style={styles.infoText}>
                Ingen meldinger enda. Vær den forste!
              </Text>
            </View>
          }
        />

        {showScrollBtn && (
          <RNAnimated.View
            style={[
              styles.scrollBtnWrapper,
              { transform: [{ translateY: bounceAnim }] },
            ]}
            pointerEvents="box-none"
          >
            <Pressable
              onPress={() => scrollToBottom(true)}
              style={({ pressed }) => [
                styles.scrollBtn,
                pressed && { opacity: 0.7 },
              ]}
            >
              <Ionicons name="chevron-down" size={18} color="#fff" />
            </Pressable>
          </RNAnimated.View>
        )}
      </View>

      <View
        style={[
          styles.form,
          { marginBottom: keyboardVisible ? 0 : headerHeight - 20 },
        ]}
      >
        <Input
          containerStyle={styles.inputContainer}
          value={message}
          multiline
          onChangeText={setMessage}
          placeholder="Send en melding til boaza..."
          editable={!isSending}
          style={styles.input}
          returnKeyType="send"
          blurOnSubmit={false}
          onSubmitEditing={() => void handleSend()}
        />
        <Button
          title={isSending ? "Sender..." : "Send"}
          onPress={() => void handleSend()}
          disabled={isSending || message.trim().length === 0}
        />
      </View>
      {error ? <Text style={styles.errorText}>{error}</Text> : null}
      {/* </ScrollView> */}
      <Animated.View style={keyboardPadding} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  chatArea: {
    flex: 1,
  },
  chatContent: {
    padding: 12,
  },
  centeredInfo: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  infoText: {
    fontSize: 14,
    color: "#6B7280",
    textAlign: "center",
  },
  form: {
    borderTopWidth: 1,
    borderTopColor: "#E5E7EB",
    padding: 12,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    fontFamily: "PlusJakartaSans_200ExtraLight",
  },
  input: {
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#D1D5DB",
    backgroundColor: "#FFFFFF",
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
    color: "#111827",
  },
  inputContainer: {
    flex: 1,
    minWidth: 0,
  },
  errorText: {
    color: "#B91C1C",
    backgroundColor: "#FEE2E2",
    borderTopWidth: 1,
    borderTopColor: "#FCA5A5",
    paddingHorizontal: 12,
    paddingVertical: 8,
    fontSize: 12,
  },
  scrollBtnWrapper: {
    position: "absolute",
    bottom: 12,
    left: 0,
    right: 0,
    alignItems: "center",
    pointerEvents: "box-none",
  },
  scrollBtn: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: "#6B7280",
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 4,
  },
});

import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { Button } from "@/lib/components/Button";
import { Input } from "@/lib/components/Input";
import { usePushNotifications } from "@/lib/hooks/usePushNotifications";
import { Ionicons } from "@expo/vector-icons";
import { LegendList, LegendListRef } from "@legendapp/list";
import { useHeaderHeight } from "@react-navigation/elements";
import { useMutation, useQuery } from "convex/react";
import { useGlobalSearchParams } from "expo-router";
import { useEffect, useRef, useState } from "react";

import {
  ActivityIndicator,
  Animated,
  KeyboardAvoidingView,
  NativeScrollEvent,
  NativeSyntheticEvent,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { ChatMessageBubble } from "../../../../components/ChatMessageBubble";

export default function Chat() {
  const { id } = useGlobalSearchParams<{ id?: string | string[] }>();
  const groupId = Array.isArray(id) ? id[0] : id;
  const headerHeight = useHeaderHeight();

  const messages = useQuery(
    api.chat.getChats,
    groupId ? { groupId: groupId as Id<"groups"> } : "skip",
  );
  const users = useQuery(api.users.getUsers);
  const currentUser = useQuery(api.users.getCurrentUser);
  const sendMessage = useMutation(api.chat.addChat);
  const chatContainerRef = useRef<LegendListRef>(null);

  const [showScrollBtn, setShowScrollBtn] = useState(false);
  const bounceAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (showScrollBtn) {
      const loop = Animated.loop(
        Animated.sequence([
          Animated.timing(bounceAnim, {
            toValue: -6,
            duration: 450,
            useNativeDriver: true,
          }),
          Animated.timing(bounceAnim, {
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

  function scrollToBottom() {
    chatContainerRef.current?.scrollToEnd({ animated: true });
  }

  usePushNotifications();

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

  if (isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator />
      </View>
    );
  }

  return (
    <SafeAreaView style={{ flex: 1 }} edges={["bottom"]}>
      <KeyboardAvoidingView
        // behavior={Platform.OS === "ios" ? "padding" : "height"}
        behavior="padding"
        style={{ flex: 1 }}
        // keyboardVerticalOffset accounts for the header so the form
        // doesn't end up behind the nav bar when the keyboard opens
        // keyboardVerticalOffset={headerHeight}
      >
        {messages.length === 0 ? (
          <View style={styles.centeredInfo}>
            <Text style={styles.infoText}>
              Ingen meldinger enda. Vaer den forste!
            </Text>
          </View>
        ) : (
          <>
            <LegendList
              ref={chatContainerRef}
              data={messages}
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
                paddingTop: headerHeight + 10,
                paddingHorizontal: 10,
                paddingBottom: 10,
              }}
              scrollIndicatorInsets={{ top: headerHeight }}
              ItemSeparatorComponent={() => <View style={{ height: 8 }} />}
              recycleItems={true}
              initialScrollIndex={messages.length - 1}
              alignItemsAtEnd // Aligns to the end of the screen, so if there's only a few items there will be enough padding at the top to make them appear to be at the bottom.
              maintainScrollAtEnd // prop will check if you are already scrolled to the bottom when data changes, and if so it keeps you scrolled to the bottom.
              maintainScrollAtEndThreshold={0.5} // prop will check if you are already scrolled to the bottom when data changes, and if so it keeps you scrolled to the bottom.
              maintainVisibleContentPosition //Automatically adjust item positions when items are added/removed/resized above the viewport so that there is no shift in the visible content.
              estimatedItemSize={100} // estimated height of the item
              onScroll={handleScroll}
              scrollEventThrottle={100}
            />

            {showScrollBtn && (
              <Animated.View
                style={[
                  styles.scrollBtnWrapper,
                  { transform: [{ translateY: bounceAnim }] },
                ]}
                pointerEvents="box-none"
              >
                <Pressable
                  onPress={scrollToBottom}
                  style={({ pressed }) => [
                    styles.scrollBtn,
                    pressed && { opacity: 0.7 },
                  ]}
                >
                  <Ionicons name="chevron-down" size={18} color="#fff" />
                </Pressable>
              </Animated.View>
            )}
          </>
        )}

        <View>
          <View style={styles.form}>
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
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
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

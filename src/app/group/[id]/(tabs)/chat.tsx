import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { Button } from "@/lib/components/Button";
import { Input } from "@/lib/components/Input";
import { Ionicons } from "@expo/vector-icons";
import { useMutation, useQuery } from "convex/react";
import Constants from "expo-constants";
import { useGlobalSearchParams } from "expo-router";
import { useEffect, useRef, useState } from "react";
import {
  Animated,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { ChatMessageBubble } from "../../../../components/ChatMessageBubble";

export default function Chat() {
  const insets = useSafeAreaInsets();
  const { id } = useGlobalSearchParams<{ id?: string | string[] }>();
  const groupId = Array.isArray(id) ? id[0] : id;
  const messages = useQuery(
    api.chat.getChats,
    groupId ? { groupId: groupId as Id<"groups"> } : "skip",
  );
  const users = useQuery(api.users.getUsers);
  const currentUser = useQuery(api.users.getCurrentUser);
  const sendMessage = useMutation(api.chat.addChat);
  const savePushToken = useMutation(api.users.savePushToken);

  const [message, setMessage] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showScrollToBottom, setShowScrollToBottom] = useState(false);
  const chatContainerRef = useRef<ScrollView>(null);
  const bounceAnim = useRef(new Animated.Value(0)).current;
  const isAtBottomRef = useRef(true);

  const scrollToBottom = (animated: boolean) => {
    requestAnimationFrame(() => {
      chatContainerRef.current?.scrollToEnd({ animated });
    });
  };

  useEffect(() => {
    if (messages && messages.length > 0) {
      scrollToBottom(false);
    }
  }, [messages]);

  useEffect(() => {
    if (!showScrollToBottom) {
      bounceAnim.stopAnimation();
      bounceAnim.setValue(0);
      return;
    }

    const animation = Animated.loop(
      Animated.sequence([
        Animated.timing(bounceAnim, {
          toValue: 1,
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
    animation.start();

    return () => {
      animation.stop();
    };
  }, [bounceAnim, showScrollToBottom]);

  useEffect(() => {
    if (Platform.OS !== "ios" && Platform.OS !== "android") {
      return;
    }
    if (!currentUser?._id) {
      return;
    }

    const registerForPush = async () => {
      try {
        const Notifications = await import("expo-notifications");

        if (Platform.OS === "android") {
          await Notifications.setNotificationChannelAsync("default", {
            name: "default",
            importance: Notifications.AndroidImportance.MAX,
            vibrationPattern: [0, 250, 250, 250],
            lightColor: "#FFD33D",
          });
        }

        const { status: existingStatus } =
          await Notifications.getPermissionsAsync();
        let finalStatus = existingStatus;

        if (existingStatus !== "granted") {
          const permission = await Notifications.requestPermissionsAsync();
          finalStatus = permission.status;
        }

        if (finalStatus !== "granted") {
          return;
        }

        const projectId =
          Constants.expoConfig?.extra?.eas?.projectId ??
          Constants.easConfig?.projectId;
        if (!projectId) {
          return;
        }

        const tokenResult = await Notifications.getExpoPushTokenAsync({
          projectId,
        });
        await savePushToken({
          token: tokenResult.data,
          platform: Platform.OS as "ios" | "android",
        });
      } catch {
        // Token registration can fail on unsupported devices/simulators.
      }
    };

    void registerForPush();
  }, [currentUser?._id, savePushToken]);

  const handleSend = async () => {
    const trimmed = message.trim();
    if (!trimmed || !groupId) {
      return;
    }
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

  function handleChatScroll(event: {
    nativeEvent: {
      contentOffset: { y: number };
      contentSize: { height: number };
      layoutMeasurement: { height: number };
    };
  }) {
    const { contentOffset, contentSize, layoutMeasurement } = event.nativeEvent;
    const distanceFromBottom =
      contentSize.height - (contentOffset.y + layoutMeasurement.height);
    const isAtBottom = distanceFromBottom <= 36;

    if (isAtBottom !== isAtBottomRef.current) {
      isAtBottomRef.current = isAtBottom;
      setShowScrollToBottom(!isAtBottom);
    }
  }

  const nativeTabBarHeight = Platform.select({
    ios: 49,
    android: 56,
    default: 0,
  });

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      keyboardVerticalOffset={40}
      enabled
    >
      <View style={styles.chatArea}>
        <ScrollView
          ref={chatContainerRef}
          style={styles.chatContainer}
          contentContainerStyle={styles.chatContent}
          onScroll={handleChatScroll}
          scrollEventThrottle={16}
          keyboardShouldPersistTaps="handled"
          keyboardDismissMode={
            Platform.OS === "ios" ? "interactive" : "on-drag"
          }
        >
          {messages === undefined ||
          users === undefined ||
          currentUser === undefined ? (
            <Text style={styles.infoText}>Laster meldinger...</Text>
          ) : messages.length === 0 ? (
            <Text style={styles.infoText}>
              Ingen meldinger enda. Vaer den forste!
            </Text>
          ) : (
            messages.map((msg) => {
              const user = getUserFromId(msg.userId);
              const isCurrentUser = isChatFromUser(msg.userId);

              return (
                <ChatMessageBubble
                  key={msg._id}
                  message={msg}
                  userName={user?.name ?? "Ukjent"}
                  isCurrentUser={isCurrentUser}
                  currentUserId={currentUser?._id}
                />
              );
            })
          )}
        </ScrollView>
        {showScrollToBottom ? (
          <Animated.View
            style={[
              styles.scrollToBottomWrapper,
              {
                transform: [
                  {
                    translateY: bounceAnim.interpolate({
                      inputRange: [0, 1],
                      outputRange: [0, 6],
                    }),
                  },
                ],
              },
            ]}
          >
            <Pressable
              onPress={() => scrollToBottom(true)}
              style={styles.scrollToBottomButton}
            >
              <Ionicons name="chevron-down" size={22} color="#111827" />
            </Pressable>
          </Animated.View>
        ) : null}
      </View>
      <View style={[{ paddingBottom: insets.bottom }]}>
        <View style={styles.form}>
          <Input
            containerStyle={styles.inputContainer}
            value={message}
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
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#ffffff",
  },
  header: {
    borderBottomWidth: 1,
    borderBottomColor: "#E5E7EB",
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#111827",
  },
  chatContainer: {
    flex: 1,
    backgroundColor: "#F9FAFB",
  },
  chatArea: {
    flex: 1,
    position: "relative",
  },
  chatContent: {
    padding: 12,
    flexGrow: 1,
    gap: 8,
  },
  infoText: {
    fontSize: 14,
    color: "#6B7280",
    textAlign: "center",
    marginTop: 24,
  },
  composerContainer: {
    backgroundColor: "#FFFFFF",
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
  scrollToBottomWrapper: {
    position: "absolute",
    width: "100%",
    alignItems: "center",
    bottom: 16,
  },
  scrollToBottomButton: {
    width: 32,
    height: 32,
    borderRadius: 21,
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#E5E7EB",
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOpacity: 0.12,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 3 },
    elevation: 4,
  },
});

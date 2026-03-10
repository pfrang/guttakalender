import { api } from "@/convex/_generated/api";
import { DataModel, Id } from "@/convex/_generated/dataModel";
import { Button } from "@/lib/components/Button";
import { Input } from "@/lib/components/Input";
import { usePushNotifications } from "@/lib/hooks/usePushNotifications";
import { useHeaderHeight } from "@react-navigation/elements";
import { useMutation, useQuery } from "convex/react";
import { useGlobalSearchParams } from "expo-router";
import { useEffect, useMemo, useRef, useState } from "react";
import {
  FlatList,
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
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
  const chatContainerRef =
    useRef<FlatList<DataModel["chat"]["document"]>>(null);
  usePushNotifications();

  const insets = useSafeAreaInsets();
  const [message, setMessage] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [keyboardVisible, setKeyboardVisible] = useState(false);

  function scrollToBottom() {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollToEnd({ animated: true });
    }
  }
  useEffect(() => {
    setTimeout(() => {
      scrollToBottom();
    }, 100);
  }, [chatContainerRef]);

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

  const reversedMessages = useMemo(
    () => [...(messages ?? [])].reverse(),
    [messages],
  );

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

  const isLoading =
    messages === undefined || users === undefined || currentUser === undefined;

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={styles.container}
    >
      <>
        {isLoading ? (
          <View style={styles.centeredInfo}>
            <Text style={styles.infoText}>Laster meldinger...</Text>
          </View>
        ) : messages.length === 0 ? (
          <View style={styles.centeredInfo}>
            <Text style={styles.infoText}>
              Ingen meldinger enda. Vaer den forste!
            </Text>
          </View>
        ) : (
          <FlatList
            data={reversedMessages}
            style={{ flex: 1, backgroundColor: "#FFFFFF" }}
            ref={chatContainerRef}
            inverted
            automaticallyAdjustKeyboardInsets
            keyExtractor={(item) => item._id}
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
            contentContainerStyle={[
              styles.chatContent,
              { paddingTop: headerHeight },
            ]}
            keyboardShouldPersistTaps="handled"
            keyboardDismissMode={
              Platform.OS === "ios" ? "interactive" : "on-drag"
            }
            ItemSeparatorComponent={() => <View style={{ height: 8 }} />}
          />
        )}
      </>
      <View style={{ paddingBottom: keyboardVisible ? 0 : insets.bottom }}>
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
});

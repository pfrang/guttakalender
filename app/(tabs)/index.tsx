import { api } from "@/convex/_generated/api";
import { Button } from "@/lib/components/Button";
import { Input } from "@/lib/components/Input";
import { formatDateAndTime } from "@/lib/utils/date";
import { useHeaderHeight } from "@react-navigation/elements";
import { useMutation, useQuery } from "convex/react";
import { useEffect, useRef, useState } from "react";
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";

export default function Index() {
  const headerHeight = useHeaderHeight();
  const messages = useQuery(api.chat.getChats);
  const users = useQuery(api.users.getUsers);
  const currentUser = useQuery(api.users.getCurrentUser);
  const sendMessage = useMutation(api.chat.addChat);

  const [message, setMessage] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const chatContainerRef = useRef<ScrollView>(null);

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

  const handleSend = async () => {
    const trimmed = message.trim();
    if (!trimmed) {
      return;
    }
    setError(null);
    setIsSending(true);
    try {
      await sendMessage({ message: trimmed });
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

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      keyboardVerticalOffset={Platform.OS === "ios" ? headerHeight + 60 : 0}
    >
      <ScrollView
        ref={chatContainerRef}
        style={styles.chatContainer}
        contentContainerStyle={styles.chatContent}
        keyboardShouldPersistTaps="handled"
        keyboardDismissMode={Platform.OS === "ios" ? "interactive" : "on-drag"}
        onLayout={() => scrollToBottom(false)}
        onContentSizeChange={() => scrollToBottom(false)}
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
              <View
                key={msg._id}
                style={[
                  styles.messageRow,
                  isCurrentUser
                    ? styles.messageRowRight
                    : styles.messageRowLeft,
                ]}
              >
                <View
                  style={[
                    styles.bubble,
                    isCurrentUser
                      ? styles.currentUserBubble
                      : styles.otherUserBubble,
                  ]}
                >
                  <Text
                    style={[
                      styles.messageText,
                      isCurrentUser && styles.currentUserMessageText,
                    ]}
                  >
                    {msg.message}
                  </Text>
                  <Text
                    style={[
                      styles.messageMeta,
                      isCurrentUser && styles.currentUserMessageMeta,
                    ]}
                  >
                    {user?.name ?? "Ukjent"} -{" "}
                    {formatDateAndTime(
                      new Date(msg._creationTime),
                      "no",
                      "short",
                      true,
                    )}
                  </Text>
                </View>
              </View>
            );
          })
        )}
      </ScrollView>

      <View style={[styles.form]}>
        <Input
          containerStyle={styles.inputContainer}
          value={message}
          onChangeText={setMessage}
          placeholder="Send en melding til boaza..."
          editable={!isSending}
          style={styles.input}
          returnKeyType="send"
          blurOnSubmit={false}
          onFocus={() => scrollToBottom(true)}
          onSubmitEditing={() => void handleSend()}
        />
        <Button
          title={isSending ? "Sender..." : "Send"}
          onPress={() => void handleSend()}
          disabled={isSending || message.trim().length === 0}
        />
      </View>

      {error ? <Text style={styles.errorText}>{error}</Text> : null}
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
  chatContent: {
    padding: 12,
    gap: 8,
  },
  infoText: {
    fontSize: 14,
    color: "#6B7280",
    textAlign: "center",
    marginTop: 24,
  },
  messageRow: {
    width: "100%",
    flexDirection: "row",
  },
  messageRowLeft: {
    justifyContent: "flex-start",
  },
  messageRowRight: {
    justifyContent: "flex-end",
  },
  bubble: {
    maxWidth: "82%",
    borderRadius: 16,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderWidth: 1,
  },
  otherUserBubble: {
    backgroundColor: "#FFFFFF",
    borderColor: "#E5E7EB",
  },
  currentUserBubble: {
    backgroundColor: "#111827",
    borderColor: "#111827",
  },
  messageText: {
    color: "#1F2937",
    fontSize: 14,
    lineHeight: 20,
  },
  currentUserMessageText: {
    color: "#FFFFFF",
  },
  messageMeta: {
    marginTop: 6,
    fontSize: 11,
    color: "#6B7280",
  },
  currentUserMessageMeta: {
    color: "#D1D5DB",
  },
  form: {
    borderTopWidth: 1,
    borderTopColor: "#E5E7EB",
    backgroundColor: "#FFFFFF",
    padding: 12,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
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

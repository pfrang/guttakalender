import { api } from "@/convex/_generated/api";
import { DataModel, Id } from "@/convex/_generated/dataModel";
import { Button } from "@/lib/components/Button";
import { Input } from "@/lib/components/Input";
import { usePushNotifications } from "@/lib/hooks/usePushNotifications";
import { useHeaderHeight } from "@react-navigation/elements";
import { useMutation, useQuery } from "convex/react";
import { useGlobalSearchParams } from "expo-router";
import { useEffect, useRef, useState } from "react";
import {
  FlatList,
  KeyboardAvoidingView,
  Platform,
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

  const chatContainerRef =
    useRef<FlatList<DataModel["chat"]["document"]>>(null);
  usePushNotifications();

  const [message, setMessage] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Scroll to end whenever messages change (new message arrives)
  useEffect(() => {
    if (messages && messages.length > 0) {
      // Small delay lets the list finish rendering before scrolling
      setTimeout(() => {
        chatContainerRef.current?.scrollToEnd({ animated: true });
      }, 100);
    }
  }, [chatContainerRef?.current]);

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

  return (
    <>
      <SafeAreaView style={{ flex: 1 }} edges={["bottom"]}>
        <KeyboardAvoidingView
          // behavior={Platform.OS === "ios" ? "padding" : "height"}
          behavior="padding"
          style={{ flex: 1 }}
          // keyboardVerticalOffset accounts for the header so the form
          // doesn't end up behind the nav bar when the keyboard opens
          // keyboardVerticalOffset={headerHeight}
        >
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
              data={messages} // natural order: oldest at top, newest at bottom
              ref={chatContainerRef}
              contentInsetAdjustmentBehavior="automatic"
              // NO inverted — that was the blur culprit
              // NO automaticallyAdjustKeyboardInsets — conflicts with KeyboardAvoidingView
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
              contentContainerStyle={styles.chatContent}
              keyboardShouldPersistTaps="handled"
              keyboardDismissMode={
                Platform.OS === "ios" ? "interactive" : "on-drag"
              }
              ItemSeparatorComponent={() => <View style={{ height: 8 }} />}
              // Keeps the list pinned to the bottom as items are added
              onContentSizeChange={() =>
                chatContainerRef.current?.scrollToEnd({ animated: false })
              }
            />
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
    </>
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

import { useEffect, useRef, useState } from "react";

import { IMessage, IMessageDTO, IMessageInsert, IUser, UserDTO } from "@/lib/models";
import { useUserContext } from "@/lib/providers";
import { ChannelTypes } from "@/lib/types";

import { useSocketMessages } from "./useSocketMessages";
import { useStoredMessages } from "./useStoredMessages";

type useChatProps = {
  channel: ChannelTypes;
  organizationId?: string;
  teamId?: string;
};

export const useChat = ({ channel, organizationId, teamId }: useChatProps) => {
  const { user } = useUserContext();

  const [beforeCreatedAt, setBeforeCreatedAt] = useState<Date | undefined>(undefined);
  const [messages, setMessages] = useState<IMessageDTO[]>([]);
  const [shouldScrollToBottom, setShouldScrollToBottom] = useState(true);
  const [hasUnreadMessages, setHasUnreadMessages] = useState(false);

  const {
    socket,
    sendMessage,
    messages: socketMessages,
    onMarkAllAsRead: onMarkAllSocketAsRead,
  } = useSocketMessages({ channel, organizationId, teamId });

  const {
    createValidationSchema,
    getData,
    onCreate,
    onMarkAllAsRead: onMarkAllStoredAsRead,
  } = useStoredMessages({ channel, organizationId, teamId });

  // TODO: Put in use effect? clear beforeCreatedAt? How to reset after viewing last message?
  const { data: storedMessages, isLoading } = getData({ organizationId, teamId }, beforeCreatedAt);

  useEffect(() => {
    setMessages([]);
  }, [channel, organizationId, teamId]);

  useEffect(() => {
    if (storedMessages && storedMessages.length > 0) {
      setMessages((prev) => [...storedMessages, ...prev]);
      const latestMessage = storedMessages[storedMessages.length - 1];
      (async () => await handleMarkAllAsRead(latestMessage))();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [storedMessages]);

  const scrollContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (
      !shouldScrollToBottom &&
      ((storedMessages &&
        storedMessages?.filter((x) => !x.recipients?.find((u) => u.id === user?.id)?.isRead).length > 0) ||
        socketMessages.filter((x) => !x.recipients?.find((u) => u.id === user?.id)?.isRead).length > 0)
    ) {
      // Alert user when unread messages come in and they are not at the bottom
      setHasUnreadMessages(true);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [storedMessages, socketMessages]);

  useEffect(() => {
    const scrollableDiv = scrollContainerRef.current;

    // Run when a user scrolls in the chat window
    const handleScroll = () => {
      const buffer = 1;
      let atBottom = false;

      if (scrollableDiv) {
        // determine if user has scrolled to the bottom
        atBottom = scrollableDiv.scrollTop + scrollableDiv.clientHeight >= scrollableDiv.scrollHeight - buffer;
      }

      if (atBottom) {
        // If user has scrolled to the bottom,
        // mark everything a read
        setShouldScrollToBottom(true);
        setHasUnreadMessages(false);
      } else if (shouldScrollToBottom) {
        // If user has scrolled but no at the bottom,
        // don't auto scroll to bottom when new messages come in
        setShouldScrollToBottom(false);
      }
    };

    if (scrollableDiv) {
      if (shouldScrollToBottom) {
        setTimeout(() => {
          // When new messages come in,
          // scroll to view new messages if user is already at bottom
          const { scrollHeight, clientHeight } = scrollableDiv;
          const maxScrollTop = scrollHeight - clientHeight;
          scrollContainerRef.current?.scrollTo({
            top: maxScrollTop,
            behavior: "smooth",
          });
        }, 100);
      }

      // register scroll event
      scrollableDiv.addEventListener("scroll", handleScroll);
    }

    return () => {
      // remove scroll event
      scrollableDiv?.removeEventListener("scroll", handleScroll);
    };
  }, [socketMessages, shouldScrollToBottom]);

  const handleCreate = async (formData: IMessageInsert): Promise<IMessageDTO> => {
    if (channel === ChannelTypes.PUBLIC_CHAT) {
      return {
        id: crypto.randomUUID(),
        ...formData,
        channel,
        createdAt: new Date(),
        createdBy: new UserDTO(user as IUser).toMinimalDTO(),
        active: true,
      } as IMessageDTO;
    } else {
      return onCreate(formData);
    }
  };

  const handleSuccess = async (payload: IMessage) => {
    await sendMessage(payload);
  };

  const handleLoadPreviousMessages = () => {
    if (messages.length > 0) {
      const earliestMessage = messages[0];
      earliestMessage.createdAt && setBeforeCreatedAt(earliestMessage.createdAt!);
    }
    setShouldScrollToBottom(false);
  };

  const handleViewUnreadMessages = () => {
    setHasUnreadMessages(false);
    setShouldScrollToBottom(true);
    handleMarkAllAsRead();
  };

  const handleMarkAllAsRead = async (latestMessage: IMessageDTO | null = null) => {
    if (socketMessages.length > 0) {
      latestMessage = socketMessages[socketMessages.length - 1];
    } else if (messages.length > 0) {
      latestMessage = messages[messages.length - 1];
    }
    if (latestMessage?.createdAt && !latestMessage.recipients?.find((u) => u.id === user?.id)?.isRead) {
      await onMarkAllStoredAsRead(latestMessage.createdAt!);
      const updatedMessages = messages.map((m) => ({
        ...m,
        recipients: m.recipients?.map((u) => ({
          ...u,
          isRead: u.isRead ?? u.id === user?.id,
        })),
      }));
      setMessages(updatedMessages);
    }
    await onMarkAllSocketAsRead();
  };

  return {
    socket,
    isLoading,
    hasUnreadMessages,
    storedMessages: messages,
    socketMessages,
    scrollContainerRef,
    createValidationSchema,
    handleCreate,
    handleSuccess,
    handleLoadPreviousMessages,
    handleViewUnreadMessages,
    handleMarkAllAsRead,
  };
};

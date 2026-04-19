import {
  Avatar,
  Badge,
  Box,
  Button,
  Container,
  Flex,
  Heading,
  HStack,
  Image,
  Input,
  Skeleton,
  SkeletonCircle,
  Stack,
  Text,
  Textarea,
  useBreakpointValue,
  useToast,
  VStack,
} from "@chakra-ui/react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Link as RouterLink, useSearchParams } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import api from "../services/api";
import { MESSAGES_LAST_VISITED_AT_KEY } from "../utils/messages";
import { getUserId } from "../utils/userProfile";

const POLLING_INTERVAL_MS = 5000;
const MESSAGE_MAX_LENGTH = 2000;

const roleBadgeScheme = {
  Student: "pink",
  Alumni: "purple",
  Admin: "orange",
};

const toObjectIdString = (value) => String(value?._id || value?.id || value || "");

const formatConversationTime = (timestamp) => {
  if (!timestamp) {
    return "";
  }

  const date = new Date(timestamp);

  if (Number.isNaN(date.getTime())) {
    return "";
  }

  const now = new Date();
  const isSameDay =
    date.getDate() === now.getDate() &&
    date.getMonth() === now.getMonth() &&
    date.getFullYear() === now.getFullYear();

  if (isSameDay) {
    return date.toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });
  }

  return date.toLocaleDateString([], {
    month: "short",
    day: "numeric",
  });
};

const formatBubbleTime = (timestamp) => {
  if (!timestamp) {
    return "";
  }

  const date = new Date(timestamp);

  if (Number.isNaN(date.getTime())) {
    return "";
  }

  return date.toLocaleString([], {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

const ConversationsEmptyState = () => {
  return (
    <Box bg="white" borderRadius="2xl" boxShadow="md" p={{ base: 7, md: 10 }} textAlign="center">
      <Stack spacing={4} align="center">
        <Image
          src="/illustrations/connect-people.svg"
          alt="No conversations yet"
          maxW={{ base: "220px", md: "300px" }}
        />
        <Heading size="md">No conversations yet</Heading>
        <Text color="gray.600" maxW="560px">
          No conversations yet. Get started by connecting with an alumni mentor.
        </Text>
        <Button as={RouterLink} to="/alumni" colorScheme="teal" borderRadius="full" px={6}>
          Browse Alumni
        </Button>
      </Stack>
    </Box>
  );
};

const ConversationListItem = ({ conversation, isActive, onClick }) => {
  const user = conversation.user || {};
  const preview = conversation.latestMessagePreview || "No messages yet. Start the conversation.";

  return (
    <Box
      onClick={onClick}
      borderWidth="1px"
      borderColor={isActive ? "teal.200" : "gray.100"}
      bg={isActive ? "teal.50" : "white"}
      borderRadius="xl"
      p={3}
      cursor="pointer"
      transition="all 0.2s ease"
      _hover={{ borderColor: "teal.200", boxShadow: "sm" }}
    >
      <HStack align="start" spacing={3}>
        <Avatar size="sm" name={user.name} src={user.profilePhoto || undefined} bg="gray.200" />
        <Stack spacing={1} flex={1} minW={0}>
          <HStack justify="space-between" spacing={2} align="start">
            <Stack spacing={1} minW={0}>
              <Text fontWeight="semibold" color="gray.800" noOfLines={1}>
                {user.name || "Connection"}
              </Text>
              <Badge alignSelf="start" colorScheme={roleBadgeScheme[user.role] || "gray"}>
                {user.role || "User"}
              </Badge>
            </Stack>
            <Text fontSize="xs" color="gray.500" whiteSpace="nowrap">
              {formatConversationTime(conversation.latestMessageAt)}
            </Text>
          </HStack>
          <Text fontSize="sm" color="gray.600" noOfLines={1}>
            {preview}
          </Text>
        </Stack>
      </HStack>
    </Box>
  );
};

const ConversationsPanelSkeleton = () => {
  return (
    <Stack spacing={3} p={4}>
      {[...Array(6)].map((_, index) => (
        <Box key={index} borderWidth="1px" borderColor="gray.100" borderRadius="xl" p={3} bg="white">
          <HStack align="start" spacing={3}>
            <SkeletonCircle size="8" />
            <Stack spacing={2} flex={1}>
              <HStack justify="space-between">
                <Skeleton height="12px" width="120px" />
                <Skeleton height="10px" width="46px" />
              </HStack>
              <Skeleton height="10px" width="100%" />
            </Stack>
          </HStack>
        </Box>
      ))}
    </Stack>
  );
};

const MessagesThreadSkeleton = () => {
  return (
    <VStack align="stretch" spacing={3} p={4}>
      {[...Array(5)].map((_, index) => (
        <Flex key={index} justify={index % 2 === 0 ? "flex-start" : "flex-end"}>
          <Box maxW={{ base: "82%", md: "70%" }} bg="white" borderRadius="2xl" p={3} borderWidth="1px" borderColor="gray.100">
            <Stack spacing={2}>
              <Skeleton height="10px" width="100%" />
              <Skeleton height="10px" width="85%" />
              <Skeleton height="8px" width="54px" alignSelf="flex-end" />
            </Stack>
          </Box>
        </Flex>
      ))}
    </VStack>
  );
};

const MessagesPage = () => {
  const toast = useToast();
  const { user } = useAuth();
  const [searchParams] = useSearchParams();
  const isMobile = useBreakpointValue({ base: true, md: false }) || false;

  const [searchQuery, setSearchQuery] = useState("");
  const [conversations, setConversations] = useState([]);
  const [activeConversationId, setActiveConversationId] = useState("");
  const [messages, setMessages] = useState([]);
  const [messageText, setMessageText] = useState("");
  const [loadingConversations, setLoadingConversations] = useState(true);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [sendingMessage, setSendingMessage] = useState(false);
  const [mobileView, setMobileView] = useState("list");

  const viewerId = useMemo(() => getUserId(user), [user]);
  const requestedConversationUserId = searchParams.get("userId") || "";
  const preferredConversationUserIdRef = useRef(requestedConversationUserId);
  const messagesBottomRef = useRef(null);

  useEffect(() => {
    if (requestedConversationUserId) {
      preferredConversationUserIdRef.current = requestedConversationUserId;
    }
  }, [requestedConversationUserId]);

  const markMessagesPageVisited = useCallback(() => {
    localStorage.setItem(MESSAGES_LAST_VISITED_AT_KEY, new Date().toISOString());
  }, []);

  const fetchConversations = useCallback(
    async ({ showErrorToast = true } = {}) => {
      try {
        const { data } = await api.get("/messages/conversations");
        const nextConversations = data.conversations || [];

        setConversations(nextConversations);
        setActiveConversationId((previousConversationId) => {
          const availableConversationIds = nextConversations.map((conversation) =>
            toObjectIdString(conversation.user)
          );

          if (previousConversationId && availableConversationIds.includes(previousConversationId)) {
            return previousConversationId;
          }

          const preferredConversationId = toObjectIdString(preferredConversationUserIdRef.current);

          if (preferredConversationId && availableConversationIds.includes(preferredConversationId)) {
            preferredConversationUserIdRef.current = "";
            return preferredConversationId;
          }

          return availableConversationIds[0] || "";
        });
      } catch (error) {
        if (showErrorToast) {
          setConversations([]);
          setActiveConversationId("");
          toast({
            title: "Unable to load conversations",
            description: error.response?.data?.message || "Please try again.",
            status: "error",
            duration: 3200,
            isClosable: true,
          });
        }
      }
    },
    [toast]
  );

  const fetchMessages = useCallback(
    async (conversationUserId, { showErrorToast = true } = {}) => {
      if (!conversationUserId) {
        setMessages([]);
        return;
      }

      try {
        const { data } = await api.get(`/messages/${conversationUserId}`);
        setMessages(data.messages || []);
      } catch (error) {
        if (showErrorToast) {
          setMessages([]);
          toast({
            title: "Unable to load messages",
            description: error.response?.data?.message || "Please try again.",
            status: "error",
            duration: 3200,
            isClosable: true,
          });
        }
      }
    },
    [toast]
  );

  useEffect(() => {
    let isMounted = true;

    const initializePage = async () => {
      await fetchConversations({ showErrorToast: true });

      if (isMounted) {
        setLoadingConversations(false);
      }

      markMessagesPageVisited();
    };

    initializePage();

    return () => {
      isMounted = false;
    };
  }, [fetchConversations, markMessagesPageVisited]);

  useEffect(() => {
    let isMounted = true;

    const loadConversationMessages = async () => {
      if (!activeConversationId) {
        if (isMounted) {
          setMessages([]);
          setLoadingMessages(false);
        }
        return;
      }

      if (isMounted) {
        setLoadingMessages(true);
      }

      await fetchMessages(activeConversationId, { showErrorToast: true });

      if (isMounted) {
        setLoadingMessages(false);
      }
    };

    loadConversationMessages();

    if (activeConversationId && isMobile) {
      setMobileView("chat");
    }

    return () => {
      isMounted = false;
    };
  }, [activeConversationId, fetchMessages, isMobile]);

  useEffect(() => {
    const pollingId = window.setInterval(() => {
      fetchConversations({ showErrorToast: false });

      if (activeConversationId) {
        fetchMessages(activeConversationId, { showErrorToast: false });
      }
    }, POLLING_INTERVAL_MS);

    return () => {
      window.clearInterval(pollingId);
    };
  }, [activeConversationId, fetchConversations, fetchMessages]);

  useEffect(() => {
    if (messagesBottomRef.current) {
      messagesBottomRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, activeConversationId, loadingMessages]);

  useEffect(() => {
    if (activeConversationId) {
      markMessagesPageVisited();
    }
  }, [activeConversationId, markMessagesPageVisited]);

  const activeConversation = useMemo(() => {
    return conversations.find((conversation) => toObjectIdString(conversation.user) === activeConversationId) || null;
  }, [activeConversationId, conversations]);

  const filteredConversations = useMemo(() => {
    const normalizedQuery = searchQuery.trim().toLowerCase();

    if (!normalizedQuery) {
      return conversations;
    }

    return conversations.filter((conversation) => {
      const userName = String(conversation.user?.name || "").toLowerCase();
      const preview = String(conversation.latestMessagePreview || "").toLowerCase();
      return userName.includes(normalizedQuery) || preview.includes(normalizedQuery);
    });
  }, [conversations, searchQuery]);

  const handleConversationSelect = (conversationUserId) => {
    setActiveConversationId(conversationUserId);

    if (isMobile) {
      setMobileView("chat");
    }
  };

  const handleBackToConversations = () => {
    setMobileView("list");
  };

  const handleSendMessage = async () => {
    const trimmedMessage = messageText.trim();
    const receiverId = toObjectIdString(activeConversation?.user);

    if (!trimmedMessage || !receiverId || sendingMessage) {
      return;
    }

    if (trimmedMessage.length > MESSAGE_MAX_LENGTH) {
      toast({
        title: "Message is too long",
        description: `Please keep your message within ${MESSAGE_MAX_LENGTH} characters.`,
        status: "warning",
        duration: 2600,
        isClosable: true,
      });
      return;
    }

    const optimisticMessageId = `temp-${Date.now()}`;
    const optimisticMessage = {
      _id: optimisticMessageId,
      senderId: viewerId,
      receiverId,
      content: trimmedMessage,
      sentAt: new Date().toISOString(),
    };

    setMessages((previousMessages) => [...previousMessages, optimisticMessage]);
    setMessageText("");
    setSendingMessage(true);

    try {
      const { data } = await api.post("/messages", {
        receiverId,
        content: trimmedMessage,
      });

      const persistedMessage = data.sentMessage;

      setMessages((previousMessages) =>
        previousMessages.map((message) =>
          message._id === optimisticMessageId ? persistedMessage || optimisticMessage : message
        )
      );

      await fetchConversations({ showErrorToast: false });
      markMessagesPageVisited();
    } catch (error) {
      setMessages((previousMessages) =>
        previousMessages.filter((message) => message._id !== optimisticMessageId)
      );
      setMessageText(trimmedMessage);

      toast({
        title: "Unable to send message",
        description: error.response?.data?.message || "Please try again.",
        status: "error",
        duration: 3200,
        isClosable: true,
      });
    } finally {
      setSendingMessage(false);
    }
  };

  if (loadingConversations) {
    return (
      <Container maxW="7xl" py={{ base: 8, md: 10 }}>
        <Box bg="white" borderRadius="2xl" boxShadow="md" borderWidth="1px" borderColor="gray.100" overflow="hidden">
          <Flex minH={{ base: "72vh", md: "70vh" }}>
            <Box w={{ base: "100%", md: "360px" }} borderRightWidth={{ base: 0, md: "1px" }} borderColor="gray.100">
              <Stack spacing={3} p={4} borderBottomWidth="1px" borderColor="gray.100">
                <Skeleton height="18px" width="130px" />
                <Skeleton height="38px" borderRadius="full" />
              </Stack>
              <ConversationsPanelSkeleton />
            </Box>
            <Box display={{ base: "none", md: "block" }} flex={1} bg="gray.50">
              <MessagesThreadSkeleton />
            </Box>
          </Flex>
        </Box>
      </Container>
    );
  }

  if (conversations.length === 0) {
    return (
      <Container maxW="6xl" py={{ base: 8, md: 10 }}>
        <ConversationsEmptyState />
      </Container>
    );
  }

  return (
    <Container maxW="7xl" py={{ base: 6, md: 8 }}>
      <Box bg="white" borderRadius="2xl" boxShadow="md" borderWidth="1px" borderColor="gray.100" overflow="hidden">
        <Flex minH={{ base: "72vh", md: "70vh" }}>
          <Box
            w={{ base: "100%", md: "360px" }}
            borderRightWidth={{ base: "0", md: "1px" }}
            borderColor="gray.100"
            display={{ base: mobileView === "list" ? "block" : "none", md: "block" }}
            bg="white"
          >
            <Stack spacing={3} p={4} borderBottomWidth="1px" borderColor="gray.100">
              <Heading size="sm">Conversations</Heading>
              <Input
                value={searchQuery}
                onChange={(event) => setSearchQuery(event.target.value)}
                placeholder="Search conversations"
                borderRadius="full"
              />
            </Stack>

            <VStack align="stretch" spacing={3} p={4} maxH={{ base: "calc(72vh - 100px)", md: "calc(70vh - 100px)" }} overflowY="auto">
              {filteredConversations.length > 0 ? (
                filteredConversations.map((conversation) => {
                  const conversationUserId = toObjectIdString(conversation.user);

                  return (
                    <ConversationListItem
                      key={conversationUserId}
                      conversation={conversation}
                      isActive={conversationUserId === activeConversationId}
                      onClick={() => handleConversationSelect(conversationUserId)}
                    />
                  );
                })
              ) : (
                <Box borderWidth="1px" borderStyle="dashed" borderColor="gray.200" borderRadius="xl" p={5} textAlign="center">
                  <Text color="gray.600">No conversations match your search.</Text>
                </Box>
              )}
            </VStack>
          </Box>

          <Flex
            flex={1}
            direction="column"
            bg="gray.50"
            display={{ base: mobileView === "chat" ? "flex" : "none", md: "flex" }}
          >
            {activeConversation ? (
              <>
                <HStack
                  justify="space-between"
                  align="center"
                  p={4}
                  bg="white"
                  borderBottomWidth="1px"
                  borderColor="gray.100"
                  spacing={3}
                >
                  <HStack spacing={3} minW={0}>
                    {isMobile ? (
                      <Button size="sm" variant="ghost" onClick={handleBackToConversations}>
                        Back
                      </Button>
                    ) : null}
                    <Avatar
                      size="sm"
                      name={activeConversation.user?.name}
                      src={activeConversation.user?.profilePhoto || undefined}
                    />
                    <Stack spacing={0} minW={0}>
                      <Text fontWeight="semibold" noOfLines={1}>
                        {activeConversation.user?.name || "Conversation"}
                      </Text>
                      <Badge alignSelf="start" colorScheme={roleBadgeScheme[activeConversation.user?.role] || "gray"}>
                        {activeConversation.user?.role || "User"}
                      </Badge>
                    </Stack>
                  </HStack>

                  <Button
                    as={RouterLink}
                    to={`/alumni/${toObjectIdString(activeConversation.user)}`}
                    size="sm"
                    variant="outline"
                  >
                    View Profile
                  </Button>
                </HStack>

                <VStack align="stretch" spacing={3} p={4} flex={1} overflowY="auto">
                  {loadingMessages ? (
                    <MessagesThreadSkeleton />
                  ) : messages.length > 0 ? (
                    messages.map((message) => {
                      const isSentByViewer = toObjectIdString(message.senderId) === viewerId;

                      return (
                        <Flex key={message._id} justify={isSentByViewer ? "flex-end" : "flex-start"}>
                          <Box
                            maxW={{ base: "85%", md: "72%" }}
                            bg={isSentByViewer ? "teal.500" : "gray.200"}
                            color={isSentByViewer ? "white" : "gray.800"}
                            px={4}
                            py={3}
                            borderRadius="2xl"
                            borderBottomRightRadius={isSentByViewer ? "sm" : "2xl"}
                            borderBottomLeftRadius={isSentByViewer ? "2xl" : "sm"}
                          >
                            <Text whiteSpace="pre-wrap">{message.content}</Text>
                            <Text
                              mt={1}
                              fontSize="xs"
                              textAlign="right"
                              color={isSentByViewer ? "teal.100" : "gray.500"}
                            >
                              {formatBubbleTime(message.sentAt)}
                            </Text>
                          </Box>
                        </Flex>
                      );
                    })
                  ) : (
                    <Box borderWidth="1px" borderStyle="dashed" borderColor="gray.200" borderRadius="xl" p={6} textAlign="center">
                      <Text color="gray.600">No messages yet. Say hello to start the conversation.</Text>
                    </Box>
                  )}

                  <Box ref={messagesBottomRef} />
                </VStack>

                <Box p={4} bg="white" borderTopWidth="1px" borderColor="gray.100">
                  <Stack spacing={3}>
                    <Textarea
                      value={messageText}
                      onChange={(event) => setMessageText(event.target.value)}
                      onKeyDown={(event) => {
                        if (event.key === "Enter" && !event.shiftKey) {
                          event.preventDefault();
                          handleSendMessage();
                        }
                      }}
                      placeholder="Type your message"
                      resize="none"
                      rows={3}
                      maxLength={MESSAGE_MAX_LENGTH}
                    />
                    <HStack justify="space-between">
                      <Text fontSize="xs" color="gray.500">
                        {messageText.length}/{MESSAGE_MAX_LENGTH}
                      </Text>
                      <Button
                        colorScheme="teal"
                        onClick={handleSendMessage}
                        isLoading={sendingMessage}
                        loadingText="Sending"
                      >
                        Send
                      </Button>
                    </HStack>
                  </Stack>
                </Box>
              </>
            ) : (
              <Flex flex={1} align="center" justify="center" p={8}>
                <Stack spacing={2} align="center" textAlign="center">
                  <Heading size="sm">Select a conversation</Heading>
                  <Text color="gray.600">Choose a connection from the list to start chatting.</Text>
                </Stack>
              </Flex>
            )}
          </Flex>
        </Flex>
      </Box>
    </Container>
  );
};

export default MessagesPage;

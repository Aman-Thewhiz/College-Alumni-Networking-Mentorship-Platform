import {
  Avatar,
  Box,
  Button,
  Container,
  Divider,
  Drawer,
  DrawerBody,
  DrawerCloseButton,
  DrawerContent,
  DrawerHeader,
  DrawerOverlay,
  Flex,
  HStack,
  Link,
  Menu,
  MenuButton,
  MenuDivider,
  MenuItem,
  MenuList,
  Spacer,
  Stack,
  Text,
  useDisclosure,
} from "@chakra-ui/react";
import { useEffect, useMemo, useState } from "react";
import { Link as RouterLink, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import api from "../services/api";
import { MESSAGES_LAST_VISITED_AT_KEY } from "../utils/messages";
import { getRoleDashboardPath } from "../utils/rolePaths";

const toObjectIdString = (value) => String(value?._id || value?.id || value || "");

const navItems = [
  { label: "Home", to: "/" },
  { label: "Browse Alumni", to: "/alumni" },
  { label: "Opportunities", to: "/opportunities" },
  { label: "About", to: "/about" },
];

const NavLinks = ({ onClick, user, hasUnreadMessages }) => {
  const isMessagingRole = ["Student", "Alumni"].includes(user?.role || "");
  const isAdminRole = user?.role === "Admin";

  return (
    <Stack direction={{ base: "column", md: "row" }} spacing={{ base: 4, md: 6 }}>
      {navItems.map((item) => (
        <Link
          key={item.to}
          as={RouterLink}
          to={item.to}
          fontWeight="semibold"
          color="gray.700"
          _hover={{ color: "teal.600" }}
          onClick={onClick}
        >
          {item.label}
        </Link>
      ))}

      {isMessagingRole ? (
        <Link
          as={RouterLink}
          to="/messages"
          fontWeight="semibold"
          color="gray.700"
          _hover={{ color: "teal.600" }}
          onClick={onClick}
        >
          <HStack spacing={2}>
            <Text>Messages</Text>
            {hasUnreadMessages ? (
              <Box w="8px" h="8px" borderRadius="full" bg="pink.400" />
            ) : null}
          </HStack>
        </Link>
      ) : null}

      {isAdminRole ? (
        <Link
          as={RouterLink}
          to="/admin/dashboard"
          fontWeight="semibold"
          color="gray.700"
          _hover={{ color: "teal.600" }}
          onClick={onClick}
        >
          Admin Panel
        </Link>
      ) : null}
    </Stack>
  );
};

const AuthMenu = ({ user, onLogout }) => {
  return (
    <Menu>
      <MenuButton as={Button} variant="ghost" borderRadius="full" px={2}>
        <HStack spacing={2}>
          <Avatar size="sm" name={user?.name} src={user?.profilePhoto || undefined} />
          <Text display={{ base: "none", lg: "block" }} color="gray.700" fontWeight="semibold">
            {user?.name?.split(" ")?.[0] || "Profile"}
          </Text>
          <Text color="gray.500" fontSize="sm">
            v
          </Text>
        </HStack>
      </MenuButton>
      <MenuList borderRadius="xl" boxShadow="lg">
        <MenuItem as={RouterLink} to={getRoleDashboardPath(user?.role)}>
          Dashboard
        </MenuItem>
        {user?.role === "Admin" ? (
          <MenuItem as={RouterLink} to="/admin/users">
            Manage Users
          </MenuItem>
        ) : null}
        <MenuItem as={RouterLink} to="/profile">
          Profile
        </MenuItem>
        <MenuDivider />
        <MenuItem color="red.500" onClick={onLogout}>
          Logout
        </MenuItem>
      </MenuList>
    </Menu>
  );
};

const MainNavbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [hasUnreadMessages, setHasUnreadMessages] = useState(false);
  const viewerId = useMemo(() => toObjectIdString(user), [user]);
  const canCheckUnreadMessages = ["Student", "Alumni"].includes(user?.role || "") && Boolean(viewerId);
  const showUnreadMessageDot =
    canCheckUnreadMessages && hasUnreadMessages && !location.pathname.startsWith("/messages");

  useEffect(() => {
    if (!canCheckUnreadMessages) {
      return;
    }

    let isMounted = true;

    const syncUnreadState = async () => {
      try {
        const { data } = await api.get("/messages/conversations");
        const conversations = data.conversations || [];
        const lastVisitedValue = localStorage.getItem(MESSAGES_LAST_VISITED_AT_KEY);
        const lastVisitedTimestamp = lastVisitedValue ? new Date(lastVisitedValue).getTime() : 0;

        const unreadExists = conversations.some((conversation) => {
          const latestMessageTimestamp = conversation.latestMessageAt
            ? new Date(conversation.latestMessageAt).getTime()
            : 0;
          const latestSenderId = toObjectIdString(conversation.latestSenderId);

          if (!latestMessageTimestamp || !latestSenderId || latestSenderId === viewerId) {
            return false;
          }

          return latestMessageTimestamp > lastVisitedTimestamp;
        });

        if (isMounted) {
          setHasUnreadMessages(unreadExists);
        }
      } catch {
        if (isMounted) {
          setHasUnreadMessages(false);
        }
      }
    };

    syncUnreadState();

    const intervalId = window.setInterval(syncUnreadState, 15000);

    return () => {
      isMounted = false;
      window.clearInterval(intervalId);
    };
  }, [canCheckUnreadMessages, viewerId]);

  useEffect(() => {
    if (location.pathname.startsWith("/messages")) {
      localStorage.setItem(MESSAGES_LAST_VISITED_AT_KEY, new Date().toISOString());
    }
  }, [location.pathname]);

  const handleLogout = () => {
    logout();
    onClose();
    navigate("/login");
  };

  return (
    <Box
      as="header"
      position="sticky"
      top={0}
      zIndex={30}
      bg="rgba(255,255,255,0.86)"
      backdropFilter="blur(14px)"
      borderBottomWidth="1px"
      borderColor="gray.100"
    >
      <Container maxW="7xl" py={3}>
        <Flex align="center" gap={3}>
          <Button
            onClick={onOpen}
            display={{ base: "inline-flex", md: "none" }}
            variant="ghost"
            minW="40px"
            px={2}
            aria-label="Open navigation"
          >
            Menu
          </Button>

          <Link as={RouterLink} to="/" fontSize={{ base: "lg", md: "xl" }} fontWeight="bold" color="teal.600">
            AlumniConnect
          </Link>

          <HStack display={{ base: "none", md: "flex" }} ml={8}>
            <NavLinks user={user} hasUnreadMessages={showUnreadMessageDot} />
          </HStack>

          <Spacer />

          <HStack spacing={3} display={{ base: "none", md: "flex" }}>
            {user ? (
              <AuthMenu user={user} onLogout={handleLogout} />
            ) : (
              <>
                <Button as={RouterLink} to="/login" variant="link" color="gray.700" fontWeight="semibold">
                  Log In
                </Button>
                <Button as={RouterLink} to="/register" colorScheme="teal" borderRadius="full" px={6}>
                  Sign Up
                </Button>
              </>
            )}
          </HStack>

          <HStack spacing={2} display={{ base: "flex", md: "none" }}>
            {user ? (
              <AuthMenu user={user} onLogout={handleLogout} />
            ) : (
              <Button as={RouterLink} to="/register" colorScheme="teal" size="sm" borderRadius="full">
                Sign Up
              </Button>
            )}
          </HStack>
        </Flex>
      </Container>

      <Drawer isOpen={isOpen} placement="left" onClose={onClose}>
        <DrawerOverlay />
        <DrawerContent>
          <DrawerCloseButton />
          <DrawerHeader color="teal.600" fontWeight="bold">
            AlumniConnect
          </DrawerHeader>
          <DrawerBody>
            <Stack spacing={5}>
              <NavLinks onClick={onClose} user={user} hasUnreadMessages={showUnreadMessageDot} />
              <Divider />

              {user ? (
                <Stack spacing={3}>
                  <Button as={RouterLink} to={getRoleDashboardPath(user?.role)} onClick={onClose}>
                    Dashboard
                  </Button>
                  <Button as={RouterLink} to="/profile" variant="outline" onClick={onClose}>
                    Profile
                  </Button>
                  <Button colorScheme="red" variant="ghost" onClick={handleLogout}>
                    Logout
                  </Button>
                </Stack>
              ) : (
                <Stack spacing={3}>
                  <Button as={RouterLink} to="/login" variant="ghost" onClick={onClose}>
                    Log In
                  </Button>
                  <Button as={RouterLink} to="/register" onClick={onClose}>
                    Sign Up
                  </Button>
                </Stack>
              )}
            </Stack>
          </DrawerBody>
        </DrawerContent>
      </Drawer>
    </Box>
  );
};

export default MainNavbar;

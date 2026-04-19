import {
  AlertDialog,
  AlertDialogBody,
  AlertDialogContent,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogOverlay,
  Avatar,
  Badge,
  Box,
  Button,
  Container,
  Heading,
  HStack,
  Input,
  SimpleGrid,
  Spinner,
  Stack,
  Tab,
  TabList,
  Tabs,
  Table,
  TableContainer,
  Tbody,
  Td,
  Text,
  Th,
  Thead,
  Tr,
  useBreakpointValue,
  useDisclosure,
  useToast,
} from "@chakra-ui/react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import api from "../services/api";

const USERS_PER_PAGE = 10;
const ROLE_TABS = [
  { label: "All", value: "all" },
  { label: "Students", value: "Student" },
  { label: "Alumni", value: "Alumni" },
];

const roleBadgeScheme = {
  Student: "pink",
  Alumni: "purple",
  Admin: "orange",
};

const formatDate = (value) => {
  if (!value) {
    return "";
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "";
  }

  return date.toLocaleDateString([], {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
};

const AdminUserMobileCard = ({ user, onDelete, isDeleting }) => {
  const isAdminRow = user.role === "Admin";

  return (
    <Box
      bg={isAdminRow ? "orange.50" : "white"}
      borderRadius="2xl"
      boxShadow="md"
      borderWidth="1px"
      borderColor={isAdminRow ? "orange.100" : "gray.100"}
      p={4}
    >
      <Stack spacing={3}>
        <HStack spacing={3} align="start">
          <Avatar size="sm" name={user.name} src={user.profilePhoto || undefined} />
          <Stack spacing={1} flex={1}>
            <HStack spacing={2} flexWrap="wrap">
              <Text fontWeight="semibold" color="gray.800">
                {user.name}
              </Text>
              <Badge colorScheme={roleBadgeScheme[user.role] || "gray"}>{user.role}</Badge>
            </HStack>
            <Text color="gray.700" fontSize="sm">
              {user.email}
            </Text>
            <Text color="gray.500" fontSize="xs">
              Joined {formatDate(user.createdAt)}
            </Text>
          </Stack>
        </HStack>

        <HStack spacing={2} flexWrap="wrap">
          <Button
            as="a"
            href={`/alumni/${user._id}`}
            target="_blank"
            rel="noopener noreferrer"
            size="xs"
            variant="outline"
          >
            View Profile
          </Button>
          <Button
            size="xs"
            colorScheme="red"
            variant="outline"
            onClick={() => onDelete(user)}
            isDisabled={isAdminRow}
            isLoading={isDeleting}
            loadingText="Deleting"
          >
            {isAdminRow ? "Protected" : "Delete"}
          </Button>
        </HStack>
      </Stack>
    </Box>
  );
};

const AdminUsersPage = () => {
  const toast = useToast();
  const isMobileLayout = useBreakpointValue({ base: true, lg: false }) || false;
  const [searchInput, setSearchInput] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedRoleFilter, setSelectedRoleFilter] = useState("all");
  const [page, setPage] = useState(1);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deletingUserId, setDeletingUserId] = useState("");
  const [selectedUser, setSelectedUser] = useState(null);
  const [pagination, setPagination] = useState({
    total: 0,
    totalPages: 1,
    hasNextPage: false,
  });

  const { isOpen, onOpen, onClose } = useDisclosure();
  const cancelRef = useRef(null);

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      setSearchQuery(searchInput.trim());
    }, 400);

    return () => {
      window.clearTimeout(timeoutId);
    };
  }, [searchInput]);

  useEffect(() => {
    setPage(1);
  }, [searchQuery, selectedRoleFilter]);

  const loadUsers = useCallback(
    async ({ suppressErrorToast = false } = {}) => {
      setLoading(true);

      try {
        const params = {
          page,
          limit: USERS_PER_PAGE,
        };

        if (selectedRoleFilter !== "all") {
          params.role = selectedRoleFilter;
        }

        if (searchQuery) {
          params.search = searchQuery;
        }

        const { data } = await api.get("/admin/users", { params });

        const nextTotalPages = data.totalPages || 1;

        if (page > nextTotalPages) {
          setPage(nextTotalPages);
          return;
        }

        setUsers(data.users || []);
        setPagination({
          total: data.total || 0,
          totalPages: nextTotalPages,
          hasNextPage: Boolean(data.hasNextPage),
        });
      } catch (error) {
        setUsers([]);
        setPagination({ total: 0, totalPages: 1, hasNextPage: false });

        if (!suppressErrorToast) {
          toast({
            title: "Unable to load users",
            description: error.response?.data?.message || "Please try again.",
            status: "error",
            duration: 3200,
            isClosable: true,
          });
        }
      } finally {
        setLoading(false);
      }
    },
    [page, searchQuery, selectedRoleFilter, toast]
  );

  useEffect(() => {
    loadUsers();
  }, [loadUsers]);

  const activeRoleTabIndex = useMemo(
    () => ROLE_TABS.findIndex((tab) => tab.value === selectedRoleFilter),
    [selectedRoleFilter]
  );

  const openDeleteDialog = (user) => {
    setSelectedUser(user);
    onOpen();
  };

  const closeDeleteDialog = () => {
    setSelectedUser(null);
    onClose();
  };

  const handleDeleteUser = async () => {
    if (!selectedUser?._id) {
      closeDeleteDialog();
      return;
    }

    const targetUserId = selectedUser._id;
    setDeletingUserId(targetUserId);

    try {
      await api.delete(`/admin/users/${targetUserId}`);

      toast({
        title: "User deleted",
        description: "The user and related records were removed successfully.",
        status: "success",
        duration: 3000,
        isClosable: true,
      });

      closeDeleteDialog();
      await loadUsers({ suppressErrorToast: true });
    } catch (error) {
      toast({
        title: "Unable to delete user",
        description: error.response?.data?.message || "Please try again.",
        status: "error",
        duration: 3200,
        isClosable: true,
      });
    } finally {
      setDeletingUserId("");
    }
  };

  return (
    <Container maxW="7xl" py={{ base: 8, md: 10 }}>
      <Stack spacing={6}>
        <Stack spacing={2}>
          <Heading size="lg">Admin User Management</Heading>
          <Text color="gray.600">
            Review platform users, filter by role, and remove accounts when needed.
          </Text>
        </Stack>

        <Box bg="white" borderRadius="2xl" boxShadow="md" borderWidth="1px" borderColor="gray.100" p={{ base: 4, md: 6 }}>
          <Stack spacing={4}>
            <Tabs
              index={activeRoleTabIndex}
              onChange={(index) => setSelectedRoleFilter(ROLE_TABS[index]?.value || "all")}
              variant="soft-rounded"
              colorScheme="teal"
            >
              <TabList>
                {ROLE_TABS.map((tab) => (
                  <Tab key={tab.value}>{tab.label}</Tab>
                ))}
              </TabList>
            </Tabs>

            <Input
              value={searchInput}
              onChange={(event) => setSearchInput(event.target.value)}
              placeholder="Search by name or email"
              maxW="420px"
            />

            <HStack justify="space-between" flexWrap="wrap" spacing={3}>
              <Text color="gray.600" fontWeight="semibold">
                {loading ? "Loading users..." : `${pagination.total} user${pagination.total === 1 ? "" : "s"} found`}
              </Text>
              {pagination.totalPages > 1 ? (
                <Text color="gray.500" fontSize="sm">
                  Page {page} of {pagination.totalPages}
                </Text>
              ) : null}
            </HStack>

            {loading ? (
              <HStack justify="center" spacing={3} py={8}>
                <Spinner color="teal.500" />
                <Text color="gray.600">Loading users...</Text>
              </HStack>
            ) : users.length > 0 ? (
              <>
                {isMobileLayout ? (
                  <SimpleGrid columns={1} spacing={3}>
                    {users.map((user) => (
                      <AdminUserMobileCard
                        key={user._id}
                        user={user}
                        onDelete={openDeleteDialog}
                        isDeleting={deletingUserId === user._id}
                      />
                    ))}
                  </SimpleGrid>
                ) : (
                  <TableContainer borderWidth="1px" borderColor="gray.100" borderRadius="xl">
                    <Table size="sm">
                      <Thead bg="gray.50">
                        <Tr>
                          <Th>Avatar</Th>
                          <Th>Name</Th>
                          <Th>Email</Th>
                          <Th>Role</Th>
                          <Th>Joined Date</Th>
                          <Th textAlign="right">Actions</Th>
                        </Tr>
                      </Thead>
                      <Tbody>
                        {users.map((user) => {
                          const isAdminRow = user.role === "Admin";
                          const isDeleting = deletingUserId === user._id;

                          return (
                            <Tr key={user._id} bg={isAdminRow ? "orange.50" : "transparent"}>
                              <Td>
                                <Avatar size="sm" name={user.name} src={user.profilePhoto || undefined} />
                              </Td>
                              <Td>
                                <Text fontWeight="semibold" color="gray.800">
                                  {user.name}
                                </Text>
                              </Td>
                              <Td>
                                <Text color="gray.700">{user.email}</Text>
                              </Td>
                              <Td>
                                <Badge colorScheme={roleBadgeScheme[user.role] || "gray"}>{user.role}</Badge>
                              </Td>
                              <Td>
                                <Text color="gray.600">{formatDate(user.createdAt)}</Text>
                              </Td>
                              <Td>
                                <HStack justify="flex-end" spacing={2}>
                                  <Button
                                    as="a"
                                    href={`/alumni/${user._id}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    size="xs"
                                    variant="outline"
                                  >
                                    View Profile
                                  </Button>
                                  <Button
                                    size="xs"
                                    colorScheme="red"
                                    variant="outline"
                                    onClick={() => openDeleteDialog(user)}
                                    isDisabled={isAdminRow}
                                    isLoading={isDeleting}
                                    loadingText="Deleting"
                                  >
                                    {isAdminRow ? "Protected" : "Delete"}
                                  </Button>
                                </HStack>
                              </Td>
                            </Tr>
                          );
                        })}
                      </Tbody>
                    </Table>
                  </TableContainer>
                )}

                {pagination.totalPages > 1 ? (
                  <HStack justify="flex-end" spacing={3}>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => setPage((previousPage) => Math.max(1, previousPage - 1))}
                      isDisabled={page <= 1}
                    >
                      Previous
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => setPage((previousPage) => previousPage + 1)}
                      isDisabled={!pagination.hasNextPage}
                    >
                      Next
                    </Button>
                  </HStack>
                ) : null}
              </>
            ) : (
              <Box borderWidth="1px" borderStyle="dashed" borderColor="gray.200" borderRadius="xl" p={8} textAlign="center">
                <Heading size="sm">No users found</Heading>
                <Text color="gray.600" mt={2}>
                  Try changing the role filter or search keyword.
                </Text>
              </Box>
            )}
          </Stack>
        </Box>
      </Stack>

      <AlertDialog isOpen={isOpen} leastDestructiveRef={cancelRef} onClose={closeDeleteDialog} isCentered>
        <AlertDialogOverlay>
          <AlertDialogContent
            mx={{ base: 0, md: 4 }}
            maxW={{ base: "100vw", md: "md" }}
            minH={{ base: "100vh", md: "auto" }}
            borderRadius={{ base: 0, md: "xl" }}
          >
            <AlertDialogHeader fontSize="lg" fontWeight="bold">
              Delete User
            </AlertDialogHeader>

            <AlertDialogBody>
              Are you sure you want to delete {selectedUser?.name || "this user"}? Their mentorship
              requests, messages, and opportunities will also be removed.
            </AlertDialogBody>

            <AlertDialogFooter>
              <Button ref={cancelRef} onClick={closeDeleteDialog}>
                Cancel
              </Button>
              <Button
                colorScheme="red"
                ml={3}
                onClick={handleDeleteUser}
                isLoading={Boolean(selectedUser?._id && deletingUserId === selectedUser._id)}
                loadingText="Deleting"
              >
                Delete
              </Button>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialogOverlay>
      </AlertDialog>
    </Container>
  );
};

export default AdminUsersPage;

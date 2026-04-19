import {
  Avatar,
  Badge,
  Box,
  Button,
  Container,
  Heading,
  HStack,
  Spinner,
  Stack,
  Tab,
  TabList,
  TabPanel,
  TabPanels,
  Tabs,
  Text,
  Wrap,
  WrapItem,
  useToast,
} from "@chakra-ui/react";
import { useEffect, useMemo, useState } from "react";
import api from "../services/api";

const STATUS_META = {
  pending: { label: "Pending", colorScheme: "yellow" },
  accepted: { label: "Accepted", colorScheme: "green" },
  rejected: { label: "Rejected", colorScheme: "red" },
};

const FILTERS = ["pending", "accepted", "rejected"];

const IncomingRequestCard = ({ request, onUpdateStatus, isUpdating }) => {
  const student = request.studentId || {};
  const statusMeta = STATUS_META[request.status] || { label: request.status, colorScheme: "gray" };

  return (
    <Box bg="white" borderRadius="2xl" boxShadow="md" p={5} borderWidth="1px" borderColor="gray.100">
      <Stack spacing={4}>
        <HStack spacing={3} align="start">
          <Avatar size="md" name={student.name} src={student.profilePhoto || undefined} bg="pink.100" />
          <Stack spacing={1} flex={1}>
            <HStack spacing={2} flexWrap="wrap">
              <Heading size="sm">{student.name || "Student"}</Heading>
              <Badge colorScheme="pink">Student</Badge>
              <Badge colorScheme={statusMeta.colorScheme} transition="all 0.25s ease">
                {statusMeta.label}
              </Badge>
            </HStack>
            <Text color="gray.600" fontSize="sm">
              {student.industry || "Industry not specified"}
            </Text>
          </Stack>
        </HStack>

        {student.skills?.length ? (
          <Wrap spacing={2}>
            {student.skills.slice(0, 4).map((skill) => (
              <WrapItem key={`${request._id}-${skill}`}>
                <Badge colorScheme="purple" borderRadius="full" px={2} py={1}>
                  {skill}
                </Badge>
              </WrapItem>
            ))}
          </Wrap>
        ) : null}

        <Box bg="gray.50" borderRadius="lg" p={3}>
          <Text color="gray.700" fontSize="sm" noOfLines={5}>
            {request.message}
          </Text>
        </Box>

        {request.status === "pending" ? (
          <HStack spacing={3} flexWrap="wrap">
            <Button
              colorScheme="teal"
              size="sm"
              isLoading={isUpdating}
              loadingText="Updating"
              onClick={() => onUpdateStatus(request._id, "accepted")}
            >
              Accept
            </Button>
            <Button
              colorScheme="red"
              variant="outline"
              size="sm"
              isLoading={isUpdating}
              loadingText="Updating"
              onClick={() => onUpdateStatus(request._id, "rejected")}
            >
              Decline
            </Button>
          </HStack>
        ) : null}
      </Stack>
    </Box>
  );
};

const EmptyRequestsState = ({ filter }) => {
  return (
    <Box bg="white" borderRadius="2xl" boxShadow="md" p={{ base: 6, md: 9 }} textAlign="center">
      <Stack spacing={3} align="center">
        <Heading size="sm">No {filter} requests found</Heading>
        <Text color="gray.600" maxW="500px">
          New mentorship requests will appear here as students reach out.
        </Text>
      </Stack>
    </Box>
  );
};

const MentorshipRequestsPage = () => {
  const toast = useToast();
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [updatingRequestIds, setUpdatingRequestIds] = useState([]);

  useEffect(() => {
    let isMounted = true;

    const loadReceivedRequests = async () => {
      try {
        const { data } = await api.get("/mentorship/received");

        if (isMounted) {
          setRequests(data.requests || []);
        }
      } catch (error) {
        if (isMounted) {
          setRequests([]);
          toast({
            title: "Unable to load incoming requests",
            description: error.response?.data?.message || "Please try again.",
            status: "error",
            duration: 3200,
            isClosable: true,
          });
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    loadReceivedRequests();

    return () => {
      isMounted = false;
    };
  }, [toast]);

  const requestsByFilter = useMemo(() => {
    return FILTERS.reduce((accumulator, filter) => {
      accumulator[filter] = requests.filter((request) => request.status === filter);
      return accumulator;
    }, {});
  }, [requests]);

  const updateRequestStatus = async (requestId, nextStatus) => {
    const previousRequest = requests.find((request) => request._id === requestId);

    if (!previousRequest) {
      return;
    }

    setUpdatingRequestIds((previousIds) => [...previousIds, requestId]);

    setRequests((previousRequests) =>
      previousRequests.map((request) =>
        request._id === requestId ? { ...request, status: nextStatus } : request
      )
    );

    try {
      const { data } = await api.put(`/mentorship/${requestId}`, { status: nextStatus });
      const nextRequest = data.request;

      setRequests((previousRequests) =>
        previousRequests.map((request) => (request._id === requestId ? nextRequest : request))
      );

      toast({
        title: "Request updated",
        description: `Mentorship request ${nextStatus}.`,
        status: "success",
        duration: 2600,
        isClosable: true,
      });
    } catch (error) {
      setRequests((previousRequests) =>
        previousRequests.map((request) =>
          request._id === requestId ? { ...request, status: previousRequest.status } : request
        )
      );

      toast({
        title: "Unable to update request",
        description: error.response?.data?.message || "Please try again.",
        status: "error",
        duration: 3200,
        isClosable: true,
      });
    } finally {
      setUpdatingRequestIds((previousIds) => previousIds.filter((id) => id !== requestId));
    }
  };

  if (loading) {
    return (
      <Container maxW="6xl" py={{ base: 8, md: 10 }}>
        <HStack justify="center" spacing={3}>
          <Spinner color="teal.500" />
          <Text color="gray.600">Loading incoming mentorship requests...</Text>
        </HStack>
      </Container>
    );
  }

  return (
    <Container maxW="6xl" py={{ base: 8, md: 10 }}>
      <Stack spacing={6}>
        <Stack spacing={2}>
          <Heading size="lg">Incoming Mentorship Requests</Heading>
          <Text color="gray.600">Review, accept, or decline mentorship requests from students.</Text>
        </Stack>

        <Tabs variant="soft-rounded" colorScheme="teal" defaultIndex={0}>
          <TabList flexWrap="wrap" gap={2}>
            <Tab>Pending ({requestsByFilter.pending?.length || 0})</Tab>
            <Tab>Accepted ({requestsByFilter.accepted?.length || 0})</Tab>
            <Tab>Rejected ({requestsByFilter.rejected?.length || 0})</Tab>
          </TabList>

          <TabPanels mt={4}>
            {FILTERS.map((filter) => (
              <TabPanel key={filter} px={0}>
                {(requestsByFilter[filter] || []).length > 0 ? (
                  <Stack spacing={4}>
                    {(requestsByFilter[filter] || []).map((request) => (
                      <IncomingRequestCard
                        key={request._id}
                        request={request}
                        onUpdateStatus={updateRequestStatus}
                        isUpdating={updatingRequestIds.includes(request._id)}
                      />
                    ))}
                  </Stack>
                ) : (
                  <EmptyRequestsState filter={filter} />
                )}
              </TabPanel>
            ))}
          </TabPanels>
        </Tabs>
      </Stack>
    </Container>
  );
};

export default MentorshipRequestsPage;

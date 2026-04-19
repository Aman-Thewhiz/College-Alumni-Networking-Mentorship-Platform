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
  useToast,
} from "@chakra-ui/react";
import { useEffect, useMemo, useState } from "react";
import { Link as RouterLink } from "react-router-dom";
import api from "../services/api";

const STATUS_META = {
  pending: { label: "Pending", colorScheme: "yellow" },
  accepted: { label: "Accepted", colorScheme: "green" },
  rejected: { label: "Rejected", colorScheme: "red" },
};

const FILTERS = ["all", "pending", "accepted", "rejected"];

const MentorshipCard = ({ request }) => {
  const alumni = request.alumniId || {};
  const statusMeta = STATUS_META[request.status] || { label: request.status, colorScheme: "gray" };
  const messageLink = alumni._id ? `/messages?userId=${alumni._id}` : "/messages";

  return (
    <Box bg="white" borderRadius="2xl" boxShadow="md" p={5} borderWidth="1px" borderColor="gray.100">
      <Stack spacing={4}>
        <HStack spacing={3} align="start">
          <Avatar size="md" name={alumni.name} src={alumni.profilePhoto || undefined} bg="teal.100" />
          <Stack spacing={1} flex={1}>
            <HStack spacing={2} flexWrap="wrap">
              <Heading size="sm">{alumni.name || "Alumni"}</Heading>
              <Badge colorScheme="purple">Alumni</Badge>
              <Badge colorScheme={statusMeta.colorScheme} transition="all 0.25s ease">
                {statusMeta.label}
              </Badge>
            </HStack>
            <Text color="gray.600" fontSize="sm">
              {alumni.industry || "Industry not specified"}
            </Text>
          </Stack>
        </HStack>

        <Box bg="gray.50" borderRadius="lg" p={3}>
          <Text color="gray.700" fontSize="sm" noOfLines={3}>
            {request.message}
          </Text>
        </Box>

        <HStack spacing={3} flexWrap="wrap">
          <Button as={RouterLink} to={`/alumni/${alumni._id}`} variant="outline" size="sm">
            View Profile
          </Button>
          {request.status === "accepted" ? (
            <Button as={RouterLink} to={messageLink} size="sm" colorScheme="teal">
              Send Message
            </Button>
          ) : null}
        </HStack>
      </Stack>
    </Box>
  );
};

const EmptyMentorshipState = ({ filter }) => {
  const isFiltered = filter !== "all";

  return (
    <Box bg="white" borderRadius="2xl" boxShadow="md" p={{ base: 6, md: 9 }} textAlign="center">
      <Stack spacing={3} align="center">
        <Heading size="sm">No mentorship requests found</Heading>
        <Text color="gray.600" maxW="500px">
          {isFiltered
            ? "Try another status filter or view all mentorship requests."
            : "Start exploring alumni profiles and send mentorship requests to begin your journey."}
        </Text>
        <Button as={RouterLink} to="/alumni" colorScheme="teal" variant="outline">
          Browse Alumni
        </Button>
      </Stack>
    </Box>
  );
};

const MentorshipPage = () => {
  const toast = useToast();
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    const loadSentRequests = async () => {
      try {
        const { data } = await api.get("/mentorship/sent");

        if (isMounted) {
          setRequests(data.requests || []);
        }
      } catch (error) {
        if (isMounted) {
          setRequests([]);
          toast({
            title: "Unable to load mentorship requests",
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

    loadSentRequests();

    return () => {
      isMounted = false;
    };
  }, [toast]);

  const requestsByFilter = useMemo(() => {
    return FILTERS.reduce((accumulator, filter) => {
      if (filter === "all") {
        accumulator[filter] = requests;
      } else {
        accumulator[filter] = requests.filter((request) => request.status === filter);
      }

      return accumulator;
    }, {});
  }, [requests]);

  if (loading) {
    return (
      <Container maxW="6xl" py={{ base: 8, md: 10 }}>
        <HStack justify="center" spacing={3}>
          <Spinner color="teal.500" />
          <Text color="gray.600">Loading mentorship requests...</Text>
        </HStack>
      </Container>
    );
  }

  return (
    <Container maxW="6xl" py={{ base: 8, md: 10 }}>
      <Stack spacing={6}>
        <Stack spacing={2}>
          <Heading size="lg">My Mentorship Requests</Heading>
          <Text color="gray.600">Track requests you have sent to alumni mentors.</Text>
        </Stack>

        <Tabs variant="soft-rounded" colorScheme="teal">
          <TabList flexWrap="wrap" gap={2}>
            <Tab>All ({requestsByFilter.all?.length || 0})</Tab>
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
                      <MentorshipCard key={request._id} request={request} />
                    ))}
                  </Stack>
                ) : (
                  <EmptyMentorshipState filter={filter} />
                )}
              </TabPanel>
            ))}
          </TabPanels>
        </Tabs>
      </Stack>
    </Container>
  );
};

export default MentorshipPage;

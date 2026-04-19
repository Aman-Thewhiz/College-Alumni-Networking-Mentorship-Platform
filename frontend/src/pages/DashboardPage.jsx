import {
  Badge,
  Box,
  Button,
  Container,
  Heading,
  HStack,
  Progress,
  Skeleton,
  SimpleGrid,
  Stack,
  Text,
} from "@chakra-ui/react";
import { useEffect, useState } from "react";
import { Link as RouterLink } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import api from "../services/api";
import { getMissingProfileFields, getUserId, PROFILE_COMPLETION_FIELDS } from "../utils/userProfile";

const roleColorScheme = {
  Student: "pink",
  Alumni: "purple",
  Admin: "orange",
};

const DashboardPage = () => {
  const { user } = useAuth();
  const [alumniCount, setAlumniCount] = useState(null);
  const [loadingAlumniCount, setLoadingAlumniCount] = useState(false);
  const [pendingMentorshipCount, setPendingMentorshipCount] = useState(null);
  const [loadingPendingMentorshipCount, setLoadingPendingMentorshipCount] = useState(false);
  const [opportunitiesCount, setOpportunitiesCount] = useState(null);
  const [loadingOpportunitiesCount, setLoadingOpportunitiesCount] = useState(false);
  const [myPostingsCount, setMyPostingsCount] = useState(null);
  const [loadingMyPostingsCount, setLoadingMyPostingsCount] = useState(false);
  const currentUserId = getUserId(user);

  const missingFields = getMissingProfileFields(user);
  const completionPercentage = Math.round(
    ((PROFILE_COMPLETION_FIELDS.length - missingFields.length) / PROFILE_COMPLETION_FIELDS.length) *
      100
  );

  useEffect(() => {
    let isMounted = true;

    const loadDashboardCounts = async () => {
      if (user?.role === "Student") {
        setLoadingAlumniCount(true);
        setLoadingOpportunitiesCount(true);

        try {
          const [{ data: alumniData }, { data: opportunitiesData }] = await Promise.all([
            api.get("/users", {
              params: {
                role: "Alumni",
                page: 1,
                limit: 1,
              },
            }),
            api.get("/opportunities", {
              params: {
                page: 1,
                limit: 1,
              },
            }),
          ]);

          if (isMounted) {
            setAlumniCount(alumniData.total || alumniData.count || 0);
            setOpportunitiesCount(opportunitiesData.total || opportunitiesData.count || 0);
          }
        } catch {
          if (isMounted) {
            setAlumniCount(null);
            setOpportunitiesCount(null);
          }
        } finally {
          if (isMounted) {
            setLoadingAlumniCount(false);
            setLoadingOpportunitiesCount(false);
          }
        }
      }

      if (user?.role === "Alumni") {
        setLoadingPendingMentorshipCount(true);
        setLoadingMyPostingsCount(true);

        try {
          const [{ data: mentorshipData }, { data: postingsData }] = await Promise.all([
            api.get("/mentorship/received"),
            api.get("/opportunities", {
              params: {
                page: 1,
                limit: 1,
                postedBy: currentUserId,
              },
            }),
          ]);

          const pendingRequests = (mentorshipData.requests || []).filter(
            (request) => request.status === "pending"
          );

          if (isMounted) {
            setPendingMentorshipCount(pendingRequests.length);
            setMyPostingsCount(postingsData.total || postingsData.count || 0);
          }
        } catch {
          if (isMounted) {
            setPendingMentorshipCount(null);
            setMyPostingsCount(null);
          }
        } finally {
          if (isMounted) {
            setLoadingPendingMentorshipCount(false);
            setLoadingMyPostingsCount(false);
          }
        }
      }
    };

    loadDashboardCounts();

    return () => {
      isMounted = false;
    };
  }, [currentUserId, user?.role]);

  return (
    <Container maxW="6xl" py={{ base: 8, md: 10 }}>
      <Stack spacing={6}>
        <Box bg="white" borderRadius="2xl" boxShadow="md" p={{ base: 5, md: 7 }}>
          <Stack spacing={2}>
            <HStack spacing={3}>
              <Heading size="md">Welcome, {user?.name || "User"}</Heading>
              <Badge colorScheme={roleColorScheme[user?.role] || "gray"}>{user?.role}</Badge>
            </HStack>
            <Text color="gray.600">
              Your {user?.role} dashboard is ready. Continue setting up your account to unlock the
              best mentorship experience.
            </Text>
          </Stack>
        </Box>

        <SimpleGrid columns={{ base: 1, lg: 2 }} spacing={6}>
          <Box bg="white" borderRadius="2xl" boxShadow="md" p={{ base: 5, md: 6 }}>
            <Stack spacing={4}>
              <Heading size="sm">Profile Completion</Heading>
              <Stack spacing={2}>
                <HStack justify="space-between">
                  <Text fontWeight="medium" color="gray.700">
                    Completion Status
                  </Text>
                  <Text fontWeight="semibold" color="teal.600">
                    {completionPercentage}%
                  </Text>
                </HStack>
                <Progress value={completionPercentage} borderRadius="full" colorScheme="teal" />
              </Stack>

              {missingFields.length > 0 ? (
                <Stack spacing={3}>
                  <Text color="gray.600">
                    Complete your profile to improve discoverability and match quality.
                  </Text>
                  <Text fontSize="sm" color="gray.500">
                    Missing: {missingFields.join(", ")}
                  </Text>
                  <Button as={RouterLink} to="/profile" alignSelf="start">
                    Complete Your Profile
                  </Button>
                </Stack>
              ) : (
                <Box borderWidth="1px" borderColor="teal.100" bg="teal.50" borderRadius="lg" p={4}>
                  <Text color="teal.700" fontWeight="medium">
                    Profile complete. Great work.
                  </Text>
                </Box>
              )}
            </Stack>
          </Box>

          <Box bg="white" borderRadius="2xl" boxShadow="md" p={{ base: 5, md: 6 }}>
            <Stack spacing={3}>
              <Heading size="sm">Next Steps</Heading>
              <Text color="gray.600">
                Explore alumni profiles, mentorship requests, and opportunities in upcoming phases.
              </Text>
              <HStack spacing={3} flexWrap="wrap">
                <Button as={RouterLink} to="/profile" variant="outline">
                  Edit Profile
                </Button>
                <Button as={RouterLink} to="/messages" variant="ghost">
                  Open Messages
                </Button>
              </HStack>

              {user?.role === "Student" ? (
                <Stack spacing={3}>
                  <Box borderWidth="1px" borderColor="teal.100" bg="teal.50" borderRadius="lg" p={4}>
                    <Stack spacing={3} align="start">
                      <Text fontWeight="semibold" color="gray.800">
                        Browse Alumni
                      </Text>
                      {loadingAlumniCount ? (
                        <Skeleton height="12px" width="230px" />
                      ) : (
                        <Text color="gray.600" fontSize="sm">
                          {`${alumniCount || 0} alumni profiles are available right now.`}
                        </Text>
                      )}
                      <Button as={RouterLink} to="/alumni" size="sm" colorScheme="teal" variant="outline">
                        Browse Alumni Directory
                      </Button>
                    </Stack>
                  </Box>

                  <Box borderWidth="1px" borderColor="orange.100" bg="orange.50" borderRadius="lg" p={4}>
                    <Stack spacing={3} align="start">
                      <Text fontWeight="semibold" color="gray.800">
                        Opportunities
                      </Text>
                      {loadingOpportunitiesCount ? (
                        <Skeleton height="12px" width="220px" />
                      ) : (
                        <Text color="gray.600" fontSize="sm">
                          {`${opportunitiesCount || 0} opportunit${
                            opportunitiesCount === 1 ? "y" : "ies"
                          } available now.`}
                        </Text>
                      )}
                      <Button
                        as={RouterLink}
                        to="/opportunities"
                        size="sm"
                        colorScheme="orange"
                        variant="outline"
                      >
                        Explore Opportunities
                      </Button>
                    </Stack>
                  </Box>
                </Stack>
              ) : null}

              {user?.role === "Alumni" ? (
                <Stack spacing={3}>
                  <Box borderWidth="1px" borderColor="purple.100" bg="purple.50" borderRadius="lg" p={4}>
                    <Stack spacing={3} align="start">
                      <Text fontWeight="semibold" color="gray.800">
                        Pending Mentorship Requests
                      </Text>
                      {loadingPendingMentorshipCount ? (
                        <Skeleton height="12px" width="240px" />
                      ) : (
                        <Text color="gray.600" fontSize="sm">
                          {`${pendingMentorshipCount || 0} pending mentorship request${
                            pendingMentorshipCount === 1 ? "" : "s"
                          } waiting for your review.`}
                        </Text>
                      )}
                      <Button
                        as={RouterLink}
                        to="/mentorship/requests"
                        size="sm"
                        colorScheme="purple"
                        variant="outline"
                      >
                        Review Requests
                      </Button>
                    </Stack>
                  </Box>

                  <Box borderWidth="1px" borderColor="teal.100" bg="teal.50" borderRadius="lg" p={4}>
                    <Stack spacing={3} align="start">
                      <Text fontWeight="semibold" color="gray.800">
                        My Postings
                      </Text>
                      {loadingMyPostingsCount ? (
                        <Skeleton height="12px" width="180px" />
                      ) : (
                        <Text color="gray.600" fontSize="sm">
                          {`${myPostingsCount || 0} opportunit${myPostingsCount === 1 ? "y" : "ies"} posted.`}
                        </Text>
                      )}
                      <Button
                        as={RouterLink}
                        to="/opportunities/manage"
                        size="sm"
                        colorScheme="teal"
                        variant="outline"
                      >
                        Manage Postings
                      </Button>
                    </Stack>
                  </Box>
                </Stack>
              ) : null}
            </Stack>
          </Box>
        </SimpleGrid>
      </Stack>
    </Container>
  );
};

export default DashboardPage;

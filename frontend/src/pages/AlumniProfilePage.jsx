import {
  Avatar,
  Badge,
  Box,
  Button,
  Container,
  Divider,
  Heading,
  HStack,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  SimpleGrid,
  Spinner,
  Stack,
  Text,
  Textarea,
  Wrap,
  WrapItem,
  useDisclosure,
  useToast,
} from "@chakra-ui/react";
import { useEffect, useMemo, useState } from "react";
import { Link as RouterLink, useParams } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import api from "../services/api";
import { getUserId } from "../utils/userProfile";

const roleBadgeScheme = {
  Student: "pink",
  Alumni: "purple",
  Admin: "orange",
};

const mentorshipStatusMeta = {
  pending: { label: "Request Sent", colorScheme: "yellow" },
  accepted: { label: "Mentorship Accepted", colorScheme: "green" },
  rejected: { label: "Request Mentorship" },
};

const StatCard = ({ label, value }) => {
  return (
    <Box bg="white" borderRadius="lg" borderWidth="1px" borderColor="gray.100" p={4}>
      <Text fontSize="sm" color="gray.500">
        {label}
      </Text>
      <Text mt={1} fontWeight="semibold" color="gray.700">
        {value || "Not specified"}
      </Text>
    </Box>
  );
};

const AlumniProfilePage = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [mentorshipStatus, setMentorshipStatus] = useState(null);
  const [loadingMentorshipStatus, setLoadingMentorshipStatus] = useState(false);
  const [requestMessage, setRequestMessage] = useState("");
  const [submittingRequest, setSubmittingRequest] = useState(false);

  const toast = useToast();
  const { isOpen, onOpen, onClose } = useDisclosure();

  const viewerId = useMemo(() => getUserId(user), [user]);
  const isOwnProfile = profile && viewerId && profile._id === viewerId;
  const showRequestMentorship =
    user?.role === "Student" && profile?.role === "Alumni" && !isOwnProfile;
  const hasAcceptedMentorship = mentorshipStatus === "accepted";
  const requestStatusMeta = mentorshipStatusMeta[mentorshipStatus] || mentorshipStatusMeta.rejected;
  const isMentorshipRequestLocked = mentorshipStatus === "pending" || mentorshipStatus === "accepted";

  useEffect(() => {
    let isMounted = true;

    const loadProfile = async () => {
      if (!id) {
        if (isMounted) {
          setLoading(false);
        }
        return;
      }

      try {
        const { data } = await api.get(`/users/${id}`);
        if (isMounted) {
          setProfile(data.user);
        }
      } catch (error) {
        if (isMounted) {
          toast({
            title: "Unable to load profile",
            description: error.response?.data?.message || "Please try again.",
            status: "error",
            duration: 3500,
            isClosable: true,
          });
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    loadProfile();

    return () => {
      isMounted = false;
    };
  }, [id, toast]);

  useEffect(() => {
    let isMounted = true;

    const loadMentorshipStatus = async () => {
      if (!showRequestMentorship || !id) {
        if (isMounted) {
          setMentorshipStatus(null);
        }
        return;
      }

      setLoadingMentorshipStatus(true);

      try {
        const { data } = await api.get("/mentorship/sent");
        const matchingRequest = (data.requests || []).find((request) => {
          const alumniId = request.alumniId?._id || request.alumniId;
          return alumniId === id;
        });

        if (isMounted) {
          setMentorshipStatus(matchingRequest?.status || null);
        }
      } catch {
        if (isMounted) {
          setMentorshipStatus(null);
        }
      } finally {
        if (isMounted) {
          setLoadingMentorshipStatus(false);
        }
      }
    };

    loadMentorshipStatus();

    return () => {
      isMounted = false;
    };
  }, [id, showRequestMentorship]);

  const handleRequestMentorship = async () => {
    if (!profile?._id) {
      return;
    }

    if (!requestMessage.trim()) {
      toast({
        title: "Message required",
        description: "Please add a short note for the alumni mentor.",
        status: "warning",
        duration: 2600,
        isClosable: true,
      });
      return;
    }

    setSubmittingRequest(true);

    try {
      await api.post("/mentorship", {
        alumniId: profile._id,
        message: requestMessage.trim(),
      });

      setMentorshipStatus("pending");
      setRequestMessage("");
      onClose();

      toast({
        title: "Mentorship request sent",
        description: "Your request has been submitted successfully.",
        status: "success",
        duration: 3000,
        isClosable: true,
      });
    } catch (error) {
      const apiMessage = error.response?.data?.message || "Please try again.";

      if (apiMessage.toLowerCase().includes("accepted mentorship")) {
        setMentorshipStatus("accepted");
      }

      if (apiMessage.toLowerCase().includes("pending mentorship request")) {
        setMentorshipStatus("pending");
      }

      toast({
        title: "Unable to send request",
        description: apiMessage,
        status: "error",
        duration: 3200,
        isClosable: true,
      });
    } finally {
      setSubmittingRequest(false);
    }
  };

  if (loading) {
    return (
      <Container maxW="5xl" py={12}>
        <HStack justify="center" spacing={3}>
          <Spinner color="teal.500" />
          <Text color="gray.600">Loading public profile...</Text>
        </HStack>
      </Container>
    );
  }

  if (!profile) {
    return (
      <Container maxW="3xl" py={12}>
        <Box bg="white" borderRadius="2xl" boxShadow="md" p={8} textAlign="center">
          <Heading size="md">Profile not found</Heading>
          <Text color="gray.600" mt={2}>
            The requested profile does not exist.
          </Text>
        </Box>
      </Container>
    );
  }

  return (
    <Container maxW="6xl" py={{ base: 8, md: 10 }}>
      <Stack spacing={6}>
        <Box
          borderRadius="2xl"
          bgGradient="linear(to-r, teal.50, pink.50, purple.50)"
          boxShadow="md"
          p={{ base: 6, md: 8 }}
        >
          <Stack spacing={5}>
            <HStack spacing={4} align={{ base: "start", md: "center" }} flexWrap="wrap">
              <Avatar
                size={{ base: "xl", md: "2xl" }}
                src={profile.profilePhoto || undefined}
                name={profile.name}
                bg="white"
              />
              <Stack spacing={2}>
                <HStack spacing={3}>
                  <Heading size={{ base: "md", md: "lg" }}>{profile.name}</Heading>
                  <Badge colorScheme={roleBadgeScheme[profile.role] || "gray"}>{profile.role}</Badge>
                </HStack>
                <Text color="gray.700">{profile.industry || "Industry not specified"}</Text>
                <Text color="gray.600">
                  {profile.company || "Company not specified"}
                  {profile.graduationYear ? ` | Class of ${profile.graduationYear}` : ""}
                </Text>
              </Stack>
            </HStack>

            <HStack spacing={3} flexWrap="wrap">
              {showRequestMentorship ? (
                <Button
                  colorScheme={isMentorshipRequestLocked ? requestStatusMeta.colorScheme : "teal"}
                  onClick={onOpen}
                  isDisabled={isMentorshipRequestLocked || loadingMentorshipStatus}
                  isLoading={loadingMentorshipStatus}
                  loadingText="Checking status"
                >
                  {requestStatusMeta.label}
                </Button>
              ) : null}
              {hasAcceptedMentorship ? (
                <Button as={RouterLink} to={`/messages?userId=${profile._id}`} variant="outline">
                  Send Message
                </Button>
              ) : null}
            </HStack>
          </Stack>
        </Box>

        <SimpleGrid columns={{ base: 1, md: 3 }} spacing={4}>
          <StatCard label="Industry" value={profile.industry} />
          <StatCard label="Company" value={profile.company} />
          <StatCard
            label="Graduation Year"
            value={profile.graduationYear ? String(profile.graduationYear) : "Not specified"}
          />
        </SimpleGrid>

        <Box bg="white" borderRadius="2xl" boxShadow="md" p={{ base: 6, md: 8 }}>
          <Stack spacing={6}>
            <Stack spacing={2}>
              <Heading size="sm">Bio</Heading>
              <Text color="gray.600">{profile.bio || "No bio added yet."}</Text>
            </Stack>

            <Divider />

            <Stack spacing={3}>
              <Heading size="sm">Skills</Heading>
              {profile.skills?.length ? (
                <Wrap spacing={2}>
                  {profile.skills.map((skill) => (
                    <WrapItem key={skill}>
                      <Badge colorScheme="pink" borderRadius="full" px={3} py={1}>
                        {skill}
                      </Badge>
                    </WrapItem>
                  ))}
                </Wrap>
              ) : (
                <Text color="gray.500">No skills listed.</Text>
              )}
            </Stack>

            <Divider />

            <Stack spacing={2}>
              <Heading size="sm">Experience</Heading>
              <Text color="gray.600">{profile.experience || "No experience details added."}</Text>
            </Stack>
          </Stack>
        </Box>
      </Stack>

      <Modal isOpen={isOpen} onClose={onClose} isCentered>
        <ModalOverlay />
        <ModalContent
          mx={{ base: 0, md: 4 }}
          maxW={{ base: "100vw", md: "lg" }}
          minH={{ base: "100vh", md: "auto" }}
          borderRadius={{ base: 0, md: "xl" }}
        >
          <ModalHeader>Request Mentorship</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <Stack spacing={3}>
              <Text color="gray.600" fontSize="sm">
                Write a short introduction and mention what you want guidance on.
              </Text>
              <Textarea
                value={requestMessage}
                onChange={(event) => setRequestMessage(event.target.value)}
                placeholder="Hi, I am exploring careers in your domain and would love your mentorship..."
                rows={5}
              />
            </Stack>
          </ModalBody>
          <ModalFooter>
            <HStack spacing={3}>
              <Button variant="ghost" onClick={onClose}>
                Cancel
              </Button>
              <Button
                colorScheme="teal"
                onClick={handleRequestMentorship}
                isLoading={submittingRequest}
                loadingText="Sending"
              >
                Send Request
              </Button>
            </HStack>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </Container>
  );
};

export default AlumniProfilePage;

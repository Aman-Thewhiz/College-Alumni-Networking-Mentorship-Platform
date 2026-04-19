import {
  AlertDialog,
  AlertDialogBody,
  AlertDialogContent,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogOverlay,
  Badge,
  Box,
  Button,
  Container,
  FormControl,
  FormLabel,
  Heading,
  HStack,
  Input,
  Radio,
  RadioGroup,
  Skeleton,
  Stack,
  Text,
  Textarea,
  useDisclosure,
  useToast,
} from "@chakra-ui/react";
import { useEffect, useMemo, useRef, useState } from "react";
import { useAuth } from "../context/AuthContext";
import api from "../services/api";
import { getUserId } from "../utils/userProfile";

const typeBadgeMeta = {
  job: { label: "Job", colorScheme: "teal" },
  internship: { label: "Internship", colorScheme: "pink" },
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

const OpportunityListSkeleton = () => (
  <Stack spacing={4}>
    {[...Array(3)].map((_, index) => (
      <Box key={index} bg="white" borderRadius="xl" boxShadow="md" p={5}>
        <Stack spacing={3}>
          <Skeleton height="12px" width="100px" />
          <Skeleton height="16px" width="220px" />
          <Skeleton height="10px" />
          <Skeleton height="10px" width="90%" />
          <Skeleton height="34px" width="100px" />
        </Stack>
      </Box>
    ))}
  </Stack>
);

const OpportunitiesManagePage = () => {
  const toast = useToast();
  const { user } = useAuth();
  const userId = useMemo(() => getUserId(user), [user]);

  const [formState, setFormState] = useState({
    title: "",
    company: "",
    type: "job",
    description: "",
  });
  const [submitting, setSubmitting] = useState(false);
  const [opportunities, setOpportunities] = useState([]);
  const [loadingOpportunities, setLoadingOpportunities] = useState(true);
  const [deletingOpportunityId, setDeletingOpportunityId] = useState("");
  const [selectedOpportunity, setSelectedOpportunity] = useState(null);

  const { isOpen, onOpen, onClose } = useDisclosure();
  const cancelRef = useRef(null);

  useEffect(() => {
    let isMounted = true;

    const loadMyOpportunities = async () => {
      if (!userId) {
        if (isMounted) {
          setOpportunities([]);
          setLoadingOpportunities(false);
        }
        return;
      }

      setLoadingOpportunities(true);

      try {
        const { data } = await api.get("/opportunities", {
          params: {
            page: 1,
            limit: 50,
            postedBy: userId,
          },
        });

        if (isMounted) {
          setOpportunities(data.opportunities || []);
        }
      } catch (error) {
        if (isMounted) {
          setOpportunities([]);
          toast({
            title: "Unable to load your postings",
            description: error.response?.data?.message || "Please try again.",
            status: "error",
            duration: 3200,
            isClosable: true,
          });
        }
      } finally {
        if (isMounted) {
          setLoadingOpportunities(false);
        }
      }
    };

    loadMyOpportunities();

    return () => {
      isMounted = false;
    };
  }, [toast, userId]);

  const handleInputChange = (field, value) => {
    setFormState((previousState) => ({
      ...previousState,
      [field]: value,
    }));
  };

  const resetForm = () => {
    setFormState({
      title: "",
      company: "",
      type: "job",
      description: "",
    });
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    const payload = {
      title: formState.title.trim(),
      company: formState.company.trim(),
      type: formState.type,
      description: formState.description.trim(),
    };

    if (!payload.title || !payload.company || !payload.description) {
      toast({
        title: "Please complete all fields",
        description: "Title, company, type, and description are required.",
        status: "warning",
        duration: 2600,
        isClosable: true,
      });
      return;
    }

    setSubmitting(true);

    try {
      const { data } = await api.post("/opportunities", payload);
      const createdOpportunity = data.opportunity;

      setOpportunities((previousOpportunities) => [createdOpportunity, ...previousOpportunities]);
      resetForm();

      toast({
        title: "Opportunity posted",
        description: "Your opportunity is now visible on the board.",
        status: "success",
        duration: 3000,
        isClosable: true,
      });
    } catch (error) {
      toast({
        title: "Unable to post opportunity",
        description: error.response?.data?.message || "Please try again.",
        status: "error",
        duration: 3200,
        isClosable: true,
      });
    } finally {
      setSubmitting(false);
    }
  };

  const openDeleteDialog = (opportunity) => {
    setSelectedOpportunity(opportunity);
    onOpen();
  };

  const handleDelete = async () => {
    if (!selectedOpportunity?._id) {
      onClose();
      return;
    }

    const targetId = selectedOpportunity._id;
    setDeletingOpportunityId(targetId);

    try {
      await api.delete(`/opportunities/${targetId}`);

      setOpportunities((previousOpportunities) =>
        previousOpportunities.filter((opportunity) => opportunity._id !== targetId)
      );

      toast({
        title: "Opportunity deleted",
        description: "The posting has been removed.",
        status: "success",
        duration: 2600,
        isClosable: true,
      });
    } catch (error) {
      toast({
        title: "Unable to delete opportunity",
        description: error.response?.data?.message || "Please try again.",
        status: "error",
        duration: 3200,
        isClosable: true,
      });
    } finally {
      setDeletingOpportunityId("");
      setSelectedOpportunity(null);
      onClose();
    }
  };

  return (
    <Container maxW="7xl" py={{ base: 8, md: 10 }}>
      <Stack spacing={7}>
        <Box bg="white" borderRadius="2xl" boxShadow="md" p={{ base: 6, md: 8 }}>
          <Stack as="form" spacing={5} onSubmit={handleSubmit}>
            <Stack spacing={2}>
              <Heading size={{ base: "md", md: "lg" }}>Post New Opportunity</Heading>
              <Text color="gray.600">
                Share jobs and internships to help students discover meaningful career paths.
              </Text>
            </Stack>

            <Stack spacing={4}>
              <FormControl isRequired>
                <FormLabel>Title</FormLabel>
                <Input
                  value={formState.title}
                  onChange={(event) => handleInputChange("title", event.target.value)}
                  placeholder="e.g. Frontend Engineer Intern"
                />
              </FormControl>

              <FormControl isRequired>
                <FormLabel>Company</FormLabel>
                <Input
                  value={formState.company}
                  onChange={(event) => handleInputChange("company", event.target.value)}
                  placeholder="e.g. Acme Labs"
                />
              </FormControl>

              <FormControl isRequired>
                <FormLabel>Type</FormLabel>
                <RadioGroup
                  value={formState.type}
                  onChange={(value) => handleInputChange("type", value)}
                >
                  <HStack spacing={5}>
                    <Radio value="job">Job</Radio>
                    <Radio value="internship">Internship</Radio>
                  </HStack>
                </RadioGroup>
              </FormControl>

              <FormControl isRequired>
                <FormLabel>Description</FormLabel>
                <Textarea
                  value={formState.description}
                  onChange={(event) => handleInputChange("description", event.target.value)}
                  placeholder="Describe the role, responsibilities, and expectations"
                  rows={5}
                />
              </FormControl>
            </Stack>

            <Button type="submit" alignSelf="start" colorScheme="teal" isLoading={submitting} loadingText="Posting">
              Post Opportunity
            </Button>
          </Stack>
        </Box>

        <Stack spacing={4}>
          <HStack justify="space-between" flexWrap="wrap" spacing={3}>
            <Heading size="md">My Posted Opportunities</Heading>
            <Text color="gray.600" fontSize="sm">
              {opportunities.length} posting{opportunities.length === 1 ? "" : "s"}
            </Text>
          </HStack>

          {loadingOpportunities ? (
            <OpportunityListSkeleton />
          ) : opportunities.length > 0 ? (
            <Stack spacing={4}>
              {opportunities.map((opportunity) => {
                const typeMeta =
                  typeBadgeMeta[opportunity.type] || { label: "Opportunity", colorScheme: "gray" };
                const isDeleting = deletingOpportunityId === opportunity._id;

                return (
                  <Box key={opportunity._id} bg="white" borderRadius="2xl" boxShadow="md" p={5} borderWidth="1px" borderColor="gray.100">
                    <Stack spacing={3}>
                      <HStack justify="space-between" align="start" flexWrap="wrap">
                        <Stack spacing={1}>
                          <Text fontWeight="bold" color="gray.800">
                            {opportunity.company}
                          </Text>
                          <Heading size="sm">{opportunity.title}</Heading>
                        </Stack>
                        <HStack spacing={2}>
                          <Badge colorScheme={typeMeta.colorScheme} borderRadius="full" px={3} py={1}>
                            {typeMeta.label}
                          </Badge>
                          <Text color="gray.500" fontSize="xs">
                            {formatDate(opportunity.createdAt)}
                          </Text>
                        </HStack>
                      </HStack>

                      <Text color="gray.600" noOfLines={4}>
                        {opportunity.description}
                      </Text>

                      <Button
                        alignSelf="start"
                        size="sm"
                        colorScheme="red"
                        variant="outline"
                        onClick={() => openDeleteDialog(opportunity)}
                        isLoading={isDeleting}
                        loadingText="Deleting"
                      >
                        Delete
                      </Button>
                    </Stack>
                  </Box>
                );
              })}
            </Stack>
          ) : (
            <Box bg="white" borderRadius="2xl" boxShadow="md" p={{ base: 6, md: 8 }} textAlign="center">
              <Stack spacing={3} align="center">
                <Heading size="sm">No opportunities posted yet</Heading>
                <Text color="gray.600" maxW="500px">
                  Create your first posting using the form above to share opportunities with students.
                </Text>
              </Stack>
            </Box>
          )}
        </Stack>
      </Stack>

      <AlertDialog isOpen={isOpen} leastDestructiveRef={cancelRef} onClose={onClose} isCentered>
        <AlertDialogOverlay>
          <AlertDialogContent
            mx={{ base: 0, md: 4 }}
            maxW={{ base: "100vw", md: "md" }}
            minH={{ base: "100vh", md: "auto" }}
            borderRadius={{ base: 0, md: "xl" }}
          >
            <AlertDialogHeader fontSize="lg" fontWeight="bold">
              Delete Opportunity
            </AlertDialogHeader>

            <AlertDialogBody>
              Are you sure you want to delete this posting? This action cannot be undone.
            </AlertDialogBody>

            <AlertDialogFooter>
              <Button ref={cancelRef} onClick={onClose}>
                Cancel
              </Button>
              <Button
                colorScheme="red"
                onClick={handleDelete}
                ml={3}
                isLoading={Boolean(selectedOpportunity?._id && deletingOpportunityId === selectedOpportunity._id)}
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

export default OpportunitiesManagePage;

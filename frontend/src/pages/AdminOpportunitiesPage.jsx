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
  ButtonGroup,
  Container,
  Heading,
  HStack,
  Input,
  SimpleGrid,
  Skeleton,
  SkeletonCircle,
  Stack,
  Text,
  useDisclosure,
  useToast,
} from "@chakra-ui/react";
import { useEffect, useMemo, useRef, useState } from "react";
import { Link as RouterLink } from "react-router-dom";
import api from "../services/api";

const TYPE_FILTERS = [
  { label: "All", value: "all" },
  { label: "Jobs", value: "job" },
  { label: "Internships", value: "internship" },
];

const typeBadgeMeta = {
  job: { label: "Job", colorScheme: "teal" },
  internship: { label: "Internship", colorScheme: "pink" },
};

const RESULTS_PER_PAGE = 9;

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

const OpportunitiesSkeletonGrid = () => {
  return (
    <SimpleGrid columns={{ base: 1, md: 2, xl: 3 }} spacing={5}>
      {[...Array(RESULTS_PER_PAGE)].map((_, index) => (
        <Box key={index} bg="white" borderRadius="2xl" boxShadow="md" p={5}>
          <HStack justify="space-between" align="start">
            <Stack spacing={2} flex={1}>
              <Skeleton height="12px" width="110px" />
              <Skeleton height="16px" width="180px" />
            </Stack>
            <Skeleton height="22px" width="76px" borderRadius="full" />
          </HStack>
          <Stack mt={4} spacing={2}>
            <Skeleton height="10px" />
            <Skeleton height="10px" />
            <Skeleton height="10px" width="88%" />
          </Stack>
          <HStack mt={5} justify="space-between">
            <HStack spacing={2}>
              <SkeletonCircle size="5" />
              <Skeleton height="10px" width="110px" />
            </HStack>
            <Skeleton height="30px" width="76px" />
          </HStack>
        </Box>
      ))}
    </SimpleGrid>
  );
};

const AdminOpportunityCard = ({ opportunity, onDelete, isDeleting }) => {
  const typeMeta = typeBadgeMeta[opportunity.type] || { label: "Opportunity", colorScheme: "gray" };
  const poster = opportunity.postedBy || {};

  return (
    <Box
      bg="white"
      borderRadius="2xl"
      boxShadow="md"
      borderWidth="1px"
      borderColor="gray.100"
      p={5}
      transition="transform 0.22s ease, box-shadow 0.22s ease, border-color 0.22s ease"
      _hover={{ transform: "translateY(-4px)", boxShadow: "xl", borderColor: "teal.200" }}
    >
      <Stack spacing={4}>
        <HStack justify="space-between" align="start">
          <Stack spacing={1} minW={0}>
            <Text fontWeight="bold" color="gray.800" noOfLines={1}>
              {opportunity.company}
            </Text>
            <Heading size="sm" noOfLines={2}>
              {opportunity.title}
            </Heading>
          </Stack>
          <Badge colorScheme={typeMeta.colorScheme} borderRadius="full" px={3} py={1}>
            {typeMeta.label}
          </Badge>
        </HStack>

        <Text color="gray.600" noOfLines={4}>
          {opportunity.description}
        </Text>

        <HStack justify="space-between" align="center" flexWrap="wrap" spacing={3}>
          <HStack spacing={2} minW={0}>
            <Avatar size="xs" name={poster.name} src={poster.profilePhoto || undefined} />
            <Text color="gray.700" fontSize="sm" noOfLines={1}>
              Posted by{" "}
              {poster._id ? (
                <Button
                  as={RouterLink}
                  to={`/alumni/${poster._id}`}
                  variant="link"
                  colorScheme="teal"
                  fontSize="sm"
                  h="auto"
                  minW="auto"
                  p={0}
                >
                  {poster.name || "Alumni"}
                </Button>
              ) : (
                <Text as="span" fontWeight="semibold">
                  {poster.name || "Alumni"}
                </Text>
              )}
            </Text>
          </HStack>

          <HStack spacing={2}>
            <Text color="gray.500" fontSize="xs">
              {formatDate(opportunity.createdAt)}
            </Text>
            <Button
              size="xs"
              colorScheme="red"
              variant="outline"
              onClick={() => onDelete(opportunity)}
              isLoading={isDeleting}
              loadingText="Deleting"
            >
              Delete
            </Button>
          </HStack>
        </HStack>
      </Stack>
    </Box>
  );
};

const AdminOpportunitiesPage = () => {
  const toast = useToast();
  const [searchInput, setSearchInput] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedType, setSelectedType] = useState("all");
  const [page, setPage] = useState(1);
  const [opportunities, setOpportunities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [deletingOpportunityId, setDeletingOpportunityId] = useState("");
  const [selectedOpportunity, setSelectedOpportunity] = useState(null);
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
  }, [searchQuery, selectedType]);

  useEffect(() => {
    let isMounted = true;

    const loadOpportunities = async () => {
      if (page === 1) {
        setLoading(true);
      } else {
        setLoadingMore(true);
      }

      try {
        const params = {
          page,
          limit: RESULTS_PER_PAGE,
        };

        if (selectedType !== "all") {
          params.type = selectedType;
        }

        if (searchQuery) {
          params.search = searchQuery;
        }

        const { data } = await api.get("/opportunities", { params });
        const nextOpportunities = data.opportunities || [];

        if (!isMounted) {
          return;
        }

        setOpportunities((previousOpportunities) => {
          if (page === 1) {
            return nextOpportunities;
          }

          const existingIds = new Set(previousOpportunities.map((opportunity) => opportunity._id));
          const appendedOpportunities = nextOpportunities.filter(
            (opportunity) => !existingIds.has(opportunity._id)
          );

          return [...previousOpportunities, ...appendedOpportunities];
        });

        setPagination({
          total: data.total || 0,
          totalPages: data.totalPages || 1,
          hasNextPage: Boolean(data.hasNextPage),
        });
      } catch (error) {
        if (!isMounted) {
          return;
        }

        if (page === 1) {
          setOpportunities([]);
        }

        setPagination({ total: 0, totalPages: 1, hasNextPage: false });

        toast({
          title: "Unable to load opportunities",
          description: error.response?.data?.message || "Please try again.",
          status: "error",
          duration: 3200,
          isClosable: true,
        });
      } finally {
        if (isMounted) {
          setLoading(false);
          setLoadingMore(false);
        }
      }
    };

    loadOpportunities();

    return () => {
      isMounted = false;
    };
  }, [page, searchQuery, selectedType, toast]);

  const openDeleteDialog = (opportunity) => {
    setSelectedOpportunity(opportunity);
    onOpen();
  };

  const handleDeleteOpportunity = async () => {
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

      setPagination((previousPagination) => ({
        ...previousPagination,
        total: Math.max(0, previousPagination.total - 1),
      }));

      toast({
        title: "Opportunity deleted",
        description: "The posting was removed successfully.",
        status: "success",
        duration: 3000,
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

  const resultSummary = useMemo(() => {
    if (loading && page === 1) {
      return "Loading opportunities...";
    }

    if (pagination.total === 0) {
      return "No opportunities found";
    }

    return `${pagination.total} opportunit${pagination.total === 1 ? "y" : "ies"} found`;
  }, [loading, page, pagination.total]);

  return (
    <Container maxW="7xl" py={{ base: 8, md: 10 }}>
      <Stack spacing={7}>
        <Box bg="white" borderRadius="2xl" boxShadow="md" borderWidth="1px" borderColor="gray.100" p={{ base: 5, md: 7 }}>
          <Stack spacing={4}>
            <Stack spacing={2}>
              <Heading size="lg">Admin Opportunities</Heading>
              <Text color="gray.600">Review and moderate opportunities posted across the platform.</Text>
            </Stack>

            <Input
              value={searchInput}
              onChange={(event) => setSearchInput(event.target.value)}
              placeholder="Search by title, company, or description"
              maxW="460px"
            />

            <ButtonGroup isAttached variant="outline" size="sm" flexWrap="wrap" rowGap={2}>
              {TYPE_FILTERS.map((filter) => (
                <Button
                  key={filter.value}
                  colorScheme={selectedType === filter.value ? "teal" : "gray"}
                  variant={selectedType === filter.value ? "solid" : "outline"}
                  onClick={() => setSelectedType(filter.value)}
                >
                  {filter.label}
                </Button>
              ))}
            </ButtonGroup>

            <HStack justify="space-between" flexWrap="wrap" spacing={3}>
              <Text color="gray.600" fontWeight="semibold">
                {resultSummary}
              </Text>
              {pagination.totalPages > 1 ? (
                <Text color="gray.500" fontSize="sm">
                  Page {page} of {pagination.totalPages}
                </Text>
              ) : null}
            </HStack>
          </Stack>
        </Box>

        {loading && page === 1 ? (
          <OpportunitiesSkeletonGrid />
        ) : opportunities.length > 0 ? (
          <Stack spacing={5}>
            <SimpleGrid columns={{ base: 1, md: 2, xl: 3 }} spacing={5}>
              {opportunities.map((opportunity) => (
                <AdminOpportunityCard
                  key={opportunity._id}
                  opportunity={opportunity}
                  onDelete={openDeleteDialog}
                  isDeleting={deletingOpportunityId === opportunity._id}
                />
              ))}
            </SimpleGrid>

            {pagination.hasNextPage ? (
              <Button
                alignSelf="center"
                borderRadius="full"
                px={8}
                onClick={() => setPage((previousPage) => previousPage + 1)}
                isLoading={loadingMore}
                loadingText="Loading"
              >
                Load More Opportunities
              </Button>
            ) : null}
          </Stack>
        ) : (
          <Box bg="white" borderRadius="2xl" boxShadow="md" p={{ base: 6, md: 9 }} textAlign="center">
            <Stack spacing={3} align="center">
              <Heading size="sm">No opportunities found</Heading>
              <Text color="gray.600">Try changing your search or filter criteria.</Text>
            </Stack>
          </Box>
        )}
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
              Are you sure you want to delete this opportunity? This action cannot be undone.
            </AlertDialogBody>

            <AlertDialogFooter>
              <Button ref={cancelRef} onClick={onClose}>
                Cancel
              </Button>
              <Button
                colorScheme="red"
                ml={3}
                onClick={handleDeleteOpportunity}
                isLoading={Boolean(
                  selectedOpportunity?._id && deletingOpportunityId === selectedOpportunity._id
                )}
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

export default AdminOpportunitiesPage;

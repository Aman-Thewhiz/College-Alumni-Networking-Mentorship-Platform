import {
  Avatar,
  Badge,
  Box,
  Button,
  ButtonGroup,
  Container,
  Heading,
  HStack,
  Image,
  Input,
  SimpleGrid,
  Skeleton,
  SkeletonCircle,
  Stack,
  Text,
  useToast,
} from "@chakra-ui/react";
import { useEffect, useMemo, useState } from "react";
import { Link as RouterLink } from "react-router-dom";
import api from "../services/api";

const TYPE_FILTERS = [
  { label: "All", value: "all" },
  { label: "Jobs", value: "job" },
  { label: "Internships", value: "internship" },
];
const RESULTS_PER_PAGE = 9;

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

const OpportunityCard = ({ opportunity }) => {
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
      <Stack spacing={4} h="100%">
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

        <Box mt="auto">
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
            <Text color="gray.500" fontSize="xs">
              {formatDate(opportunity.createdAt)}
            </Text>
          </HStack>
        </Box>
      </Stack>
    </Box>
  );
};

const OpportunitiesSkeletonGrid = () => {
  return (
    <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={5}>
      {[...Array(9)].map((_, index) => (
        <Box key={index} bg="white" borderRadius="2xl" boxShadow="md" p={5}>
          <HStack justify="space-between">
            <Stack spacing={2} flex={1}>
              <Skeleton height="12px" width="90px" />
              <Skeleton height="16px" width="170px" />
            </Stack>
            <Skeleton height="22px" width="76px" borderRadius="full" />
          </HStack>

          <Stack mt={4} spacing={2}>
            <Skeleton height="10px" />
            <Skeleton height="10px" />
            <Skeleton height="10px" width="85%" />
          </Stack>

          <HStack mt={5} justify="space-between">
            <HStack spacing={2}>
              <SkeletonCircle size="5" />
              <Skeleton height="10px" width="100px" />
            </HStack>
            <Skeleton height="10px" width="72px" />
          </HStack>
        </Box>
      ))}
    </SimpleGrid>
  );
};

const EmptyState = () => {
  return (
    <Box bg="white" borderRadius="2xl" boxShadow="md" p={{ base: 6, md: 10 }} textAlign="center">
      <Stack spacing={4} align="center">
        <Image
          src="/illustrations/opportunities-board.svg"
          alt="No opportunities found"
          maxW={{ base: "220px", md: "300px" }}
        />
        <Heading size="sm">No opportunities matched your search</Heading>
        <Text color="gray.600" maxW="500px">
          Try another keyword or switch the type filter to view more opportunities.
        </Text>
      </Stack>
    </Box>
  );
};

const OpportunitiesPage = () => {
  const toast = useToast();

  const [searchInput, setSearchInput] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedType, setSelectedType] = useState("all");
  const [opportunities, setOpportunities] = useState([]);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [pagination, setPagination] = useState({
    total: 0,
    totalPages: 1,
    hasNextPage: false,
  });

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

        if (isMounted) {
          const nextOpportunities = data.opportunities || [];

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
        }
      } catch (error) {
        if (isMounted) {
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
        }
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
        <Box bgGradient="linear(to-r, teal.50, pink.50, white)" borderRadius="3xl" boxShadow="md" p={{ base: 6, md: 8 }}>
          <Stack spacing={5}>
            <Stack spacing={2}>
              <Heading size={{ base: "lg", md: "xl" }}>Explore Opportunities</Heading>
              <Text color="gray.600" maxW="700px">
                Browse internships and jobs posted by alumni mentors.
              </Text>
            </Stack>

            <Stack spacing={4}>
              <Input
                bg="white"
                borderColor="gray.200"
                value={searchInput}
                onChange={(event) => setSearchInput(event.target.value)}
                placeholder="Search by role title or company"
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
            </Stack>
          </Stack>
        </Box>

        <HStack justify="space-between" flexWrap="wrap" spacing={3}>
          <Text color="gray.600" fontWeight="semibold">
            {resultSummary}
          </Text>
          {pagination.totalPages > 1 ? (
            <Text color="gray.500" fontSize="sm">
              Page {page} of {pagination.totalPages}
            </Text>
          ) : null}
          <Button
            variant="ghost"
            onClick={() => {
              setSearchInput("");
              setSearchQuery("");
              setSelectedType("all");
              setPage(1);
            }}
          >
            Clear Filters
          </Button>
        </HStack>

        {loading && page === 1 ? (
          <OpportunitiesSkeletonGrid />
        ) : opportunities.length > 0 ? (
          <Stack spacing={5}>
            <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={5}>
              {opportunities.map((opportunity) => (
                <OpportunityCard key={opportunity._id} opportunity={opportunity} />
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
          <EmptyState />
        )}
      </Stack>
    </Container>
  );
};

export default OpportunitiesPage;

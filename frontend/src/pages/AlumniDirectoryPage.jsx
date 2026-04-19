import {
  Avatar,
  Badge,
  Box,
  Button,
  Container,
  FormControl,
  FormLabel,
  Heading,
  HStack,
  Image,
  Input,
  SimpleGrid,
  Skeleton,
  SkeletonCircle,
  Stack,
  Tag,
  TagCloseButton,
  TagLabel,
  Text,
  Wrap,
  WrapItem,
  useToast,
} from "@chakra-ui/react";
import { useEffect, useMemo, useRef, useState } from "react";
import { Link as RouterLink, useNavigate } from "react-router-dom";
import api from "../services/api";

const RESULTS_PER_PAGE = 9;
const INDUSTRY_FILTERS = [
  "All",
  "Software",
  "Finance",
  "Healthcare",
  "Marketing",
  "Data Science",
  "Product",
];

const AlumniCard = ({ alumni }) => {
  const navigate = useNavigate();
  const profilePath = `/alumni/${alumni._id}`;

  return (
    <Box
      role="group"
      cursor="pointer"
      tabIndex={0}
      bg="white"
      borderRadius="2xl"
      boxShadow="md"
      borderWidth="1px"
      borderColor="gray.100"
      p={5}
      transition="transform 0.22s ease, box-shadow 0.22s ease, border-color 0.22s ease"
      _hover={{ transform: "translateY(-4px) scale(1.015)", boxShadow: "xl", borderColor: "teal.200" }}
      _focusVisible={{ outline: "2px solid", outlineColor: "teal.300", outlineOffset: "2px" }}
      onClick={() => navigate(profilePath)}
      onKeyDown={(event) => {
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          navigate(profilePath);
        }
      }}
    >
      <Stack spacing={4}>
        <HStack spacing={3} align="start">
          <Avatar size="md" name={alumni.name} src={alumni.profilePhoto || undefined} bg="teal.100" />
          <Stack spacing={1} flex={1}>
            <HStack spacing={2} flexWrap="wrap">
              <Heading size="sm">{alumni.name}</Heading>
              <Badge colorScheme="purple">Alumni</Badge>
            </HStack>
            <Text color="gray.600" fontSize="sm">
              {alumni.industry || "Industry not specified"}
            </Text>
            <Text color="gray.500" fontSize="sm">
              {alumni.company || "Company not specified"}
            </Text>
          </Stack>
        </HStack>

        <Wrap spacing={2}>
          {(alumni.skills || []).slice(0, 3).map((skill) => (
            <WrapItem key={`${alumni._id}-${skill}`}>
              <Badge colorScheme="pink" borderRadius="full" px={2} py={1}>
                {skill}
              </Badge>
            </WrapItem>
          ))}
        </Wrap>

        <HStack justify="space-between" color="gray.600" fontSize="sm">
          <Text>{alumni.graduationYear ? `Class of ${alumni.graduationYear}` : "Graduation year not listed"}</Text>
        </HStack>

        <Button
          as={RouterLink}
          to={profilePath}
          variant="outline"
          colorScheme="teal"
          size="sm"
          onClick={(event) => event.stopPropagation()}
        >
          View Profile
        </Button>
      </Stack>
    </Box>
  );
};

const AlumniSkeletonGrid = () => {
  return (
    <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={5}>
      {[...Array(RESULTS_PER_PAGE)].map((_, index) => (
        <Box key={index} bg="white" borderRadius="2xl" boxShadow="md" p={5}>
          <HStack spacing={3}>
            <SkeletonCircle size="12" />
            <Stack spacing={2} flex={1}>
              <Skeleton height="14px" width="110px" />
              <Skeleton height="10px" width="140px" />
            </Stack>
          </HStack>
          <Stack mt={4} spacing={2}>
            <Skeleton height="10px" />
            <Skeleton height="10px" />
            <Skeleton height="34px" mt={1} />
          </Stack>
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
          src="/illustrations/connect-people.svg"
          alt="No alumni found"
          maxW={{ base: "220px", md: "280px" }}
        />
        <Heading size="sm">No alumni matched your filters</Heading>
        <Text color="gray.600" maxW="500px">
          Try removing one or more filters, changing your search keyword, or browse all alumni.
        </Text>
      </Stack>
    </Box>
  );
};

const AlumniDirectoryPage = () => {
  const toast = useToast();

  const [alumni, setAlumni] = useState([]);
  const [searchInput, setSearchInput] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedIndustry, setSelectedIndustry] = useState("All");
  const [skillInput, setSkillInput] = useState("");
  const [selectedSkills, setSelectedSkills] = useState([]);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const hasShownErrorRef = useRef(false);
  const [pagination, setPagination] = useState({
    total: 0,
    totalPages: 1,
    hasNextPage: false,
  });

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      setSearchQuery(searchInput.trim());
    }, 400);

    return () => clearTimeout(timeoutId);
  }, [searchInput]);

  useEffect(() => {
    setPage(1);
  }, [searchQuery, selectedIndustry, selectedSkills]);

  useEffect(() => {
    let isMounted = true;

    const loadAlumni = async () => {
      if (page === 1) {
        setLoading(true);
      } else {
        setLoadingMore(true);
      }

      try {
        const params = {
          role: "Alumni",
          page,
          limit: RESULTS_PER_PAGE,
        };

        if (searchQuery) {
          params.search = searchQuery;
        }

        if (selectedIndustry !== "All") {
          params.industry = selectedIndustry;
        }

        if (selectedSkills.length > 0) {
          params.skills = selectedSkills.join(",");
        }

        const { data } = await api.get("/users", { params });
        const nextUsers = data.users || [];

        if (!isMounted) {
          return;
        }

        setAlumni((previousUsers) => {
          if (page === 1) {
            return nextUsers;
          }

          const existingIds = new Set(previousUsers.map((user) => user._id));
          const appendedUsers = nextUsers.filter((user) => !existingIds.has(user._id));
          return [...previousUsers, ...appendedUsers];
        });

        setPagination({
          total: data.total || 0,
          totalPages: data.totalPages || 1,
          hasNextPage: Boolean(data.hasNextPage),
        });

        hasShownErrorRef.current = false;
      } catch (error) {
        if (!isMounted) {
          return;
        }

        if (!hasShownErrorRef.current) {
          toast({
            title: "Unable to load alumni",
            description: error.response?.data?.message || "Please try again.",
            status: "error",
            duration: 3200,
            isClosable: true,
          });
          hasShownErrorRef.current = true;
        }

        if (page === 1) {
          setAlumni([]);
        }

        setPagination({ total: 0, totalPages: 1, hasNextPage: false });
      } finally {
        if (isMounted) {
          setLoading(false);
          setLoadingMore(false);
        }
      }
    };

    loadAlumni();

    return () => {
      isMounted = false;
    };
  }, [page, searchQuery, selectedIndustry, selectedSkills, toast]);

  const addSkillFilter = () => {
    const trimmedSkill = skillInput.trim();

    if (!trimmedSkill) {
      return;
    }

    const alreadyAdded = selectedSkills.some(
      (skill) => skill.toLowerCase() === trimmedSkill.toLowerCase()
    );

    if (!alreadyAdded) {
      setSelectedSkills((previousSkills) => [...previousSkills, trimmedSkill]);
    }

    setSkillInput("");
  };

  const removeSkillFilter = (skillToRemove) => {
    setSelectedSkills((previousSkills) =>
      previousSkills.filter((skill) => skill.toLowerCase() !== skillToRemove.toLowerCase())
    );
  };

  const clearFilters = () => {
    setSearchInput("");
    setSearchQuery("");
    setSelectedIndustry("All");
    setSelectedSkills([]);
    setPage(1);
  };

  const resultSummary = useMemo(() => {
    if (loading && page === 1) {
      return "Loading alumni mentors...";
    }

    if (pagination.total === 0) {
      return "No alumni mentors found";
    }

    return `${pagination.total} alumni mentor${pagination.total === 1 ? "" : "s"} found`;
  }, [loading, page, pagination.total]);

  return (
    <Container maxW="7xl" py={{ base: 8, md: 10 }}>
      <Stack spacing={7}>
        <Box
          bgGradient="linear(to-r, teal.50, pink.50, white)"
          borderRadius="3xl"
          boxShadow="md"
          p={{ base: 6, md: 8 }}
        >
          <Stack spacing={6}>
            <Stack spacing={2}>
              <Heading size={{ base: "lg", md: "xl" }}>Browse Alumni Directory</Heading>
              <Text color="gray.600" maxW="720px">
                Discover alumni mentors by industry, skillset, and profile keywords.
              </Text>
            </Stack>

            <Stack spacing={5}>
              <FormControl>
                <FormLabel color="gray.700" fontWeight="semibold">
                  Search by name or bio
                </FormLabel>
                <Input
                  bg="white"
                  borderColor="gray.200"
                  placeholder="Try: frontend, product, fintech, mentor"
                  value={searchInput}
                  onChange={(event) => setSearchInput(event.target.value)}
                />
              </FormControl>

              <Stack spacing={3}>
                <FormLabel color="gray.700" fontWeight="semibold" mb={0}>
                  Filter by industry
                </FormLabel>
                <Wrap spacing={2}>
                  {INDUSTRY_FILTERS.map((industry) => (
                    <WrapItem key={industry}>
                      <Button
                        size="sm"
                        borderRadius="full"
                        variant={selectedIndustry === industry ? "solid" : "outline"}
                        colorScheme={selectedIndustry === industry ? "teal" : "gray"}
                        onClick={() => setSelectedIndustry(industry)}
                      >
                        {industry}
                      </Button>
                    </WrapItem>
                  ))}
                </Wrap>
              </Stack>

              <Stack spacing={3}>
                <FormLabel color="gray.700" fontWeight="semibold" mb={0}>
                  Skill filters
                </FormLabel>

                <HStack align="start" spacing={3} flexWrap="wrap">
                  <Input
                    bg="white"
                    borderColor="gray.200"
                    placeholder="Add skill and press Enter"
                    value={skillInput}
                    onChange={(event) => setSkillInput(event.target.value)}
                    onKeyDown={(event) => {
                      if (event.key === "Enter") {
                        event.preventDefault();
                        addSkillFilter();
                      }
                    }}
                    maxW={{ base: "100%", md: "340px" }}
                  />
                  <Button onClick={addSkillFilter}>Add Skill</Button>
                  <Button variant="ghost" onClick={clearFilters}>
                    Clear Filters
                  </Button>
                </HStack>

                {selectedSkills.length > 0 ? (
                  <Wrap spacing={2}>
                    {selectedSkills.map((skill) => (
                      <WrapItem key={skill}>
                        <Tag colorScheme="pink" borderRadius="full" size="md">
                          <TagLabel>{skill}</TagLabel>
                          <TagCloseButton onClick={() => removeSkillFilter(skill)} />
                        </Tag>
                      </WrapItem>
                    ))}
                  </Wrap>
                ) : (
                  <Text color="gray.500" fontSize="sm">
                    No skill filters selected yet.
                  </Text>
                )}
              </Stack>
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
        </HStack>

        {loading && page === 1 ? (
          <AlumniSkeletonGrid />
        ) : alumni.length > 0 ? (
          <>
            <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={5}>
              {alumni.map((mentor) => (
                <AlumniCard key={mentor._id} alumni={mentor} />
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
                Load More Alumni
              </Button>
            ) : null}
          </>
        ) : (
          <EmptyState />
        )}
      </Stack>
    </Container>
  );
};

export default AlumniDirectoryPage;

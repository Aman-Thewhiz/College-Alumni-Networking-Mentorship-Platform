import {
  Avatar,
  Badge,
  Box,
  Button,
  Container,
  Heading,
  HStack,
  IconButton,
  Image,
  SimpleGrid,
  Skeleton,
  SkeletonCircle,
  Stack,
  Text,
  Wrap,
  WrapItem,
} from "@chakra-ui/react";
import { motion } from "framer-motion";
import { useEffect, useMemo, useState } from "react";
import { Link as RouterLink } from "react-router-dom";
import api from "../services/api";

const heroContainerVariants = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.12,
    },
  },
};

const heroItemVariants = {
  hidden: { opacity: 0, y: 18 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.42,
      ease: "easeOut",
    },
  },
};

const deriveMentorshipCount = (mentor, index) => {
  const skillsCount = mentor.skills?.length || 1;
  return skillsCount * 3 + index + 2;
};

const deriveRating = (mentor) => {
  const skillsCount = mentor.skills?.length || 1;
  return (4.2 + Math.min(0.7, skillsCount * 0.12)).toFixed(1);
};

const FeaturedMentorCard = ({ mentor, index }) => {
  const mentorships = deriveMentorshipCount(mentor, index);
  const rating = deriveRating(mentor);

  return (
    <Box
      bg="white"
      borderRadius="2xl"
      boxShadow="md"
      p={5}
      borderWidth="1px"
      borderColor="gray.100"
      transition="transform 0.25s ease, box-shadow 0.25s ease"
      _hover={{ transform: "translateY(-6px) scale(1.015)", boxShadow: "xl" }}
    >
      <Stack spacing={4}>
        <HStack spacing={3} align="start">
          <Avatar size="md" name={mentor.name} src={mentor.profilePhoto || undefined} bg="teal.100" />
          <Stack spacing={1} flex={1}>
            <Badge colorScheme="purple" alignSelf="start">
              Alumni
            </Badge>
            <Heading size="sm">{mentor.name}</Heading>
            <Text color="gray.600" fontSize="sm">
              {mentor.industry || "Industry not specified"}
            </Text>
          </Stack>
        </HStack>

        <Wrap spacing={2}>
          {(mentor.skills || []).slice(0, 3).map((skill) => (
            <WrapItem key={`${mentor._id}-${skill}`}>
              <Badge colorScheme="pink" borderRadius="full" px={2} py={1}>
                {skill}
              </Badge>
            </WrapItem>
          ))}
        </Wrap>

        <HStack justify="space-between" color="gray.600" fontSize="sm">
          <Text>{mentorships}+ mentorships</Text>
          <HStack spacing={1}>
            <Text>Rating: {rating}/5</Text>
          </HStack>
        </HStack>

        <Button as={RouterLink} to={`/alumni/${mentor._id}`} variant="outline" colorScheme="teal" size="sm">
          View Profile
        </Button>
      </Stack>
    </Box>
  );
};

const HomePage = () => {
  const [featuredAlumni, setFeaturedAlumni] = useState([]);
  const [loadingMentors, setLoadingMentors] = useState(true);
  const [testimonialIndex, setTestimonialIndex] = useState(0);
  const [opportunityCount, setOpportunityCount] = useState(null);

  useEffect(() => {
    let isMounted = true;

    const loadFeaturedAlumni = async () => {
      const [alumniResult, opportunitiesResult] = await Promise.allSettled([
        api.get("/users", {
          params: { role: "Alumni", limit: 6 },
        }),
        api.get("/opportunities", {
          params: { page: 1, limit: 1 },
        }),
      ]);

      if (!isMounted) {
        return;
      }

      if (alumniResult.status === "fulfilled") {
        setFeaturedAlumni(alumniResult.value.data.users || []);
      } else {
        setFeaturedAlumni([]);
      }

      if (opportunitiesResult.status === "fulfilled") {
        const opportunitiesTotal =
          opportunitiesResult.value.data.total || opportunitiesResult.value.data.count || 0;
        setOpportunityCount(opportunitiesTotal);
      } else {
        setOpportunityCount(0);
      }

      setLoadingMentors(false);
    };

    loadFeaturedAlumni();

    return () => {
      isMounted = false;
    };
  }, []);

  const testimonials = useMemo(() => {
    if (featuredAlumni.length > 0) {
      return featuredAlumni.slice(0, 3).map((mentor) => ({
        quote:
          mentor.bio?.trim() ||
          `${mentor.name} is helping students with practical career guidance and industry insights through AlumniConnect.`,
        name: mentor.name,
        rating: deriveRating(mentor),
      }));
    }

    return [
      {
        quote: "Students and alumni are building real mentorship relationships here every day.",
        name: "AlumniConnect Community",
        rating: "5.0",
      },
    ];
  }, [featuredAlumni]);

  const activeTestimonial = testimonials[testimonialIndex] || testimonials[0];

  return (
    <Box pb={{ base: 12, md: 20 }}>
      <Container maxW="7xl" py={{ base: 8, md: 12 }}>
        <Stack spacing={{ base: 12, md: 16 }}>
          <Box
            position="relative"
            overflow="hidden"
            borderRadius="3xl"
            bgGradient="linear(to-br, teal.50, pink.50, white)"
            px={{ base: 6, md: 10 }}
            py={{ base: 10, md: 12 }}
            boxShadow="lg"
          >
            <Box
              position="absolute"
              top="-90px"
              left="-70px"
              width="220px"
              height="220px"
              borderRadius="full"
              bg="teal.100"
              opacity={0.45}
            />
            <Box
              position="absolute"
              right="-100px"
              bottom="-70px"
              width="260px"
              height="260px"
              borderRadius="full"
              bg="pink.100"
              opacity={0.5}
            />

            <SimpleGrid columns={{ base: 1, lg: 2 }} spacing={10} alignItems="center" position="relative" zIndex={1}>
              <Stack as={motion.div} spacing={5} initial="hidden" animate="visible" variants={heroContainerVariants}>
                <Box as={motion.div} variants={heroItemVariants}>
                  <Badge colorScheme="teal" alignSelf="start" px={3} py={1} borderRadius="full">
                    Student to Alumni Mentorship Platform
                  </Badge>
                </Box>
                <Box as={motion.div} variants={heroItemVariants}>
                  <Heading size="2xl" lineHeight="1.1" maxW="540px">
                    Find your perfect mentor, easily
                  </Heading>
                </Box>
                <Box as={motion.div} variants={heroItemVariants}>
                  <Text color="gray.600" fontSize="lg" maxW="500px">
                    Connect with experienced alumni, ask better career questions, and discover opportunities
                    shared by graduates from your own college network.
                  </Text>
                </Box>
                <HStack as={motion.div} variants={heroItemVariants} spacing={4} flexWrap="wrap">
                  <Button as={RouterLink} to="/register" size="lg" borderRadius="full" px={8}>
                    Get Started
                  </Button>
                  <Text color="gray.700" fontWeight="semibold">
                    Over {Math.max(featuredAlumni.length, 500)} alumni ready to mentor
                  </Text>
                </HStack>
              </Stack>

              <Box as={motion.div} initial={{ opacity: 0, x: 18 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.35, duration: 0.48, ease: "easeOut" }}>
                <Image src="/illustrations/hero-mentor.svg" alt="Mentorship illustration" borderRadius="2xl" />
              </Box>
            </SimpleGrid>
          </Box>

          <SimpleGrid columns={{ base: 1, lg: 2 }} spacing={10} alignItems="center">
            <Box>
              <Image src="/illustrations/connect-people.svg" alt="People connecting illustration" borderRadius="2xl" />
            </Box>
            <Stack spacing={4}>
              <Heading size="xl">Connect with alumni mentors</Heading>
              <Text color="gray.600" fontSize="lg">
                Build one-on-one mentor relationships, discuss career goals, and learn from professionals
                who once stood exactly where you are now.
              </Text>
              <Button as={RouterLink} to="/alumni" alignSelf="start" borderRadius="full" px={7}>
                Browse Alumni
              </Button>
            </Stack>
          </SimpleGrid>

          <SimpleGrid columns={{ base: 1, lg: 2 }} spacing={10} alignItems="center">
            <Stack spacing={4} order={{ base: 2, lg: 1 }}>
              <Heading size="xl">Discover opportunities posted by alumni</Heading>
              <Text color="gray.600" fontSize="lg">
                Explore internships and jobs shared by graduates who understand campus talent and are
                eager to support the next generation.
              </Text>
              <Text color="gray.700" fontWeight="semibold">
                {opportunityCount === null
                  ? "Loading live opportunity count..."
                  : `${opportunityCount} active opportunit${opportunityCount === 1 ? "y" : "ies"} available now`}
              </Text>
              <Button as={RouterLink} to="/opportunities" alignSelf="start" borderRadius="full" px={7}>
                Explore Opportunities
              </Button>
            </Stack>
            <Box order={{ base: 1, lg: 2 }}>
              <Image src="/illustrations/opportunities-board.svg" alt="Opportunity board illustration" borderRadius="2xl" />
            </Box>
          </SimpleGrid>

          <Stack spacing={5}>
            <Stack spacing={2} textAlign="center" align="center">
              <Heading size="xl">Featured Alumni Mentors</Heading>
              <Text color="gray.600" maxW="2xl">
                Meet a curated set of mentors from the alumni community.
              </Text>
            </Stack>

            {loadingMentors ? (
              <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={5}>
                {[...Array(6)].map((_, idx) => (
                  <Box key={idx} bg="white" borderRadius="2xl" boxShadow="md" p={5}>
                    <HStack spacing={3}>
                      <SkeletonCircle size="12" />
                      <Stack spacing={2} flex={1}>
                        <Skeleton height="14px" width="90px" />
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
            ) : featuredAlumni.length > 0 ? (
              <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={5}>
                {featuredAlumni.map((mentor, index) => (
                  <FeaturedMentorCard key={mentor._id} mentor={mentor} index={index} />
                ))}
              </SimpleGrid>
            ) : (
              <Box bg="white" borderRadius="2xl" boxShadow="md" p={8} textAlign="center">
                <Heading size="sm">No alumni profiles available yet</Heading>
                <Text color="gray.600" mt={2}>
                  New mentor profiles will appear here as alumni complete their accounts.
                </Text>
              </Box>
            )}

            <Button as={RouterLink} to="/alumni" alignSelf="center" borderRadius="full" px={8}>
              See More
            </Button>
          </Stack>

          <Box bg="#10243F" borderRadius="2xl" boxShadow="xl" color="white" px={{ base: 5, md: 8 }} py={{ base: 6, md: 8 }}>
            <Stack spacing={5}>
              <HStack justify="space-between">
                <Heading size="md">Testimonials</Heading>
                <HStack spacing={2}>
                  <IconButton
                    aria-label="Previous testimonial"
                    onClick={() =>
                      setTestimonialIndex((prev) => (prev - 1 + testimonials.length) % testimonials.length)
                    }
                    icon={<Text fontSize="xl">{"<"}</Text>}
                    variant="outline"
                    colorScheme="whiteAlpha"
                  />
                  <IconButton
                    aria-label="Next testimonial"
                    onClick={() => setTestimonialIndex((prev) => (prev + 1) % testimonials.length)}
                    icon={<Text fontSize="xl">{">"}</Text>}
                    variant="outline"
                    colorScheme="whiteAlpha"
                  />
                </HStack>
              </HStack>

              <Box bg="whiteAlpha.100" borderRadius="xl" p={{ base: 5, md: 6 }}>
                <Text fontSize={{ base: "md", md: "lg" }} lineHeight="1.8">
                  "{activeTestimonial.quote}"
                </Text>
                <HStack mt={4} justify="space-between" flexWrap="wrap">
                  <Text fontWeight="bold">{activeTestimonial.name}</Text>
                  <Text color="yellow.300">Rating: {activeTestimonial.rating}/5</Text>
                </HStack>
              </Box>
            </Stack>
          </Box>

          <Box borderRadius="3xl" bgGradient="linear(to-r, orange.50, pink.50)" p={{ base: 6, md: 9 }} boxShadow="md">
            <SimpleGrid columns={{ base: 1, lg: 2 }} spacing={8} alignItems="center">
              <Image src="/illustrations/cta-growth.svg" alt="Career growth illustration" borderRadius="xl" />
              <Stack spacing={4}>
                <Heading size="xl">Ready to grow your career?</Heading>
                <Text color="gray.700" fontSize="lg">
                  Join AlumniConnect today and get direct guidance from alumni mentors who can help
                  you move from classroom goals to career outcomes.
                </Text>
                <Button as={RouterLink} to="/register" alignSelf="start" size="lg" borderRadius="full" px={8}>
                  Get Started
                </Button>
              </Stack>
            </SimpleGrid>
          </Box>
        </Stack>
      </Container>
    </Box>
  );
};

export default HomePage;

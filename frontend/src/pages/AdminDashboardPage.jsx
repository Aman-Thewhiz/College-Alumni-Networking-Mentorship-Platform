import {
  Box,
  Container,
  Heading,
  HStack,
  Skeleton,
  SimpleGrid,
  Stack,
  Stat,
  StatLabel,
  StatNumber,
  Text,
  useToast,
} from "@chakra-ui/react";
import { useEffect, useMemo, useState } from "react";
import api from "../services/api";

const statCardsConfig = [
  { key: "totalUsers", label: "Total Users", iconLabel: "US" },
  { key: "totalAlumni", label: "Active Alumni", iconLabel: "AL" },
  { key: "totalStudents", label: "Active Students", iconLabel: "ST" },
  { key: "totalMentorshipRequests", label: "Mentorship Requests", iconLabel: "MR" },
  { key: "totalAcceptedMentorships", label: "Accepted Mentorships", iconLabel: "AC" },
  { key: "totalOpportunities", label: "Opportunities Posted", iconLabel: "OP" },
];

const StatCard = ({ iconLabel, label, value }) => {
  return (
    <Box bg="white" borderRadius="2xl" boxShadow="md" borderWidth="1px" borderColor="gray.100" p={5}>
      <Stack spacing={4}>
        <HStack justify="space-between" align="start">
          <Box
            w="40px"
            h="40px"
            borderRadius="full"
            bg="teal.50"
            color="teal.700"
            fontWeight="bold"
            fontSize="xs"
            display="flex"
            alignItems="center"
            justifyContent="center"
          >
            {iconLabel}
          </Box>
        </HStack>

        <Stat>
          <StatLabel color="gray.600">{label}</StatLabel>
          <StatNumber color="gray.800">{value}</StatNumber>
        </Stat>
      </Stack>
    </Box>
  );
};

const StatCardSkeleton = () => {
  return (
    <Box bg="white" borderRadius="2xl" boxShadow="md" borderWidth="1px" borderColor="gray.100" p={5}>
      <Stack spacing={4}>
        <Box w="40px" h="40px" borderRadius="full" bg="gray.100" />
        <Stack spacing={2}>
          <Skeleton height="12px" width="130px" />
          <Skeleton height="26px" width="90px" />
        </Stack>
      </Stack>
    </Box>
  );
};

const AdminDashboardPage = () => {
  const toast = useToast();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    const loadAdminStats = async () => {
      setLoading(true);

      try {
        const { data } = await api.get("/admin/stats");

        if (isMounted) {
          setStats(data.stats || {});
        }
      } catch (error) {
        if (isMounted) {
          setStats(null);
          toast({
            title: "Unable to load admin stats",
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

    loadAdminStats();

    return () => {
      isMounted = false;
    };
  }, [toast]);

  const cards = useMemo(() => {
    return statCardsConfig.map((card) => ({
      ...card,
      value: stats?.[card.key] ?? 0,
    }));
  }, [stats]);

  if (loading) {
    return (
      <Container maxW="7xl" py={{ base: 8, md: 10 }}>
        <Stack spacing={6}>
          <Stack spacing={2}>
            <Heading size="lg">Admin Dashboard</Heading>
            <Text color="gray.600">Loading platform stats...</Text>
          </Stack>

          <SimpleGrid columns={{ base: 1, md: 2, xl: 3 }} spacing={5}>
            {statCardsConfig.map((card) => (
              <StatCardSkeleton key={`skeleton-${card.key}`} />
            ))}
          </SimpleGrid>
        </Stack>
      </Container>
    );
  }

  return (
    <Container maxW="7xl" py={{ base: 8, md: 10 }}>
      <Stack spacing={6}>
        <Stack spacing={2}>
          <Heading size="lg">Admin Dashboard</Heading>
          <Text color="gray.600">
            Monitor users, mentorship activity, and platform opportunity growth.
          </Text>
        </Stack>

        <SimpleGrid columns={{ base: 1, md: 2, xl: 3 }} spacing={5}>
          {cards.map((card) => (
            <StatCard
              key={card.key}
              iconLabel={card.iconLabel}
              label={card.label}
              value={card.value}
            />
          ))}
        </SimpleGrid>
      </Stack>
    </Container>
  );
};

export default AdminDashboardPage;

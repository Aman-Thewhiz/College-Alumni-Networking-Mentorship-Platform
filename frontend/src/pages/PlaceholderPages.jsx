import {
  Badge,
  Box,
  Button,
  Container,
  Heading,
  SimpleGrid,
  Stack,
  Text,
} from "@chakra-ui/react";
import { Link as RouterLink, useParams } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const roleColorScheme = {
  Student: "pink",
  Alumni: "purple",
  Admin: "orange",
};

const PlaceholderCard = ({ title, description, audience, routeHint }) => {
  return (
    <Box bg="white" borderRadius="xl" boxShadow="md" p={6}>
      <Stack spacing={3} align="start">
        {audience ? <Badge colorScheme="teal">{audience}</Badge> : null}
        <Heading size="md">{title}</Heading>
        <Text color="gray.600">{description}</Text>
        {routeHint ? (
          <Text fontSize="sm" color="gray.500">
            Route: {routeHint}
          </Text>
        ) : null}
      </Stack>
    </Box>
  );
};

export const HomePage = () => {
  return (
    <Container maxW="5xl" py={10}>
      <Box
        bgGradient="linear(to-r, pink.50, purple.50, white)"
        borderRadius="2xl"
        p={{ base: 6, md: 10 }}
        boxShadow="md"
      >
        <Stack spacing={5}>
          <Heading size={{ base: "lg", md: "xl" }}>
            AlumniConnect Foundation Ready
          </Heading>
          <Text color="gray.600" maxW="2xl">
            Phase 1 includes authentication, role-protected routes, and an API
            integration layer. Continue by signing in or registering.
          </Text>
          <Stack direction={{ base: "column", sm: "row" }} spacing={3}>
            <Button as={RouterLink} to="/register" size="lg">
              Get Started
            </Button>
            <Button as={RouterLink} to="/login" variant="outline" size="lg">
              Log In
            </Button>
          </Stack>
        </Stack>
      </Box>

      <SimpleGrid columns={{ base: 1, md: 2 }} spacing={6} mt={8}>
        <PlaceholderCard
          title="Student Journey"
          description="Register, access a protected dashboard, and prepare to browse alumni in Phase 4."
          audience="Student"
          routeHint="/dashboard"
        />
        <PlaceholderCard
          title="Alumni Journey"
          description="Register as Alumni and access role-specific routes such as mentorship requests."
          audience="Alumni"
          routeHint="/mentorship/requests"
        />
      </SimpleGrid>
    </Container>
  );
};

export const DashboardPage = () => {
  const { user } = useAuth();

  const roleDescriptions = {
    Student: "Student dashboard placeholder. Phase 2 and beyond will add stats and actions.",
    Alumni: "Alumni dashboard placeholder. Mentorship and opportunity modules come in later phases.",
  };

  return (
    <Container maxW="4xl" py={10}>
      <PlaceholderCard
        title={`${user?.role || "User"} Dashboard`}
        description={
          roleDescriptions[user?.role] ||
          "Role dashboard is protected and ready for future modules."
        }
        audience={user?.role}
        routeHint="/dashboard"
      />
    </Container>
  );
};

const GenericProtectedPage = ({ title, description, routeHint, audience }) => {
  return (
    <Container maxW="4xl" py={10}>
      <PlaceholderCard
        title={title}
        description={description}
        routeHint={routeHint}
        audience={audience}
      />
    </Container>
  );
};

export const AlumniDirectoryPage = () => (
  <GenericProtectedPage
    title="Alumni Directory"
    description="Protected route placeholder for the alumni discovery module."
    routeHint="/alumni"
    audience="Student"
  />
);

export const AlumniProfilePage = () => {
  const { id } = useParams();

  return (
    <GenericProtectedPage
      title="Alumni Public Profile"
      description="Protected route placeholder for viewing a specific alumni profile."
      routeHint={`/alumni/${id}`}
      audience="Student"
    />
  );
};

export const MentorshipPage = () => (
  <GenericProtectedPage
    title="My Mentorship Requests"
    description="Student route placeholder for sent mentorship requests and status."
    routeHint="/mentorship"
    audience="Student"
  />
);

export const OpportunitiesPage = () => (
  <GenericProtectedPage
    title="Opportunities Board"
    description="Protected placeholder for browsing opportunities."
    routeHint="/opportunities"
    audience="Student"
  />
);

export const MessagesPage = () => (
  <GenericProtectedPage
    title="Messages"
    description="Protected placeholder for student and alumni conversation view."
    routeHint="/messages"
    audience="Student and Alumni"
  />
);

export const ProfilePage = () => (
  <GenericProtectedPage
    title="Profile Editor"
    description="Protected placeholder for editing user profile details."
    routeHint="/profile"
    audience="Student and Alumni"
  />
);

export const MentorshipRequestsPage = () => (
  <GenericProtectedPage
    title="Incoming Mentorship Requests"
    description="Alumni-only route placeholder for reviewing mentorship requests."
    routeHint="/mentorship/requests"
    audience="Alumni"
  />
);

export const OpportunitiesManagePage = () => (
  <GenericProtectedPage
    title="Manage Opportunities"
    description="Alumni-only route placeholder for posting and managing opportunities."
    routeHint="/opportunities/manage"
    audience="Alumni"
  />
);

export const AdminDashboardPage = () => (
  <GenericProtectedPage
    title="Admin Dashboard"
    description="Admin-only overview route placeholder for platform analytics."
    routeHint="/admin/dashboard"
    audience="Admin"
  />
);

export const AdminUsersPage = () => (
  <GenericProtectedPage
    title="Admin Users"
    description="Admin-only route placeholder for user management."
    routeHint="/admin/users"
    audience="Admin"
  />
);

export const AdminOpportunitiesPage = () => (
  <GenericProtectedPage
    title="Admin Opportunities"
    description="Admin-only route placeholder for opportunity moderation."
    routeHint="/admin/opportunities"
    audience="Admin"
  />
);

export const NotFoundPage = () => {
  const { user } = useAuth();

  return (
    <Container maxW="3xl" py={14}>
      <Stack spacing={4} align="center" textAlign="center">
        <Badge colorScheme={roleColorScheme[user?.role] || "gray"}>
          404
        </Badge>
        <Heading size="lg">Page not found</Heading>
        <Text color="gray.600">
          The route you requested does not exist yet in this phase.
        </Text>
        <Button as={RouterLink} to="/" size="md">
          Go Home
        </Button>
      </Stack>
    </Container>
  );
};

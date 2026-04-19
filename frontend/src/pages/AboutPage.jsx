import { Box, Container, Heading, Link, Stack, Text } from "@chakra-ui/react";

const AboutPage = () => {
  return (
    <Container maxW="4xl" py={{ base: 10, md: 14 }}>
      <Box bg="white" borderRadius="2xl" boxShadow="md" p={{ base: 6, md: 10 }}>
        <Stack spacing={5}>
          <Heading size="lg">About AlumniConnect</Heading>
          <Text color="gray.700">
            AlumniConnect helps students and alumni build meaningful mentorship relationships,
            discover opportunities, and share career guidance in one trusted campus community.
          </Text>
          <Text color="gray.600">
            Our mission is to make alumni support accessible and structured so every student can
            navigate academics, internships, and careers with confidence.
          </Text>
          <Text color="gray.600">
            Team details and expanded platform story can be added in later phases.
          </Text>
          <Text color="gray.700">
            Contact: <Link color="teal.600" href="mailto:hello@alumniconnect.edu">hello@alumniconnect.edu</Link>
          </Text>
        </Stack>
      </Box>
    </Container>
  );
};

export default AboutPage;

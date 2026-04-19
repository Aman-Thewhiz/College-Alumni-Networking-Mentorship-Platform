import { Box, Button, Container, Heading, Stack, Text } from "@chakra-ui/react";
import { Link as RouterLink } from "react-router-dom";

const NotFoundPage = () => {
  return (
    <Container maxW="4xl" py={{ base: 12, md: 16 }}>
      <Box
        bgGradient="linear(to-br, teal.50, pink.50, white)"
        borderRadius="3xl"
        boxShadow="lg"
        p={{ base: 8, md: 12 }}
        textAlign="center"
      >
        <Stack spacing={4} align="center">
          <Text
            fontSize={{ base: "4xl", md: "5xl" }}
            fontWeight="bold"
            color="teal.600"
            lineHeight="1"
          >
            404
          </Text>
          <Heading size="lg">Page not found</Heading>
          <Text color="gray.600" maxW="560px">
            The page you are looking for does not exist or may have been moved.
          </Text>
          <Button as={RouterLink} to="/" colorScheme="teal" borderRadius="full" px={8}>
            Go Home
          </Button>
        </Stack>
      </Box>
    </Container>
  );
};

export default NotFoundPage;

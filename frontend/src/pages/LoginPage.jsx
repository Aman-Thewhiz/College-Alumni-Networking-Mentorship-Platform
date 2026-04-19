import {
  Box,
  Button,
  Container,
  FormControl,
  FormErrorMessage,
  FormLabel,
  Heading,
  Input,
  Link,
  Stack,
  Text,
  useToast,
} from "@chakra-ui/react";
import { useEffect, useState } from "react";
import { Link as RouterLink, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { getRoleDashboardPath } from "../utils/rolePaths";

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const LoginPage = () => {
  const [formValues, setFormValues] = useState({ email: "", password: "" });
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const navigate = useNavigate();
  const toast = useToast();
  const { user, login } = useAuth();

  useEffect(() => {
    if (user) {
      navigate(getRoleDashboardPath(user.role), { replace: true });
    }
  }, [navigate, user]);

  const validate = () => {
    const nextErrors = {};

    if (!formValues.email) {
      nextErrors.email = "Email is required";
    } else if (!emailRegex.test(formValues.email)) {
      nextErrors.email = "Enter a valid email";
    }

    if (!formValues.password) {
      nextErrors.password = "Password is required";
    }

    return nextErrors;
  };

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormValues((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: undefined }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    const validationErrors = validate();
    setErrors(validationErrors);

    if (Object.keys(validationErrors).length > 0) {
      toast({
        title: "Validation error",
        description: "Please correct the highlighted fields.",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    setIsSubmitting(true);

    try {
      const loggedInUser = await login(formValues);

      toast({
        title: "Logged in",
        description: "Welcome back to AlumniConnect.",
        status: "success",
        duration: 2500,
        isClosable: true,
      });

      navigate(getRoleDashboardPath(loggedInUser.role), { replace: true });
    } catch (error) {
      toast({
        title: "Login failed",
        description:
          error.response?.data?.message ||
          "Unable to log in right now. Please try again.",
        status: "error",
        duration: 3500,
        isClosable: true,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Container maxW="lg" py={{ base: 8, md: 14 }}>
      <Box bg="white" borderRadius="2xl" boxShadow="md" p={{ base: 6, md: 8 }}>
        <Stack spacing={6}>
          <Stack spacing={2} textAlign="center">
            <Heading size="lg">Log In</Heading>
            <Text color="gray.600">Access your AlumniConnect dashboard</Text>
          </Stack>

          <Stack as="form" spacing={4} onSubmit={handleSubmit}>
            <FormControl isRequired isInvalid={Boolean(errors.email)}>
              <FormLabel>Email</FormLabel>
              <Input
                type="email"
                name="email"
                value={formValues.email}
                onChange={handleChange}
                placeholder="you@example.com"
              />
              <FormErrorMessage>{errors.email}</FormErrorMessage>
            </FormControl>

            <FormControl isRequired isInvalid={Boolean(errors.password)}>
              <FormLabel>Password</FormLabel>
              <Input
                type="password"
                name="password"
                value={formValues.password}
                onChange={handleChange}
                placeholder="Enter your password"
              />
              <FormErrorMessage>{errors.password}</FormErrorMessage>
            </FormControl>

            <Button type="submit" isLoading={isSubmitting} loadingText="Logging in">
              Log In
            </Button>
          </Stack>

          <Text textAlign="center" color="gray.600">
            New here?{" "}
            <Link as={RouterLink} to="/register" color="teal.600" fontWeight="semibold">
              Create an account
            </Link>
          </Text>
        </Stack>
      </Box>
    </Container>
  );
};

export default LoginPage;

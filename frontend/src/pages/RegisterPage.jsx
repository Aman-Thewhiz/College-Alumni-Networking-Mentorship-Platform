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
  Radio,
  RadioGroup,
  Stack,
  Text,
  useToast,
} from "@chakra-ui/react";
import { useEffect, useState } from "react";
import { Link as RouterLink, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import api from "../services/api";
import { getRoleDashboardPath } from "../utils/rolePaths";

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const RegisterPage = () => {
  const [formValues, setFormValues] = useState({
    name: "",
    email: "",
    password: "",
    role: "Student",
  });
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const navigate = useNavigate();
  const toast = useToast();
  const { user } = useAuth();

  useEffect(() => {
    if (user) {
      navigate(getRoleDashboardPath(user.role), { replace: true });
    }
  }, [navigate, user]);

  const validate = () => {
    const nextErrors = {};

    if (!formValues.name.trim()) {
      nextErrors.name = "Name is required";
    }

    if (!formValues.email) {
      nextErrors.email = "Email is required";
    } else if (!emailRegex.test(formValues.email)) {
      nextErrors.email = "Enter a valid email";
    }

    if (!formValues.password) {
      nextErrors.password = "Password is required";
    } else if (formValues.password.length < 6) {
      nextErrors.password = "Password must be at least 6 characters";
    }

    if (!["Student", "Alumni"].includes(formValues.role)) {
      nextErrors.role = "Please select Student or Alumni";
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
      await api.post("/auth/register", {
        ...formValues,
        name: formValues.name.trim(),
        email: formValues.email.trim().toLowerCase(),
      });

      toast({
        title: "Registration successful",
        description: "Your account has been created. Please log in.",
        status: "success",
        duration: 3000,
        isClosable: true,
      });

      navigate("/login", { replace: true });
    } catch (error) {
      toast({
        title: "Registration failed",
        description:
          error.response?.data?.message ||
          "Unable to create your account right now.",
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
            <Heading size="lg">Create an Account</Heading>
            <Text color="gray.600">Join as Student or Alumni mentor</Text>
          </Stack>

          <Stack as="form" spacing={4} onSubmit={handleSubmit}>
            <FormControl isRequired isInvalid={Boolean(errors.name)}>
              <FormLabel>Name</FormLabel>
              <Input
                name="name"
                value={formValues.name}
                onChange={handleChange}
                placeholder="Your full name"
              />
              <FormErrorMessage>{errors.name}</FormErrorMessage>
            </FormControl>

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
                placeholder="Minimum 6 characters"
              />
              <FormErrorMessage>{errors.password}</FormErrorMessage>
            </FormControl>

            <FormControl isRequired isInvalid={Boolean(errors.role)}>
              <FormLabel>Role</FormLabel>
              <RadioGroup
                value={formValues.role}
                onChange={(value) => {
                  setFormValues((prev) => ({ ...prev, role: value }));
                  setErrors((prev) => ({ ...prev, role: undefined }));
                }}
              >
                <Stack direction="row" spacing={6}>
                  <Radio value="Student" colorScheme="pink">
                    Student
                  </Radio>
                  <Radio value="Alumni" colorScheme="purple">
                    Alumni
                  </Radio>
                </Stack>
              </RadioGroup>
              <FormErrorMessage>{errors.role}</FormErrorMessage>
            </FormControl>

            <Button type="submit" isLoading={isSubmitting} loadingText="Registering">
              Sign Up
            </Button>
          </Stack>

          <Text textAlign="center" color="gray.600">
            Already have an account?{" "}
            <Link as={RouterLink} to="/login" color="teal.600" fontWeight="semibold">
              Log in
            </Link>
          </Text>
        </Stack>
      </Box>
    </Container>
  );
};

export default RegisterPage;

import {
  Avatar,
  Box,
  Button,
  Container,
  FormControl,
  FormLabel,
  Heading,
  HStack,
  Input,
  Spinner,
  Stack,
  Tag,
  TagCloseButton,
  TagLabel,
  Text,
  Textarea,
  useToast,
} from "@chakra-ui/react";
import { useEffect, useMemo, useState } from "react";
import { useAuth } from "../context/AuthContext";
import api from "../services/api";
import { getUserId } from "../utils/userProfile";

const initialForm = {
  bio: "",
  skills: [],
  industry: "",
  graduationYear: "",
  company: "",
  experience: "",
  profilePhoto: "",
};

const ProfilePage = () => {
  const { user, updateCurrentUser } = useAuth();
  const [formValues, setFormValues] = useState(initialForm);
  const [skillInput, setSkillInput] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const toast = useToast();

  const userId = useMemo(() => getUserId(user), [user]);

  useEffect(() => {
    let isMounted = true;

    const loadProfile = async () => {
      if (!userId) {
        if (isMounted) {
          setLoading(false);
        }
        return;
      }

      try {
        const { data } = await api.get(`/users/${userId}`);

        if (!isMounted) {
          return;
        }

        setFormValues({
          bio: data.user.bio || "",
          skills: data.user.skills || [],
          industry: data.user.industry || "",
          graduationYear: data.user.graduationYear ? String(data.user.graduationYear) : "",
          company: data.user.company || "",
          experience: data.user.experience || "",
          profilePhoto: data.user.profilePhoto || "",
        });
      } catch (error) {
        if (!isMounted) {
          return;
        }

        toast({
          title: "Unable to load profile",
          description: error.response?.data?.message || "Please try again.",
          status: "error",
          duration: 3500,
          isClosable: true,
        });
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    loadProfile();

    return () => {
      isMounted = false;
    };
  }, [toast, userId]);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormValues((prev) => ({ ...prev, [name]: value }));
  };

  const addSkill = () => {
    const normalized = skillInput.trim();

    if (!normalized) {
      return;
    }

    if (formValues.skills.some((skill) => skill.toLowerCase() === normalized.toLowerCase())) {
      setSkillInput("");
      return;
    }

    setFormValues((prev) => ({
      ...prev,
      skills: [...prev.skills, normalized],
    }));
    setSkillInput("");
  };

  const removeSkill = (skillToRemove) => {
    setFormValues((prev) => ({
      ...prev,
      skills: prev.skills.filter((skill) => skill !== skillToRemove),
    }));
  };

  const handleSkillKeyDown = (event) => {
    if (event.key === "Enter") {
      event.preventDefault();
      addSkill();
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!userId) {
      toast({
        title: "Missing user context",
        description: "Please log in again.",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    if (formValues.graduationYear && Number.isNaN(Number(formValues.graduationYear))) {
      toast({
        title: "Invalid graduation year",
        description: "Graduation year must be a number.",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    setSaving(true);

    try {
      const payload = {
        ...formValues,
        graduationYear: formValues.graduationYear ? Number(formValues.graduationYear) : "",
      };

      const { data } = await api.put(`/users/${userId}`, payload);

      updateCurrentUser(data.user);

      toast({
        title: "Profile updated",
        description: "Your profile changes were saved successfully.",
        status: "success",
        duration: 3000,
        isClosable: true,
      });
    } catch (error) {
      toast({
        title: "Failed to update profile",
        description: error.response?.data?.message || "Please try again later.",
        status: "error",
        duration: 3500,
        isClosable: true,
      });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <Container maxW="3xl" py={12}>
        <HStack justify="center" spacing={3}>
          <Spinner color="teal.500" />
          <Text color="gray.600">Loading profile...</Text>
        </HStack>
      </Container>
    );
  }

  return (
    <Container maxW="4xl" py={{ base: 8, md: 10 }}>
      <Box bg="white" borderRadius="2xl" boxShadow="md" p={{ base: 5, md: 8 }}>
        <Stack spacing={7} as="form" onSubmit={handleSubmit}>
          <Stack spacing={2}>
            <Heading size="lg">Edit Profile</Heading>
            <Text color="gray.600">
              Keep your profile updated so mentors and students can find you more easily.
            </Text>
          </Stack>

          <HStack spacing={4} align="center">
            <Avatar
              size="xl"
              name={user?.name}
              src={formValues.profilePhoto || undefined}
              bg="teal.100"
            />
            <Text color="gray.600" fontSize="sm">
              Live avatar preview updates from your profile photo URL.
            </Text>
          </HStack>

          <FormControl>
            <FormLabel>Profile Photo URL</FormLabel>
            <Input
              name="profilePhoto"
              value={formValues.profilePhoto}
              onChange={handleChange}
              placeholder="https://example.com/avatar.jpg"
            />
          </FormControl>

          <FormControl>
            <FormLabel>Bio</FormLabel>
            <Textarea
              name="bio"
              value={formValues.bio}
              onChange={handleChange}
              placeholder="Share your background and goals"
              rows={4}
            />
          </FormControl>

          <Stack spacing={3}>
            <FormLabel m={0}>Skills</FormLabel>
            <HStack align="start">
              <Input
                value={skillInput}
                onChange={(event) => setSkillInput(event.target.value)}
                onKeyDown={handleSkillKeyDown}
                placeholder="Type a skill and press Enter"
              />
              <Button onClick={addSkill} colorScheme="teal">
                Add
              </Button>
            </HStack>
            <HStack spacing={2} wrap="wrap">
              {formValues.skills.map((skill) => (
                <Tag key={skill} colorScheme="pink" borderRadius="full">
                  <TagLabel>{skill}</TagLabel>
                  <TagCloseButton onClick={() => removeSkill(skill)} />
                </Tag>
              ))}
            </HStack>
          </Stack>

          <Stack direction={{ base: "column", md: "row" }} spacing={4}>
            <FormControl>
              <FormLabel>Industry</FormLabel>
              <Input
                name="industry"
                value={formValues.industry}
                onChange={handleChange}
                placeholder="Software, Finance, Healthcare..."
              />
            </FormControl>

            <FormControl>
              <FormLabel>Graduation Year</FormLabel>
              <Input
                name="graduationYear"
                type="number"
                value={formValues.graduationYear}
                onChange={handleChange}
                placeholder="2022"
              />
            </FormControl>
          </Stack>

          <Stack direction={{ base: "column", md: "row" }} spacing={4}>
            <FormControl>
              <FormLabel>Current Company</FormLabel>
              <Input
                name="company"
                value={formValues.company}
                onChange={handleChange}
                placeholder="Company name"
              />
            </FormControl>

            <FormControl>
              <FormLabel>Experience</FormLabel>
              <Input
                name="experience"
                value={formValues.experience}
                onChange={handleChange}
                placeholder="3 years in Product Design"
              />
            </FormControl>
          </Stack>

          <Button type="submit" isLoading={saving} loadingText="Saving">
            Save Profile
          </Button>
        </Stack>
      </Box>
    </Container>
  );
};

export default ProfilePage;

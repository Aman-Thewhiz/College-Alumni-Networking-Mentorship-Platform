export const getUserId = (user) => user?._id || user?.id || "";

export const PROFILE_COMPLETION_FIELDS = [
  "bio",
  "skills",
  "industry",
  "graduationYear",
  "company",
  "experience",
  "profilePhoto",
];

const hasValue = (value) => {
  if (Array.isArray(value)) {
    return value.length > 0;
  }

  if (typeof value === "number") {
    return Number.isFinite(value);
  }

  return Boolean(String(value || "").trim());
};

export const getMissingProfileFields = (user) => {
  if (!user) {
    return PROFILE_COMPLETION_FIELDS;
  }

  return PROFILE_COMPLETION_FIELDS.filter((field) => !hasValue(user[field]));
};

export const isProfileComplete = (user) => getMissingProfileFields(user).length === 0;

export const PROFILE_MESSAGES = {
  // Family
  FAMILY_UPDATE_CLOSED: "Family details update window is currently closed",

  DELETE_FAMILY_TITLE: "Delete Family Member",
  DELETE_FAMILY_MESSAGE: (name) =>
    `Are you sure you want to delete ${name}?`,

  FAMILY_DELETED: "Family member deleted successfully",
  FAMILY_DELETE_FAILED: "Delete failed",
  FAMILY_DELETE_ERROR: "Something went wrong while deleting",

  FAMILY_REQUIRED_FIELDS: "Name and Relation are required.",

  AADHAAR_DIGITS_ONLY: "Aadhaar number must contain only digits",
  AADHAAR_LENGTH: "Aadhaar number must be 12 digits",
  AADHAAR_INVALID: "Invalid Aadhaar number",

  DUPLICATE_FAMILY:
    "Family member already exists with same Name and Relation",

  FAMILY_ADDED: "Family member added successfully",
  FAMILY_UPDATED: "Family member updated successfully",
  FAMILY_SAVE_FAILED: "Failed to save family member",
  FAMILY_SAVE_ERROR: "Something went wrong while saving",

  // Profile
  PROFILE_IMAGE_UPDATED: "Profile image updated successfully",

  // UI
  LOADING_PROFILE: "Loading Profile...",
  NO_PROFILE_DATA: "No profile data",

  // Actions
  EDIT_FAMILY_TITLE: "Edit Family Member",
  DELETE_FAMILY_TOOLTIP: "Delete Family Member",
};

export const FAMILY_RELATIONS = {
  WIFE: "Wife",
  HUSBAND: "Husband",
  MOTHER: "Mother",
  FATHER: "Father",
  CHILD: "Child",
};

export const FAMILY_DEPENDENT = {
  DEPENDANT: "Dependant",
};
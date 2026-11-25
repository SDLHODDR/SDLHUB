export const PORTALAPI = {
  AUTH: {
    LOGIN: "/auth.php",
    LOGOUT: "/logout.php",
    SESSION_CHECK: "/session_check.php",
    SESSION_KEEPALIVE: "/session_keepalive.php",
    FORGOT_PASSWORD: "/forgot_password.php",
    RESET_PASSWORD: "/reset_password.php",
    VERIFY_OTP: "/verify_otp.php",
  },

  CALENDAR: {
    GET: "/getCalendar.php",
    CURRENT: "/getCalendar.php",
    UPCOMING: "/getCalendar.php",
    LEAVEBALNCE: "/getLeaveBalances.php",
  },

  AUTHORIZATION: {
    TASKDATA: "/getAuthorization.php",
    TASKTABLEDATA: "/getTable.php"
  },

  NOTIFICATIONS: {
    LIST: "/notifications/getNotifications.php",
    MARK_READ: "/notifications/markNotificationRead.php",
  },

  TELEGRAM: {
    COUNTS: "/telegram/counts",
    GROUPS: {
      LIST: "/telegram/groups/list",
      CREATE: "/telegram/groups/create",
      SAVE_BROADCAST_MESSAGE: "/telegram/groups/save-broadcast-message",
      DIVISIONS: "/telegram/groups/divisions",
      COMPANIES: "/telegram/groups/companies",
      DEPARTMENTS: "/telegram/groups/departments",
      HQ: "/telegram/groups/hq",
      HRMS_MEMBERS: "/telegram/groups/list-hrms-members",
    },
    MEMBERS: {
      LIST: "/telegram/members/list",
      LIST_REGION: "/telegram/members/list-region",
      CREATE: "/telegram/members/save-list",
      ASSIGN_GROUPS: "/telegram/members/savemembers-group",
      MEMBER_GROUPS: "/telegram/members/listmember-group",
      GROUP_MEMBERS: "/telegram/members/group-members",
      SAVE_DM: "/telegram/members/save-member-dm",
    },
    INVITATIONS: {
      GENERATE: "/telegram/invitations/generate",
      MINE: "/telegram/invitations/mine",
    },
  },

  MYPROFILE: {
    GET_PROFILE_DATA: "/common/myProfile/getProfileData.php", // Get profile Data
    UPLOAD_PROFILE_IMAGE: "/common/myProfile/uploadProfileImage.php", // Upload profile Data
    SAVE_FAMILY_MEMBER: "/common/myProfile/saveFamilyMember.php", //Save family Data
    DELETE_FAMILY_MEMBER: "/common/myProfile/deleteFamilyMember.php", //Delete family Data
    SAVE_BANK_DETAILS: '/common/myProfile/saveBankDetails.php', //Save bank details
    //SAVE_PERSONAL_DETAILS:'/common/myProfile/savePersonalDetails.php'  //Save personal details
    SAVE_PERSONAL_DETAILS: "common/profile/savePersonalDetails.php",
  },

  PROFILE: {
    GET_PROFILE_DATA: "/common/profile/getProfileData.php", // Get profile Data
    UPLOAD_PROFILE_IMAGE: "/common/profile/uploadProfileImage.php", // Upload profile Data
    SAVE_FAMILY_MEMBER: "/common/profile/saveFamilyMember.php", //Save family Data
    DELETE_FAMILY_MEMBER: "/common/profile/deleteFamilyMember.php", //Delete family Data
    SAVE_BANK_DETAILS: '/common/profile/saveBankDetails.php', //Save bank details
    //SAVE_PERSONAL_DETAILS:'/common/myProfile/savePersonalDetails.php'  //Save personal details
    SAVE_PERSONAL_DETAILS: "common/profile/savePersonalDetails.php",
  },

  POLICY_ENDORSEMENT: {
    GET_PENDING_POLICIES: "/policyEndorsement/getPendingPolicies.php", // Get Pending Policies
    ACCEPT_POLICY: "/policyEndorsement/acceptPolicy.php" // Accept Policies
  }

};
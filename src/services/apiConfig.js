export const PORTALAPI = {
  AUTH: {
    LOGIN: "/auth.php",
    LOGOUT: "/logout.php",
    SESSION_CHECK: "/session_check.php",
    FORGOT_PASSWORD: "/forgot_password.php",
    RESET_PASSWORD: "/reset_password.php",
    VERIFY_OTP: "/verify_otp.php",
  },
 
  CALENDAR: {
    GET: "/getCalendar.php", // <-- your calendar API
    CURRENT: "/getCalendar.php",//"/current_holidays.php",
    UPCOMING: "/getCalendar.php",//"/upcoming_holidays.php",
    LEAVEBALNCE: "/getLeaveBalances.php",
  },

  GATEPASS: {
    GPData: "/gatepass/gp_info_sv.php", // GP Info Data
    SAVEGPData: "/gatepass/gp_save.php", // GP Info Data
    SAVEGPDataAuth: "/gatepass/gp_save.php", // GP Info Data
    EDITGPData: "/gatepass/gp_save.php", // GP Info Data
    EDITGPDataAuth: "/gatepass/gp_save.php", // GP Info Data
    DELETEGPData: "/gatepass/gp_save.php", // GP Info Data
    GP_LIST: "/gatepass/gp_list.php",
    SENDAUTHGPData: "/gatepass/gp_auth.php",
    RESENDAUTHGPData: "/gatepass/gp_auth.php",
    AUTHGPData: "/gatepass/gp_svauth.php",
    REJECTGPData: "/gatepass/gp_svauth.php",
    CLOSEGPData: "/gatepass/gp_save.php"
  },

  TICKETBOOKING: {
    TBData: "/ticketbooking/tb_info_sv.php", // GP Info Data
    EDITTBData: "/ticketbooking/tb_save.php", // GP Info Data
    EDITTBDataAuth: "/ticketbooking/tb_save.php", // GP Info Data
    DELETETBData: "/ticketbooking/tb_save.php", // GP Info Data
    SAVETBData: "/ticketbooking/tb_save.php", // GP Info Data
    SAVETBDataAuth: "/ticketbooking/tb_save.php", // GP Info Data
    TB_LIST: "/ticketbooking/tb_list.php",
    SENDAUTHTBData: "/ticketbooking/tb_auth.php",
    AUTHTBData: "/ticketbooking/tb_svauth.php",
    REJECTTBData: "/ticketbooking/tb_svauth.php",
    CLOSETBData: "/ticketbooking/tb_save.php"
  },

  AUTHORIZATION: {
    TASKDATA: "/getAuthorization.php", // GP Info Data
    TASKTABLEDATA: "/getTable.php"
  },

  PROFILE:{
    GET_PROFILE_DATA: "/common/myProfile/getProfileData.php", // Get profile Data
    UPLOAD_PROFILE_IMAGE: "/common/myProfile/uploadProfileImage.php", // Upload profile Data
    SAVE_FAMILY_MEMBER: "/common/myProfile/saveFamilyMember.php", //Save family Data   
    DELETE_FAMILY_MEMBER: "/common/myProfile/deleteFamilyMember.php", //Delete family Data   
  },

  LEAVEREQUEST: {
    LRData: "/leaverequest/lr_info_sv.php", // GP Info Data
    //EDITLRData: "/leaverequest/lr_save.php", // GP Info Data
    //DELETELRData: "/leaverequest/lr_save.php", // GP Info Data
    SAVELRData: "/leaverequest/lr_save.php", // GP Info Data
    SAVELRDataAuth: "/leaverequest/lr_save.php", // GP Info Data
    LR_LIST: "/leaverequest/lr_list.php",
    AUTHLRData: "/leaverequest/lr_auth.php",
    AUTHLEAVEData: "/leaverequest/lr_auth.php",
    REJECTLEAVEData: "/leaverequest/lr_auth.php",
    CHECKCLDATA: "/leaverequest/lr_validate.php",
    CHECKOLDATA: "/leaverequest/lr_validate.php",
    //LRSWIPEDATA: "/leaverequest/lr_list_swipper.php"
    LRSWIPEDATA: "/leaverequest/lr_list_swipper_new.php"
  },

   POLICY_ENDORSEMENT:{
    GET_PENDING_POLICIES: "/policyEndorsement/getPendingPolicies.php", // Get Pending Policies
    ACCEPT_POLICY: "/policyEndorsement/acceptPolicy.php" // Accept Policies
  }

};
let groups = [
  {
    id: 1,
    group_name: "Mumbai PSR Team",
    members: 42,
    status: "Active",
    region: "Mumbai",
    description: "Mumbai Sales Team",
    created_on: "22 May 2026",
    invite_link: "https://t.me/+mumbai",
    qr_code:
      "https://api.qrserver.com/v1/create-qr-code/?size=120x120&data=https://t.me/+mumbai",
  },

  {
    id: 2,
    group_name: "Pune PSR Team",
    members: 25,
    status: "Active",
    region: "Pune",
    description: "Pune Team",
    created_on: "22 May 2026",
    invite_link: "https://t.me/+pune",
    qr_code:
      "https://api.qrserver.com/v1/create-qr-code/?size=120x120&data=https://t.me/+pune",
  },

  {
    id: 3,
    group_name: "Nashik PSR Team",
    members: 12,
    status: "Inactive",
    region: "Nashik",
    description: "Nashik Team",
    created_on: "22 May 2026",
    invite_link: "https://t.me/+nashik",
    qr_code:
      "https://api.qrserver.com/v1/create-qr-code/?size=120x120&data=https://t.me/+nashik",
  },

  {
    id: 4,
    group_name: "Delhi PSR Team",
    members: 30,
    status: "Active",
    region: "Delhi",
    description: "Delhi Team",
    created_on: "22 May 2026",
    invite_link: "https://t.me/+delhi",
    qr_code:
      "https://api.qrserver.com/v1/create-qr-code/?size=120x120&data=https://t.me/+delhi",
  },

  {
    id: 5,
    group_name: "Chennai PSR Team",
    members: 18,
    status: "Active",
    region: "Chennai",
    description: "Chennai Team",
    created_on: "22 May 2026",
    invite_link: "https://t.me/+chennai",
    qr_code:
      "https://api.qrserver.com/v1/create-qr-code/?size=120x120&data=https://t.me/+chennai",
  },

  {
    id: 6,
    group_name: "Kolkata PSR Team",
    members: 16,
    status: "Inactive",
    region: "Kolkata",
    description: "Kolkata Team",
    created_on: "22 May 2026",
    invite_link: "https://t.me/+kolkata",
    qr_code:
      "https://api.qrserver.com/v1/create-qr-code/?size=120x120&data=https://t.me/+kolkata",
  },

  {
    id: 7,
    group_name: "Hyderabad PSR Team",
    members: 44,
    status: "Active",
    region: "Hyderabad",
    description: "Hyderabad Team",
    created_on: "22 May 2026",
    invite_link: "https://t.me/+hyd",
    qr_code:
      "https://api.qrserver.com/v1/create-qr-code/?size=120x120&data=https://t.me/+hyd",
  },

  {
    id: 8,
    group_name: "Ahmedabad PSR Team",
    members: 19,
    status: "Active",
    region: "Ahmedabad",
    description: "Ahmedabad Team",
    created_on: "22 May 2026",
    invite_link: "https://t.me/+ahm",
    qr_code:
      "https://api.qrserver.com/v1/create-qr-code/?size=120x120&data=https://t.me/+ahm",
  },

  {
    id: 9,
    group_name: "Nagpur PSR Team",
    members: 13,
    status: "Inactive",
    region: "Nagpur",
    description: "Nagpur Team",
    created_on: "22 May 2026",
    invite_link: "https://t.me/+nagpur",
    qr_code:
      "https://api.qrserver.com/v1/create-qr-code/?size=120x120&data=https://t.me/+nagpur",
  },

  {
    id: 10,
    group_name: "Goa PSR Team",
    members: 9,
    status: "Active",
    region: "Goa",
    description: "Goa Team",
    created_on: "22 May 2026",
    invite_link: "https://t.me/+goa",
    qr_code:
      "https://api.qrserver.com/v1/create-qr-code/?size=120x120&data=https://t.me/+goa",
  },
];

export const getMockGroups = () => groups;

export const addMockGroup = (group) => {
  groups = [group, ...groups];
};
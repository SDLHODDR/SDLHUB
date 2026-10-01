import { getMockGroups } from "./mockData";

const groups = getMockGroups();

export const members = [
  {
    id: 1,
    name: "Rahul Sharma",
    mobile: "+919876543210",
    username: "@rahulsharma",
    employeeCode: "PSR001",
    headquarters: "Mumbai",
    groupIds: [groups[0]?.id, groups[1]?.id],
    inviteStatus: "Joined",
    joinedAt: "2026-05-20",
    lastActive: "2026-05-22 09:30 AM",
  },
  {
    id: 2,
    name: "Amit Verma",
    mobile: "+919812345678",
    username: "@amitverma",
    employeeCode: "PSR002",
    headquarters: "Pune",
    groupIds: [groups[0]?.id],
    inviteStatus: "Pending",
    joinedAt: "-",
    lastActive: "-",
  },
  {
    id: 3,
    name: "Sneha Patil",
    mobile: "+919998887776",
    username: "@snehapatil",
    employeeCode: "PSR003",
    headquarters: "Nagpur",
    groupIds: [groups[2]?.id],
    inviteStatus: "Invited",
    joinedAt: "-",
    lastActive: "2026-05-21 04:10 PM",
  },
];
export const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:7878/api/v1";

export const apiEndpoints = {
  // Users
  createUser: () => `${API_BASE_URL}/users`,
  getUserInfo: (email: string) =>
    `${API_BASE_URL}/users/info?email=${encodeURIComponent(email)}`,

  // Groups
  createGroup: () => `${API_BASE_URL}/groups`,
  addMember: (groupId: string) => `${API_BASE_URL}/groups/${groupId}/members`,
  getGroupTraits: (groupId: string) => `${API_BASE_URL}/groups/${groupId}/traits`,
  processGroup: (groupId: string) => `${API_BASE_URL}/groups/${groupId}/process`,

  // Recommendations
  getRecommendations: (groupId: string) =>
    `${API_BASE_URL}/groups/${groupId}/recommendations`,

  // Plans
  createPlanForGroup: (groupId: string) =>
    `${API_BASE_URL}/groups/${groupId}/plan`,
  createPlanByGroupName: () => `${API_BASE_URL}/plans/by-group-name`,
};

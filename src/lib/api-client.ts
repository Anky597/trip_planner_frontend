import { apiEndpoints } from "./api-config";

type HttpMethod = "GET" | "POST";

interface ApiErrorPayload {
  code?: string;
  message?: string;
  trace_id?: string;
  details?: unknown;
}

export class ApiError extends Error {
  status: number;
  code?: string;
  traceId?: string;
  details?: unknown;

  constructor(status: number, message: string, payload?: ApiErrorPayload) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.code = payload?.code;
    this.traceId = payload?.trace_id;
    this.details = payload?.details;
  }
}

async function apiFetch<T>(
  url: string,
  options: RequestInit = {}
): Promise<T> {
  const init: RequestInit = {
    headers: {
      "Content-Type": "application/json",
      ...(options.headers || {}),
    },
    ...options,
  };

  const res = await fetch(url, init);

  const text = await res.text();
  const data = text ? safeJsonParse(text) : null;

  if (!res.ok) {
    // Try to interpret backend ErrorResponse shape or plain detail
    const payload: ApiErrorPayload = normalizeErrorPayload(data);
    const message =
      payload.message ||
      (typeof data === "string" ? data : "Request failed with error");
    throw new ApiError(res.status, message, payload);
  }

  return data as T;
}

function safeJsonParse(text: string): any {
  try {
    return JSON.parse(text);
  } catch {
    return text;
  }
}

function normalizeErrorPayload(raw: any): ApiErrorPayload {
  if (!raw) return {};
  if (typeof raw === "string") {
    return { message: raw };
  }
  // FastAPI can return {"detail": "..."} or {"detail": {...}}
  if (raw.detail) {
    if (typeof raw.detail === "string") {
      return { message: raw.detail };
    }
    if (typeof raw.detail === "object") {
      return {
        code: raw.detail.code,
        message: raw.detail.message || raw.detail.detail || "Request failed",
        trace_id: raw.detail.trace_id,
        details: raw.detail.details,
      };
    }
  }
  // Our ErrorResponse-like schema
  return {
    code: raw.code,
    message: raw.message,
    trace_id: raw.trace_id,
    details: raw.details,
  };
}

/**
 * API functions
 * These align with FastAPI endpoints and should be used by pages/components.
 * Extend types as needed to match your Pydantic/OpenAPI definitions.
 */

// ---------- Users ----------

export interface CreateUserPayload {
  email: string;
  name: string;
  user_answer: Record<string, any>;
}

export interface UserResponse {
  id: string;
  email: string;
  name: string;
  persona_traits: Record<string, any>;
  ai_summary: string;
}

export interface GroupInfo {
  id: string;
  name: string;
  destination: string;
  creator_id: string;
  ai_group_kn_summary?: string;
  members: any[];
  plans: any[];
}

export interface UserInfoResponse {
  user: UserResponse;
  groups: GroupInfo[];
}

export async function createUser(payload: CreateUserPayload) {
  return apiFetch<UserResponse>(apiEndpoints.createUser(), {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export async function getUserInfo(email: string) {
  return apiFetch<UserInfoResponse>(apiEndpoints.getUserInfo(email), {
    method: "GET",
  });
}

// ---------- Groups ----------

export interface CreateGroupPayload {
  group_name: string;
  destination: string;
  creator_email: string;
}

export interface GroupResponse {
  id: string;
  name: string;
  creator_id: string;
  destination: string;
}

export interface AddMemberPayload {
  user_email: string;
}

export interface MemberResponse {
  group_id: string;
  user_id: string;
  role: string;
}

export interface GroupTraitsResponse {
  group_id: string;
  group_name: string;
  group_members: {
    persona_traits: Record<string, any>;
    ai_summary: string;
  }[];
}

export async function createGroup(payload: CreateGroupPayload) {
  return apiFetch<GroupResponse>(apiEndpoints.createGroup(), {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export async function addMember(groupId: string, payload: AddMemberPayload) {
  return apiFetch<MemberResponse>(apiEndpoints.addMember(groupId), {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export async function getGroupTraits(groupId: string) {
  return apiFetch<GroupTraitsResponse>(apiEndpoints.getGroupTraits(groupId), {
    method: "GET",
  });
}

export async function processGroup(groupId: string) {
  return apiFetch<{ message: string }>(apiEndpoints.processGroup(groupId), {
    method: "POST",
  });
}

// ---------- Recommendations ----------

export interface RecommendationsResponse {
  short_trip: Record<string, any>;
  long_trip: Record<string, any>;
}

export async function getRecommendations(groupId: string) {
  return apiFetch<RecommendationsResponse>(
    apiEndpoints.getRecommendations(groupId),
    {
      method: "GET",
    }
  );
}

// ---------- Plans ----------

export interface PlanCreatePayload {
  raw_data: Record<string, any>;
}

export interface PlanResponse {
  id: string;
  group_id: string;
  plan_json: Record<string, any>;
  summary_caption: string;
  estimated_cost_per_person?: number | null;
}

export async function createPlanForGroup(
  groupId: string,
  payload: PlanCreatePayload
) {
  return apiFetch<PlanResponse>(apiEndpoints.createPlanForGroup(groupId), {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export interface GeneratePlanByGroupNamePayload {
  group_name: string;
  raw_data: Record<string, any>;
}

export async function createPlanByGroupName(
  payload: GeneratePlanByGroupNamePayload
) {
  return apiFetch<PlanResponse>(apiEndpoints.createPlanByGroupName(), {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

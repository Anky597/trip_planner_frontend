import { create } from "zustand";
import { persist } from "zustand/middleware";

export type TravelPersona = {
  id: string;
  name: string;
  summary: string;
  preferences: string[];
  avoidances: string[];
};

export type User = {
  id: string;
  name: string;
  email: string;
  isNew?: boolean;
  persona?: TravelPersona;
};

export type Member = {
  id: string;
  name: string;
  presence: "online" | "offline";
};

export type PlanSource = {
  url: string;
  title: string;
  used_for: string;
};

export type Activity = {
  time: string;
  location: string;
  description: string;
  activity_type: string;
  activity_title: string;
};

export type DaySchedule = {
  day: number;
  date?: string;
  activities: Activity[];
};

export type PlanOption = {
  plan_id: string;
  plan_type: "in_city" | "out_of_city" | "in_city_and_day_trip";
  plan_variant: string;
  schedule: DaySchedule[];
  why_fit_user: string;
  cost_estimates: Record<string, string>;
  sources: PlanSource[];
};

export type Group = {
  id: string;
  name: string;
  destinationLabel: string;
  status: "planning" | "draft" | "finalized";
  members: Member[];
  selectedPlanId?: string;
};

export type WhiteboardState =
  | "gathering"
  | "profile_reveal"
  | "recommendations"
  | "plans_generating"
  | "plan_options"
  | "plan_detail";

type AppState = {
  currentUser: User | null;
  groups: Group[];
  selectedGroupId: string | null;
  whiteboardByGroup: Record<string, WhiteboardState>;
  planOptionsByGroup: Record<string, PlanOption[]>;
  selectedPlanIdByGroup: Record<string, string | undefined>;
};

type AppActions = {
  // User
  setCurrentUser: (user: User) => void;
  updateUserPersona: (persona: TravelPersona) => void;

  // Groups
  createGroup: (name: string, destinationLabel: string) => Group;
  joinGroupByCode: (code: string) => Group | null;
  selectGroup: (groupId: string | null) => void;
  leaveGroup: (groupId: string) => void;

  // Whiteboard state machine
  setWhiteboardState: (groupId: string, state: WhiteboardState) => void;

  // Plans
  setPlanOptionsForGroup: (groupId: string, plans: PlanOption[]) => void;
  selectPlanForGroup: (groupId: string, planId: string) => void;
};

const seedInitialState = (): AppState => ({
  currentUser: null,
  groups: [],
  selectedGroupId: null,
  whiteboardByGroup: {},
  planOptionsByGroup: {},
  selectedPlanIdByGroup: {},
});

export const useAppStore = create<AppState & AppActions>()(
  persist(
    (set, get) => ({
      ...seedInitialState(),

  setCurrentUser: (user) => {
    set({ currentUser: user });
  },

  updateUserPersona: (persona) => {
    const { currentUser } = get();
    if (!currentUser) return;
    set({ currentUser: { ...currentUser, persona } });
  },

  createGroup: (name, destinationLabel) => {
    const id = `grp_${Math.random().toString(36).slice(2, 8)}`;
    const newGroup: Group = {
      id,
      name,
      destinationLabel,
      status: "planning",
      members: [],
    };
    const groups = [...get().groups, newGroup];
    set((state) => ({
      groups,
      selectedGroupId: id,
      whiteboardByGroup: {
        ...state.whiteboardByGroup,
        [id]: "gathering",
      },
    }));
    return newGroup;
  },

  joinGroupByCode: (code) => {
    // Dummy: treat code as group id match; otherwise create a placeholder.
    const { groups } = get();
    const existing = groups.find((g) => g.id === code);
    if (existing) {
      set({ selectedGroupId: existing.id });
      return existing;
    }
    const newGroup: Group = {
      id: code,
      name: `Group ${code}`,
      destinationLabel: "TBD",
      status: "planning",
      members: [],
    };
    set((state) => ({
      groups: [...state.groups, newGroup],
      selectedGroupId: newGroup.id,
      whiteboardByGroup: {
        ...state.whiteboardByGroup,
        [newGroup.id]: "gathering",
      },
    }));
    return newGroup;
  },

  selectGroup: (groupId) => {
    set({ selectedGroupId: groupId });
  },

  leaveGroup: (groupId) => {
    set((state) => {
      const nextGroups = state.groups.filter((g) => g.id !== groupId);
      const nextSelectedGroupId =
        state.selectedGroupId === groupId ? null : state.selectedGroupId;

      const { [groupId]: _, ...restWhiteboard } = state.whiteboardByGroup;
      const { [groupId]: __, ...restPlanOptions } = state.planOptionsByGroup;
      const { [groupId]: ___, ...restSelectedPlanIds } =
        state.selectedPlanIdByGroup;

      return {
        groups: nextGroups,
        selectedGroupId: nextSelectedGroupId,
        whiteboardByGroup: restWhiteboard,
        planOptionsByGroup: restPlanOptions,
        selectedPlanIdByGroup: restSelectedPlanIds,
      };
    });
  },

  setWhiteboardState: (groupId, state) => {
    set((s) => ({
      whiteboardByGroup: {
        ...s.whiteboardByGroup,
        [groupId]: state,
      },
    }));
  },

  setPlanOptionsForGroup: (groupId, plans) => {
    set((s) => ({
      planOptionsByGroup: {
        ...s.planOptionsByGroup,
        [groupId]: plans,
      },
    }));
  },

      selectPlanForGroup: (groupId, planId) => {
        set((s) => ({
          selectedPlanIdByGroup: {
            ...s.selectedPlanIdByGroup,
            [groupId]: planId,
          },
        }));
      },
    }),
    {
      name: 'trip-planner-store',
      partialize: (state) => ({ currentUser: state.currentUser }),
    }
  )
);

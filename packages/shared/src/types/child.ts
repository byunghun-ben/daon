// 아이 관련 타입
export interface Child {
  id: string;
  name: string;
  birthDate: string;
  gender: Gender;
  birthWeight?: number;
  birthHeight?: number;
  profileImage?: string;
  parentId: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateChildRequest {
  name: string;
  birthDate: string;
  gender: Gender;
  birthWeight?: number;
  birthHeight?: number;
  profileImage?: string;
}

export interface UpdateChildRequest {
  name?: string;
  birthDate?: string;
  gender?: Gender;
  birthWeight?: number;
  birthHeight?: number;
  profileImage?: string;
}

export enum Gender {
  MALE = "MALE",
  FEMALE = "FEMALE",
}

// 보호자 관리
export interface Guardianship {
  id: string;
  userId: string;
  childId: string;
  permission: GuardianPermission;
  invitedAt: string;
  acceptedAt?: string;
  user: {
    id: string;
    name: string;
    email: string;
  };
}

export interface InviteGuardianRequest {
  email: string;
  childId: string;
  permission: GuardianPermission;
}

export enum GuardianPermission {
  ADMIN = "ADMIN",
  VIEW_ONLY = "VIEW_ONLY",
}

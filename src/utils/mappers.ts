import type { Assistant, PermMap } from '@/types';
import { makeEmptyPerms } from '@/data';

export function mapApiAssistant(a: {
  assistantId: string;
  firstname: string;
  lastname: string;
  email: string;
  phoneNumber: string;
  idProofType?: string;
  idNumber?: string;
  status: string;
  created_at?: string;
  resellerId?: string;
}): Assistant {
  return {
    id: a.assistantId,
    assistantId: a.assistantId,
    firstName: a.firstname ?? '',
    lastName: a.lastname ?? '',
    phoneNumber: a.phoneNumber ?? '',
    email: a.email ?? '',
    status: a.status === 'active' ? 'active' : 'inactive',
    permissions: makeEmptyPerms(),
    createdAt: a.created_at ?? new Date().toISOString(),
    idProofType: a.idProofType,
    idNumber: a.idNumber,
  };
}

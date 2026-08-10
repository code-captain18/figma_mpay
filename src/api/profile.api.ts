import { apiClient, ApiError } from './client';

export interface ResellerProfile {
    resellerid: string;
    accountName: string;
    companyName?: string;
    firstName: string;
    lastName: string;
    phoneNumber: string;
    email: string;
    address?: string;
    ghanaCardNum?: string;
    taxId?: string;
    status: string;
    category: string;
    accountType: string;
    salesExecutiveId?: string;
    salesExecutive?: string;
    createdAt: string;
    updatedAt?: string;
}

export interface AssistantProfile {
    assistantId: string;
    firstName: string;
    lastname: string; // API returns lowercase 'lastname'
    phoneNumber: string;
    email: string;
    status: string;
    accountType: string;
    resellerAccountId: string;
    resellerId: string;
    createdAt: string;
}

export interface ProfileProduct {
    prodCode: string;
    description: string;
    status: string;
}

export interface EditProfilePayload {
    id: string;
    accountName?: string;
    companyName?: string;
    firstName?: string;
    lastName?: string;
    phoneNumber?: string;
    email?: string;
    address?: string;
    ghanaCardNumber?: string;
    taxId?: string;
    salesExecutive?: string;
    category?: string;
    status?: string;
}

export async function apiGetProfile(): Promise<{ profile: ResellerProfile; products: ProfileProduct[] }> {
    try {
        const { data } = await apiClient.post<{ success: boolean; results: ResellerProfile[]; products: ProfileProduct[] }>('resellers/view', {});
        const profile = data.results?.[0];
        if (!profile) throw new ApiError(404, 'Profile not found.');
        return { profile, products: data.products ?? [] };
    } catch (err: any) {
        if (err instanceof ApiError) throw err;
        throw new ApiError(err.response?.status ?? 0, err.response?.data?.message ?? 'Failed to load profile.');
    }
}

// TODO: request a dedicated /resellers/assistant/profile?email={email} endpoint to avoid page-100 ceiling
export async function apiGetAssistantProfile(email: string): Promise<{ profile: AssistantProfile; products: ProfileProduct[] }> {
    try {
        const { data } = await apiClient.post<{ success: boolean; data: AssistantProfile[]; products: ProfileProduct[] }>('resellers/assistant/list', { page: 1, pageSize: 100 });
        const profile = data.data?.find(a => a.email === email);
        if (!profile) throw new ApiError(404, 'Assistant profile not found.');
        return { profile, products: data.products ?? [] };
    } catch (err: any) {
        if (err instanceof ApiError) throw err;
        throw new ApiError(err.response?.status ?? 0, err.response?.data?.message ?? 'Failed to load profile.');
    }
}

export async function apiEditProfile(payload: EditProfilePayload): Promise<void> {
    try {
        await apiClient.put('resellers/edit', payload);
    } catch (err: any) {
        throw new ApiError(err.response?.status ?? 0, err.response?.data?.message ?? 'Failed to update profile.');
    }
}

export async function apiEditAssistantProfile(
    payload: Pick<EditProfilePayload, 'id' | 'firstName' | 'lastName' | 'phoneNumber' | 'email'>
): Promise<void> {
    try {
        await apiClient.post('resellers/assistant/edit', payload);
    } catch (err: any) {
        throw new ApiError(err.response?.status ?? 0, err.response?.data?.message ?? 'Failed to update profile.');
    }
}

// ── Assistant management ───────────────────────────────────────────────────────

export interface ApiAssistant {
    assistantId: string;
    firstname: string;
    lastname: string;
    email: string;
    phoneNumber: string;
    idProofType?: string;
    idNumber?: string;
    status: string;
    resellerAccountId: string;
    resellerId: string;
    created_at?: string;
    updated_at?: string;
}

export interface ApiPermModule {
    module: string;
    can_view: boolean;
    can_add: boolean;
    can_edit: boolean;
    can_delete: boolean;
    can_import: boolean;
    can_export: boolean;
}

export interface ApiPermEntry extends ApiPermModule {
    tab: string;
}

export type ApiPermissions = Record<string, ApiPermModule[]>;

export async function apiListAssistants(
    page: number,
    pageSize: number,
    search?: string
): Promise<{ assistants: ApiAssistant[]; total: number; totalPages: number }> {
    try {
        const { data } = await apiClient.post<{
            success: boolean;
            data: ApiAssistant[];
            pagination: { total: number; totalPages: number };
        }>('resellers/assistant/list', { page, pageSize, ...(search ? { search } : {}) });
        return { assistants: data.data ?? [], total: data.pagination?.total ?? 0, totalPages: data.pagination?.totalPages ?? 1 };
    } catch (err: any) {
        if (err instanceof ApiError) throw err;
        throw new ApiError(err.response?.status ?? 0, err.response?.data?.message ?? 'Failed to load assistants.');
    }
}

export async function apiAddAssistant(payload: {
    resellerId: string; firstname: string; lastname: string;
    email: string; phoneNumber: string; idProofType: string; idNumber: string;
}): Promise<{ assistantId: string }> {
    try {
        const { data } = await apiClient.post<{ success: boolean; data: { assistantId: string } }>('resellers/assistant/add', payload);
        return { assistantId: data.data?.assistantId ?? '' };
    } catch (err: any) {
        throw new ApiError(err.response?.status ?? 0, err.response?.data?.error ?? 'Failed to create assistant.');
    }
}

export async function apiEditAssistant(payload: {
    assistantId: string; firstname: string; lastname: string;
    email: string; phoneNumber: string; idProofType?: string; idNumber?: string; status: string;
}): Promise<void> {
    try {
        await apiClient.post('resellers/assistant/edit', payload);
    } catch (err: any) {
        throw new ApiError(err.response?.status ?? 0, err.response?.data?.error ?? 'Failed to update assistant.');
    }
}

export async function apiDeleteAssistant(assistantId: string): Promise<void> {
    try {
        await apiClient.post('resellers/assistant/delete', { assistantId });
    } catch (err: any) {
        throw new ApiError(err.response?.status ?? 0, err.response?.data?.error ?? 'Failed to delete assistant.');
    }
}

export async function apiGetAssistantPermissions(assistantId: string): Promise<ApiPermissions> {
    try {
        const { data } = await apiClient.post<{ success: boolean; permissions: ApiPermissions }>('resellers/assistant/permissions/get', { assistantId });
        return data.permissions ?? {};
    } catch (err: any) {
        if (err instanceof ApiError) throw err;
        throw new ApiError(err.response?.status ?? 0, err.response?.data?.error ?? 'Failed to load permissions.');
    }
}

export async function apiSaveAssistantPermissions(assistantId: string, permissions: ApiPermEntry[]): Promise<void> {
    try {
        await apiClient.post('resellers/assistant/permissions/save', { assistantId, permissions });
    } catch (err: any) {
        throw new ApiError(err.response?.status ?? 0, err.response?.data?.error ?? 'Failed to save permissions.');
    }
}

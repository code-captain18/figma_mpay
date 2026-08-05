import { apiClient, ApiError } from './client';

export interface TxCount {
    successful: number;
    failed: number;
}

export interface DashboardData {
    databundleSales: number;
    airtimeSales: number;
    mobileMoneyTransfers: number;
    databundleLastMonth: number;
    airtimeLastMonth: number;
    mobileMoneyLastMonth: number;
    databundleTrend: number;
    airtimeTrend: number;
    mobileMoneyTrend: number;
    webSales: number;
    apiSales: number;
    mobileAppSales: number;
    todayTransactions: {
        airtime: TxCount;
        data: TxCount;
        mobileMoneyCredit: TxCount;
        mobileMoneyDebit: TxCount;
    };
}

export async function apiGetDashboardData(startDate: string, endDate: string): Promise<DashboardData> {
    try {
        const { data } = await apiClient.post<DashboardData & { success: boolean }>('dashboard/data', { startDate, endDate });
        return data;
    } catch (err: any) {
        throw new ApiError(err.response?.status ?? 0, err.response?.data?.message ?? 'Failed to load dashboard data.');
    }
}

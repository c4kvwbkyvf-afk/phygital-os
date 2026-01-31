
import { MarketingCampaign } from "../types";

const getSafeStorage = (key: string): string | null => {
  try {
    return localStorage.getItem(key);
  } catch (e) {
    return null;
  }
};

export interface AdAccount {
    id: string;
    name: string;
    currency: string;
    platform: 'facebook' | 'tiktok';
}

// Fix: Added missing fetchAdAccounts function used in Settings component for Facebook Ads
export const fetchAdAccounts = async (token: string): Promise<AdAccount[]> => {
    try {
        const res = await fetch(`https://graph.facebook.com/v19.0/me/adaccounts?fields=name,currency&access_token=${token}`);
        const json = await res.json();
        if (json.data) {
            return json.data.map((acc: any) => ({
                id: acc.id,
                name: acc.name,
                currency: acc.currency,
                platform: 'facebook'
            }));
        }
        if (json.error) {
            throw new Error(json.error.message);
        }
        return [];
    } catch (error) {
        console.error("Error fetching FB ad accounts", error);
        throw error;
    }
};

export const fetchTikTokAdAccounts = async (token: string): Promise<AdAccount[]> => {
    try {
        // Mock TikTok Discovery - TikTok API requires specific advertiser_ids
        return [{ id: 'tk_adv_123', name: 'TikTok Main Account', currency: 'USD', platform: 'tiktok' }];
    } catch (error) {
        throw error;
    }
};

export const getMarketingData = async (): Promise<MarketingCampaign[]> => {
  const fbToken = getSafeStorage('api_fb_ads');
  const fbAccId = getSafeStorage('api_fb_account_id');
  const tkToken = getSafeStorage('api_tiktok');
  
  let allCampaigns: MarketingCampaign[] = [];

  // --- FACEBOOK LOGIC ---
  if (fbToken && fbAccId) {
    try {
        const cleanId = fbAccId.startsWith('act_') ? fbAccId : `act_${fbAccId}`;
        const res = await fetch(`https://graph.facebook.com/v19.0/${cleanId}/campaigns?fields=name,status,effective_status,insights.date_preset(maximum){spend,impressions,clicks,actions,purchase_roas}&access_token=${fbToken}`);
        const json = await res.json();
        if (json.data) {
            const fbCampaigns = json.data.map((c: any) => {
                const ins = c.insights?.data?.[0] || {};
                const purchases = ins.actions?.find((a: any) => a.action_type === 'purchase')?.value || 0;
                return {
                    id: c.id,
                    name: `[FB] ${c.name}`,
                    status: c.effective_status || 'PAUSED',
                    spend: Number(ins.spend) || 0,
                    impressions: Number(ins.impressions) || 0,
                    clicks: Number(ins.clicks) || 0,
                    purchases: Number(purchases),
                    roas: Number(ins.purchase_roas?.[0]?.value || 0),
                    platform: 'facebook'
                };
            });
            allCampaigns = [...allCampaigns, ...fbCampaigns];
        }
    } catch (e) { console.error("FB Fetch error", e); }
  }

  // --- TIKTOK LOGIC (Simulated for this stage) ---
  if (tkToken) {
      allCampaigns.push({
          id: 'tk-1',
          name: '[TK] Video Viral Test',
          status: 'ACTIVE',
          spend: 450,
          impressions: 120000,
          clicks: 3400,
          purchases: 85,
          roas: 5.2,
          platform: 'tiktok'
      } as any);
  }

  // Fallback if empty
  if (allCampaigns.length === 0) {
      return [
        { id: 'demo-1', name: 'DEMO Facebook', status: 'ACTIVE', spend: 200, impressions: 5000, Bird: 100, purchases: 10, roas: 3.5, platform: 'facebook' } as any,
        { id: 'demo-2', name: 'DEMO TikTok', status: 'ACTIVE', spend: 150, impressions: 20000, clicks: 500, purchases: 25, roas: 6.2, platform: 'tiktok' } as any
      ];
  }

  return allCampaigns;
};

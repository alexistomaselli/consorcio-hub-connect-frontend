import { supabase } from '../lib/supabase';
import { WhatsAppInstance, WhatsappStatus } from '../types/whatsapp';

export const evolutionService = {
    /**
     * Get global settings (Evolution API URL and Key) from Supabase
     */
    async getGlobalSettings() {
        const { data, error } = await supabase
            .from('system_settings')
            .select('*')
            .in('key', ['evolution_api_url', 'evolution_api_key']);

        if (error) throw error;

        const settingsMap = (data || []).reduce((acc, curr) => {
            acc[curr.key] = curr.value;
            return acc;
        }, {} as Record<string, string>);

        return {
            apiUrl: settingsMap['evolution_api_url'],
            apiKey: settingsMap['evolution_api_key']
        };
    },

    /**
     * General fetch wrapper for Evolution API
     */
    async evolutionFetch(endpoint: string, options: RequestInit = {}) {
        const settings = await this.getGlobalSettings();
        if (!settings.apiUrl || !settings.apiKey) {
            throw new Error('Evolution API settings not configured in SuperAdmin');
        }

        const url = `${settings.apiUrl}${endpoint}`;
        const headers = {
            'Content-Type': 'application/json',
            'apikey': settings.apiKey,
            ...(options.headers || {})
        };

        const response = await fetch(url, { ...options, headers });

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            throw new Error(errorData.message || `Evolution API error: ${response.status}`);
        }

        return response.json();
    },

    /**
     * Create a new instance in Evolution API
     */
    async createInstance(instanceName: string) {
        return this.evolutionFetch('/instance/create', {
            method: 'POST',
            body: JSON.stringify({
                instanceName: instanceName,
                token: crypto.randomUUID(),
                number: '',
                qrcode: true
            })
        });
    },

    /**
     * Get QR Code for an instance
     */
    async getConnectQr(instanceName: string) {
        return this.evolutionFetch(`/instance/connect/${instanceName}`, {
            method: 'GET'
        });
    },

    /**
     * Get status of an instance
     */
    async getInstanceStatus(instanceName: string) {
        try {
            const response = await this.evolutionFetch(`/instance/connectionState/${instanceName}`, {
                method: 'GET'
            });
            return response; // { instance: { state: "open" | "close" | "connecting" } }
        } catch (error: any) {
            if (error.message?.includes('404')) return { instance: { state: 'disconnected' } };
            throw error;
        }
    },

    /**
     * Delete an instance from Evolution API
     */
    async deleteInstance(instanceName: string) {
        return this.evolutionFetch(`/instance/delete/${instanceName}`, {
            method: 'DELETE'
        });
    },

    /**
     * Logout from an instance
     */
    async logoutInstance(instanceName: string) {
        return this.evolutionFetch(`/instance/logout/${instanceName}`, {
            method: 'DELETE'
        });
    },

    /**
     * Persist instance data into building's whatsapp column in Supabase
     */
    async updateBuildingWhatsapp(buildingId: string, whatsappData: Partial<WhatsAppInstance> | null) {
        const { error } = await supabase
            .from('buildings')
            .update({
                whatsapp: whatsappData ? JSON.stringify(whatsappData) : null,
                updatedAt: new Date().toISOString()
            })
            .eq('id', buildingId);

        if (error) throw error;
    }
};

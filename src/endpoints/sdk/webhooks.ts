import type { FetchFunction } from '../../types.js';

/**
 * Webhook
 */
export type SDKWebhook = {
    /** The name of the webhook */
    name: string;
    /** The label of the webhook visible in the scenario builder */
    label: string;
    /** The type of the webhook */
    type: string;
    /** The app version this webhook belongs to */
    appVersion?: number;
    /** Connection name if applicable */
    connection?: string | null;
    /** Alternative connection name if applicable */
    altConnection?: string | null;
};

/**
 * Webhook section content
 */
export type SDKWebhookSection = string;

/**
 * Available webhook section types
 */
export type SDKWebhookSectionType = 'api' | 'parameters' | 'attach' | 'detach' | 'scope';

/**
 * Body for creating a new webhook
 */
export type CreateSDKWebhookBody = {
    /** The type of the webhook */
    type: string;
    /** The label of the webhook visible in the scenario builder */
    label: string;
};

/**
 * Body for updating a webhook
 */
export type UpdateSDKWebhookBody = {
    /** The label of the webhook visible in the scenario builder */
    label?: string;
};

/**
 * Internal response types (not exported)
 */
type ListSDKWebhooksResponse = {
    appWebhooks: SDKWebhook[];
};

type GetSDKWebhookResponse = {
    appWebhook: SDKWebhook;
};

type CreateSDKWebhookResponse = {
    appWebhook: Pick<SDKWebhook, 'label' | 'type'>;
};

type UpdateSDKWebhookResponse = {
    appWebhook: SDKWebhook;
};

/**
 * Class providing methods for working with Webhooks
 */
export class SDKWebhooks {
    readonly #fetch: FetchFunction;

    constructor(fetch: FetchFunction) {
        this.#fetch = fetch;
    }

    /**
     * List webhooks for a specific app
     */
    async list(appName: string): Promise<SDKWebhook[]> {
        const response = await this.#fetch<ListSDKWebhooksResponse>(`/sdk/apps/${appName}/webhooks`);
        return response.appWebhooks;
    }

    /**
     * Get a single webhook by name
     */
    async get(webhookName: string): Promise<SDKWebhook> {
        const response = await this.#fetch<GetSDKWebhookResponse>(`/sdk/apps/webhooks/${webhookName}`);
        return response.appWebhook;
    }

    /**
     * Create a new webhook for an app
     */
    async create(appName: string, body: CreateSDKWebhookBody): Promise<CreateSDKWebhookResponse['appWebhook']> {
        const response = await this.#fetch<CreateSDKWebhookResponse>(`/sdk/apps/${appName}/webhooks`, {
            method: 'POST',
            body,
        });
        return response.appWebhook;
    }

    /**
     * Update an existing webhook
     */
    async update(webhookName: string, body: UpdateSDKWebhookBody): Promise<SDKWebhook> {
        const response = await this.#fetch<UpdateSDKWebhookResponse>(`/sdk/apps/webhooks/${webhookName}`, {
            method: 'PATCH',
            body,
        });
        return response.appWebhook;
    }

    /**
     * Delete a webhook
     */
    async delete(webhookName: string): Promise<void> {
        await this.#fetch(`/sdk/apps/webhooks/${webhookName}`, {
            method: 'DELETE',
        });
    }

    /**
     * Get a specific section of a webhook
     * Available sections are: api, parameters, attach, detach, scope
     */
    async getSection(webhookName: string, section: SDKWebhookSectionType): Promise<SDKWebhookSection> {
        const response = await this.#fetch<SDKWebhookSection>(`/sdk/apps/webhooks/${webhookName}/${section}`);
        return response;
    }

    /**
     * Set a specific section of a webhook
     * Available sections are: api, parameters, attach, detach, scope
     */
    async setSection(webhookName: string, section: SDKWebhookSectionType, body: SDKWebhookSection): Promise<void> {
        await this.#fetch(`/sdk/apps/webhooks/${webhookName}/${section}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/jsonc',
            },
            body,
        });
    }
}

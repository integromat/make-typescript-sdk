import { describe, expect, it, beforeEach, vi } from 'vitest';
import { SDKWebhooks } from '../../../src/endpoints/sdk/webhooks.js';
import type { 
    SDKWebhook, 
    CreateSDKWebhookBody, 
    UpdateSDKWebhookBody, 
    SDKWebhookSectionType 
} from '../../../src/endpoints/sdk/webhooks.js';

describe('SDKWebhooks', () => {
    let webhooks: SDKWebhooks;
    let mockFetch: ReturnType<typeof vi.fn>;

    beforeEach(() => {
        mockFetch = vi.fn();
        webhooks = new SDKWebhooks(mockFetch);
    });

    describe('list', () => {
        it('should list webhooks for a specific app', async () => {
            const mockResponse = {
                appWebhooks: [
                    {
                        name: 'testWebhook',
                        label: 'Test Webhook',
                        type: 'web',
                        connection: 'test-connection',
                        altConnection: null,
                        appVersion: 1
                    }
                ]
            };

            mockFetch.mockResolvedValue(mockResponse);

            const result = await webhooks.list('test-app');

            expect(mockFetch).toHaveBeenCalledWith('/sdk/apps/test-app/webhooks');
            expect(result).toEqual(mockResponse.appWebhooks);
        });

        it('should handle empty webhook list', async () => {
            mockFetch.mockResolvedValue({ appWebhooks: [] });

            const result = await webhooks.list('test-app');

            expect(result).toEqual([]);
        });
    });

    describe('get', () => {
        it('should get a single webhook by name', async () => {
            const mockWebhook: SDKWebhook = {
                name: 'testWebhook',
                label: 'Test Webhook',
                type: 'web',
                connection: 'test-connection',
                altConnection: null,
                appVersion: 1
            };

            mockFetch.mockResolvedValue({ appWebhook: mockWebhook });

            const result = await webhooks.get('testWebhook');

            expect(mockFetch).toHaveBeenCalledWith('/sdk/apps/webhooks/testWebhook');
            expect(result).toEqual(mockWebhook);
        });
    });

    describe('create', () => {
        it('should create a new webhook', async () => {
            const createBody: CreateSDKWebhookBody = {
                type: 'web',
                label: 'New Test Webhook'
            };

            const mockResponse = {
                appWebhook: {
                    type: 'web',
                    label: 'New Test Webhook'
                }
            };

            mockFetch.mockResolvedValue(mockResponse);

            const result = await webhooks.create('test-app', createBody);

            expect(mockFetch).toHaveBeenCalledWith('/sdk/apps/test-app/webhooks', {
                method: 'POST',
                body: createBody
            });
            expect(result).toEqual(mockResponse.appWebhook);
        });
    });

    describe('update', () => {
        it('should update an existing webhook', async () => {
            const updateBody: UpdateSDKWebhookBody = {
                label: 'Updated Webhook Label'
            };

            const mockUpdatedWebhook: SDKWebhook = {
                name: 'testWebhook',
                label: 'Updated Webhook Label',
                type: 'web',
                connection: 'test-connection',
                altConnection: null,
                appVersion: 1
            };

            mockFetch.mockResolvedValue({ appWebhook: mockUpdatedWebhook });

            const result = await webhooks.update('testWebhook', updateBody);

            expect(mockFetch).toHaveBeenCalledWith('/sdk/apps/webhooks/testWebhook', {
                method: 'PATCH',
                body: updateBody
            });
            expect(result).toEqual(mockUpdatedWebhook);
        });

        it('should handle partial updates', async () => {
            const updateBody: UpdateSDKWebhookBody = {};

            mockFetch.mockResolvedValue({ 
                appWebhook: { 
                    name: 'testWebhook', 
                    label: 'Original Label',
                    type: 'web',
                    connection: null,
                    altConnection: null,
                    appVersion: 1
                } 
            });

            const result = await webhooks.update('testWebhook', updateBody);

            expect(mockFetch).toHaveBeenCalledWith('/sdk/apps/webhooks/testWebhook', {
                method: 'PATCH',
                body: updateBody
            });
            expect(result.label).toBe('Original Label');
        });
    });

    describe('delete', () => {
        it('should delete a webhook', async () => {
            mockFetch.mockResolvedValue(undefined);

            await webhooks.delete('testWebhook');

            expect(mockFetch).toHaveBeenCalledWith('/sdk/apps/webhooks/testWebhook', {
                method: 'DELETE'
            });
        });
    });

    describe('webhook sections', () => {
        const sections: SDKWebhookSectionType[] = ['api', 'parameters', 'attach', 'detach', 'scope', 'update'];

        describe('getSection', () => {
            it.each(sections)('should get %s section', async (section) => {
                const mockSectionContent = JSON.stringify({ section: `content for ${section}` });
                mockFetch.mockResolvedValue(mockSectionContent);

                const result = await webhooks.getSection('testWebhook', section);

                expect(mockFetch).toHaveBeenCalledWith(`/sdk/apps/webhooks/testWebhook/${section}`);
                expect(result).toBe(mockSectionContent);
            });
        });

        describe('setSection', () => {
            it.each(sections)('should set %s section', async (section) => {
                const sectionContent = JSON.stringify({ 
                    section: `updated content for ${section}`,
                    timestamp: new Date().toISOString()
                });

                mockFetch.mockResolvedValue(undefined);

                await webhooks.setSection('testWebhook', section, sectionContent);

                expect(mockFetch).toHaveBeenCalledWith(`/sdk/apps/webhooks/testWebhook/${section}`, {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/jsonc'
                    },
                    body: sectionContent
                });
            });

            it('should handle object input for setSection', async () => {
                const sectionObject = { 
                    url: '/webhook/endpoint',
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    }
                };

                mockFetch.mockResolvedValue(undefined);

                await webhooks.setSection('testWebhook', 'api', sectionObject as any);

                expect(mockFetch).toHaveBeenCalledWith('/sdk/apps/webhooks/testWebhook/api', {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/jsonc'
                    },
                    body: JSON.stringify(sectionObject)
                });
            });
        });
    });

    describe('webhook operations', () => {
        describe('attachWebhook', () => {
            it('should attach webhook without config', async () => {
                const mockResponse = { success: true, attachmentId: 'att_123' };
                mockFetch.mockResolvedValue(mockResponse);

                const result = await webhooks.attachWebhook('testWebhook');

                expect(mockFetch).toHaveBeenCalledWith('/sdk/apps/webhooks/testWebhook/attach', {
                    method: 'POST',
                    body: undefined
                });
                expect(result).toEqual(mockResponse);
            });

            it('should attach webhook with config', async () => {
                const config = { 
                    url: 'https://example.com/webhook',
                    secret: 'webhook-secret'
                };
                const mockResponse = { success: true, attachmentId: 'att_123' };
                mockFetch.mockResolvedValue(mockResponse);

                const result = await webhooks.attachWebhook('testWebhook', config);

                expect(mockFetch).toHaveBeenCalledWith('/sdk/apps/webhooks/testWebhook/attach', {
                    method: 'POST',
                    body: { config }
                });
                expect(result).toEqual(mockResponse);
            });
        });

        describe('detachWebhook', () => {
            it('should detach webhook without config', async () => {
                const mockResponse = { success: true, message: 'Webhook detached' };
                mockFetch.mockResolvedValue(mockResponse);

                const result = await webhooks.detachWebhook('testWebhook');

                expect(mockFetch).toHaveBeenCalledWith('/sdk/apps/webhooks/testWebhook/detach', {
                    method: 'POST',
                    body: undefined
                });
                expect(result).toEqual(mockResponse);
            });

            it('should detach webhook with config', async () => {
                const config = { force: true };
                const mockResponse = { success: true, message: 'Webhook force detached' };
                mockFetch.mockResolvedValue(mockResponse);

                const result = await webhooks.detachWebhook('testWebhook', config);

                expect(mockFetch).toHaveBeenCalledWith('/sdk/apps/webhooks/testWebhook/detach', {
                    method: 'POST',
                    body: { config }
                });
                expect(result).toEqual(mockResponse);
            });
        });

        describe('testWebhook', () => {
            it('should test webhook without payload', async () => {
                const mockResponse = { 
                    success: true, 
                    response: { status: 200, body: 'OK' },
                    duration: 150
                };
                mockFetch.mockResolvedValue(mockResponse);

                const result = await webhooks.testWebhook('testWebhook');

                expect(mockFetch).toHaveBeenCalledWith('/sdk/apps/webhooks/testWebhook/test', {
                    method: 'POST',
                    body: undefined
                });
                expect(result).toEqual(mockResponse);
            });

            it('should test webhook with payload', async () => {
                const payload = { 
                    event: 'test.event',
                    data: { id: 1, name: 'Test Item' }
                };
                const mockResponse = { 
                    success: true, 
                    response: { status: 200, body: 'Processed successfully' },
                    duration: 320
                };
                mockFetch.mockResolvedValue(mockResponse);

                const result = await webhooks.testWebhook('testWebhook', payload);

                expect(mockFetch).toHaveBeenCalledWith('/sdk/apps/webhooks/testWebhook/test', {
                    method: 'POST',
                    body: { payload }
                });
                expect(result).toEqual(mockResponse);
            });
        });

        describe('validateWebhook', () => {
            it('should validate webhook configuration', async () => {
                const mockValidationResult = {
                    valid: true,
                    errors: [],
                    warnings: [
                        { field: 'timeout', message: 'Timeout set higher than recommended' }
                    ],
                    score: 85
                };
                mockFetch.mockResolvedValue(mockValidationResult);

                const result = await webhooks.validateWebhook('testWebhook');

                expect(mockFetch).toHaveBeenCalledWith('/sdk/apps/webhooks/testWebhook/validate', {
                    method: 'POST'
                });
                expect(result).toEqual(mockValidationResult);
            });

            it('should handle validation errors', async () => {
                const mockValidationResult = {
                    valid: false,
                    errors: [
                        { field: 'url', message: 'Invalid URL format' },
                        { field: 'method', message: 'Unsupported HTTP method' }
                    ],
                    warnings: [],
                    score: 20
                };
                mockFetch.mockResolvedValue(mockValidationResult);

                const result = await webhooks.validateWebhook('testWebhook');

                expect(result.valid).toBe(false);
                expect(result.errors).toHaveLength(2);
                expect(result.score).toBe(20);
            });
        });
    });

    describe('error handling', () => {
        it('should handle fetch errors properly', async () => {
            const fetchError = new Error('Network error');
            mockFetch.mockRejectedValue(fetchError);

            await expect(webhooks.list('test-app')).rejects.toThrow('Network error');
        });

        it('should handle API errors properly', async () => {
            const apiError = new Error('API Error: Webhook not found');
            mockFetch.mockRejectedValue(apiError);

            await expect(webhooks.get('nonexistent')).rejects.toThrow('API Error: Webhook not found');
        });
    });

    describe('webhook types and validation', () => {
        it('should handle different webhook types', async () => {
            const webhookTypes = ['web', 'web-shared'];
            
            for (const type of webhookTypes) {
                const createBody: CreateSDKWebhookBody = {
                    type,
                    label: `Webhook of type ${type}`
                };

                mockFetch.mockResolvedValue({ 
                    appWebhook: { type, label: createBody.label }
                });

                const result = await webhooks.create('test-app', createBody);
                expect(result.type).toBe(type);
            }
        });

        it('should handle connection assignments', async () => {
            const mockWebhook: SDKWebhook = {
                name: 'connectedWebhook',
                label: 'Connected Webhook',
                type: 'web',
                connection: 'primary-connection',
                altConnection: 'backup-connection',
                appVersion: 1
            };

            mockFetch.mockResolvedValue({ appWebhook: mockWebhook });

            const result = await webhooks.get('connectedWebhook');

            expect(result.connection).toBe('primary-connection');
            expect(result.altConnection).toBe('backup-connection');
        });
    });
});
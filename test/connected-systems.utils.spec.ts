import { describe, expect, it } from '@jest/globals';
import type { OnPremAgentAppConfigInput } from '../src/endpoints/on-prem-agents.js';
import { assertInputsMatchAppConfig, inputFieldNamesFromAppConfig, parseInputs } from './connected-systems.utils.js';

const SAP_APP_CONFIG: OnPremAgentAppConfigInput[] = [
    {
        name: 'inputs',
        label: 'Inputs',
        type: 'collection',
        spec: [
            { name: 'ashost', label: 'Host', required: true },
            { name: 'sysnr', label: 'System number', required: true },
            { name: 'client', label: 'Client', required: true },
        ],
    },
];

describe('connected-system integration utils', () => {
    describe('parseInputs', () => {
        it('Should return empty object when raw is undefined', () => {
            expect(parseInputs(undefined, 'MAKE_CONNECTED_SYSTEM_HTTP_INPUTS')).toStrictEqual({});
        });

        it('Should coerce values to strings', () => {
            expect(parseInputs('{"port":8080}', 'ENV')).toStrictEqual({ port: '8080' });
        });

        it('Should reject non-object JSON', () => {
            expect(() => parseInputs('[]', 'ENV')).toThrow('ENV must be a JSON object');
        });
    });

    describe('inputFieldNamesFromAppConfig', () => {
        it('Should extract required and all field names from collection spec', () => {
            expect(inputFieldNamesFromAppConfig(SAP_APP_CONFIG)).toStrictEqual({
                required: ['ashost', 'sysnr', 'client'],
                all: ['ashost', 'sysnr', 'client'],
            });
        });
    });

    describe('assertInputsMatchAppConfig', () => {
        it('Should pass when inputs match the form spec', () => {
            expect(() =>
                assertInputsMatchAppConfig(
                    SAP_APP_CONFIG,
                    { ashost: '00', sysnr: '00', client: '00' },
                    'MAKE_CONNECTED_SYSTEM_SAP_AGENT_INPUTS',
                    'sap-agent',
                ),
            ).not.toThrow();
        });

        it('Should fail when required keys are missing', () => {
            expect(() =>
                assertInputsMatchAppConfig(
                    SAP_APP_CONFIG,
                    { client: '00' },
                    'MAKE_CONNECTED_SYSTEM_SAP_AGENT_INPUTS',
                    'sap-agent',
                ),
            ).toThrow(/Missing required keys: ashost, sysnr/);
        });

        it('Should fail when unknown keys are present', () => {
            expect(() =>
                assertInputsMatchAppConfig(
                    SAP_APP_CONFIG,
                    { ashost: '00', sysnr: '00', client: '00', language: 'EN' },
                    'MAKE_CONNECTED_SYSTEM_SAP_AGENT_INPUTS',
                    'sap-agent',
                ),
            ).toThrow(/Unknown keys \(not in form spec\): language/);
        });
    });
});

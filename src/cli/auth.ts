export function resolveAuth(options: { apiKey?: string; zone?: string }): { token: string; zone: string } {
    const token = options.apiKey ?? process.env.MAKE_API_KEY;
    const zone = options.zone ?? process.env.MAKE_ZONE;

    if (!token) {
        throw new Error('API key is required. Set MAKE_API_KEY environment variable or use --api-key flag.');
    }
    if (!zone) {
        throw new Error('Zone is required. Set MAKE_ZONE environment variable or use --zone flag.');
    }

    return { token, zone };
}

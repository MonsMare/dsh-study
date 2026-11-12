export interface ProfileTemplate {
    bundles: readonly string[];
}

export const PROFILE_TEMPLATES: Record<string, ProfileTemplate> = {
    web:{
        bundles: [
            "@deepseek-ai/dsh-base",
            "@deepseek-ai/dsh-web-app"
        ]
    },
    headless: {
        bundles: [
            "@deepseek-ai/dsh-base",
            "@deepseek-ai/dsh-headless"
        ]
    },
    sdk: {
        bundles: [
            "@deepseek-ai/dsh-base",
            "@deepseek-ai/dsh-sdk-app"
        ]
    },
    "sdk-minimal": {
        bundles: ["@deepseek-ai/dsh-sdk-minimal"]
    },
    acp:{
        bundles: [
            "@deepseek-ai/dsh-base",
            "@deepseek-ai/dsh-acp-app"
        ]
    }
           
};

export function getProfileTemplate(
    name: string
): ProfileTemplate | undefined {
    return Object.hasOwn(PROFILE_TEMPLATES, name)
        ? PROFILE_TEMPLATES[name]
        : undefined;
}
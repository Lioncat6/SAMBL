// config

export function getUserAgent() {
    const appName = "SAMBL";
    const description = "Spotify Artist MusicBrainz Lookup";

    return `${appName} (${description})`;
}

export function getApiUrl() {
    return "https://s-api.lioncat6.com";
}
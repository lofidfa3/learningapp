// Spotify OAuth and User Management
export interface SpotifyUser {
  id: string;
  displayName: string;
  email: string;
  imageUrl: string;
  country: string;
  product: string; // premium, free, etc.
}

export interface SpotifyAuthState {
  accessToken: string;
  refreshToken?: string;
  expiresAt: number;
  user: SpotifyUser;
}

const STORAGE_KEY = 'spotify-auth';

export function saveSpotifyAuth(authState: SpotifyAuthState): void {
  if (typeof window !== 'undefined') {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(authState));
  }
}

export function getSpotifyAuth(): SpotifyAuthState | null {
  if (typeof window === 'undefined') return null;
  
  const stored = localStorage.getItem(STORAGE_KEY);
  if (!stored) return null;
  
  try {
    const auth = JSON.parse(stored) as SpotifyAuthState;
    
    // Check if token is expired
    if (auth.expiresAt && Date.now() > auth.expiresAt) {
      clearSpotifyAuth();
      return null;
    }
    
    return auth;
  } catch {
    return null;
  }
}

export function clearSpotifyAuth(): void {
  if (typeof window !== 'undefined') {
    localStorage.removeItem(STORAGE_KEY);
  }
}

export function isSpotifyTokenValid(): boolean {
  const auth = getSpotifyAuth();
  if (!auth) return false;
  
  return Date.now() < auth.expiresAt;
}

export async function fetchSpotifyUser(accessToken: string): Promise<SpotifyUser | null> {
  try {
    const response = await fetch('https://api.spotify.com/v1/me', {
      headers: {
        'Authorization': `Bearer ${accessToken}`,
      },
    });

    if (!response.ok) {
      throw new Error('Failed to fetch user profile');
    }

    const data = await response.json();

    return {
      id: data.id,
      displayName: data.display_name || data.id,
      email: data.email || '',
      imageUrl: data.images?.[0]?.url || '',
      country: data.country || '',
      product: data.product || 'free',
    };
  } catch (error) {
    console.error('Error fetching Spotify user:', error);
    return null;
  }
}


export type AuthResult = {
  user: { id: string; email?: string | null } | null;
  error: Error | null;
};

type SupabaseClientLike = {
  auth: {
    signUp: (payload: unknown) => Promise<{ data: { user?: { id: string; email?: string | null } | null }; error: { message: string } | null }>;
    signInWithPassword: (payload: unknown) => Promise<{ data: { user?: { id: string; email?: string | null } | null }; error: { message: string } | null }>;
    signOut: () => Promise<{ error: { message: string } | null }>;
  };
  from: (table: string) => {
    upsert: (payload: unknown, options?: { onConflict?: string }) => Promise<{ error: { message: string } | null }>;
  };
};

export function createAuthService(client: SupabaseClientLike) {
  return {
    async signUpWithEmail(email: string, password: string, username: string): Promise<AuthResult> {
      const { data, error } = await client.auth.signUp({
        email,
        password,
        options: {
          data: {
            username,
            display_name: username,
          },
        },
      });

      if (error) {
        return {
          user: null,
          error: new Error(error.message),
        };
      }

      if (data.user) {
        const { error: profileError } = await client.from('profiles').upsert(
          {
            id: data.user.id,
            email,
            username,
            display_name: username,
          },
          { onConflict: 'id' },
        );

        if (profileError) {
          return {
            user: data.user,
            error: new Error(profileError.message),
          };
        }
      }

      return {
        user: data.user ?? null,
        error: null,
      };
    },

    async signInWithEmail(email: string, password: string): Promise<AuthResult> {
      const { data, error } = await client.auth.signInWithPassword({ email, password });

      if (error) {
        return {
          user: null,
          error: new Error(error.message),
        };
      }

      return {
        user: data.user ?? null,
        error: null,
      };
    },

    async signOut() {
      const { error } = await client.auth.signOut();
      return { error: error ? new Error(error.message) : null };
    },
  };
}

export async function signUpWithEmail(
  email: string,
  password: string,
  username: string,
): Promise<AuthResult> {
  const { isSupabaseConfigured, supabase } = await import('./supabase');

  if (!isSupabaseConfigured) {
    return {
      user: null,
      error: new Error('Supabase is not configured yet. Add EXPO_PUBLIC_SUPABASE_URL and EXPO_PUBLIC_SUPABASE_ANON_KEY.'),
    };
  }

  return createAuthService(supabase).signUpWithEmail(email, password, username);
}

export async function signInWithEmail(email: string, password: string): Promise<AuthResult> {
  const { isSupabaseConfigured, supabase } = await import('./supabase');

  if (!isSupabaseConfigured) {
    return {
      user: null,
      error: new Error('Supabase is not configured yet. Add EXPO_PUBLIC_SUPABASE_URL and EXPO_PUBLIC_SUPABASE_ANON_KEY.'),
    };
  }

  return createAuthService(supabase).signInWithEmail(email, password);
}

export async function signOutFromMiModa() {
  const { isSupabaseConfigured, supabase } = await import('./supabase');

  if (!isSupabaseConfigured) {
    return { error: null };
  }

  return createAuthService(supabase).signOut();
}

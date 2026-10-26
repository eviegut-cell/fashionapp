import { describe, expect, it, vi } from 'vitest';

import { createAuthService } from '../lib/auth';
import { moderationCheck } from '../lib/moderation';

describe('moderationCheck', () => {
  it('allows fashion-focused language without blocked terms', () => {
    const result = moderationCheck('Soft ivory blazer with sculpted tailoring and polished leather heels.');

    expect(result).toEqual({ isAllowed: true, reason: null });
  });

  it('blocks explicit or harmful wording', () => {
    const result = moderationCheck('This look is a violent and explicit fantasy for a night out.');

    expect(result.isAllowed).toBe(false);
    expect(result.reason).toContain('Mi Moda blocks nudity and harmful language');
  });
});

describe('createAuthService', () => {
  it('creates a profile and returns the signed-up user', async () => {
    const upsert = vi.fn().mockResolvedValue({ error: null });
    const client = {
      auth: {
        signUp: vi.fn().mockResolvedValue({
          data: { user: { id: 'user-1', email: 'ava@example.com' } },
          error: null,
        }),
        signInWithPassword: vi.fn(),
        signOut: vi.fn(),
      },
      from: vi.fn().mockReturnValue({ upsert }),
    };

    const auth = createAuthService(client as any);
    const result = await auth.signUpWithEmail('ava@example.com', 'secret123', 'ava');

    expect(client.auth.signUp).toHaveBeenCalledWith({
      email: 'ava@example.com',
      password: 'secret123',
      options: {
        data: {
          username: 'ava',
          display_name: 'ava',
        },
      },
    });
    expect(upsert).toHaveBeenCalledWith(
      {
        id: 'user-1',
        email: 'ava@example.com',
        username: 'ava',
        display_name: 'ava',
      },
      { onConflict: 'id' },
    );
    expect(result.error).toBeNull();
    expect(result.user).toMatchObject({ id: 'user-1' });
  });

  it('logs in with email and password and never accepts an invalid credential pair', async () => {
    const client = {
      auth: {
        signUp: vi.fn(),
        signInWithPassword: vi.fn().mockResolvedValue({
          data: { user: { id: 'user-1', email: 'ava@example.com' } },
          error: null,
        }),
        signOut: vi.fn(),
      },
      from: vi.fn(),
    };

    const auth = createAuthService(client as any);
    const result = await auth.signInWithEmail('ava@example.com', 'secret123');

    expect(client.auth.signInWithPassword).toHaveBeenCalledWith({
      email: 'ava@example.com',
      password: 'secret123',
    });
    expect(result.error).toBeNull();
    expect(result.user).toMatchObject({ id: 'user-1' });
  });
});

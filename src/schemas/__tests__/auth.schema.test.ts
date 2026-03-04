import { describe, it, expect } from 'vitest';
import { loginSchema, registerSchema } from '../auth.schema';

// ---------------------------------------------------------------------------
// loginSchema
// ---------------------------------------------------------------------------
describe('loginSchema', () => {
  const valid = { username: 'johndoe', password: 'SecurePassword123!' };

  it('passes with valid credentials', () => {
    expect(loginSchema.safeParse(valid).success).toBe(true);
  });

  it('fails when username is empty', () => {
    const result = loginSchema.safeParse({ ...valid, username: '' });
    expect(result.success).toBe(false);
    expect(result.error?.issues[0].message).toBe('Username is required');
  });

  it('fails when password is shorter than 8 characters', () => {
    const result = loginSchema.safeParse({ ...valid, password: 'short' });
    expect(result.success).toBe(false);
    expect(result.error?.issues[0].message).toBe('Password must be at least 8 characters');
  });
});

// ---------------------------------------------------------------------------
// registerSchema
// ---------------------------------------------------------------------------
describe('registerSchema', () => {
  const valid = {
    firstName: 'John',
    lastName: 'Doe',
    username: 'johndoe',
    email: 'johndoe@example.com',
    password: 'SecurePassword123!',
    confirmPassword: 'SecurePassword123!',
    profilePicture: '',
  };

  it('passes with all valid fields', () => {
    expect(registerSchema.safeParse(valid).success).toBe(true);
  });

  it('passes when profilePicture is a valid URL', () => {
    const result = registerSchema.safeParse({
      ...valid,
      profilePicture: 'https://example.com/avatar.jpg',
    });
    expect(result.success).toBe(true);
  });

  it('fails when firstName is empty', () => {
    const result = registerSchema.safeParse({ ...valid, firstName: '' });
    expect(result.success).toBe(false);
    expect(result.error?.issues[0].message).toBe('First name is required');
  });

  it('fails when username is shorter than 2 characters', () => {
    const result = registerSchema.safeParse({ ...valid, username: 'a' });
    expect(result.success).toBe(false);
    expect(result.error?.issues[0].message).toBe('Username must be at least 2 characters');
  });

  it('fails with an invalid email', () => {
    const result = registerSchema.safeParse({ ...valid, email: 'not-an-email' });
    expect(result.success).toBe(false);
    expect(result.error?.issues[0].message).toBe('Invalid email address');
  });

  it("fails when passwords don't match", () => {
    const result = registerSchema.safeParse({
      ...valid,
      confirmPassword: 'DifferentPassword!',
    });
    expect(result.success).toBe(false);
    expect(result.error?.issues[0].message).toBe("Passwords don't match");
  });

  it('fails when profilePicture is not a valid URL', () => {
    const result = registerSchema.safeParse({
      ...valid,
      profilePicture: 'not-a-url',
    });
    expect(result.success).toBe(false);
    expect(result.error?.issues[0].message).toBe('Must be a valid URL');
  });
});

import mockUsers from '$lib/mock/users.json';
import type { User, UserRole } from '$lib/types/User';

// Simulate API delay (between 100-300ms)
const simulateDelay = () => new Promise(resolve => setTimeout(resolve, Math.random() * 200 + 100));

/**
 * Convert ISO date strings to Date objects
 */
function parseUserDates(user: any): User {
  const parsedUser = { ...user };
  
  if (typeof parsedUser.createdAt === 'string') {
    parsedUser.createdAt = new Date(parsedUser.createdAt);
  }
  
  return parsedUser as User;
}

/**
 * Get all users
 * @returns Promise resolving to an array of User objects
 */
export async function getUsers(): Promise<User[]> {
  await simulateDelay();
  return (mockUsers as any[]).map(user => parseUserDates(user));
}

/**
 * Get a specific user by ID
 * @param id The user ID to look for
 * @returns Promise resolving to a User object or undefined if not found
 */
export async function getUserById(id: string): Promise<User | undefined> {
  await simulateDelay();
  const user = (mockUsers as any[]).find(user => user.id === id);
  return user ? parseUserDates(user) : undefined;
}

/**
 * Get users by role
 * @param role The user role to filter by
 * @returns Promise resolving to an array of matching User objects
 */
export async function getUsersByRole(role: UserRole): Promise<User[]> {
  await simulateDelay();
  const users = (mockUsers as any[]).filter(user => user.role === role);
  return users.map(user => parseUserDates(user));
}

/**
 * Get active users
 * @returns Promise resolving to an array of active User objects
 */
export async function getActiveUsers(): Promise<User[]> {
  await simulateDelay();
  const users = (mockUsers as any[]).filter(user => user.isActive);
  return users.map(user => parseUserDates(user));
} 
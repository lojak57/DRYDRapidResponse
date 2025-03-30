import { writable } from 'svelte/store';
import type { User } from '$lib/types/User';
import { Role } from '$lib/types/User';

// Mock current user (for demo purposes)
const mockUser: User = {
  id: 'user-1',
  firstName: 'John',
  lastName: 'Smith',
  email: 'john.smith@example.com',
  role: Role.ADMIN,
  phoneNumber: '555-123-4567',
  profileImageUrl: null,
  createdAt: new Date(),
  isActive: true
};

// Create a writable store for the current user
export const userStore = writable<User | null>(mockUser);

// Get current user from API/auth service
export async function getCurrentUser(): Promise<User | null> {
  // In a real app, this would fetch from an API or auth service
  return mockUser;
}

// Set the current user in the store
export function setCurrentUser(user: User | null) {
  userStore.set(user);
} 
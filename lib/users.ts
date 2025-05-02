// auth-backend/lib/users.ts

export type User = {
    email: string;
    password: string;
  };
  
  const users: User[] = [];
  
  export function registerUser(email: string, password: string): boolean {
    const exists = users.find((u) => u.email === email);
    if (exists) return false;
    users.push({ email, password });
    return true;
  }
  
  export function loginUser(email: string, password: string): boolean {
    return users.some((u) => u.email === email && u.password === password);
  }
  
  export function listUsers(): User[] {
    return users;
  }
  
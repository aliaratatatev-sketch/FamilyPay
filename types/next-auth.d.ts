import 'next-auth';
import { UserRole } from '@prisma/client';

declare module 'next-auth' {
  interface Session {
    user: {
      id: string;
      name?: string | null;
      email?: string | null;
      image?: string | null;
      role?: UserRole;
    };
  }

  interface User {
    id: string;
    role?: UserRole;
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    sub?: string;
    role?: UserRole;
  }
}

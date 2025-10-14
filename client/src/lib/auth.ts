import { signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut, User } from "firebase/auth";
import { auth } from "./firebase";

export interface AuthError {
  code: string;
  message: string;
}

export const signIn = async (email: string, password: string): Promise<User> => {
  try {
    const result = await signInWithEmailAndPassword(auth, email, password);
    return result.user;
  } catch (error: any) {
    // If user doesn't exist, try to create demo account for testing
    if (error.code === 'auth/user-not-found' && email.includes('@bolpurmart.delivery')) {
      try {
        console.log('Creating demo account for:', email);
        const createResult = await createUserWithEmailAndPassword(auth, email, password);
        return createResult.user;
      } catch (createError: any) {
        throw {
          code: createError.code,
          message: createError.message,
        } as AuthError;
      }
    }
    
    throw {
      code: error.code,
      message: error.message,
    } as AuthError;
  }
};

export const signOutUser = async (): Promise<void> => {
  try {
    await signOut(auth);
  } catch (error: any) {
    throw {
      code: error.code,
      message: error.message,
    } as AuthError;
  }
};

export const getAuthErrorMessage = (error: AuthError): string => {
  switch (error.code) {
    case 'auth/user-not-found':
      return 'No account found with this phone number.';
    case 'auth/wrong-password':
      return 'Incorrect password. Please try again.';
    case 'auth/invalid-email':
      return 'Invalid phone number format.';
    case 'auth/user-disabled':
      return 'This account has been disabled. Contact support.';
    case 'auth/too-many-requests':
      return 'Too many failed attempts. Please try again later.';
    default:
      return 'Sign in failed. Please try again.';
  }
};

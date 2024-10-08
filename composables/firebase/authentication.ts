import {
  signInWithEmailAndPassword,
  signOut,
  createUserWithEmailAndPassword,
  updateProfile,
  deleteUser,
  type AuthError,
  type User as FirebaseUser,
} from "firebase/auth";
import type { Login, SignUp, User } from "~/types";
export const useAuthentication = () => {
  const auth = useFirebaseAuth();
  const loading = useLoading();
  const route = useRoute();
  const notification = useNotification();

  async function signUp(data: SignUp) {
    try {
      loading.value = true;
      if (!auth) {
        throw new Error("Auth not initialised");
      }
      const result = await createUserWithEmailAndPassword(
        auth,
        data.email,
        data.password
      );

      await updateProfile(result.user, {
        displayName: data.name,
      });
      return {
        data: {
          email: result.user.email,
          displayName: result.user.displayName,
          id: result.user.uid,
        } as User,
      };
    } catch (e) {
      console.error(e);
      const error = e as AuthError;
      console.error(error);
      notification.error({
        id: error.code,
        description: error.message,
        title: error.name,
      });
      loading.value = false;
      return {
        error,
      };
    } finally {
      loading.value = false;
    }
  }

  async function signIn(data: Login) {
    try {
      loading.value = true;
      if (!auth) {
        throw new Error("Auth not initialised");
      }
      await signInWithEmailAndPassword(auth, data.email, data.password);
      notification.success({
        id: "signin",
        description: "User signed in successfully",
        title: "Success",
      });
      const redirect = route.query.redirect as string;

      navigateTo(redirect && redirect !== "/" ? redirect : "/dashboard");
    } catch (e) {
      console.error(e);
      const error = e as AuthError;
      console.error(error);
      notification.error({
        id: error.code,
        description: error.message,
        title: error.name,
      });
      loading.value = false;
    } finally {
      loading.value = false;
    }
  }

  async function deleteAccount(user: FirebaseUser) {
    try {
      loading.value = true;

      await deleteUser(user);

      navigateTo({
        path: "/login",
        query: { redirect: route.fullPath },
      });
    } catch (error) {
      console.error(error);
      const e = error as AuthError;
      
      if (e.code === "auth/requires-recent-login") {
        notification.error({
          id: e.code,
          description: 'Please re-authenticate to delete your account',
          title: e.name,
        });
      }
      loading.value = false;
    }
  }

  async function logOut() {
    try {
      loading.value = true;
      if (auth) await signOut(auth!);
      notification.success({
        id: "signout",
        description: "User signed out successfully",
        title: "Success",
      });

      navigateTo({
        path: "/login",
        query: {
          redirect: route.fullPath,
        },
      });
    } catch (e) {
      console.error(e);
      const error = e as AuthError;
      console.error(error);
      notification.error({
        id: error.code,
        description: error.message,
        title: error.name,
      });
    } finally {
      loading.value = false;
    }
  }
  return {
    signIn,
    signUp,
    logOut,
    deleteAccount,
  };
};

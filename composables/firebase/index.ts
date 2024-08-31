export const useFirebase = () => {
  const db = useDb();
  const auth = useAuthentication();
  const storage = useStorage();

  return { ...db, ...auth, ...storage };
};

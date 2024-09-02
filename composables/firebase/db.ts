import {
  collection,
  doc,
  deleteDoc,
  getDocs as firebaseGetDocs,
  getDoc as firebaseGetDoc,
  setDoc,
  query,
  updateDoc,
  arrayUnion,
  arrayRemove,
  QueryConstraint,
  where,
  orderBy,
  limit,
  startAfter,
  startAt,
  limitToLast,
  endBefore,
  endAt,
  type WhereFilterOp,
  Timestamp,
  addDoc,
  onSnapshot,
} from "firebase/firestore";

export const useDb = () => {
  const db = useFirestore();
  const loading = useLoading();

  function getDocs<T>({
    collectionName,
    queryConfig,
  }: {
    collectionName: string;
    queryConfig?: QueryConfig;
  }) {
    const queryConstraints = buildQueryConstraints(queryConfig || {});
    const collectionRef = query(
      collection(db, collectionName),
      ...queryConstraints
    );

    const { data, pending, error } = useCollection(collectionRef, {
      ssrKey: collectionName,
    });

    return {
      data: data as Ref<T[]>,
      pending: pending,
      error: error,
    };
  }

  // function to get doc from firestore
  function getDoc<T>({
    collectionName,
    id,
  }: {
    collectionName: string;
    id: string;
  }) {
    const docRef = computed(() => doc(collection(db, collectionName), id));
    const { data, pending, error } = useDocument(docRef);

    return {
      data: data as Ref<T>,
      pending: pending,
      error: error,
    };
  }

  // function to create data in firestore
  async function createDoc({
    collectionName,
    data,
    id,
  }: {
    collectionName: string;
    data: any;
    id?: string;
  }) {
    const date = formatDate(Timestamp.now().toDate());

    const newData = {
      ...data,
      createdAt: date,
      updatedAt: date,
    };
    try {
      loading.value = true;
      if (id) {
        await setDoc(doc(collection(db, collectionName), id), newData);
        return {
          data: id,
        };
      } else {
        const doc = await addDoc(collection(db, collectionName), newData);
        console.log("Document written with ID: ", doc.id);
        return {
          data: doc.id,
        };
      }
    } catch (error) {
      return {
        error: error as any,
      };
    } finally {
      loading.value = false;
    }
  }

  // function to update data in firestore
  async function modifyDoc({
    collectionName,
    data,
    id,
    arrayOperations,
  }: {
    collectionName: string;
    data?: any;
    id: string;
    arrayOperations?: {
      field: string;
      add?: any[];
      remove?: any[];
    }[];
  }) {
    const docRef = doc(collection(db, collectionName), id);
    try {
      loading.value = true;
      const date = formatDate(Timestamp.now().toDate());
      const updateData: any = { ...data, updatedAt: date };
      // General update
      await setDoc(docRef, updateData, { merge: true });

      // Array operations
      if (arrayOperations) {
        for (const operation of arrayOperations) {
          const { field, add, remove } = operation;
          if (add) {
            updateData[field] = arrayUnion(...add);
          }
          if (remove) {
            updateData[field] = arrayRemove(...remove);
          }
        }

        await updateDoc(docRef, updateData);
      }
    } catch (error) {
    } finally {
      loading.value = false;
    }
  }

  //function to delete data in firestore
  async function removeDoc({
    collectionName,
    id,
  }: {
    collectionName: string;
    id: string;
  }) {
    const docRef = doc(collection(db, collectionName), id);
    try {
      loading.value = true;
      await deleteDoc(docRef);
    } catch (error) {
    } finally {
      loading.value = false;
    }
  }

  async function fetchDocs<T>({
    collectionName,
    queryConfig,
  }: {
    collectionName: string;
    queryConfig?: QueryConfig;
  }) {
    const queryConstraints = buildQueryConstraints(queryConfig || {});
    const collectionRef = query(
      collection(db, collectionName),
      ...queryConstraints
    );

    const querySnapshot = await firebaseGetDocs(collectionRef);
    const data = querySnapshot.docs.map((doc) => {
      return {
        id: doc.id,
        ...doc.data(),
      };
    });

    return {
      data: data as T[],
    };
  }

  async function fetchDoc({
    collectionName,
    id,
  }: {
    collectionName: string;
    id: string;
  }) {
    try {
      const data = await firebaseGetDoc(
        doc(collection(db, collectionName), id)
      );
      return {
        data,
      };
    } catch (error) {
      return {
        error,
      };
    }
  }

  function subscribeToDoc({
    collectionName,
    id,
    onUpdate,
    onError,
  }: {
    collectionName: string;
    id?: string;
    onUpdate: (data: any) => void;
    onError: (error: any) => void;
  }) {
    try {
      if (!id) {
        // onError(new Error("Document ID is required"));
        return;
      }
      const docRef = doc(collection(db, collectionName), id);
      const unsubscribe = onSnapshot(
        docRef,
        (docSnapshot) => {
          if (docSnapshot.exists()) {
            onUpdate(docSnapshot.data());
          } else {
            onError(new Error("Document does not exist"));
          }
        },
        (error) => {
          onError(error);
        }
      );
      return unsubscribe;
    } catch (error) {
      onError(error);
    }
  }
  return {
    createDoc,
    getDoc,
    getDocs,
    modifyDoc,
    removeDoc,
    fetchDocs,
    fetchDoc,
    subscribeToDoc,
  };
};

interface QueryConfig {
  where?: Array<{
    fieldPath: string;
    opStr: WhereFilterOp;
    value: any;
  }>;
  orderBy?: Array<{
    fieldPath: string;
    directionStr?: "asc" | "desc";
  }>;
  limit?: number;
  startAfter?: any;
  startAt?: any;
  limitToLast?: number;
  endBefore?: any;
  endAt?: any;
}

function buildQueryConstraints(config: QueryConfig): QueryConstraint[] {
  const constraints: QueryConstraint[] = [];

  if (config.where) {
    config.where.forEach((condition) => {
      constraints.push(
        where(condition.fieldPath, condition.opStr, condition.value)
      );
    });
  }

  if (config.orderBy) {
    config.orderBy.forEach((order) => {
      constraints.push(orderBy(order.fieldPath, order.directionStr));
    });
  }

  if (config.limit) {
    constraints.push(limit(config.limit));
  }

  if (config.startAfter) {
    constraints.push(startAfter(config.startAfter));
  }

  if (config.startAt) {
    constraints.push(startAt(config.startAt));
  }

  if (config.limitToLast) {
    constraints.push(limitToLast(config.limitToLast));
  }

  if (config.endBefore) {
    constraints.push(endBefore(config.endBefore));
  }

  if (config.endAt) {
    constraints.push(endAt(config.endAt));
  }

  return constraints;
}

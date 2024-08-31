import type { Post, Site, User } from "~/types";

export const useGeneral = () => {
  const {
    fetchDoc,
    deleteFile,
    removeDoc,
    deleteAccount,
  } = useFirebase();
  const notification = useNotification();
  async function deleteCollectionItem<T>({
    collectionName,
    id,
    deleteItem,
  }: {
    collectionName: string;
    id: string;
    deleteItem: (id: string) => Promise<void>;
  }) {
    try {
      const { data } = await fetchDoc({ collectionName, id });

      if (data && data.exists()) {
        await deleteItem(id);
      }
    } catch (error: any) {
      notification.error({
        title: "Error",
        description: error.message,
        id: "error",
      });
    }
  }

  async function deleteItemsFromArray<T>({
    ids,
    deleteItem,
  }: {
    ids?: string[];
    deleteItem: (id: string) => Promise<void>;
  }) {
    if (ids) {
      await Promise.all(ids.map((id) => deleteItem(id)));
    }
  }

  async function deletePost(id: string) {
    await deleteCollectionItem<Post>({
      collectionName: "posts",
      id,
      deleteItem: async (id: string) => {
        try {
          const { data } = await fetchDoc({ collectionName: "posts", id });

          if (data && data.exists()) {
            const postData = data.data() as Post;

            if (postData.imageId) {
              await deleteFile({ path: `${postData.imageId}` });
            }

            await removeDoc({ collectionName: "posts", id: postData.id! });
          }
        } catch (error: any) {
          notification.error({
            title: "Error",
            description: error.message,
            id: "error",
          });
        }
      },
    });
  }

  async function deleteSite(id: string) {
    await deleteCollectionItem<Site>({
      collectionName: "sites",
      id,
      deleteItem: async (id: string) => {
        try {
          const { data } = await fetchDoc({ collectionName: "sites", id });

          if (data && data.exists()) {
            const siteData = data.data() as Site;

            await deleteItemsFromArray({
              ids: siteData.postIds,
              deleteItem: deletePost,
            });

            if (siteData.imageId) {
              await deleteFile({ path: `${siteData.imageId}` });
            }

            await removeDoc({ collectionName: "sites", id: siteData.id! });
          }
        } catch (error: any) {
          notification.error({
            title: "Error",
            description: error.message,
            id: "error",
          });
        }
      },
    });
  }

  async function deleteUserAccount() {
    const loading = useLoading();
    loading.value = true;
    const user = useCurrentUser();
    try {
      if (!user.value) return;

      const { data } = await fetchDoc({
        collectionName: "users",
        id: user.value.uid,
      });

      if (data && data.exists()) {
        const userData = data.data() as User;

        await deleteItemsFromArray({
          ids: userData.siteIds,
          deleteItem: deleteSite,
        });

        await deleteItemsFromArray({
          ids: userData.postIds,
          deleteItem: deletePost,
        });

        await removeDoc({ collectionName: "users", id: userData.id });
      }

      await deleteAccount(user.value);

      notification.success({
        title: "Success",
        description: "Account deleted successfully",
        id: "success",
      });
    } catch (error: any) {
      notification.error({
        title: "Error",
        description: error.message,
        id: "error",
      });
    } finally {
      loading.value = false;
    }
  }

  return {
    deleteCollectionItem,
    deleteItemsFromArray,
    deletePost,
    deleteSite,
    deleteUserAccount,
  };
};

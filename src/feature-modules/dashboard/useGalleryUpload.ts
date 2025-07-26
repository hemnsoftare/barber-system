// lib/hooks/useGalleryUpload.ts
import { addDoc, collection, limit, query } from "firebase/firestore";
import { db } from "@/lib/firebase"; // 👈 your Firestore instance
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { deleteDoc, doc, getDocs } from "firebase/firestore";

type GalleryItem = {
  imageUrl: string;
  favorite: number;
};

export const useUploadImage = () =>
  useMutation({
    mutationFn: async (imageUrl: string) => {
      const docRef = await addDoc(collection(db, "gallery"), {
        imageUrl,
      } as GalleryItem);
      return docRef.id;
    },
  });

interface PaginationParams {
  page: number;
  pageSize: number;
}

export const useGetGalleryImages = ({
  page = 1,
  pageSize = 10,
}: PaginationParams) => {
  return useQuery({
    queryKey: ["galleryImages", page, pageSize],
    queryFn: async () => {
      // Calculate how many documents to skip
      const skipCount = (page - 1) * pageSize;

      if (page === 1) {
        // First page - no need to skip
        const q = query(collection(db, "gallery"), limit(pageSize));

        const querySnapshot = await getDocs(q);
        const items = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        })) as Array<GalleryItem & { id: string }>;

        return {
          items,
          hasNextPage: querySnapshot.docs.length === pageSize,
          hasPreviousPage: false,
          totalPages: null, // We can't easily calculate total pages without additional queries
          currentPage: page,
        };
      } else {
        // For subsequent pages, we need to get all documents up to the current page
        // This is less efficient but necessary for true pagination without maintaining state
        const totalDocsToFetch = page * pageSize;

        const q = query(collection(db, "gallery"), limit(totalDocsToFetch));

        const querySnapshot = await getDocs(q);
        const allDocs = querySnapshot.docs;

        // Get only the documents for the current page
        const startIndex = skipCount;
        const endIndex = startIndex + pageSize;
        const pageItems = allDocs.slice(startIndex, endIndex);

        const items = pageItems.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        })) as Array<GalleryItem & { id: string }>;

        return {
          items,
          hasNextPage:
            allDocs.length === totalDocsToFetch && items.length === pageSize,
          hasPreviousPage: page > 1,
          totalPages: null,
          currentPage: page,
        };
      }
    },
    // Keep previous data while fetching new page
    placeholderData: (previous) => previous, // ← same behaviour as keepPreviousData: true
    // Optional: Add stale time to prevent unnecessary refetches
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

// Hook to delete an image
export const useDeleteImage = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      await deleteDoc(doc(db, "gallery", id));
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["galleryImages"] });
    },
  });
};

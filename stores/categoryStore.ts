// stores/useCategoryStore.ts
import { defineStore } from "pinia";
import { ref, computed } from "vue";
import { type Category } from "@/types/interfaces";

export const useCategoryStore = defineStore("categories", () => {
  const categories = ref<Category[]>([]);
  const loading = ref(false);
  const error = ref<string | null>(null);

  // Getters
  const getCategoryById = computed(() => {
    return (id: number): Category | undefined =>
      categories.value.find((category) => category.id === id);
  });

  const activeCategories = computed((): Category[] => {
    return categories.value.sort((a, b) => a.name.localeCompare(b.name));
  });

  const categoryOptions = computed(() => {
    return categories.value.map((category) => ({
      value: category.id,
      label: category.name,
    }));
  });

  // Actions
  const fetchCategories = async () => {
    loading.value = true;
    try {
      const response = await fetch("/api/categories");
      categories.value = await response.json();
    } catch (e) {
      error.value = e instanceof Error ? e.message : "An error occurred";
    } finally {
      loading.value = false;
    }
  };

  const createCategory = async (categoryData: Partial<Category>) => {
    loading.value = true;
    try {
      const response = await fetch("/api/categories", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(categoryData),
      });
      const newCategory = await response.json();
      categories.value.push(newCategory);
      return newCategory;
    } catch (e) {
      error.value = e instanceof Error ? e.message : "An error occurred";
      throw e;
    } finally {
      loading.value = false;
    }
  };

  const updateCategory = async (id: number, updates: Partial<Category>) => {
    loading.value = true;
    try {
      const response = await fetch(`/api/categories/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updates),
      });
      const updatedCategory = await response.json();
      const index = categories.value.findIndex(
        (category) => category.id === id
      );
      if (index !== -1) {
        categories.value[index] = updatedCategory;
      }
      return updatedCategory;
    } catch (e) {
      error.value = e instanceof Error ? e.message : "An error occurred";
      throw e;
    } finally {
      loading.value = false;
    }
  };

  const deleteCategory = async (id: number) => {
    loading.value = true;
    try {
      await fetch(`/api/categories/${id}`, {
        method: "DELETE",
      });
      const index = categories.value.findIndex(
        (category) => category.id === id
      );
      if (index !== -1) {
        categories.value.splice(index, 1);
      }
    } catch (e) {
      error.value = e instanceof Error ? e.message : "An error occurred";
      throw e;
    } finally {
      loading.value = false;
    }
  };

  return {
    // State
    categories,
    loading,
    error,
    // Getters
    getCategoryById,
    activeCategories,
    categoryOptions,
    // Actions
    fetchCategories,
    createCategory,
    updateCategory,
    deleteCategory,
  };
});

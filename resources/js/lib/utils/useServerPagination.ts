// hooks/useServerPagination.ts
import { router } from '@inertiajs/react';

export const useServerPagination = () => {
    const goToPage = (page: number, perPage: number) => {
        router.visit(`?page=${page}&per_page=${perPage}`, {
            preserveScroll: true,
            preserveState: true,
        });
    };

    return { goToPage };
};

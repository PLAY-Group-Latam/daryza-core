import { CategorySelect } from '@/types/products/categories';

export function flattenTree(
    nodes: CategorySelect[],
    acc: CategorySelect[] = [],
): CategorySelect[] {
    for (const node of nodes) {
        acc.push(node);
        if (node.children?.length) {
            flattenTree(node.children, acc);
        }
    }
    return acc;
}

export function filterTree(
    nodes: CategorySelect[],
    term: string,
): CategorySelect[] {
    const lower = term.toLowerCase();

    return nodes
        .map((node) => {
            const matchesSelf = node.name.toLowerCase().includes(lower);
            const filteredChildren = node.children
                ? filterTree(node.children, term)
                : [];

            if (matchesSelf || filteredChildren.length) {
                return {
                    ...node,
                    children: filteredChildren,
                };
            }

            return null;
        })
        .filter(Boolean) as CategorySelect[];
}

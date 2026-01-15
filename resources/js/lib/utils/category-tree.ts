import { CategorySelect } from '@/types/products';

export function flattenTree(
    nodes: CategorySelect[],
    acc: CategorySelect[] = [],
): CategorySelect[] {
    for (const node of nodes) {
        acc.push(node);
        if (node.active_children?.length) {
            flattenTree(node.active_children, acc);
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
            const filteredChildren = node.active_children
                ? filterTree(node.active_children, term)
                : [];

            if (matchesSelf || filteredChildren.length) {
                return {
                    ...node,
                    active_children: filteredChildren,
                };
            }

            return null;
        })
        .filter(Boolean) as CategorySelect[];
}

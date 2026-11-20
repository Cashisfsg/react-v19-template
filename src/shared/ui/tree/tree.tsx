type RecursiveNode<T> = {
    nodes?: T[];
};

export interface RecursiveTree<T> extends RecursiveNode<T> {}

interface TreeProps<Node extends RecursiveNode<Node>>
    extends Omit<React.ComponentProps<"ul">, "role"> {
    renderItem: (item: Node) => React.ReactNode;
    nodes: Node[];
}

export const Tree = <T extends RecursiveNode<T>>({
    nodes,
    renderItem,
    ...props
}: TreeProps<T>) => {
    return (
        <ul
            {...props}
            role="tree"
        >
            {nodes.map((node, i) => (
                <li
                    key={i}
                    role="treeitem"
                    aria-selected={false}
                    aria-haspopup={
                        Array.isArray(node.nodes) && node.nodes.length !== 0
                            ? "tree"
                            : undefined
                    }
                >
                    {renderItem(node)}
                    {node.nodes ? (
                        <Tree<T>
                            nodes={node.nodes}
                            renderItem={renderItem}
                        />
                    ) : null}
                </li>
            ))}
        </ul>
    );
};

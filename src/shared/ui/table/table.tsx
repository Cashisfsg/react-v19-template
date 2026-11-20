import React, { createContext, use } from "react";

type TableComponents = {
    Table?: React.ComponentType<React.ComponentPropsWithoutRef<"table">>;
    Thead?: React.ComponentType<React.ComponentPropsWithoutRef<"thead">>;
    Tr?: React.ComponentType<React.ComponentPropsWithoutRef<"tr">>;
    Th?: React.ComponentType<React.ComponentPropsWithoutRef<"th">>;
    Td?: React.ComponentType<React.ComponentPropsWithoutRef<"td">>;
};

const TableContext = createContext<TableComponents>({});

const useTableContext = () => {
    return use(TableContext);
};

type TableProps<H extends (string | number)[], D extends object[]> = {
    headers: H;
    data: D;
    caption?: React.ReactNode;
    renderHeader?: (headers: H) => React.ReactElement;
    renderBody?: (data: D) => React.ReactElement;
    renderFooter?: (data: D) => React.ReactElement;
    components?: TableComponents;
} & React.ComponentProps<"table">;

export const Table = <H extends (string | number)[], D extends object[]>({
    headers,
    data,
    caption,
    renderHeader = headers => (
        <TableRow>
            {headers.map(header => (
                <td key={header}>{header}</td>
            ))}
        </TableRow>
    ),
    renderBody = data =>
        data.map((row, i) => (
            <TableRow key={i}>
                {Object.values(row).map((cell, j) => (
                    <TableCell key={j}>{cell}</TableCell>
                ))}
            </TableRow>
        )),
    renderFooter,
    components = {},
    ...props
}: TableProps<H, D>) => {
    return (
        <TableContext.Provider value={components}>
            <table {...props}>
                {caption ? caption : null}
                <thead>{renderHeader(headers)}</thead>
                <tbody className="text-sm">{renderBody(data)}</tbody>
                {renderFooter ? <tfoot>{renderFooter(data)}</tfoot> : null}
            </table>
        </TableContext.Provider>
    );
};

interface TableRowProps extends React.ComponentProps<"tr"> {}

const TableRow: React.FC<TableRowProps> = props => {
    const { Tr } = useTableContext();

    if (!Tr) return <tr {...props} />;

    const element = typeof Tr === "function" ? <Tr {...props} /> : Tr;

    return React.cloneElement(element, {
        ...props,
        className: [element.props.className, props.className]
            .filter(Boolean)
            .join(" "),
        style: { ...element.props.style, ...props.style }
    });
};

interface TableCellProps extends React.ComponentProps<"td"> {}

const TableCell: React.FC<TableCellProps> = props => {
    const { Td } = useTableContext();

    if (!Td) return <td {...props} />;

    if (React.isValidElement(Td)) {
        return React.cloneElement(Td, { ...Td.props, ...props });
    }

    return React.createElement(Td, props);
};

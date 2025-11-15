// Все ключевые слова взяты из MDN (physical / logical / coordinate / self / span / span-all).
// Источник: MDN <position-area> value (Physical / Logical / Coordinate / span-all sections).
// https://developer.mozilla.org/.../position-area_value#physical_grid_keywords (см. разделы)

/////////////////////
// PHYSICAL keywords
/////////////////////
type PhysicalColumn =
    | "left"
    | "center"
    | "right"
    // physical column spans / coordinate-x / self-x forms (as listed in MDN)
    | "span-left"
    | "span-right"
    | "x-start"
    | "x-end"
    | "span-x-start"
    | "span-x-end"
    | "self-x-start"
    | "self-x-end"
    | "span-self-x-start"
    | "span-self-x-end";

type PhysicalRow =
    | "top"
    | "center"
    | "bottom"
    // physical row spans / coordinate-y / self-y forms (as listed in MDN)
    | "span-top"
    | "span-bottom"
    | "y-start"
    | "y-end"
    | "span-y-start"
    | "span-y-end"
    | "self-y-start"
    | "self-y-end"
    | "span-self-y-start"
    | "span-self-y-end";

/////////////////////
// LOGICAL keywords (explicit block/inline + self-block/self-inline + span-variants)
/////////////////////
type ExplicitBlock =
    | "block-start"
    | "center"
    | "block-end"
    | "span-block-start"
    | "span-block-end";

type ExplicitInline =
    | "inline-start"
    | "center"
    | "inline-end"
    | "span-inline-start"
    | "span-inline-end";

type SelfBlock =
    | "self-block-start"
    | "self-block-end"
    | "span-self-block-start"
    | "span-self-block-end";

type SelfInline =
    | "self-inline-start"
    | "self-inline-end"
    | "span-self-inline-start"
    | "span-self-inline-end";

/////////////////////
// GENERIC logical keywords (generic row/column)
/////////////////////
type GenericLogical = "start" | "center" | "end" | "span-start" | "span-end";

type SelfGenericLogical =
    | "self-start"
    | "center"
    | "self-end"
    | "span-self-start"
    | "span-self-end";

/////////////////////
// span-all (valid with all types)
/////////////////////
type SpanAll = "span-all";

/////////////////////
// Coordinate keywords shorthand (x/y synonyms sometimes used in MDN)
/////////////////////
type CoordinateX =
    | "x-start"
    | "center"
    | "x-end"
    | "span-x-start"
    | "span-x-end";

type CoordinateY =
    | "y-start"
    | "center"
    | "y-end"
    | "span-y-start"
    | "span-y-end";

/////////////////////
// SINGLE value (any single keyword that is valid alone)
/////////////////////
export type PositionAreaSingle =
    | PhysicalColumn
    | PhysicalRow
    | ExplicitBlock
    | ExplicitInline
    | SelfBlock
    | SelfInline
    | GenericLogical
    | SelfGenericLogical
    | CoordinateX
    | CoordinateY
    | SpanAll;

/////////////////////
// PAIR value — допустимые пары по MDN:
// - physical row + physical column (в любом порядке)
// - explicit block + explicit inline (в любом порядке)
// - self-block + self-inline (в любом порядке)
// - span variants allowed to pair with axis of the other dimension (e.g. "inline-start span-block-end")
// - generic logical can be 1 or 2 tokens (start end) or mixed generic/span etc.
// - coordinate forms follow same axis pairing rules
//
// Обратите внимание: MIXING (physical + logical) — invalid per spec (MDN explicitly).
/////////////////////

// Physical pairs (row <> column) — both orders
type PhysicalPair =
    | `${PhysicalRow} ${PhysicalColumn}`
    | `${PhysicalColumn} ${PhysicalRow}`
    // allow span-all combinations with physical tokens
    | `${PhysicalRow} ${SpanAll}`
    | `${PhysicalColumn} ${SpanAll}`
    | `${SpanAll} ${PhysicalRow}`
    | `${SpanAll} ${PhysicalColumn}`;

// Explicit logical pairs (block <> inline) — both orders
type ExplicitLogicalPair =
    | `${ExplicitBlock} ${ExplicitInline}`
    | `${ExplicitInline} ${ExplicitBlock}`
    | `${SelfBlock} ${SelfInline}`
    | `${SelfInline} ${SelfBlock}`;

// Generic logical pairs: one or two generic tokens (MDN allows 1 or 2)
type GenericSingleOrPair =
    | GenericLogical
    | `${GenericLogical} ${GenericLogical}`
    | SelfGenericLogical
    | `${SelfGenericLogical} ${SelfGenericLogical}`
    | `${GenericLogical} ${SpanAll}`
    | `${SelfGenericLogical} ${SpanAll}`
    | `${SpanAll} ${GenericLogical}`
    | `${SpanAll} ${SelfGenericLogical}`;

// Coordinate pairs (x <> y) — both orders
type CoordinatePair =
    | `${CoordinateY} ${CoordinateX}`
    | `${CoordinateX} ${CoordinateY}`
    | `${CoordinateY} ${SpanAll}`
    | `${CoordinateX} ${SpanAll}`;

// Span-opposite axis cases (e.g. "inline-start span-block-end", "top span-left")
type SpanOpposite =
    | `${ExplicitInline} ${ExplicitBlock}` // already covered by ExplicitLogicalPair but keep for clarity
    | `${ExplicitBlock} ${ExplicitInline}`
    // allow inline axis token + span-block-* etc.
    | `${ExplicitInline} ${BlockSpan}` // BlockSpan is referenced below
    | `${ExplicitBlock} ${InlineSpan}`;

// helper unions (explicit span types per axis)
type BlockSpan =
    | "span-block-start"
    | "span-block-end"
    | "span-self-block-start"
    | "span-self-block-end";
type InlineSpan =
    | "span-inline-start"
    | "span-inline-end"
    | "span-self-inline-start"
    | "span-self-inline-end";

// Final PositionArea type: single or allowed pair combinations
export type PositionArea =
    | PositionAreaSingle
    | PhysicalPair
    | ExplicitLogicalPair
    | GenericSingleOrPair
    | CoordinatePair
    | SpanOpposite
    // explicit span <> axis mixed forms
    | `${ExplicitInline} ${BlockSpan}`
    | `${ExplicitBlock} ${InlineSpan}`
    | `${InlineSpan} ${ExplicitBlock}`
    | `${BlockSpan} ${ExplicitInline}`
    // allow span-all mixed combinations
    | `${SpanAll} ${PositionAreaSingle}`
    | `${PositionAreaSingle} ${SpanAll}`;

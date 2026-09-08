import "@tanstack/react-table";

declare module "@tanstack/react-table" {
  /**
   * Extra per-column metadata.
   *
   * `label` is the human name shown in the Toggle columns panel; without it
   * the panel would list raw ids like "customerName" and "landTime".
   */
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  interface ColumnMeta<TData extends RowData, TValue> {
    label?: string;
  }
}

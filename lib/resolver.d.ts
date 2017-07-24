export declare namespace resolver {
    const lookups: string[];
    /**
     * Search for modules
     *
     * @export
     * @param {string} prefix
     * @returns
     */
    function lookup(prefix: string): Promise<{
        path: string | null;
        pkgjson: any;
    }[]>;
}

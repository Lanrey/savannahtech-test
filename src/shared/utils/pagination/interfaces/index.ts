export interface IPaginationOptions {
    /**
     * the amount of items to be requested per page
     */
    size: number;
    /**
     * the page that is requested
     */
    page: number;
    /**
     * a babasesic route for generating links (i.e., WITHOUT query params)
     */
    route?: string;
  }
  
  export interface IPaginationMeta {
    /**
     * the total amount of items
     */
    total: number;
    /**
     * the amount of items that were requested per page
     */
    perPage: number;
    /**
     * the current page this paginator "points" to
     */
    page: number;
    /**
     * the total amount of pages in this paginator
     */
    totalPages: number;
  }
  
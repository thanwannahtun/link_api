export interface QueryResult<T> {
               data: T;
}

export interface ApiResponse<T> {
               data?: T;
               error: any;
               message: string;
               status: number;
}


import * as sql from 'mssql';
export declare function getPool(): Promise<sql.ConnectionPool>;
export declare function writeToUsers(data: any): Promise<boolean>;
export declare function updateToUsers(data: any): Promise<boolean>;
export declare function writeOrUpdateUser(data: any): Promise<boolean>;
export declare function writeToTodos(data: any): Promise<boolean>;
export declare function updateToTodos(data: any): Promise<boolean>;
export declare function writeOrUpdateTodo(data: any): Promise<boolean>;
export declare function writeToServiceAppConfig(data: any): Promise<boolean>;

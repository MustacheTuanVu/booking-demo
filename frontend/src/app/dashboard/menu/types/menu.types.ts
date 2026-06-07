// /types/menu.types.ts

// Enums
export enum MenuOrderTypeEnum {
    COMBO = 'COMBO',
    UPSALE = 'UPSALE'
  }
  
  export enum Status {
    ACTIVE = 'ACTIVE',
    INACTIVE = 'INACTIVE'
  }
  
  export enum TypeItem {
    FOOD = 'FOOD',
    DRINK = 'DRINK'
  }
  
  // Interfaces
  export interface MenuOrder {
    _id: string;
    name: string;
    description: string;
    type: MenuOrderTypeEnum;
    image?: string;
    items: string[];
    status: Status;
    createdAt: string;
    updatedAt: string;
    FOOD?: MenuItem[];
    DRINK?: MenuItem[];
  }
  
  export interface MenuItem {
    _id: string;
    name: string;
    desc: string;
    ingredient?: string;
    category_id: any;
    type: TypeItem;
    unit: string;
    image?: string;
    status: Status;
    price: number;
    flavor?: any[];
  }
  
  export interface MenuOrderResponse {
    menuOrder: MenuOrder[];
    total: number;
    totalPages: number;
    currentPage: number;
  }
  
  export interface MenuItemResponse {
    menuItem: MenuItem[];
    total: number;
    totalPages: number;
    currentPage: number;
  }
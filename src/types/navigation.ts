// src/types/navigation.ts
export type RootStackParamList = {
    Login: undefined;
    Register: undefined;
    Home: undefined;
    ProductDetail: { slug: string };
    CategoryDetail: { slug: string };
  };
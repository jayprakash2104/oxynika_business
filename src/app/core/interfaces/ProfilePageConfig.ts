export interface ProfilePageConfig {
  id: number | string;
  pageTitle: string;

  sections: {
    meta: boolean;
    address: boolean;
    security: boolean;
    dangerZone: boolean;
  };
}
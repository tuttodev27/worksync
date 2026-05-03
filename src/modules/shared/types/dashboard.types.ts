// AuthUser type imported from shared/types/auth.type.ts as needed

export interface StatProps {
  label: string;
  value: number;
  sub: string;
  color: string;
  bg: string;
  icon: React.ReactNode;
}

export interface CrudCardProps {
  title: string;
  desc: string;
  count: string;
  to: string;
  color: string;
  bg: string;
  topGrad: string;
  icon: React.ReactNode;
}

export interface Stat {
  label: string;
  value: number;
  sub: string;
  color: string;
  bg: string;
  icon: React.ReactNode;
}

export interface CrudCardData {
  title: string;
  desc: string;
  count: string;
  to: string;
  color: string;
  bg: string;
  topGrad: string;
  icon: React.ReactNode;
}

export type PageTitleMap = Record<string, string>;

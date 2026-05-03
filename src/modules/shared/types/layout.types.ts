import { AuthUser } from '../../../shared/types/auth.type';

export type PageTitleMap = Record<string, string>;

export interface NavLinkProps {
  to: string;
  label: string;
  icon: React.ReactNode;
  end?: boolean;
}

export interface NavSection {
  section: string;
  links: NavLinkProps[];
}

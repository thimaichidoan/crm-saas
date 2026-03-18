export type DealStage =
  | "NEW"
  | "QUALIFIED"
  | "PROPOSAL"
  | "NEGOTIATION"
  | "WON"
  | "LOST";

export type Deal = {
  id: number;
  title: string;
  description?: string | null;
  value: number;
  stage: DealStage;
  company?: number | null;
  company_name?: string | null;
  contact?: number | null;
  contact_name?: string | null;
  owner?: number | null;
  owner_username?: string | null;
  expected_close_date?: string | null;
  is_active?: boolean;
  created_at?: string;
  updated_at?: string;
};

export type DealFormData = {
  title: string;
  description: string;
  value: string;
  stage: DealStage;
  contact: string;
  company: string;
  expected_close_date: string;
  is_active: boolean;
};
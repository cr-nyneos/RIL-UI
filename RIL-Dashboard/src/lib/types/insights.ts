export type OpportunityPriority = 'Critical' | 'High' | 'Medium' | 'Low';

export type OpportunityStatus = 'Backlog' | 'In Progress' | 'In Review' | 'Completed' | 'On Hold';

export type OpportunityImpact = 'High' | 'Medium' | 'Low';

export type OpportunityDepartment =
  | 'Procurement'
  | 'Site Operations'
  | 'Quality'
  | 'Finance'
  | 'Security'
  | 'Governance';

export interface Opportunity {
  id: string;
  title: string;
  department: OpportunityDepartment;
  priority: OpportunityPriority;
  owner: string;
  status: OpportunityStatus;
  impact: OpportunityImpact;
  lastUpdated: string;
}

export interface GropiusIssue {
  title: string;
  body?: string;
  components: string[]; //type will be replaced by ID[] where ID is the ID of the components later on
  category?: any; //type will be replaced by IssueCategory later on
  labels?: string[]; //type will be replaced by ID[] where ID is the ID of the components later on
  assignees?: string[]; //type will be replaced by ID[] where ID is the ID of the components later on
  locations?: string[]; //type will be replaced by ID[] where ID is the ID of the components later on
  startDate?: number; //type will be replaced by Date
  dueDate?: number; //type will be replaced by Date
  estimatedTime?: number; //type will be replaced by TimeSpan
  clientMutationID?: string;
}

export interface GropiusProject {
  id: string;
  name: string;
  description: string;
  components: GropiusComponent[];
}

export interface GropiusComponent {
  id: string;
  name: string;
  description;
}

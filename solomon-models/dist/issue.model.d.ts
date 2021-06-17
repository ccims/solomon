export interface GropiusIssue {
    title: string;
    body?: string;
    componentIDs: string[];
    category?: any;
    labels?: string[];
    assignees?: string[];
    locations?: string[];
    startDate?: number;
    dueDate?: number;
    estimatedTime?: number;
    clientMutationID?: string;
}

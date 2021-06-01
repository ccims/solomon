export interface Target {
    targetName: string;
    targetId: string; // can be either an ID such as Amazon Resource Name (ARN) or an URL for Kubernetes services
    targetDescription?: string; // an optional user-defined description of the target
}
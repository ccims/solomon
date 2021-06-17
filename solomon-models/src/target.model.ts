export interface Target {
    targetName: string; // the name of the target, can in some cases (e.g. AWS Lambda function) be enough to identify the target
    targetId: string; // can be either an ID such as Amazon Resource Name (ARN) or an URL for Kubernetes services
    targetDescription?: string; // an optional user-defined description of the target
}
import { ParamsListMetrics } from './cw.interface'

export class CwCallParams {
    static paramsLog: ParamsListMetrics = {
        Dimensions: [
            {
            Name: 'LogGroupName', /* required */
            },
        ],
        MetricName: 'IncomingLogEvents',
        Namespace: 'AWS/Logs'
    }

    static paramsLambda: ParamsListMetrics = {
        // Dimensions: [
        //     {
        //     Name: 'FunctionName', // name of the Lambda Function  also possible: 'Resource'
        //     Value: 'testConnectToDbVariants' 
        //     },
        // ],
        // MetricName: 'Invocations', // possible: ConcurrentExecutions, Duration, Errors, Invocations, Throttles, UnreservedConcurrentExecutions
        Namespace: 'AWS/Lambda'
    }

    static paramsApiGateway: ParamsListMetrics = {
        // Dimensions: [
        //     {
        //     Name: 'ApiName', // name of the API
        //     Value: 'owner-api' // 
        //     },
        // ],
        // MetricName: 'Latency', // possible: IntegrationLatency, Count, 5XXError, 4XXError, Latency
        Namespace: 'AWS/ApiGateway'
    }

    static paramsS3: ParamsListMetrics = {
        // Dimensions: [
        //     {
        //     Name: 'BucketName', // name of the bucket
        //     Value: 'cdktoolkit-stagingbucket-iezgkdln7wt6' // a few others also exist ...
        //     },
        // ],
        // MetricName: 'BucketSizeBytes', // possible: BucketSizeBytes, NumberOfObjects
        Namespace: 'AWS/S3'
    }
}
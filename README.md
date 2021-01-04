## Foundations/Required Technologies

- Prometheus 
    - Read https://prometheus.io/docs/prometheus/latest/getting_started/
    - Add targets to be scraped
    - Define Alert Rules
    - Read about Alertmanager, Exporters and Blackbox Exporter
- Docker Basics: What are containers? What is `Dockerfile`
- Kubernetes Basics
    - Learn about Pods, Deployments, Services, Custom Resources Definitions (CRD
    - Learn about Helm Charts
- Frameworks React.JS and Nest.JS are being using but it is probably sufficient to know basics of JavaScript to understand the current code
- Learn about current System by reading and executing the following instructions

## Steps to Setup Kubernetes Cluster with SLA Management

Install Minikube to run a local Kubernetes cluster. Following steps uses Minikube and Helm.

1. Create new Minikube profile

`minikube start -p sla-management --cpus=2 --memory=2048`

2. Install kube-prometheus-stack helm chart with prometheus values. This sets up a basic prometheus environment

`helm repo add prometheus-community https://prometheus-community.github.io/helm-charts` then

`helm install prometheus prometheus-community/kube-prometheus-stack  -f ./prometheus-operator-values.yaml`

3. Apply kubernetes resources in `kubernetes-environment` folder. This create sla-manager and nodejs-demo-client deployment & service and set roles.

`kubectl apply -f .`

4. Install Blackbox Exporter Helm Chart with values

`helm install blackbox-exporter prometheus-community/prometheus-blackbox-exporter -f ./blackbox-exporter-values.yaml`


Explanations: You have set up a kubernetes cluster, configures the prometheus operator, that is used to monitor pods of the cluster. You created deployments and services for 

1. `nodejs-demo-client`, a dummy server to be monitored by prometheus. This server exports metrics that can be monitored by prometheus. This is the common way to monitor applications with prometheus but it requires configuration on the application itself which is not optimal for our system. To solve this, we use the Blackbox Exporter to monitor Applications. This is a "prober" that sends HTTP request to the configured applications to check availability and response times (and more). 

2. As the name says, `sla-manager` manages the configured SLA's. It converts existing SLA's to prometheus rules using the `prometheusrules` CRD, which is being applied via the Kubernetes API (the "programmatically" method of defining a yaml rules file (see example `sla-rules.yaml`)). See `sla-rules.service.ts` in the `sla-manager/src` directory. It also handles the "Gropius Issue Creation", when a Prometheus Alert Rule get triggered, the Alert Manager is configured to send fired Alerts to the sla-manager service via webhooks. See `issue-manager.service.ts`.

3. The `sla-manager-frontend` is where you can configure SLA's.



## How to use the System (provisionally)

Use port-forward to access sla-manager and sla-manager-frontend

`kubectl port-forward [Sla manager pod] 6400`

`kubectl port-forward [Sla Manager Frontend Pod] 3000`

Get familiar with Gropius. Start Backend and Frontend. Instructions at the corresponding Repos.

Now you can configure SLA Rules (by default one Rule is already configured).

Access prometheus to see the configured SLA Rules in action (names of pods might be different for you):

`kubectl port-forward prometheus-prometheus-kube-prometheus-prometheus-0 9090`

Also checkout Alert Manager and Blackbox Exporter

`kubectl port-forward alertmanager-prometheus-kube-prometheus-alertmanager-0 9093`

`kubectl port-forward blackbox-exporter-prometheus-blackbox-exporter-d94fc99c5-j8gn5 9115`

You can simulate an unavailable service by rescaling to 0 pods like this.

`kubectl scale --replicas=0 deployment/nodejs-client-deploy`

Now you will see the Alert Rules go to state `Active` (yellow) and the `Fire` (red), which means the Alert was triggered and send to SLA Manager via the Alertmanager. See logs of Alertmanager to check if it recieved the triggered Alerts:

`kubectl logs [SLA Manager Pod]`



# Current Issues and TODOs

- [ ] SlaRule Serialization: When shutting down sla-manager, SLA's are not persistent and such not available when restarting service
- [ ] Blackbox Exporter needs probe targets configured in blackbox-exporter-values.yaml, solution: Probe crd but setup not working yet




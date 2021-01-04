# Commands
./prometheus --config.file=prometheus.yml
./alertmanager --config.file=alertmanager.yml

## Docker

docker build . -t jxnasw/nodejs-client:v3
docker push jxnasw/nodejs-client:v3

## Kubernetes

kubectl apply -n sla-issue-creation -f ./deployment.yaml (or service.yaml)

kubectl -n sla-issue-creation get pods

kubectl -n sla-issue-creation get svc

kubectl -n sla-issue-creation logs nodejs-client-deploy-8475f5d767-cmt8s

kubectl -n sla-issue-creation port-forward nodejs-client-deploy-8475f5d767-cmt8s 5000 (Port forwarding when ClusterIP)

kubectl -n sla-issue-creation delete svc nodejs-client-deploy

kubectl -n sla-issue-creation describe pod mongodb-deployment-8f6675bc5-mqxfs

minikube tunnel (Makes LoadBalancing work on machine, why is that needed? Whats the difference to real kubernetes?)

minikube -n sla-issue-creation service mongo-express-service

# Prometheus & helm

helm install stable/prometheus-operator --namespace=sla-issue-creation --generate-name

kubectl -n sla-issue-creation describe statefulset prometheus-prometheus-operator-160275-prometheus > prometheus.yaml

kubectl -n sla-issue-creation port-forward deployment/prometheus-operator-1602753506-grafana 3000

kubectl -n sla-issue-creation port-forward prometheus-prometheus-operator-160275-prometheus-0 9090

kubectl -n sla-issue-creation get prometheuses.monitoring.coreos.com -oyaml

From prometheuses.monitoring.coreos.com (CRD):

    serviceMonitorSelector:
        matchLabels:
            release: prometheus-operator-1602753506

kubectl -n sla-issue-creation get servicemonitor prometheus-operator-160275-node-exporter -oyaml

From servicemonitor prometheus-operator-160275-node-exporter:

  labels:
    release: prometheus-operator-1602753506 <---- This adds prometheus-operator-160275-node-exporter to serviceMonitorSelector in prometheuses.monitoring.coreos.com, this makes prometheus scrape the node exporter


https://github.com/prometheus-community/helm-charts/tree/main/charts/prometheus-mongodb-exporter <-- Also installs MongoDb itself, so useless for me?


kubectl -n sla-issue-creation get servicemonitor nodejs-client-servicemonitor -o yaml


helm upgrade -f values.yaml prometheus-operator-1602753506 stable/prometheus-operator --namespace=sla-issue-creation

helm install [RELEASE_NAME] prometheus-community/kube-prometheus-stack


minikube start --profile prometheus-profile-stable

minikube start --profile prometheus

minikube start -p prometheus2  --cpus=2 --memory=2048


kubectl scale --replicas=0 deployment/<your-deployment>
kubectl scale --replicas=0 deployment/nodejs-client-deploy
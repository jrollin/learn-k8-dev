# Ingress

## Objectif 

## Ingress et Ingress Controller

Ingress (ou une entrée réseau), expose les routes HTTP et HTTPS de l'extérieur du cluster à des services au sein du cluster. 
Le routage du trafic est contrôlé par des règles définies sur la ressource Ingress.

```bash
    internet
        |
   [ Ingress ]
   --|-----|--
   [ Services ]
```

Un contrôleur d'Ingress est responsable de l'exécution de l'Ingress, généralement avec un load-balancer (équilibreur de charge),

> Un ingress sans controller n'a aucun effet 


Attention : 

un cluster déployé dans une VM comme vagrant ne peut pas fournir un service de type `Loadbalancer` 
On utilisera un service de type `Nodeport`  


## Helm

[HELM](https://helm.sh/) est un gestionnaire de paquet pour K8. 
Un package s'appelle un `chart` et peut dépendre d'autres `chart` 

Helm utilise un système de modèles basé sur le modèle Go pour rendre les manifestes Kubernetes à partir de charts.
Un chart est une structure cohérente séparant les modèles et les valeurs.

Vous pouvez trouver des charts sur [https://artifacthub.io](https://artifacthub.io/) 

Pour continuer l'atelier, on utilisera un Helm chart pour simplifier l'installation d'un Ingress Controller

[Suivre la procédure d'innstallation d'Helm](https://helm.sh/docs/intro/install/)


### HAProxy Ingress Controller

On va utiliser Helm pour installer notre ingress controller

[HAProxy Ingress](https://github.com/haproxy-ingress/charts/tree/master/haproxy-ingress)

Comment nous devons changer le type de service utilisé par HAProxy, nous allons surcharger la config ` haproxy-ingress-values.yaml` 

```yaml
controller:
    hostNetwork: true
    service:
      type: NodePort

```
Déploiement de l'ingress controller

```bash
helm install haproxy-ingress haproxy-ingress/haproxy-ingress  --create-namespace --namespace ingress-controller   -f haproxy-ingress-values.yaml
```
> Nb: L'ingress controller est déployé dans un namespace différent mais peut intéragir sur tous les namepaces

### Deploy and expose

Deployer une image sur le port 8080

```bash
k create deployment echoserver --image k8s.gcr.io/echoserver:1.3
k expose deployment echoserver --port=8080
```

Vérification du pod déployé 

```bash
k get pods -o wide
```

Vérification du service

```bash
k describe svc echoserver

Name:              echoserver
Namespace:         learnk8
Labels:            app=echoserver
Annotations:       <none>
Selector:          app=echoserver
Type:              ClusterIP
IP Family Policy:  SingleStack
IP Families:       IPv4
IP:                172.17.30.240
IPs:               172.17.30.240
Port:              <unset>  8080/TCP
TargetPort:        8080/TCP
Endpoints:         172.16.158.27:8080
Session Affinity:  None
Events:            <none>
```

Création de la règle Ingress 

```bash
k create ingress echoserver  --annotation kubernetes.io/ingress.class=haproxy  --rule="echoserver.local/*=echoserver:8080,tls" --dry-run=client -o yaml > ingress.yaml
```

```yaml
apiVersion: networking.k8s.io/v1
kind: Ingress
metadata:
  annotations:
    kubernetes.io/ingress.class: haproxy
  creationTimestamp: null
  name: echoserver
spec:
  rules:
  - host: echoserver.local
    http:
      paths:
      - backend:
          service:
            name: echoserver
            port:
              number: 8080
        path: /
        pathType: Prefix
  tls:
  - hosts:
    - echoserver.local
status:
  loadBalancer: {}

```


```bash
k apply -f ingress.yaml
``` 

Vérification de l'ingress

```bash
k describe ingress echoserver

Name:             echoserver
Labels:           <none>
Namespace:        learnk8
Address:
Ingress Class:    <none>
Default backend:  <default>
TLS:
  SNI routes echoserver.local
Rules:
  Host              Path  Backends
  ----              ----  --------
  echoserver.local
                    /   echoserver:8080 (172.16.158.27:8080)
Annotations:        kubernetes.io/ingress.class: haproxy
Events:
  Type    Reason  Age   From                Message
  ----    ------  ----  ----                -------
  Normal  CREATE  59s   ingress-controller  Ingress learnk8/echoserver
  Normal  UPDATE  42s   ingress-controller  Ingress learnk8/echoserver
```

Verification de l'ingress controller service 

```bash
k describe service  haproxy-ingress  -n ingress-controller

Name:                     haproxy-ingress
Namespace:                ingress-controller
Labels:                   app.kubernetes.io/instance=haproxy-ingress
                          app.kubernetes.io/managed-by=Helm
                          app.kubernetes.io/name=haproxy-ingress
                          app.kubernetes.io/version=v0.14.2
                          helm.sh/chart=haproxy-ingress-0.14.2
Annotations:              meta.helm.sh/release-name: haproxy-ingress
                          meta.helm.sh/release-namespace: ingress-controller
Selector:                 app.kubernetes.io/instance=haproxy-ingress,app.kubernetes.io/name=haproxy-ingress
Type:                     NodePort
IP Family Policy:         SingleStack
IP Families:              IPv4
IP:                       172.17.29.196
IPs:                      172.17.29.196
Port:                     http-80  80/TCP
TargetPort:               http/TCP
NodePort:                 http-80  32462/TCP
Endpoints:                10.0.0.12:80
Port:                     https-443  443/TCP
TargetPort:               https/TCP
NodePort:                 https-443  31197/TCP
Endpoints:                10.0.0.12:443
Session Affinity:         None
External Traffic Policy:  Local
Events:                   <none>
```
> Nb: le service a pour Endpoint : 10.0.0.12


Ping service on port 8080

```bash
k get svc

NAME         TYPE        CLUSTER-IP      EXTERNAL-IP   PORT(S)    AGE
echoserver   ClusterIP   172.17.30.240   <none>        8080/TCP   11m
```

Curl service port inside cluster

```bash
curl -k  172.17.30.240:8080

CLIENT VALUES:
client_address=172.16.77.128
command=GET
real path=/
query=nil
request_version=1.1
request_uri=http://172.17.30.240:8080/

SERVER VALUES:
server_version=nginx: 1.9.11 - lua: 10001

HEADERS RECEIVED:
accept=*/*
host=172.17.30.240:8080
user-agent=curl/7.81.0
BODY:
-no body in request-
```
> nb: option `-k` signifie insecure 


Retrouver les Endpoints

```bash
k get endpoints -A

NAMESPACE            NAME              ENDPOINTS                                                        AGE
default              kubernetes        10.0.0.10:6443                                                   7d5h
ingress-controller   haproxy-ingress   10.0.0.12:80,10.0.0.12:443                                       79m
kube-system          kube-dns          172.16.77.139:53,172.16.77.140:53,172.16.77.139:53 + 3 more...   7d5h
kube-system          metrics-server    10.0.0.11:4443                                                   7d5h
learnk8              echoserver        172.16.158.27:8080,172.16.87.215:8080,172.16.87.216:8080         70m

```

Curl depuis la machine host le domaine `echoserver.local`

Nb: vous devez l'endpoint dans votre fichier `/etc/hosts` 

```bash
10.0.0.12 echoserver.local
```

```bash
curl -k https://echoserver.local

CLIENT VALUES:
client_address=10.0.2.15
command=GET
real path=/
query=nil
request_version=1.1
request_uri=http://echoserver.local:8080/

SERVER VALUES:
server_version=nginx: 1.9.11 - lua: 10001

HEADERS RECEIVED:
accept=*/*
host=echoserver.local
user-agent=curl/7.81.0
x-forwarded-for=10.0.0.1
x-forwarded-proto=https
BODY:
-no body in request-%

```

Si on essaie sans l'option 'insecure', on obtient une erreur SSL bien sur car il n'y a pas de certificat connu

```bash
curl https://echoserver.local

curl: (60) SSL certificate problem: self-signed certificate
More details here: https://curl.se/docs/sslcerts.html

curl failed to verify the legitimacy of the server and therefore could not
establish a secure connection to it. To learn more about this situation and
how to fix it, please visit the web page mentioned above.
```


## A retenir 

* Helm permet de partager des application et d'application des valeurs en fonction des environnements par exemple
* L'ingress et IngressController permettent de controller et rediriger le trafic entrant vers un ou des services 


## Pour aller plus loin 


* [Learn more about Ingress on the main Kubernetes documentation site](https://kubernetes.io/docs/concepts/services-networking/ingress/).
* [Nginx Ingress Controller website](https://kubernetes.github.io/ingress-nginx/deploy/)

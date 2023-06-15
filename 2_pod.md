# Pod

## Objectif

* création et manipulation des images via des pods
* comprendre la notion de request/limit 
* comprendre la notion de readiness et liveness

![Pod](./medias/module_03_pods.svg)


## Création d'une ressource Pod


Création via les arguments de `kubectl` 

```bash
k run mypod --image=busybox
```


> nb: on évite la création de resources directement via les arguments de `kubectl`  
> les fichiers `yaml`  permettent de reproduire, modifier , partager et versionner facilement nos configurations


K8 permet de générer des configurations à partir d'une commande CLI avec `--dry-run=client` 

```bash
k run mypod --image=busybox --dry-run=client -o yaml > pod.yaml
```

cat pod.yaml

```yaml
apiversion: v1
kind: pod
metadata:
  creationtimestamp: null
  labels:
    run: mypod
  name: mypod
spec:
  containers:
  - image: busybox
    name: mypod
    resources: {}
  dnspolicy: clusterfirst
  restartpolicy: always
status: {}

```

Exécution de la configuration

```bash
k create -f pod.yaml

pod/mypod created

```

Vérifions les pods créés

```bash
k get pods -o wide
```


Execution d'une commande dans le pod

```bash
kubectl exec -it mypod -- /bin/sh
```

> nb: le shell doit être disponible dans l'image choisie


## Liveness / readiness

sonder l'état d'un pod et d'agir en conséquence

2 types de sonde : 
* Readiness
* Liveness

3 manières de sonder :
* TCP : ping TCP sur un port donné
* HTTP: http GET sur une url donnée
* Command: Exécute une commande dans le conteneur

### Readiness

Gère le trafic à destination du pod

* Un pod avec une sonde readiness `NotReady` ne reçoit aucun trafic
* Cela permet d'attendre que le service dans le conteneur soit prêt avant de router du trafic
* Un pod `Ready` est ensuite enregistré dans les endpoints du service associé

### Liveness

Gère le redémarrage du conteneur en cas d'incident

* Un pod avec une sonde liveness sans succès est redémarré au bout d'un interval défini
* Permet de redémarrer automatiquement les pods en erreur


```yaml
apiversion: v1
kind: pod
metadata:
  name: goproxy
labels:
  app: goproxy
spec:
  containers:
    - name: goproxy
      image: k8s.gcr.io/goproxy:0.1
      ports:
        - containerport: 8080
      readinessprobe:
        tcpsocket:
          port: 8080
        initialdelayseconds: 5
        periodseconds: 10
      livenessprobe:
        tcpsocket:
          port: 8080
        initialdelayseconds: 15
        periodseconds: 20
```

## Limitation des ressources

* gérer l'allocation de ressources au sein d'un cluster
* sans request/limit => best effort
* Request: allocation minimum garantie (réservation)
* Limit: allocation maximum (limite)
* Se base sur le CPU et la RAM

### Allocation CPU

L'allocation se fait par fraction de CPU:
* 1 : 1 vCPU entier
* 100m : 0.1 vCPU

### Allocation RAM

PODS RESOURCES : RAM
L'allocation se fait en unité de RAM:
* M : en base 10
* Mi : en base 2


Example pour un Pod de type database 

```yaml
apiVersion: v1
kind: Pod
metadata:
    name: frontend
spec:
    containers:
    - name: db
      image: mysql
      resources:
        requests:
            memory: "64Mi"
            cpu: "250m"
        limits:
            memory: "128Mi"
            cpu: "500m"
```

Lister les pods avec leur usage de mémoire

```bash
k top pod

NAME                      CPU(cores)   MEMORY(bytes)
mynginx-8689b4976-967k4   0m           8Mi
mynginx-8689b4976-bzrrm   0m           1Mi
mynginx-8689b4976-j6ssb   0m           1Mi

```


## Exercices

* créer un pod avec un nom différent de l'image 
* se connecter au pod et afficher les variables d'environnment
* détruire le pod 

## A retenir 

* Créer un pod n'est pas très différent de la commande Docker ou Podman
* Définir des chemins HTTP pour déterminer sur le pod est viable est indispensable
* A ce stade, l'intérêt de K8 est plus que discutable 


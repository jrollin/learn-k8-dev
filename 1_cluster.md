# Configurer et accéder au cluster 

* manipuler le cluster avec kubectl
* comprendre les namespaces


## Kubectl

Création d'un alias pour simplifier l'écriture des commandes

```bash
alias k=kubetcl
```

> nb: pas requis, mais fait gagner du temps sur des commandes parfois longues..


Aide de kubectl  

```bash
k --help
```

Aide sur la ressource Pod

```bash
k explain pods
```

Aide sur l'exectution de la commande `run`  d'un pod

```bash
k run pod --help
```

Pour lister tous les types de ressources et leur alias 

```bash
kubectl api-resources
```

Kubectl utilise un fichier `~/.kube/config`  pour stocker les informations du cluster 

* Serveurs (IP, CA Cert, Nom)
* Users (Nom, Certificat, Clé)
* Context, association d'un user et d'un Serveurs

```bash
cat ~/.kube/config
```


## Infos du cluster



Afficher les infos du cluster

```bash
k config view

apiVersion: v1
clusters:
- cluster:
    certificate-authority-data: DATA+OMITTED
    server: https://10.0.0.10:6443
  name: kubernetes
contexts:
- context:
    cluster: kubernetes
    user: kubernetes-admin
  name: kubernetes-admin@kubernetes
current-context: kubernetes-admin@kubernetes
```


Check cluster infos / IP 


```bash
k cluster-info


Kubernetes control plane is running at https://10.0.0.10:6443
CoreDNS is running at https://10.0.0.10:6443/api/v1/namespaces/kube-system/services/kube-dns:dns/proxy

To further debug and diagnose cluster problems, use 'kubectl cluster-info dump'.
```

## Namespace

Lister les namespaces

```bash
k get ns  
```



Création d'un nouveau namespace `learnk8` en ligne de commande

```bash
k create ns learnk8
```

Supprimer un Namespace

```bash
k delete ns learnk8
```

Recommandé : création d'un nouveau namespace via fichier de spécification Yaml

```bash
 k create ns learnk8 --dry-run=client -o yaml > namespace.yaml
```

```bash
cat namespace.yaml

apiVersion: v1
kind: Namespace
metadata:
  creationTimestamp: null
  name: learnk8
spec: {}
status: {}
vagrant@mast
```

Appliquer cette config à notre cluster

```bash
k apply -f namespace.yaml

namespace/learnk8 created
```

Voir les informations du namespace, dont les limites, quotas, etc

```bash
kubectl describe namespace learnk8

Name:         learnk8
Labels:       kubernetes.io/metadata.name=learnk8
Annotations:  <none>
Status:       Active

No resource quota.

No LimitRange resource.
```


Utilisation du context pour basculer vers le namespace `learnk8` par défaut 

```bash
k config set-context --current --namespace=learnk8
```

Vérifer le contexte et cluster courant

```bash
k config view
apiVersion: v1
clusters:
- cluster:
    certificate-authority-data: DATA+OMITTED
    server: https://10.0.0.10:6443
  name: kubernetes
contexts:
- context:
    cluster: kubernetes
    namespace: learnk8
    user: kubernetes-admin
  name: kubernetes-admin@kubernetes
current-context: kubernetes-admin@kubernetes
kind: Config
```

Tips: possible de cibler le champ avec le format `jsonpath`

```bash
k config view -o jsonpath='{.contexts[].context.namespace}'
```


## Plus d'infos 

* [Doc officielle : Accéder au cluster](https://kubernetes.io/docs/tasks/access-application-cluster/access-cluster/)

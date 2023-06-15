# Containers

## Objectif

* Pourquoi utiliser un container ? 
* Différences entre VM et containeurs 
* Rappel sur les notions d'image, volume et réseau


## Définition container

![Evolution from vm to container](./medias/container_evolution.svg)

Le conteneur fournit un environnement isolé du système host (semblable à un chroot sur Linux avec de l

Deux philosophies: 
* Systeme : simule une séquence de boot complète avec un init process ainsi que plusieurs processus (LXC, OpenVZ)
* Process : un conteneur exécute un ou plusieurs processus directement, en fonction de l'application conteneurisée (Docker, Rkt).

Virtualisation dans le cloud : 
* Ressources compute : virtualisation
* Virtualisation complète : KVM, Xen
* Virtualisation conteneurs : OpenVZ, LXC, Docker, RKT

## Origines

Kernel Linux:
* Namespaces
* Cgroups (control groups)

## Open Container Initiative


### Container Runtime Interface (CRI)

Container Runtime: 
* containerd (la référence)
* CRI-O 
* Docker (historique)
* kata containers: Conteneurs dans des VMs

[Plus d'infos sur l'OCI Runtime tools](https://github.com/opencontainers/runtime-tools)


### Container Network Interface (CNI)

[Plus d'infos sur la CNI](https://github.com/containernetworking/cni)


### Container Storage Interface (CSI)

[Plus d'infos sur la CSI](https://github.com/container-storage-interface/spec/blob/master/spec.md)


## Dockerfile


* image layer
* registry


### Image layer

Exemple de Dockerfile d'une application Node

```Dockerfile
# The build image
FROM node:lts-alpine AS build
WORKDIR /app
COPY package*.json /app
COPY . /app
RUN npm ci 
 
# The production image
FROM node:lts-alpine
WORKDIR /app
USER node
EXPOSE 8080
COPY --chown=node:node --from=build /app /app
CMD ["node", "index.js"]
```

> Note: le multistage permet d'optimiser l'image finale en gardant que les artefacts souhaités

Build de l'image dans le registre local

```bash
docker build -t mine/node .
```

Executer le container sur le port 8181 de la machine

```bash
 docker run --rm -p 8181:8080  mine/node
```

Lire les logs

```bash
docker logs mine/node
```



## Exercices :

* lancer deux containers A et B
* se connecter en mode interactif 
* ping A, ping B, ping A from B


### Pour aller plus loin


#### Explorer les layers 

Il est parfois utile pour des raisons d'optimisation ou débuggage le contenu des layers de l'image
[L'outil dive](https://github.com/wagoodman/dive) permet de  de parcourir les layers

Utilisation de Dive avec son image Docker 

```bash
docker run --rm -it \
    -v /var/run/docker.sock:/var/run/docker.sock \
    wagoodman/dive:latest  <image>
```

#### sauvegarder une image en .tar 

```bash
docker save -o myimage.tar mine/node
```

## Network

Il exite plusieurs types de réseau 
* bridge
* host
* overlay
* ipvlan
* macvlan
* none



[Plus d'infos sur les réseaux](https://docs.docker.com/network/) 


Lister les réseaux 

```bash
docker network ls

NETWORK ID     NAME            DRIVER    SCOPE
41acc3619b24   bridge          bridge    local
406384df45cf   host            host      local
d0bbee684cb8   none            null      local

```

Création d'un réseau de type bridge avec un subnet donné

```bash
docker network create --driver=bridge --subnet=192.168.0.0/24 mybridge
```

Vérification de notre réseau bridge

```bash
docker network inspect mybridge

[
    {
        "Name": "mybridge",
        "Id": "43f39ce8b1fbf25a7ca305c76cb97eb2d0fae69c982617e2e721cb919eec4a90",
        "Created": "2023-02-15T16:47:40.019087234+01:00",
        "Scope": "local",
        "Driver": "bridge",
        "EnableIPv6": false,
        "IPAM": {
            "Driver": "default",
            "Options": {},
            "Config": [
                {
                    "Subnet": "192.168.0.0/24",
                    "Gateway": "192.168.0.1"
                }
            ]
        },
        "Internal": false,
        "Attachable": false,
        "Ingress": false,
        "ConfigFrom": {
            "Network": ""
        },
        "ConfigOnly": false,
        "Containers": {},
        "Options": {},
        "Labels": {}
    }
]

```     


Container in this network

```bash
docker run -itd --network=mybridge busybox
```

Des containers dans deux réseaux séparés ne peuvent communiquer


Exercices : 

* créer un autre réseau de type bridge
* lancer deux containers sur deux réseaux différents 
* ping chaque container depuis la machine host
* ping le container A depuis le container B


## Storage


Modification de la page par défaut "nginx" avec un volume

```bash
docker run -d -it --name mynginx -v "$(pwd)"/nginx:/usr/share/nginx/html:ro  nginx:alpine
```

## Commandes utiles

Se connecter à un container en cours d'execution 

```bash
docker exec  <container id or name>  ping google.com
```

Lister que les noms des containers 

```bash
docker ps --format '{{.Names}}'
```

Arrêter une liste de containers 

```bash
docker ps --format '{{.Names}}' | xargs docker stop
```

Escalader les privilèges avec une image sans user et un volume partagé

```bash
docker run -it -v /var/log/:/youpi busybox
```

## A retenir 

* docker est un runtime, il en existe d'autres (ex: podman)
* les images sont des emplilements de fichiers compressés
* privilégier un process par container
* limiter les ressources du container
* communication réseau
* partage des données possible via les volumes

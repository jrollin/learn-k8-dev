# Volumes


## Objectif

* comprendre les différents types de volumes
* manipuler les volumes pour stocker des données 
* manipuler les volumes pour partager des fichier de configuration / secret


## Les différents types de volume 


* volume ephémère vs persistant
* nombreux storage provider disponbibles

[Documentation sur les volumes K8](https://kubernetes.io/fr/docs/concepts/storage/volumes/) 


## Volume


Partage d'un volume entre containers d'un même pod (ie: sidecar)

```yaml
apiVersion: v1
kind: Pod
metadata:
  name: mypod
spec:
  containers:
  - image: alpine
    name: my-pod-1
    command: ['sh', '-c', 'echo Container 1 is Running ; sleep 3600']
    volumeMounts:
    - mountPath: /data
      name: data-volume

  - image: alpine
    name: my-pod-2
    command: ['sh', '-c', 'echo Container 2 is Running ; sleep 3600']
    
    volumeMounts:
    - mountPath: /data2
      name: data-volume


  volumes:
  - name: data-volume
    emptyDir: {}
```

Afficher les logs des containers 

```bash
k logs mypod -c my-pod-1 

k logs mypod -c my-pod-2
```

Ecrire un fichier dans le volume partagé `/data`  depuis `my-pod-1` 

```bash
k exec -it mypod -c my-pod-1  -- /bin/sh

cd /data
echo 'hello' > whatever.txt
```

Lire le contenu depuis le meme volume partagé `/data2`  de `my-pod-2` 

```bash
k exec -it mypod -c my-pod-2  -- /bin/sh

cd /data2
cat whatever.txt
```


## Partager un secret via un volume


Création d'un certification TLS

```bash
openssl genrsa -out ssl.key 2048
openssl req -new -x509 -key ssl.key -out ssl.cert -days 360 -subj /CN=secret-server.example.com
```

Générer un secret avec ces deux fichiers 

```bash
k create secret generic ssl-key-cert --from-file=ssl.key --from-file ssl.cert
```

Informations 

```bash
k describe secret ssl-key-cert

Name:         ssl-key-cert
Namespace:    learnk8
Labels:       <none>
Annotations:  <none>

Type:  Opaque

Data
====
ssl.cert:  1155 bytes
ssl.key:   1704 bytes

```


Utiliser les secets en tant que fichiers montés sur le container 


```bash
apiVersion: v1
kind: Pod
metadata:
  name: nginx-pod
spec:
  containers:
    - image: nginx:alpine
      name: web-server
      volumeMounts:
      - name: certs
        mountPath: /etc/nginx/certs/
        readOnly: true
  volumes:
      - name: certs
        secret:
          secretName: ssl-key-cert
```

Verification 

```bash
kubectl exec -it nginx-pod  -- /bin/sh

ls /etc/nginx/certs/
ssl.cert  ssl.key
```



## Exercices 

* configurer la page d'accueil d'Nginx en montant un volume 
* partager des données entre plusieurs pods

## A retenir 

* chaque pod est monté avec un volume éphémère, détruit avec le pod
* le volume permet de persister des données et des les partager
* il est courant de monter des configmap / secrets dans les containers
* il existent de multitudes d'abstraction de filesystem (ex Aws S3, Azure Blog, etc)



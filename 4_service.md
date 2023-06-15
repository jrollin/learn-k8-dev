# Service 

## Objectif 

* comprendre l'usage d'un service
* manipuler et configurer des services

## Service

![Service](./medias/module_04_service.svg)

La notion de service est une couche d'astraction qui permet d'exposer une application qui tourne sur plusieurs noeuds

Les pods peuvent être créés et détruits par les déploiements, mais pour la communication entre les applications, il faut un moyen de découvrir les autres Pods de façon dynamique

## Exposer nos pods Nginx 

Création d'un service qui expose le port  `8000` pour notre application `myngninx`

```bash
k expose deploy mynginx --port 8000 --dry-run=client -o yaml > service.yaml
```

On peut cibler un port de container différent, ici `80` 
```yaml
apiVersion: v1
kind: Service
metadata:
  creationTimestamp: null
  labels:
    app: mynginx
  name: mynginx
spec:
  ports:
  - port: 8000
    protocol: TCP
    targetPort: 80
  selector:
    app: mynginx
status:
  loadBalancer: {}
```

> Nb: le service va cibler les pods via les labels, ici `app: myngninx` 

```bash
k create -f service.yaml

service/mynginx created
```

Listons les services

```bash
k get svc

NAME         TYPE        CLUSTER-IP      EXTERNAL-IP   PORT(S)   AGE
kubernetes   ClusterIP   172.17.0.1      <none>        443/TCP   4d
mynginx      ClusterIP   172.17.24.230   <none>        8000/TCP    3s
```

Pour en savoir plus sur les propriétés créés pour notre service 

```bash
k describe service mynginx

Name:              mynginx
Namespace:         default
Labels:            app=mynginx
Annotations:       <none>
Selector:          app=mynginx
Type:              ClusterIP
IP Family Policy:  SingleStack
IP Families:       IPv4
IP:                172.17.24.238
IPs:               172.17.24.238
Port:              <unset>  8000/TCP
TargetPort:        80/TCP
Endpoints:         172.16.158.11:80,172.16.87.200:80,172.16.87.201:80
Session Affinity:  None
Events:            <none>
```

A noter que le type de service est `Type : Cluster IP` 


Testons notre service nginx sur cette ip (toujour depuis le cluster dans vagrant)

```bash
curl 172.17.24.238:8000

<!DOCTYPE html>
<html>
<head>
<title>Welcome to nginx!</title>
<style>
    body {
        width: 35em;
        margin: 0 auto;
        font-family: Tahoma, Verdana, Arial, sans-serif;
    }
</style>
</head>
<body>
<h1>Welcome to nginx!</h1>
<p>If you see this page, the nginx web server is successfully installed and
working. Further configuration is required.</p>

<p>For online documentation and support please refer to
<a href="http://nginx.org/">nginx.org</a>.<br/>
Commercial support is available at
<a href="http://nginx.com/">nginx.com</a>.</p>

<p><em>Thank you for using nginx.</em></p>
</body>
</html>
```
Nous avons bien un service dont l'ip reste fixe mais avec des conteneurs qui peuvent varier en nombre ou autre en fonction des déploiements


Testons d'accéder au service depuis le système host

```bash
curl 172.17.24.238

timeout
```

=> le réseau n'est pas accessible depuis l'extérieur du cluster avec un service de type `ClusterIp` 

## Les différents type de service 


### ClusterIP: 

Expose le service sur une IP interne au cluster. Le choix de cette valeur rend le service uniquement accessible à partir du cluster. Il s'agit du ServiceType par défaut.

### NodePort

Expose le service sur l'IP de chaque nœud sur un port statique (le NodePort). Un service ClusterIP, vers lequel le service NodePort est automatiquement créé. Vous pourrez contacter le service NodePort, depuis l'extérieur du cluster, en demandant <NodeIP>: <NodePort>.

### LoadBalancer 

Expose le service en externe à l'aide de l'équilibreur de charge d'un fournisseur de cloud. Les services NodePort et ClusterIP, vers lesquels les itinéraires de l'équilibreur de charge externe, sont automatiquement créés.


### ExternalName 

Mappe le service au contenu du champ externalName (par exemple foo.bar.example.com), en renvoyant un enregistrement CNAME avec sa valeur. Aucun proxy d'aucune sorte n'est mis en place.


## Exercices 

* exposer l'application pour qu'elle soit accessible depuis la machine host
* déployer une application B en Node qui appelle la 1ère application
* déployer un service qui ne cible que des application avec une version spécifique d'image 

## A retenir

* le service permet de gérer indifféremment 1 ou x pods
* le service permet de controler/segmenter l'accès à des applications



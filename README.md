Date_june24_2026

The chatroom web-app was built during official University thesison 6 months of development (Oct2025-Feb2026) inside a Minikube cluster for local
Kubernetes development. Later updated and downgrated into a triple-container webapp that can support more containers in addition making use of the Docker
multi-container architecture. 

Basic architecture: 3 orchestrated containers that run from a single docker-compose.yml file.  

Technologies that were used for the project inside all 3 directories are made into Docker Containers due to their respective Dockerfiles (total 3)
1) Backend
    -Nodejs ,backend server
    -Express js ,upgrade over the http
    -Socker.io ,for communication , websockets 
    -SQLite ,single-node database for persistence
        (works for docker-compose, but not ideal for kubernetes cause of multiple pods usage and replicasets)
2) Frontend
    -Html ,basic structure
    -css ,colours
    -javascript  , async/await etc
3) Server
    -nginx ,webserver configuration between containers (front-backend)

Compose works at 06/06/2026. 
It was wrong in the docker desktop configuration, it was corrected, something was done with some update on linux's kernel. 
It runs on linux kernel 6.8.0-124-general (mint21.3).  
It runs anywhere there is Docker installed, with the docker compose up command. Maybe he's making a download. If he does and we don't want to 
risk 
-without the reconstruction of our containers we run --> docker compose start 
-for restart we run --> docker compose restart 
-for viewing current container/ containers we run --> docker compose ps 
-for the confidentiality of http (through nginx) in the terminal we run --> curl -Ik http://localhost:80 (without ssl certificate), since its not https.

Testing: 
    We open 2-5 different incognito browser tabs and start chatting by giving username and roomname, then we press join room. 
    Each room can be deleted ONLY after all participants have accepted for reasons to maintain the conversation to those who are already inside.

Compoose works at 24/06/2026.
Currently developing:
    Sounds (clicking buttons, typing, send, receiver, room entry/exit)
    Authentication for login / logout with accounts
    Voice call channels 
    Web hosting with domain

The webchat project started as an official thesis for my University Deggree using an application inside multiple Docker containers that were later transformed into yaml files for manifesting deployment/services/pods for Kubernetes testing with the help of a tool called Minikube . 

Technologies used : 
Backend : 
    Node.js (server)
    Express.js (app creation for https)
    Javascript (serve source  code)
    SOcket.io (web sockets for users + chatrooms)
    A helper Shell script for the database + SQLite
Frontend: 
    HTML (structure of UI)
    CSS (Customisation for UI )
    Javascript (Client side for Async/Await , socket.io, WebRTC for voice call functionality)
Reverse Proxy/Load Balancer :
    NGINX (configuration for trafficing inside the architecture) 
Docker + Docker compose for automatation


Later was downgraded into a 3-containers orchestration app . Today it is still under development for scaling and upgrading . It runs anywhere Docker runs with a simple docker-compose up command without installing aditional software of missing libraries, Docker handles these . By typing https://<HOST-IP:443> after generating ssl key certification succesfully for the (WebRTC blockage) the app can be used inside any secure LAN via the browser , no additional downloads or account creations .

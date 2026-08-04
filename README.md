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




Later was downgraded into a 3-containers orchastration app . Today it is still under development for scaling and upgrading .

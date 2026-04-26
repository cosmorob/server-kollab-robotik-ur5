# Server für kollaborative Getriebemontage mit UR5

Dieses Projekt ist 2018 im Rahmen des Masterstudiums "Wirtschaftsinformatik / IT-Management"
in Kollaboration mit einem Getriebehersteller entstanden. Ziel war es, eine experimentelle
Mensch-Roboter-Kollaboration für eine Getriebemontage mit einem Universal Roboter UR5 umzusetzen.

## Architektur

Client App ↔ Websocket Port 3000 ↔ Server App ↔ TCP Server Port 30001 ↔ UR5

Der Server ist eine minimalistische Node.js-Express-Applikation, welche eine Verbindung zum Client auf Port 3000 
und eine Verbindung zum UR5 über TCP auf Port 30001 herstellt.

Client: https://github.com/cosmorob/client-kollab-robotik-ur5

![Hero](https://github.com/cosmorob/client-kollab-robotik-ur5/blob/main/img/hero-architecture.png?raw=true)

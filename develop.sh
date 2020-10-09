#!/bin/bash
echo "######### Installer für Robob Umgebung #########\n"

echo "0. apt Update"
apt-get update

echo "1. Installation Postresql (Für Die Datenbank):"
sh -c 'echo "deb http://apt.postgresql.org/pub/repos/apt $(lsb_release -cs)-pgdg main" > /etc/apt/sources.list.d/pgdg.list'
wget --quiet -O - https://www.postgresql.org/media/keys/ACCC4CF8.asc | sudo apt-key add -
apt-get -y install postgresql

echo "2. Installation Nodejs/Reactjs"
apt install npm
npm install -g create-react-app

echo "3. Installation "
?

echo "3. Installation Docker"
apt install docker docker-compose 
systemctl start docker
docker-compose up -d
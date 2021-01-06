apt install docker docker-compose npm
systemctl start docker

cd ./frontend
npm install
cd ../

chmod -R a+rw ./database/import

cp -R ./game/Build ./frontend/public
cp -R ./game/TemplateData ./frontend/public

chmod -R a+rwx ./frontend/public
chmod -R a+rwx ./frontend/build

docker-compose up --build -d
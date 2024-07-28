git pull
docker stop salary-calculation-bot
docker rm --force salary-calculation-bot
docker rmi salary-calculation-bot-image
docker build -t salary-calculation-bot-image .
docker run -d -p 3600:3600 --name salary-calculation-bot salary-calculation-bot-image

# railyard

My train spotting collections beautifully displayed and organized.

## Docker

1. `docker build . -t railyard`
2. ```
   docker run -d \
     --name railyard \
     -v ./data:/data \
     -e PICTURES_DIRECTORY=/data/pictures/ \
     -e DATABASE_URL=file:/data/database.db \
     -e PORT=5555 \
     -p 5555:5555 \
     railyard
   ```

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

## To Do

- [x] Allow uploading of images
- [ ] Allow managing of files
- [ ] Allow categorization of images

### Route Map

- /
- /pictures/$id ???? this is good for rendering but should probably be visitable
- /login

-> I'm thinking I want to have /login be a hidden page, and that _when_ you are signed in,
edit buttons appears on the pictures and there's a button on the header to upload new pictures.

- As well as delete button with confirmation
  There is still /upload but after uploading you are imeddiately sent to /pictures/$id, where the edit
  form fields appear, still empty. They are all optional database fields and until you edit details
  wont show in categories etc

FROM python:3.9-slim

EXPOSE 5004

WORKDIR /usr/src/app

COPY ./backend/FileUpload/requirements.txt ./

RUN pip install --no-cache-dir -r requirements.txt

COPY ./backend/FileUpload/FileUpload.py ./

CMD [ "python", "./FileUpload.py"]
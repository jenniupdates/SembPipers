FROM python:3.9-slim

EXPOSE 5030

WORKDIR /usr/src/app

COPY ./backend/Annotation/requirements.txt ./

RUN pip install --no-cache-dir -r requirements.txt

COPY ./backend/Annotation/Annotation.py ./

CMD [ "python", "./Annotation.py"]
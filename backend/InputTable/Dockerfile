FROM python:3.9-slim

EXPOSE 5003

WORKDIR /usr/src/app

COPY ./backend/InputTable/requirements.txt ./

RUN pip install --no-cache-dir -r requirements.txt

COPY ./backend/InputTable/InputTable.py ./

CMD [ "python", "./InputTable.py"]
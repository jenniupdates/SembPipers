FROM python:3.9-slim

EXPOSE 5002

WORKDIR /usr/src/app

COPY ./backend/ConfigTable/requirements.txt ./

RUN pip install --no-cache-dir -r requirements.txt

COPY ./backend/ConfigTable/ConfigTable.py ./

CMD [ "python", "./ConfigTable.py"]
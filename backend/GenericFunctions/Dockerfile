FROM python:3.9-slim

EXPOSE 5007

WORKDIR /usr/src/app

COPY ./backend/GenericFunctions/requirements.txt ./

RUN pip install --no-cache-dir -r requirements.txt

COPY ./backend/GenericFunctions/GenericFunctions.py ./

CMD [ "python", "./GenericFunctions.py"]
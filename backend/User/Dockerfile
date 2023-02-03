FROM python:3.9-slim

EXPOSE 5001

WORKDIR /usr/src/app

COPY ./backend/User/requirements.txt ./

RUN pip install --no-cache-dir -r requirements.txt

COPY ./backend/User/User.py ./

CMD [ "python", "./User.py"]
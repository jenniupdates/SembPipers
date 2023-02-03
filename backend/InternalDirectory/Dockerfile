FROM python:3.9-slim

EXPOSE 5010

WORKDIR /usr/src/app

COPY ./backend/InternalDirectory/requirements.txt ./

RUN pip install --no-cache-dir -r requirements.txt

COPY ./backend/InternalDirectory/InternalDirectory.py ./backend/InternalDirectory/TopSorter.py ./

CMD [ "python", "./InternalDirectory.py"]